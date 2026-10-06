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

function Combo({ onBack }) {
  const [currentWord, setCurrentWord] = useState(getRandomWord);
  const [input, setInput] = useState("");

  const [time, setTime] = useState(60);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  const [correctWords, setCorrectWords] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  const [score, setScore] = useState(0);

  const [resultSaved, setResultSaved] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
const [achievementMessage, setAchievementMessage] =
  useState(null);
  useEffect(() => {
    if (!started || finished || time <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTime((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished, time]);

  useEffect(() => {
    if (time === 0 && started) {
      setFinished(true);
    }
  }, [time, started]);

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

      const multiplier = Math.min(
        5,
        1 + Math.floor(newCombo / 5)
      );

      const points = 10 * multiplier;

      setScore((previous) => previous + points);

      setCurrentWord(getRandomWord());
    } else {
      setCombo(0);
      setInput("");
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

  const elapsedTime = Math.max(1, 60 - time);

  const wpm = Math.round(
    (correctWords / elapsedTime) * 60
  );

  const multiplier = Math.min(
    5,
    1 + Math.floor(combo / 5)
  );

  const xp = Math.max(
    20,
    Math.round(score / 8 + accuracy / 2)
  );

  useEffect(() => {
    if (!finished || resultSaved) {
      return;
    }

   const reward = completeGame({
  xp,
  coins: Math.max(10, Math.round(xp / 2)),
  wpm,
  accuracy,
  time: elapsedTime,
  combo: bestCombo,
  ghostWon: false,
  bossWon: false,
  mode: "Combo",
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
    elapsedTime,
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
            COMBO CHALLENGE COMPLETE
          </p>

          <h1>
            {levelUp
              ? "LEVEL UP! 🎉"
              : "Combo Complete! 🔥"}
          </h1>

          <div className="result-stats">
            <div>
              <span>WPM</span>
              <strong>{wpm}</strong>
            </div>

            <div>
              <span>Accuracy</span>
              <strong>{accuracy}%</strong>
            </div>

            <div>
              <span>Best Combo</span>
              <strong>{bestCombo}</strong>
            </div>

            <div>
              <span>Score</span>
              <strong>{score}</strong>
            </div>
          </div>

          <div className="xp-earned">
            +{xp} XP
          </div>

          <button
            className="start-btn"
            onClick={restart}
          >
            PLAY AGAIN 🔥
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
    <div className="game-page combo-page">
      <div className="game-header">
        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="game-title">
          <span>COMBO MODE</span>
          <h1>Don't break the streak!</h1>
        </div>

        <div className="timer">
          <span>TIME</span>

          <strong>
            00:{String(time).padStart(2, "0")}
          </strong>
        </div>
      </div>

      <div className="combo-display">
        <span>COMBO</span>

        <strong>
          🔥 x{combo}
        </strong>

        <p>
          {combo >= 30
            ? "UNSTOPPABLE 🔥🔥🔥"
            : combo >= 20
              ? "ON FIRE 🔥🔥"
              : combo >= 10
                ? "NICE STREAK 🔥"
                : "Keep going!"}
        </p>
      </div>

      <div className="live-stats">
        <div>
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>

        <div>
          <span>MULTIPLIER</span>
          <strong>x{multiplier}</strong>
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

      <div className="speed-word-card">
        <p className="speed-label">
          TYPE THIS WORD
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
          One mistake resets your combo!
        </p>
      </div>
    </div>
  );
}

export default Combo;