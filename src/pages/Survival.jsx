import { useEffect, useState } from "react";
import { completeGame } from "../utils/storage";

const words = [
  "keyboard",
  "computer",
  "programming",
  "javascript",
  "developer",
  "algorithm",
  "database",
  "internet",
  "software",
  "technology",
  "react",
  "python",
  "function",
  "variable",
  "network",
  "security",
  "website",
  "coding",
  "frontend",
  "backend",
  "design",
  "system",
  "digital",
  "future",
  "innovation",
];

function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

function Survival({ onBack }) {
  const [currentWord, setCurrentWord] = useState(getRandomWord);
  const [input, setInput] = useState("");

  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  const [correctWords, setCorrectWords] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [resultSaved, setResultSaved] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
const [achievementMessage, setAchievementMessage] =
  useState(null);
  const difficulty = Math.floor(correctWords / 10) + 1;

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
    if (lives <= 0) {
      setFinished(true);
    }
  }, [lives]);

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

      const points =
        10 +
        newCombo +
        (difficulty - 1) * 5;

      setScore((previous) => previous + points);

      setCurrentWord(getRandomWord());
    } else {
      setLives((previous) => previous - 1);
      setCombo(0);
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
      : Math.round((correctWords / time) * 60);

  const xp = Math.max(
    20,
    Math.round(
      score / 8 +
        correctWords / 2 +
        accuracy / 2
    )
  );

  useEffect(() => {
    if (!finished || resultSaved) {
      return;
    }

    const reward = completeGame({
  xp,
  coins: Math.max(
    10,
    Math.round(xp / 2)
  ),
  wpm,
  accuracy,
  time,
  combo: bestCombo,
  ghostWon: false,
  bossWon: false,
  mode: "Survival",
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
            SURVIVAL COMPLETE
          </p>

          <h1>
            {levelUp
              ? "LEVEL UP! 🎉"
              : "Game Over 💀"}
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

          <div className="survival-result">
            Survived for{" "}
            <strong>{time}s</strong>
          </div>

          <div className="xp-earned">
            +{xp} XP
          </div>

          <button
            className="start-btn"
            onClick={restart}
          >
            PLAY AGAIN 💀
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

  return (
    <div className="game-page survival-page">
      <div className="game-header">
        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="game-title">
          <span>SURVIVAL MODE</span>

          <h1>
            How long can you survive?
          </h1>
        </div>

        <div className="timer">
          <span>SURVIVED</span>

          <strong>
            {time}s
          </strong>
        </div>
      </div>

      <div className="survival-status">
        <div className="lives">
          <span>LIVES</span>

          <strong>
            {"❤️".repeat(lives)}
            {"🖤".repeat(3 - lives)}
          </strong>
        </div>

        <div className="difficulty">
          <span>DIFFICULTY</span>

          <strong>
            LEVEL {difficulty}
          </strong>
        </div>

        <div className="combo">
          <span>COMBO</span>

          <strong>
            🔥 x{combo}
          </strong>
        </div>
      </div>

      <div className="live-stats">
        <div>
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>

        <div>
          <span>WPM</span>
          <strong>{wpm}</strong>
        </div>

        <div>
          <span>WORDS</span>
          <strong>{correctWords}</strong>
        </div>

        <div>
          <span>ACCURACY</span>
          <strong>{accuracy}%</strong>
        </div>
      </div>

      <div className="speed-word-card survival-card">
        <p className="speed-label">
          TYPE BEFORE YOU LOSE A LIFE
        </p>

        <h2>{currentWord}</h2>

        <input
          value={input}
          onChange={handleTyping}
          autoFocus
          placeholder="Type and press SPACE..."
          disabled={finished}
        />

        <p className="speed-hint">
          One mistake costs you ❤️
        </p>
      </div>
    </div>
  );
}

export default Survival;