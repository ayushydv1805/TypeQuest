/* eslint-disable react-hooks/set-state-in-effect -- Timer completion and one-time reward saving intentionally update the game UI from effects. */
import { useEffect, useState } from "react";
import { typingTexts } from "../data/texts";
import AchievementToast from "../components/AchievementToast";
import TypingBox from "../components/TypingBox";
import {
  calculateWPM,
  calculateAccuracy,
  calculateScore,
  calculateXP,
  getDailyChallengeIndex,
} from "../utils/gamelogic";
import { completeGame } from "../utils/storage";

function Game({ onBack, daily = false }) {
  const [text] = useState(() => {
    if (daily) {
      return typingTexts[getDailyChallengeIndex(typingTexts.length)];
    }

    return typingTexts[Math.floor(Math.random() * typingTexts.length)];
  });

  const [input, setInput] = useState("");
  const [time, setTime] = useState(60);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [correctChars, setCorrectChars] = useState(0);
  const [errors, setErrors] = useState(0);
  const [achievement, setAchievement] = useState(null);
  const [saved, setSaved] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [dailyRewarded, setDailyRewarded] = useState(false);

  useEffect(() => {
    if (!started || finished || time <= 0) return undefined;

    const timer = window.setInterval(() => {
      setTime((previousTime) => previousTime - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, finished, time]);

  useEffect(() => {
    if (time === 0 && started) setFinished(true);
  }, [time, started]);

  const handleTyping = (event) => {
    const value = event.target.value.slice(0, text.length);

    if (!started) setStarted(true);

    let correct = 0;
    let mistake = 0;

    for (let index = 0; index < value.length; index += 1) {
      if (value[index] === text[index]) correct += 1;
      else mistake += 1;
    }

    setInput(value);
    setCorrectChars(correct);
    setErrors(mistake);

    if (value === text) setFinished(true);
  };

  const totalTyped = input.length;
  const elapsedTime = Math.max(1, 60 - time);
  const wpm = calculateWPM(correctChars, elapsedTime);
  const accuracy = calculateAccuracy(correctChars, totalTyped);
  const score = calculateScore(wpm, accuracy);
  const baseXp = calculateXP(wpm, accuracy);
  const xp = daily ? Math.round(baseXp * 1.25) + 10 : baseXp;
  const coins = Math.max(5, Math.round(xp / 2)) + (daily ? 5 : 0);

  useEffect(() => {
    if (!finished || saved) return;

    const result = completeGame({
      xp,
      coins,
      wpm,
      accuracy,
      time: elapsedTime,
      combo: 0,
      ghostWon: false,
      bossWon: false,
      mode: daily ? "Daily Challenge" : "Classic",
      score,
      daily,
    });

    setLevelUp(result.leveledUp);
    setDailyRewarded(result.dailyRewarded);

    if (result.newlyUnlocked.length > 0) {
      setAchievement(result.newlyUnlocked[0]);
    }

    setSaved(true);
  }, [finished, saved, xp, coins, wpm, accuracy, elapsedTime, score, daily]);

  if (finished) {
    return (
      <div className="game-page">
        <div className="result-card">
          <p className="result-label">
            {daily ? "DAILY CHALLENGE COMPLETE" : "CHALLENGE COMPLETE"}
          </p>

          <h1>
            {levelUp
              ? "LEVEL UP! 🎉"
              : daily
                ? dailyRewarded
                  ? "Daily quest claimed! 🌟"
                  : "Daily replay complete 🔁"
                : "Great Job! 🎉"}
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
              <span>Errors</span>
              <strong>{errors}</strong>
            </div>
            <div>
              <span>Score</span>
              <strong>{score}</strong>
            </div>
          </div>

          <div className="xp-earned">
            {daily && !dailyRewarded ? "+0 XP • Daily reward already claimed" : `+${xp} XP`}
          </div>

          <button className="start-btn" onClick={() => window.location.reload()}>
            PLAY AGAIN ⚡
          </button>

          <button className="back-btn" onClick={onBack}>
            ← Back to Home
          </button>
        </div>

        <AchievementToast
          achievement={achievement}
          onClose={() => setAchievement(null)}
        />
      </div>
    );
  }

  return (
    <div className={`game-page ${daily ? "daily-game-page" : ""}`}>
      <div className="game-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>

        <div className="game-title">
          <span>{daily ? "DAILY QUEST" : "CLASSIC MODE"}</span>
          <h1>{daily ? "One challenge. Every day." : "Type the text below"}</h1>
        </div>

        <div className="timer">
          <span>TIME</span>
          <strong>00:{String(time).padStart(2, "0")}</strong>
        </div>
      </div>

      {daily && (
        <div className="daily-banner">
          <span>🌟 DAILY CHALLENGE</span>
          <strong>+25% base XP + bonus coins on your first clear today</strong>
        </div>
      )}

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

      <TypingBox text={text} value={input} onChange={handleTyping} disabled={finished} />

      <AchievementToast
        achievement={achievement}
        onClose={() => setAchievement(null)}
      />
    </div>
  );
}

export default Game;
