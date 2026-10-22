# TypeQuest Windows desktop app

TypeQuest now has an Electron shell so it can run as a local Windows app instead of needing an open browser tab. The packaged renderer is served from the app://typequest origin, which keeps local storage stable and avoids relying on browser file:// storage behavior.

## Build locally

Use Node.js 22 or newer on Windows and run:

    npm ci
    npm run lint
    npm test
    npm run desktop:run

Build a Windows installer and a no-install portable executable with:

    npm run desktop:dist

The outputs are placed in the release directory. The installer allows a per-user install and creates Start Menu and Desktop shortcuts. The portable executable is intended for trying TypeQuest without installation.

## Download a prebuilt Windows build

Open the GitHub Actions page for this repository, select Build Windows Downloads, and open a successful run. Download the typequest-windows-downloads artifact. It contains the NSIS installer and portable EXE.

The feature branch workflow is configured to publish an artifact on relevant changes and can be manually run via workflow_dispatch. Artifacts are temporary CI downloads, not signed public releases.

## Data and security

- Local player profiles and progress remain stored on this Windows user account after closing and reopening TypeQuest.
- Sign-in uses device-local profiles unless a dedicated TypeQuest Supabase project has been configured.
- Cloud sign-up confirmation redirects use typequest://auth on desktop. Add this exact URI to the dedicated Supabase project's allowed redirect URLs before using cloud accounts from the desktop app.
- The Electron renderer runs with Node integration disabled, context isolation and sandbox enabled. External links are opened in the default browser and only HTTP(S) URLs are allowed.
- No code-signing certificate is configured, so Windows SmartScreen may warn when the unsigned installer is first opened.

## Before calling it a public release

Test installation and uninstall behavior on a clean Windows account, app startup after reboot, progress persistence, keyboard input, light/dark themes, backup and restore, and cloud sign-in if enabled. For broad public distribution, add a Windows code-signing certificate and publish versioned installers to GitHub Releases rather than relying on expiring workflow artifacts.
