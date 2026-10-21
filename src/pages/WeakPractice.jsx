/* eslint-disable react-hooks/set-state-in-effect -- Timer completion and one-time reward saving intentionally update the practice UI from effects. */
import { useEffect, useRef, useState } from "react";
import { getPlayerData, completeGame } from "../utils/storage";
import {
  calculateAccuracy,
  calculateScore,
  calculateWPM,
  calculateXP,
  accumulateCharacterMistakes,
} from "../utils/gamelogic";

const PRACTICE_WORDS = [
  "the", "there", "their", "these", "those", "think", "thing", "through",
  "people", "practice", "progress", "keyboard", "typing", "programming",
  "quick", "quiet", "question", "quality", "yellow", "journey", "little",
  "letter", "better", "remember", "number", "between", "because", "beautiful",
  "favorite", "different", "important", "answer", "another", "around", "always",
  "computer", "developer", "variable", "function", "problem", "solution",
  "success", "accuracy", "speed", "focus", "regular", "improve", "confidence",
  "character", "challenge", "experience", "learning", "consistent",
];

const DEFAULT_TEXT =
  "steady practice builds faster fingers and better accuracy. focus on each character, keep a comfortable rhythm, and learn from every mistake.";

function buildPracticeText(characterErrors) {
  const weak = Object.entries(characterErrors || {})
    .filter(([, count]) => Number(count) > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([character]) => character.toLowerCase());

  if (!weak.length) return DEFAULT_TEXT;

  const matches = PRACTICE_WORDS.filter((word) =>
    weak.some((character) => word.includes(character))
  );
  const selected = [...new Set([...matches, ...PRACTICE_WORDS.slice(0, 12)])];
  const words = [];
  let index = 0;

  while (words.join(" ").length < 190 && index < 100) {
    words.push(selected[index % selected.length]);
    index += 1;
  }

  return words.join(" ").slice(0, 230);
}

function WeakPractice({ onBack }) {
  const [text] = useState(() => buildPracticeText(getPlayerData().characterErrors));
  const [input, setInput] = useState("");
  const [time, setTime] = useState(60);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const characterErrorsRef = useRef({});
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    if (!started || finished || time <= 0) return undefined;

    const timer = window.setInterval(() => {
      setTime((previous) => previous - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, finished, time]);

  useEffect(() => {
    if (started && time === 0) setFinished(true);
  }, [started, time]);

  const handleTyping = (event) => {
    const value = event.target.value.slice(0, text.length);
    characterErrorsRef.current = accumulateCharacterMistakes(
      input,
      value,
      text,
      characterErrorsRef.current
    );

    if (!started) setStarted(true);

    let mistakes = 0;
    for (let index = 0; index < value.length; index += 1) {
      if (value[index] !== text[index]) mistakes += 1;
    }

    setInput(value);
    setErrors(mistakes);

    if (value === text) setFinished(true);
  };

  const correctChars = (() => {
    let total = 0;
    for (let index = 0; index < input.length; index += 1) {
      if (input[index] === text[index]) total += 1;
    }
    return total;
  })();
  const elapsedTime = Math.max(1, 60 - time);
  const wpm = calculateWPM(correctChars, elapsedTime);
  const accuracy = calculateAccuracy(correctChars, input.length);
  const score = calculateScore(wpm, accuracy);
  const xp = calculateXP(wpm, accuracy);

  useEffect(() => {
    if (!finished || resultSaved) return;

    const reward = completeGame({
      xp,
      coins: Math.max(5, Math.round(xp / 2)),
      wpm,
      accuracy,
      time: elapsedTime,
      combo: 0,
      ghostWon: false,
      bossWon: false,
      mode: "Weak-key Practice",
      score,
      characterErrors: characterErrorsRef.current,
    });

    setLevelUp(reward.leveledUp);
    setResultSaved(true);
  }, [finished, resultSaved, xp, wpm, accuracy, elapsedTime, score]);

  if (finished) {
    return (
      <div className="game-page">
        <div className="result-card">
          <p className="result-label">WEAK-KEY PRACTICE COMPLETE</p>
          <h1>{levelUp ? "LEVEL UP! 🎉" : "Practice makes progress."}</h1>
          <div className="result-stats">
            <div><span>WPM</span><strong>{wpm}</strong></div>
            <div><span>ACCURACY</span><strong>{accuracy}%</strong></div>
            <div><span>ERRORS NOW</span><strong>{errors}</strong></div>
            <div><span>CHARACTERS</span><strong>{input.length}</strong></div>
          </div>
          <div className="xp-earned">+{xp} XP</div>
          <p className="insight-copy">Your repeated mistakes were saved to Typing Insights to shape future practice.</p>
          <button className="start-btn" onClick={onBack}>BACK TO DASHBOARD</button>
        </div>
      </div>
    );
  }

  const recordedMistakes = Object.values(characterErrorsRef.current).reduce((sum, count) => sum + count, 0);

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="game-title">
          <span>PERSONAL PRACTICE</span>
          <h1>Train the characters you miss most</h1>
        </div>
        <div className="timer">
          <span>TIME</span>
          <strong>00:{String(time).padStart(2, "0")}</strong>
        </div>
      </div>

      <p className="insight-copy">Mistyped characters are counted while you type, even if you correct them before finishing.</p>

      <div className="live-stats">
        <div><span>WPM</span><strong>{wpm}</strong></div>
        <div><span>ACCURACY</span><strong>{accuracy}%</strong></div>
        <div><span>MISTAKES</span><strong>{recordedMistakes}</strong></div>
        <div><span>PROGRESS</span><strong>{Math.round((input.length / text.length) * 100)}%</strong></div>
      </div>

      <div className="typing-card">
        <div className="typing-text" aria-label="Weak-key practice text">
          {text.split("").map((character, index) => {
            let className = "";
            if (index < input.length) className = input[index] === character ? "correct" : "incorrect";
            if (index === input.length) className = "current";

            return <span className={className} key={index}>{character}</span>;
          })}
        </div>
        <textarea
          value={input}
          onChange={handleTyping}
          maxLength={text.length}
          autoFocus
          disabled={finished}
          spellCheck={false}
          placeholder="Start typing to begin the 60-second practice..."
          aria-label="Type your weak-key practice text"
        />
        {!started && <p className="typing-hint">Start typing when you are ready. Accuracy matters more than rushing.</p>}
      </div>
    </div>
  );
}

export default WeakPractice;
