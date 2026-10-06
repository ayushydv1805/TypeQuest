# TypeQuest ⚡

TypeQuest is a gamified typing trainer built with React and Vite.

## What is included

- Classic 60-second typing tests with WPM, accuracy, errors and score
- Daily Quest with deterministic daily text and first-clear bonus rewards
- Speed Rush, Combo, Survival, Ghost and Boss Battle modes
- XP, level progression and mode unlocks
- Coins and a theme shop
- Achievements with rewards and unlock notifications
- Day streak tracking
- Recent run history stored locally
- Player settings with a safe progress reset
- Responsive dark UI with multiple themes
- Corrupt localStorage protection and backward-compatible data migration

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The project is a client-side app, so player progress is intentionally stored in the browser using localStorage.
