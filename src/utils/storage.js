import { achievements } from "./achievements";
export function getPlayerData() {
  const data = localStorage.getItem("typequest-player");

  if (data) {
    const player = JSON.parse(data);

    // Make sure old saved data also gets new properties
    return {
      level: player.level ?? 1,
      xp: player.xp ?? 0,
      coins: player.coins ?? 0,
      bestWpm: player.bestWpm ?? 0,
      bestAccuracy: player.bestAccuracy ?? 0,
      testsCompleted: player.testsCompleted ?? 0,
      totalTime: player.totalTime ?? 0,
      unlockedModes: player.unlockedModes ?? ["classic"],
      unlockedAchievements:
  player.unlockedAchievements ?? [],
  unlockedThemes:
  player.unlockedThemes ?? [],
equippedTheme:
  player.equippedTheme ?? "default",
    };
  }

  return {
    level: 1,
    xp: 0,
    coins: 0,
    bestWpm: 0,
    bestAccuracy: 0,
    testsCompleted: 0,
    totalTime: 0,
    unlockedModes: ["classic"],
     unlockedAchievements: [],
     unlockedThemes: [],
equippedTheme: "default",
  };
}

export function savePlayerData(data) {
  localStorage.setItem(
    "typequest-player",
    JSON.stringify(data)
  );
}
export function completeGame({
  xp,
  coins,
  wpm,
  accuracy,
  time,
  combo = 0,
  ghostWon = false,
  bossWon = false,
}) {
  const player = getPlayerData();

  // Add game rewards
  player.xp += xp;
  player.coins += coins;

  // Update statistics
  player.testsCompleted += 1;
  player.totalTime += time;

  // Best WPM
  if (wpm > player.bestWpm) {
    player.bestWpm = wpm;
  }

  // Best accuracy
  if (accuracy > player.bestAccuracy) {
    player.bestAccuracy = accuracy;
  }

  // Check achievements BEFORE saving
  const newlyUnlocked = checkAchievements(player, {
    wpm,
    accuracy,
    combo,
    survivalTime: time,
    ghostWon,
    bossWon,
  });

  let leveledUp = false;

  // Level up every 100 XP
  while (player.xp >= 100) {
    player.xp -= 100;
    player.level += 1;
    leveledUp = true;
  }

  // Unlock game modes
  updateUnlockedModes(player);

  // Save everything
  savePlayerData(player);

  return {
    player,
    leveledUp,
    newlyUnlocked,
  };
}

function updateUnlockedModes(player) {
  // Level 2 → Speed Rush
  if (
    player.level >= 2 &&
    !player.unlockedModes.includes("speed")
  ) {
    player.unlockedModes.push("speed");
  }

  // Level 3 → Combo
  if (
    player.level >= 3 &&
    !player.unlockedModes.includes("combo")
  ) {
    player.unlockedModes.push("combo");
  }

  // Level 5 → Survival
  if (
    player.level >= 5 &&
    !player.unlockedModes.includes("survival")
  ) {
    player.unlockedModes.push("survival");
  }

  // Level 7 → Ghost
  if (
    player.level >= 7 &&
    !player.unlockedModes.includes("ghost")
  ) {
    player.unlockedModes.push("ghost");
  }

  // Level 10 → Boss Battle
  if (
    player.level >= 10 &&
    !player.unlockedModes.includes("boss")
  ) {
    player.unlockedModes.push("boss");
  }
}export function checkAchievements(player, stats = {}) {
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
    if (
      !player.unlockedAchievements.includes(id)
    ) {
      const achievement = achievements.find(
        (item) => item.id === id
      );

      if (achievement) {
        player.unlockedAchievements.push(id);

        player.xp += achievement.xp;
        player.coins += achievement.coins;

        newlyUnlocked.push(achievement);
      }
    }
  };

  if (player.testsCompleted >= 1) {
    unlock("first-test");
  }

  if (wpm >= 60) {
    unlock("speed-demon");
  }

  if (accuracy >= 95) {
    unlock("accuracy-master");
  }

  if (combo >= 10) {
    unlock("combo-10");
  }

  if (combo >= 20) {
    unlock("combo-20");
  }

  if (survivalTime >= 60) {
    unlock("survivor");
  }

  if (ghostWon) {
    unlock("ghost-slayer");
  }

  if (bossWon) {
    unlock("boss-killer");
  }

  if (player.level >= 5) {
    unlock("level-5");
  }

  if (player.level >= 10) {
    unlock("level-10");
  }

  return newlyUnlocked;
}