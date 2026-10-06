export function calculateWPM(charactersTyped, timeInSeconds) {
  if (timeInSeconds <= 0 || charactersTyped <= 0) return 0;

  const words = charactersTyped / 5;
  const minutes = timeInSeconds / 60;

  return Math.round(words / minutes);
}

export function calculateAccuracy(correctChars, totalChars) {
  if (totalChars <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((correctChars / totalChars) * 100)));
}

export function calculateScore(wpm, accuracy) {
  return Math.max(0, Math.round(wpm * (accuracy / 100) * 100));
}

export function calculateXP(wpm, accuracy) {
  return Math.max(10, Math.round(wpm + accuracy / 2));
}

export function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailyChallengeIndex(length, date = new Date()) {
  if (length <= 0) return 0;

  const key = getDateKey(date);
  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) % length;
}
