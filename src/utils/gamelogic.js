export function calculateWPM(charactersTyped, timeInSeconds) {
  if (timeInSeconds <= 0) {
    return 0;
  }

  const words = charactersTyped / 5;
  const minutes = timeInSeconds / 60;

  return Math.round(words / minutes);
}

export function calculateAccuracy(correctChars, totalChars) {
  if (totalChars === 0) {
    return 100;
  }

  return Math.round((correctChars / totalChars) * 100);
}

export function calculateScore(wpm, accuracy) {
  return Math.round(wpm * accuracy);
}

export function calculateXP(wpm, accuracy) {
  return Math.max(10, Math.round(wpm + accuracy / 2));
}