import { achievements } from "./achievements";
import { getDateKey } from "./gamelogic";

const PLAYER_KEY = "typequest-player";
const MAX_RECENT_RUNS = 8;

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
    recentRuns: [],
    unlockedModes: ["classic"],
    unlockedAchievements: [],
    unlockedThemes: [],
    equippedTheme: "default",
  };
}

function numberOr(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function normalizePlayer(player = {}) {
  const base = createDefaultPlayer();

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
    recentRuns: Array.isArray(player.recentRuns) ? player.recentRuns.slice(0, MAX_RECENT_RUNS) : [],
    unlockedModes: Array.isArray(player.unlockedModes) && player.unlockedModes.length
      ? [...new Set(["classic", ...player.unlockedModes])]
      : ["classic"],
    unlockedAchievements: Array.isArray(player.unlockedAchievements) ? [...new Set(player.unlockedAchievements)] : [],
    unlockedThemes: Array.isArray(player.unlockedThemes) ? [...new Set(player.unlockedThemes)] : [],
    equippedTheme: typeof player.equippedTheme === "string" ? player.equippedTheme : "default",
  };
}

export function getPlayerData() {
  try {
    const raw = localStorage.getItem(PLAYER_KEY);
    if (!raw) return createDefaultPlayer();

    return normalizePlayer(JSON.parse(raw));
  } catch {
    return createDefaultPlayer();
  }
}

export function savePlayerData(data) {
  localStorage.setItem(PLAYER_KEY, JSON.stringify(normalizePlayer(data)));
}

export function resetPlayerData() {
  localStorage.removeItem(PLAYER_KEY);
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
}) {
  const player = getPlayerData();

  player.xp += Math.max(0, numberOr(xp));
  player.coins += Math.max(0, numberOr(coins));
  player.testsCompleted += 1;
  player.totalTime += Math.max(0, numberOr(time));

  if (wpm > player.bestWpm) player.bestWpm = wpm;
  if (accuracy > player.bestAccuracy) player.bestAccuracy = accuracy;

  updateStreak(player);

  const stats = {
    wpm,
    accuracy,
    combo,
    survivalTime: time,
    ghostWon,
    bossWon,
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
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: getDateKey(),
    mode,
    wpm: Math.round(numberOr(wpm)),
    accuracy: Math.round(numberOr(accuracy)),
    score: Math.round(numberOr(score)),
    xp: Math.round(numberOr(xp)),
  });

  player.recentRuns = player.recentRuns.slice(0, MAX_RECENT_RUNS);
  savePlayerData(player);

  return {
    player,
    leveledUp,
    newlyUnlocked,
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
