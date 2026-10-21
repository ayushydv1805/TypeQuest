# TypeQuest Android build

The app is a Vite/React web app with a starter Capacitor configuration. These steps wrap its production build in an Android project.

## 1. Install dependencies

Capacitor Core, Android and CLI are included in package.json. From the TypeQuest repository root, use Node.js 22+ and run:

    npm ci

The repository's dependency-maintenance workflow will keep the package lockfile in sync. Do not install mismatched Capacitor major versions.

## 2. Configure cloud sign-in (optional but recommended)

1. Create or choose a dedicated Supabase project for TypeQuest. Do not use another app's project.
2. In the Supabase SQL Editor, run supabase/migrations/20261022000000_typequest_cloud_saves_and_leaderboard.sql from this repository.
3. Copy .env.example to .env.local and enter that project's URL and publishable key. Never use a service-role/secret key in the app.
4. Make sure the Supabase Data API is enabled and that email confirmation settings/site URL match your testing or deployed app.
5. Build after editing .env.local, because Vite embeds VITE_ public config into the client bundle.

Local-only sign-in and local saves still work without these variables. Cloud sign-in, cross-device save sync, and the global leaderboard need them and the SQL migration.

## 3. Generate and run Android

    npm run build
    npx cap add android
    npx cap sync android
    npx cap open android

Run the app on an emulator or a USB-connected device from Android Studio. After each web code change, run npm run build and npx cap sync android again.

## 4. Build an APK

The GitHub Actions workflow **Build Android APK** is configured to generate a debug APK artifact when the feature branch is updated. Open the workflow run and download the artifact named typequest-debug-apk.

To build locally, open Android Studio with npx cap open android. In Android Studio, select Build → Build Bundle(s) / APK(s) → Build APK(s) for a debug install. For a public release, use Build → Generate Signed Bundle / APK and keep the signing key private.

The debug APK is normally written to android/app/build/outputs/apk/debug/app-debug.apk.

## Before publishing

- Test creating an account, confirming email, signing in/out, and refreshing a session.
- Test progress survives force-close/reopen and synchronizes to a second device with the same cloud account.
- Test backup export/import and resetting progress both online and offline.
- Test keyboard focus, portrait/landscape layouts, and the Android system back button.
- Replace the starter icon with a proper app icon and add Android splash-screen assets.
- Review the dependency audit and use a signed release build.
