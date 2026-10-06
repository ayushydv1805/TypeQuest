import { useEffect, useState } from "react";
import { completeGame } from "../utils/storage";

const words = [
  "computer",
  "keyboard",
  "programming",
  "javascript",
  "algorithm",
  "developer",
  "database",
  "technology",
  "network",
  "security",
  "software",
  "internet",
  "frontend",
  "backend",
  "function",
  "variable",
  "innovation",
  "application",
  "development",
  "engineering",
];

function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

function Boss({ onBack }) {
  const [bossHp, setBossHp] = useState(1000);
  const [playerHp, setPlayerHp] = useState(3);

  const [currentWord, setCurrentWord] =
    useState(getRandomWord);

  const [input, setInput] = useState("");

  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  const [correctWords, setCorrectWords] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [resultSaved, setResultSaved] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
const [achievementMessage, setAchievementMessage] =
  useState(null);
  useEffect(() => {
    if (!started || finished) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTime((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished]);

  useEffect(() => {
    if (bossHp <= 0 || playerHp <= 0) {
      setFinished(true);
    }
  }, [bossHp, playerHp]);

  const handleTyping = (event) => {
    const value = event.target.value;

    if (!started) {
      setStarted(true);
    }

    setInput(value);

    if (!value.endsWith(" ")) {
      return;
    }

    const typedWord = value.trim();

    setTotalWords((previous) => previous + 1);

    if (typedWord === currentWord) {
      const newCombo = combo + 1;

      setCombo(newCombo);
      setCorrectWords((previous) => previous + 1);

      if (newCombo > bestCombo) {
        setBestCombo(newCombo);
      }

      let damage = 50;

      // Every 5 combo gives critical damage
      if (newCombo % 5 === 0) {
        damage = 100;
      }

      setBossHp((previous) =>
        Math.max(0, previous - damage)
      );

      setScore(
        (previous) =>
          previous + damage + newCombo * 2
      );

      setCurrentWord(getRandomWord());
    } else {
      setCombo(0);

      setPlayerHp((previous) =>
        Math.max(0, previous - 1)
      );

      setCurrentWord(getRandomWord());
    }

    setInput("");
  };

  const accuracy =
    totalWords === 0
      ? 100
      : Math.round(
          (correctWords / totalWords) * 100
        );

  const wpm =
    time === 0
      ? 0
      : Math.round(
          (correctWords / time) * 60
        );

  const xp = Math.max(
    30,
    Math.round(
      score / 8 +
        accuracy / 2 +
        bestCombo
    )
  );

  useEffect(() => {
    if (!finished || resultSaved) {
      return;
    }

   const reward = completeGame({
  xp,
  coins: Math.max(
    15,
    Math.round(xp / 2)
  ),
  wpm,
  accuracy,
  time,
  combo: bestCombo,
  ghostWon: false,
  bossWon: bossHp <= 0,
  mode: "Boss Battle",
  score,
});
if (
  reward &&
  reward.newlyUnlocked &&
  reward.newlyUnlocked.length > 0
) {
  setAchievementMessage(
    reward.newlyUnlocked[0]
  );
}
    setLevelUp(reward.leveledUp);
    setResultSaved(true);
  }, [
    finished,
    resultSaved,
    xp,
    wpm,
    accuracy,
    time,
  ]);

  const restart = () => {
    window.location.reload();
  };

  if (finished) {
    const won = bossHp <= 0;

    return (
      <div className="game-page">
        <div className="result-card">
            {achievementMessage && (
  <div className="achievement-popup">
    <div className="achievement-popup-icon">
      {achievementMessage.icon}
    </div>

    <div>
      <small>ACHIEVEMENT UNLOCKED</small>

      <h3>
        {achievementMessage.title}
      </h3>

      <p>
        {achievementMessage.description}
      </p>

      <span>
        +{achievementMessage.xp} XP
        {" • "}
        +{achievementMessage.coins} 🪙
      </span>
    </div>
  </div>
)}
          <p className="result-label">
            BOSS BATTLE
          </p>

          <h1>
            {levelUp
              ? "LEVEL UP! 🎉"
              : won
                ? "BOSS DEFEATED! 👾🔥"
                : "YOU WERE DEFEATED 💀"}
          </h1>

          <div className="result-stats">
            <div>
              <span>SCORE</span>
              <strong>{score}</strong>
            </div>

            <div>
              <span>WPM</span>
              <strong>{wpm}</strong>
            </div>

            <div>
              <span>ACCURACY</span>
              <strong>{accuracy}%</strong>
            </div>

            <div>
              <span>BEST COMBO</span>
              <strong>{bestCombo}</strong>
            </div>
          </div>

          <div className="xp-earned">
            +{xp} XP
          </div>

          <button
            className="start-btn"
            onClick={restart}
          >
            FIGHT AGAIN 👾
          </button>

          <button
            className="back-btn"
            onClick={onBack}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const bossHealth =
    (bossHp / 1000) * 100;

  return (
    <div className="game-page boss-page">
      <div className="game-header">
        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="game-title">
          <span>BOSS BATTLE</span>

          <h1>
            Defeat the Typing Boss!
          </h1>
        </div>

        <div className="timer">
          <span>TIME</span>

          <strong>
            {time}s
          </strong>
        </div>
      </div>

      <div className="boss-area">
        <div className="boss-character">
          <div className="boss-icon">
            👾
          </div>

          <h2>TYPING BOSS</h2>

          <div className="boss-hp-container">
            <div
              className="boss-hp"
              style={{
                width: `${bossHealth}%`,
              }}
            />
          </div>

          <p>
            HP: {bossHp} / 1000
          </p>
        </div>

        <div className="boss-vs">
          VS
        </div>

        <div className="player-character">
          <div className="player-icon">
            ⚡
          </div>

          <h2>YOU</h2>

          <div className="player-lives">
            {"❤️".repeat(playerHp)}
            {"🖤".repeat(3 - playerHp)}
          </div>
        </div>
      </div>

      <div className="boss-stats">
        <div>
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>

        <div>
          <span>COMBO</span>
          <strong>🔥 x{combo}</strong>
        </div>

        <div>
          <span>WPM</span>
          <strong>{wpm}</strong>
        </div>

        <div>
          <span>ACCURACY</span>
          <strong>{accuracy}%</strong>
        </div>
      </div>

      <div className="speed-word-card boss-card">
        <p className="speed-label">
          ATTACK THE BOSS
        </p>

        <h2>{currentWord}</h2>

        <input
          value={input}
          onChange={handleTyping}
          autoFocus
          placeholder="Type and press SPACE..."
        />

        <p className="speed-hint">
          Every 5 combo = CRITICAL HIT ⚡
        </p>
      </div>
    </div>
  );
}

export default Boss;