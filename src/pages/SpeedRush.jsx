import { useEffect, useState } from "react";
import { completeGame } from "../utils/storage";

const words = [
  "computer",
  "keyboard",
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

function SpeedRush({ onBack }) {
  const [currentWord, setCurrentWord] = useState(getRandomWord);
  const [input, setInput] = useState("");

  const [time, setTime] = useState(60);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [wordsTyped, setWordsTyped] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [errors, setErrors] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [score, setScore] = useState(0);

  const [resultSaved, setResultSaved] = useState(false);
  const [levelUp, setLevelUp] = useState(false);

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

    setWordsTyped((previous) => previous + 1);

    if (typedWord === currentWord) {
      const newCombo = combo + 1;

      setCorrectWords((previous) => previous + 1);
      setCombo(newCombo);

      if (newCombo > bestCombo) {
        setBestCombo(newCombo);
      }

      const points = 10 + newCombo * 2;

      setScore((previous) => previous + points);

      setCurrentWord(getRandomWord());
    } else {
      setErrors((previous) => previous + 1);
      setCombo(0);
    }

    setInput("");
  };

  const accuracy =
    wordsTyped === 0
      ? 100
      : Math.round((correctWords / wordsTyped) * 100);

  const elapsedTime = Math.max(1, 60 - time);

  const wpm = Math.round(
    (correctWords / elapsedTime) * 60
  );

  const xp = Math.max(
    15,
    Math.round(score / 10 + accuracy / 2)
  );

  useEffect(() => {
    if (!finished || resultSaved) {
      return;
    }

    const reward = completeGame({
      xp,
      coins: Math.max(5, Math.round(xp / 2)),
      wpm,
      accuracy,
      time: elapsedTime,
    });

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
          <p className="result-label">
            SPEED RUSH COMPLETE
          </p>

          <h1>
            {levelUp ? "LEVEL UP! 🎉" : "Nice Run! ⚡"}
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
              <span>Words</span>
              <strong>{correctWords}</strong>
            </div>

            <div>
              <span>Best Combo</span>
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
            PLAY AGAIN ⚡
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
    <div className="game-page speed-page">
      <div className="game-header">
        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="game-title">
          <span>SPEED RUSH</span>
          <h1>Type as fast as you can!</h1>
        </div>

        <div className="timer">
          <span>TIME</span>
          <strong>
            00:{String(time).padStart(2, "0")}
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
          <span>ACCURACY</span>
          <strong>{accuracy}%</strong>
        </div>

        <div>
          <span>COMBO</span>
          <strong>🔥 x{combo}</strong>
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
          placeholder="Type here..."
          disabled={finished}
        />

        <p className="speed-hint">
          Press SPACE after every word
        </p>
      </div>
    </div>
  );
}

export default SpeedRush;