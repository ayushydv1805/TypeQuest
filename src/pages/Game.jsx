import { useEffect, useState } from "react";
import { typingTexts } from "../data/texts";
import AchievementToast from "../components/AchievementToast";
import {
  calculateWPM,
  calculateAccuracy,
  calculateScore,
  calculateXP,
} from "../utils/gameLogic";

//import { completeGame } from "../utils/storage";
import { completeGame, getPlayerData } from "../utils/storage";
function Game() {
  const [text] = useState(
    () => typingTexts[Math.floor(Math.random() * typingTexts.length)]
  );

  const [input, setInput] = useState("");
  const [time, setTime] = useState(60);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [correctChars, setCorrectChars] = useState(0);
  const [errors, setErrors] = useState(0);
const [achievement, setAchievement] = useState(null);
  const [saved, setSaved] = useState(false);
const [achievementMessage, setAchievementMessage] =
  useState(null);
  useEffect(() => {
    if (!started || finished || time <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTime((previousTime) => previousTime - 1);
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

    let correct = 0;
    let mistake = 0;

    for (let i = 0; i < value.length; i += 1) {
      if (value[i] === text[i]) {
        correct += 1;
      } else {
        mistake += 1;
      }
    }

    setInput(value);
    setCorrectChars(correct);
    setErrors(mistake);

    if (value === text) {
      setFinished(true);
    }
  };

  const totalTyped = input.length;

  const elapsedTime = Math.max(1, 60 - time);

  const wpm = calculateWPM(
    correctChars,
    elapsedTime
  );

  const accuracy = calculateAccuracy(
    correctChars,
    totalTyped
  );

  const score = calculateScore(
    wpm,
    accuracy
  );

  const xp = calculateXP(
    wpm,
    accuracy
  );

  useEffect(() => {
  if (!finished || saved) {
    return;
  }

  const result = completeGame({
  xp,
  coins: Math.max(5, Math.round(xp / 2)),
  wpm,
  accuracy,
  time: elapsedTime,
  combo: 0,
  ghostWon: false,
  bossWon: false,
});
if (result.newlyUnlocked?.length > 0) {
  setAchievement(result.newlyUnlocked[0]);
}
  if (
    result &&
    result.newlyUnlocked &&
    result.newlyUnlocked.length > 0
  ) {
    setAchievementMessage(
      result.newlyUnlocked[0]
    );
  }

  setSaved(true);
}, [
  finished,
  saved,
  xp,
  wpm,
  accuracy,
  elapsedTime,
]);
    

  const restartGame = () => {
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
            CHALLENGE COMPLETE
          </p>

          <h1>Great Job! 🎉</h1>

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
              <span>Errors</span>
              <strong>{errors}</strong>
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
            onClick={restartGame}
          >
            PLAY AGAIN ⚡
          </button>

          <button
            className="back-btn"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <button
          className="back-btn"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          ← Back
        </button>

        <div className="game-title">
          <span>CLASSIC MODE</span>
          <h1>Type the text below</h1>
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
          <span>WPM</span>
          <strong>{wpm}</strong>
        </div>

        <div>
          <span>ACCURACY</span>
          <strong>{accuracy}%</strong>
        </div>

        <div>
          <span>ERRORS</span>
          <strong>{errors}</strong>
        </div>

        <div>
          <span>CHARACTERS</span>
          <strong>{input.length}</strong>
        </div>
      </div>

      <div className="typing-card">
        <div className="typing-text">
          {text.split("").map((character, index) => {
            let className = "";

            if (index < input.length) {
              className =
                input[index] === character
                  ? "correct"
                  : "incorrect";
            }

            if (index === input.length) {
              className = "current";
            }

            return (
              <span
                className={className}
                key={`${character}-${index}`}
              >
                {character}
              </span>
            );
          })}
        </div>

        <textarea
          value={input}
          onChange={handleTyping}
          autoFocus
          placeholder="Start typing here..."
          disabled={finished}
        />

        {!started && (
          <p className="typing-hint">
            Start typing to begin the timer ⚡
          </p>
        )}
      </div>
      <AchievementToast
  achievement={achievement}
  onClose={() => setAchievement(null)}
/>
    </div>
  );
}

export default Game;