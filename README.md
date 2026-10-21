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


## Profiles and saved progress

TypeQuest now opens with a local profile sign-in/create screen. Each profile has separate progress, levels, coins, achievements, themes, settings and recent runs. The active session and completed-run progress are saved in local storage and persist when the app is closed and reopened. The legacy single-player save is migrated into the first profile that signs in.

**Important:** this is device-local sign-in, not cloud authentication. Profiles do not sync between phones or browsers, and clearing the app/browser data may remove local saves. A backend account and cloud sync can be added when the project is prepared for a public release.

## Mobile / install metadata

A web app manifest is included as a first step toward an installable web experience and later Android packaging.
