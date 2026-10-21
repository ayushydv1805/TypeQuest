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


export function getCharacterErrorCounts(targetText, typedText) {
  const errors = {};
  const target = String(targetText || "");
  const typed = String(typedText || "");
  const length = Math.min(target.length, typed.length);

  for (let index = 0; index < length; index += 1) {
    if (typed[index] === target[index]) continue;

    const expected = target[index].toLowerCase();
    if (!/^[a-z0-9]$/.test(expected)) continue;

    errors[expected] = (errors[expected] || 0) + 1;
  }

  return errors;
}


export function accumulateCharacterMistakes(previousText, nextText, targetText, existingErrors = {}) {
  const previous = String(previousText || "");
  const next = String(nextText || "");
  const target = String(targetText || "");
  const updated = { ...existingErrors };

  let prefix = 0;
  while (
    prefix < previous.length &&
    prefix < next.length &&
    previous[prefix] === next[prefix]
  ) {
    prefix += 1;
  }

  // Normal typing appends characters. For edits/pastes, count only the changed
  // region so existing characters are not counted again on every keypress.
  let nextEnd = next.length;
  let previousEnd = previous.length;
  while (
    nextEnd > prefix &&
    previousEnd > prefix &&
    next[nextEnd - 1] === previous[previousEnd - 1]
  ) {
    nextEnd -= 1;
    previousEnd -= 1;
  }

  if (next.startsWith(previous) && next.length >= previous.length) {
    prefix = previous.length;
    nextEnd = next.length;
  }

  for (let index = prefix; index < nextEnd; index += 1) {
    const expected = target[index]?.toLowerCase();
    if (!expected || next[index] === target[index] || !/^[a-z0-9]$/.test(expected)) {
      continue;
    }
    updated[expected] = (Number(updated[expected]) || 0) + 1;
  }

  return updated;
}
