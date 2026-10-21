import assert from "node:assert/strict";
import test from "node:test";

import {
  accumulateCharacterMistakes,
  calculateAccuracy,
  calculateScore,
  calculateWPM,
  getCharacterErrorCounts,
  getDailyChallengeIndex,
} from "./gamelogic.js";

test("WPM uses five characters per word and the actual elapsed time", () => {
  assert.equal(calculateWPM(50, 60), 10);
  assert.equal(calculateWPM(100, 30), 40);
  assert.equal(calculateWPM(0, 30), 0);
  assert.equal(calculateWPM(50, 0), 0);
});

test("accuracy handles empty input and stays in the 0–100 range", () => {
  assert.equal(calculateAccuracy(0, 0), 100);
  assert.equal(calculateAccuracy(8, 10), 80);
  assert.equal(calculateAccuracy(12, 10), 100);
  assert.equal(calculateAccuracy(-1, 10), 0);
});

test("score is non-negative and scales with typing accuracy", () => {
  assert.equal(calculateScore(50, 100), 5000);
  assert.equal(calculateScore(50, 50), 2500);
  assert.equal(calculateScore(-1, 100), 0);
});

test("daily challenge index is deterministic and in range", () => {
  assert.equal(getDailyChallengeIndex(20, new Date("2026-10-22T12:00:00Z")), getDailyChallengeIndex(20, new Date("2026-10-22T12:00:00Z")));
  for (let length = 1; length <= 40; length += 1) {
    const index = getDailyChallengeIndex(length, new Date("2026-10-22T12:00:00Z"));
    assert.ok(index >= 0 && index < length);
  }
  assert.equal(getDailyChallengeIndex(0), 0);
});

test("per-keystroke tracker counts an incorrect expected character once", () => {
  let errors = {};
  errors = accumulateCharacterMistakes("", "h", "hello", errors);
  errors = accumulateCharacterMistakes("h", "he", "hello", errors);
  errors = accumulateCharacterMistakes("he", "hex", "hello", errors);
  assert.deepEqual(errors, { l: 1 });
});

test("per-keystroke tracker remembers corrected mistakes and avoids recounting unchanged text", () => {
  let errors = accumulateCharacterMistakes("", "hallo", "hello", {});
  assert.deepEqual(errors, { e: 1 });

  errors = accumulateCharacterMistakes("hallo", "hallo", "hello", errors);
  assert.deepEqual(errors, { e: 1 });

  errors = accumulateCharacterMistakes("hallo", "he", "hello", errors);
  errors = accumulateCharacterMistakes("he", "hel", "hello", errors);
  assert.deepEqual(errors, { e: 1 });
});

test("final-text error helper ignores punctuation but tracks wrong expected characters", () => {
  assert.deepEqual(getCharacterErrorCounts("cat, dog", "cxt, fog"), {
    a: 1,
    d: 1,
  });
});
