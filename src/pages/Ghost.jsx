import { useEffect, useState } from "react";
import { completeGame, getPlayerData } from "../utils/storage";

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

function Ghost({ onBack }) {
  const player = getPlayerData();

  const ghostWpm = Math.max(20, player.bestWpm);

  const [currentWord, setCurrentWord] =
    useState(getRandomWord);

  const [input, setInput] = useState("");

  const [time, setTime] = useState(60);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [correctWords, setCorrectWords] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  const [score, setScore] = useState(0);
  const [ghostWords, setGhostWords] = useState(0);

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

  // Move ghost according to previous best WPM
  useEffect(() => {
    if (!started || finished) {
      return undefined;
    }

    const interval = setInterval(() => {
      setGhostWords((previous) => previous + 1);
    }, Math.max(700, 60000 / ghostWpm));

    return () => clearInterval(interval);
  }, [started, finished, ghostWpm]);

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
      setCorrectWords((previous) => previous + 1);
      setScore((previous) => previous + 10);
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

  const distance = correctWords - ghostWords;

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
  combo: 0,
  ghostWon: distance >= 0,
  bossWon: false,
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
    const won = distance >= 0;

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
            GHOST RACE COMPLETE
          </p>

          <h1>
            {levelUp
              ? "LEVEL UP! 🎉"
              : won
                ? "YOU BEAT THE GHOST! 👻🔥"
                : "The Ghost Won 👻"}
          </h1>

          <div className="result-stats">
            <div>
              <span>YOUR WPM</span>
              <strong>{wpm}</strong>
            </div>

            <div>
              <span>GHOST WPM</span>
              <strong>{ghostWpm}</strong>
            </div>

            <div>
              <span>ACCURACY</span>
              <strong>{accuracy}%</strong>
            </div>

            <div>
              <span>SCORE</span>
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
            RACE AGAIN 👻
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
    <div className="game-page ghost-page">
      <div className="game-header">
        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="game-title">
          <span>GHOST MODE</span>
          <h1>Beat your previous best!</h1>
        </div>

        <div className="timer">
          <span>TIME</span>
          <strong>
            00:{String(time).padStart(2, "0")}
          </strong>
        </div>
      </div>

      <div className="ghost-race">
        <div className="racer">
          <span>👻 GHOST</span>

          <strong>{ghostWords} words</strong>

          <div className="race-bar">
            <div
              className="ghost-progress"
              style={{
                width: `${Math.min(
                  100,
                  ghostWords * 2
                )}%`,
              }}
            />
          </div>

          <small>
            Best: {ghostWpm} WPM
          </small>
        </div>

        <div className="racer you">
          <span>⚡ YOU</span>

          <strong>{correctWords} words</strong>

          <div className="race-bar">
            <div
              className="your-progress"
              style={{
                width: `${Math.min(
                  100,
                  correctWords * 2
                )}%`,
              }}
            />
          </div>

          <small>
            Current: {wpm} WPM
          </small>
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
          <span>ACCURACY</span>
          <strong>{accuracy}%</strong>
        </div>

        <div>
          <span>GAP</span>
          <strong>
            {distance >= 0 ? "+" : ""}
            {distance}
          </strong>
        </div>
      </div>

      <div className="speed-word-card">
        <p className="speed-label">
          TYPE BEFORE THE GHOST
        </p>

        <h2>{currentWord}</h2>

        <input
          value={input}
          onChange={handleTyping}
          autoFocus
          placeholder="Type and press SPACE..."
        />

        <p className="speed-hint">
          Your previous best is the ghost.
        </p>
      </div>
    </div>
  );
}

export default Ghost;