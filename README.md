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


## Cloud auth, backup and insights

TypeQuest supports optional Supabase Auth when VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are configured. The app uses its public client key only; the Supabase migration in supabase/migrations/ creates the private per-user save table and an authenticated leaderboard with row-level security. Never put a service-role/secret key into a Vite environment variable.

Copy .env.example to .env.local, set the values for a dedicated TypeQuest Supabase project, and apply supabase/migrations/20261022000000_typequest_cloud_saves_and_leaderboard.sql in that project's SQL Editor. Without those values the app remains usable with device-local accounts and saves, but cloud sync and the leaderboard remain disabled. Use JSON Backup & Restore in Settings to move a local save between devices.

Typing Insights show recent WPM and characters most often mistyped. Weak-key practice generates a drill using the current mistake profile. The learner's progress is saved after the drill.

## Android APK

See ANDROID_BUILD.md for Capacitor setup, Android Studio instructions, and pre-release tests.


## Windows desktop app

Electron packaging is configured for a Windows installer and portable EXE. See DESKTOP_BUILD.md for local build commands and how to download the Windows artifact from GitHub Actions. The app uses a local secure origin for packaged assets and keeps progress in the user's local app data. Unsigned builds may show a Windows SmartScreen warning.

The Windows package is built separately from the Android APK. See ANDROID_BUILD.md for Android steps. Cloud sync still requires a dedicated TypeQuest Supabase project and its project URL/publishable key.
