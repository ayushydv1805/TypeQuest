import { achievements } from "./achievements";
import { getDateKey } from "./gamelogic";
import { getActiveUserId } from "./auth";
import { deleteCloudPlayerSave, queueCloudPlayerSave } from "./cloud";

const PLAYER_KEY = "typequest-player";
const MAX_RECENT_RUNS = 8;
const THEMES = ["default", "neon", "fire", "ocean", "cyber"];

function createDefaultPlayer() {
  return {
    level: 1,
    xp: 0,
    coins: 0,
    bestWpm: 0,
    bestAccuracy: 0,
    testsCompleted: 0,
    totalTime: 0,
    currentStreak: 0,
    lastPlayedDate: "",
    lastDailyDate: "",
    recentRuns: [],
    unlockedModes: ["classic"],
    unlockedAchievements: [],
    unlockedThemes: [],
    characterErrors: {},
    equippedTheme: "default",
    colorMode: "dark",
  };
}

function numberOr(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function uniqueStrings(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  return [...new Set(value.filter((item) => typeof item === "string"))];
}

function normalizeRecentRuns(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((run) => run && typeof run === "object")
    .slice(0, MAX_RECENT_RUNS)
    .map((run, index) => ({
      id: typeof run.id === "string" ? run.id : "saved-run-" + index,
      date: typeof run.date === "string" ? run.date : "",
      mode: typeof run.mode === "string" ? run.mode : "Classic",
      wpm: Math.max(0, Math.round(numberOr(run.wpm))),
      accuracy: Math.min(100, Math.max(0, Math.round(numberOr(run.accuracy)))),
      score: Math.max(0, Math.round(numberOr(run.score))),
      xp: Math.max(0, Math.round(numberOr(run.xp))),
    }));
}

function normalizeCharacterErrors(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([character, count]) => /^[a-z0-9]$/i.test(character) && Number.isFinite(Number(count)))
      .map(([character, count]) => [character.toLowerCase(), Math.min(1000000, Math.max(0, Math.floor(Number(count))))])
      .filter(([, count]) => count > 0)
      .slice(0, 36)
  );
}

function normalizePlayer(player = {}) {
  const base = createDefaultPlayer();
  const unlockedModes = uniqueStrings(player.unlockedModes, ["classic"]);

  return {
    ...base,
    ...player,
    level: Math.max(1, Math.floor(numberOr(player.level, 1))),
    xp: Math.max(0, numberOr(player.xp, 0)),
    coins: Math.max(0, numberOr(player.coins, 0)),
    bestWpm: Math.max(0, numberOr(player.bestWpm, 0)),
    bestAccuracy: Math.min(100, Math.max(0, numberOr(player.bestAccuracy, 0))),
    testsCompleted: Math.max(0, Math.floor(numberOr(player.testsCompleted, 0))),
    totalTime: Math.max(0, numberOr(player.totalTime, 0)),
    currentStreak: Math.max(0, Math.floor(numberOr(player.currentStreak, 0))),
    lastPlayedDate: typeof player.lastPlayedDate === "string" ? player.lastPlayedDate : "",
    lastDailyDate: typeof player.lastDailyDate === "string" ? player.lastDailyDate : "",
    recentRuns: normalizeRecentRuns(player.recentRuns),
    unlockedModes: [...new Set(["classic", ...unlockedModes])],
    unlockedAchievements: uniqueStrings(player.unlockedAchievements),
    unlockedThemes: uniqueStrings(player.unlockedThemes).filter((theme) => THEMES.includes(theme)),
    characterErrors: normalizeCharacterErrors(player.characterErrors),
    equippedTheme: THEMES.includes(player.equippedTheme) ? player.equippedTheme : "default",
    colorMode: player.colorMode === "light" ? "light" : "dark",
  };
}

function getPlayerStorageKey(userId = getActiveUserId()) {
  return userId ? PLAYER_KEY + ":" + userId : PLAYER_KEY;
}

export function getPlayerData() {
  try {
    const storage = window.localStorage;
    const userId = getActiveUserId();
    const key = getPlayerStorageKey(userId);
    const raw = storage.getItem(key);

    if (raw) {
      try {
        return normalizePlayer(JSON.parse(raw));
      } catch {
        return createDefaultPlayer();
      }
    }

    // One-time migration of the old single-player save into the first profile.
    if (userId) {
      const legacyRaw = storage.getItem(PLAYER_KEY);
      if (legacyRaw) {
        try {
          const migrated = normalizePlayer(JSON.parse(legacyRaw));
          storage.setItem(key, JSON.stringify(migrated));
          if (userId) storage.setItem("typequest-player-local-updated:" + userId, String(Date.now()));
          storage.removeItem(PLAYER_KEY);
          queueCloudPlayerSave(migrated);
          return migrated;
        } catch {
          // A malformed legacy save should not prevent a new profile from playing.
        }
      }
    }
  } catch {
    // Continue with a fresh in-memory profile when storage is blocked/unavailable.
  }

  return createDefaultPlayer();
}

export function savePlayerData(data) {
  try {
    const normalized = normalizePlayer(data);
    const userId = getActiveUserId();
    window.localStorage.setItem(
      getPlayerStorageKey(userId),
      JSON.stringify(normalized)
    );
    if (userId) {
      window.localStorage.setItem("typequest-player-local-updated:" + userId, String(Date.now()));
    }
    queueCloudPlayerSave(normalized);
    return true;
  } catch {
    return false;
  }
}

export async function resetPlayerData() {
  const cloudDeleted = await deleteCloudPlayerSave();
  if (!cloudDeleted) return false;

  try {
    const userId = getActiveUserId();
    window.localStorage.removeItem(getPlayerStorageKey(userId));
    if (userId) window.localStorage.removeItem("typequest-player-local-updated:" + userId);
    return true;
  } catch {
    return false;
  }
}

export function createPlayerBackup() {
  return {
    application: "TypeQuest",
    version: 1,
    exportedAt: new Date().toISOString(),
    player: getPlayerData(),
  };
}

export function restorePlayerBackup(backup) {
  if (
    !backup ||
    typeof backup !== "object" ||
    backup.application !== "TypeQuest" ||
    backup.version !== 1 ||
    !backup.player ||
    typeof backup.player !== "object" ||
    Array.isArray(backup.player)
  ) {
    throw new Error("This file is not a supported TypeQuest backup.");
  }

  const normalized = normalizePlayer(backup.player);
  if (!savePlayerData(normalized)) {
    throw new Error("Could not save restored progress on this device.");
  }

  return normalized;
}

function updateStreak(player) {
  const today = getDateKey();
  const yesterday = getDateKey(new Date(Date.now() - 86400000));

  if (player.lastPlayedDate === today) return;

  player.currentStreak =
    player.lastPlayedDate === yesterday ? player.currentStreak + 1 : 1;
  player.lastPlayedDate = today;
}

export function completeGame({
  xp = 0,
  coins = 0,
  wpm = 0,
  accuracy = 0,
  time = 0,
  combo = 0,
  ghostWon = false,
  bossWon = false,
  mode = "Classic",
  score = 0,
  daily = false,
  characterErrors = {},
}) {
  const player = getPlayerData();
  const today = getDateKey();
  const dailyAlreadyRewarded = daily && player.lastDailyDate === today;

  const earnedXp = dailyAlreadyRewarded ? 0 : Math.max(0, numberOr(xp));
  const earnedCoins = dailyAlreadyRewarded ? 0 : Math.max(0, numberOr(coins));

  player.xp += earnedXp;
  player.coins += earnedCoins;
  player.testsCompleted += 1;
  player.totalTime += Math.max(0, numberOr(time));

  const normalizedErrors = normalizeCharacterErrors(characterErrors);
  for (const [character, count] of Object.entries(normalizedErrors)) {
    player.characterErrors[character] = Math.min(
      1000000,
      (player.characterErrors[character] || 0) + count
    );
  }

  if (daily && !dailyAlreadyRewarded) {
    player.lastDailyDate = today;
  }

  if (numberOr(wpm) > player.bestWpm) player.bestWpm = numberOr(wpm);
  if (numberOr(accuracy) > player.bestAccuracy) {
    player.bestAccuracy = Math.min(100, numberOr(accuracy));
  }

  updateStreak(player);

  const stats = {
    wpm: numberOr(wpm),
    accuracy: numberOr(accuracy),
    combo: numberOr(combo),
    // Only Survival mode should grant the Survival achievement.
    survivalTime: mode === "Survival" ? numberOr(time) : 0,
    ghostWon: Boolean(ghostWon),
    bossWon: Boolean(bossWon),
  };

  const newlyUnlocked = [...checkAchievements(player, stats)];
  let leveledUp = false;

  while (player.xp >= 100) {
    player.xp -= 100;
    player.level += 1;
    leveledUp = true;

    const levelAchievements = checkAchievements(player, stats);
    newlyUnlocked.push(...levelAchievements);
  }

  updateUnlockedModes(player);

  player.recentRuns.unshift({
    id: Date.now() + "-" + Math.random().toString(16).slice(2),
    date: today,
    mode,
    wpm: Math.round(numberOr(wpm)),
    accuracy: Math.round(numberOr(accuracy)),
    score: Math.round(numberOr(score)),
    xp: Math.round(earnedXp),
  });

  player.recentRuns = player.recentRuns.slice(0, MAX_RECENT_RUNS);
  const saved = savePlayerData(player);

  return {
    player,
    leveledUp,
    newlyUnlocked,
    dailyRewarded: daily ? !dailyAlreadyRewarded : false,
    saved,
  };
}

function updateUnlockedModes(player) {
  const unlocks = [
    [2, "speed"],
    [3, "combo"],
    [5, "survival"],
    [7, "ghost"],
    [10, "boss"],
  ];

  for (const [requiredLevel, mode] of unlocks) {
    if (player.level >= requiredLevel && !player.unlockedModes.includes(mode)) {
      player.unlockedModes.push(mode);
    }
  }
}

export function checkAchievements(player, stats = {}) {
  const newlyUnlocked = [];

  const {
    wpm = 0,
    accuracy = 0,
    combo = 0,
    survivalTime = 0,
    ghostWon = false,
    bossWon = false,
  } = stats;

  const unlock = (id) => {
    if (player.unlockedAchievements.includes(id)) return;

    const achievement = achievements.find((item) => item.id === id);
    if (!achievement) return;

    player.unlockedAchievements.push(id);
    player.xp += achievement.xp;
    player.coins += achievement.coins;
    newlyUnlocked.push(achievement);
  };

  if (player.testsCompleted >= 1) unlock("first-test");
  if (wpm >= 60) unlock("speed-demon");
  if (accuracy >= 95) unlock("accuracy-master");
  if (combo >= 10) unlock("combo-10");
  if (combo >= 20) unlock("combo-20");
  if (survivalTime >= 60) unlock("survivor");
  if (ghostWon) unlock("ghost-slayer");
  if (bossWon) unlock("boss-killer");
  if (player.level >= 5) unlock("level-5");
  if (player.level >= 10) unlock("level-10");

  return newlyUnlocked;
}
