import { useEffect, useRef, useState } from "react";
import { createPlayerBackup, getPlayerData, resetPlayerData, restorePlayerBackup } from "../utils/storage";

function SettingsModal({ onClose, colorMode, onColorModeChange }) {
  const player = getPlayerData();
  const backupFileRef = useRef(null);
  const [backupMessage, setBackupMessage] = useState("");

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Reset this profile's progress, coins, achievements, themes and stats on this device and in the cloud?"
    );

    if (!confirmed) return;

    const reset = await resetPlayerData();
    if (!reset) {
      window.alert("TypeQuest could not reset the cloud save. Your local progress was kept; check your connection and try again.");
      return;
    }

    window.location.reload();
  };

  const handleExportBackup = () => {
    try {
      const backup = createPlayerBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "typequest-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setBackupMessage("Backup downloaded. Keep this JSON file somewhere safe.");
    } catch {
      setBackupMessage("Could not create the backup. Check browser download permissions and try again.");
    }
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 2_000_000) {
      setBackupMessage("This backup file is unexpectedly large. Choose a TypeQuest backup under 2 MB.");
      return;
    }

    try {
      const payload = JSON.parse(await file.text());
      const confirmed = window.confirm(
        "Restore this backup over the currently signed-in profile? Current progress will be replaced."
      );
      if (!confirmed) return;

      restorePlayerBackup(payload);
      window.alert("Backup restored. TypeQuest will reload with the recovered progress.");
      window.location.reload();
    } catch (error) {
      setBackupMessage(
        error instanceof Error
          ? error.message
          : "Could not restore this backup. Check that the JSON file is valid."
      );
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="settings-head">
          <div>
            <span>PLAYER CONTROL</span>
            <h2 id="settings-title">Settings</h2>
          </div>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="appearance-card">
          <div>
            <span>APPEARANCE</span>
            <strong>{colorMode === "light" ? "Light Mode" : "Dark Mode"}</strong>
          </div>

          <div className="mode-switch" role="group" aria-label="Color mode">
            <button
              className={
                colorMode === "dark"
                  ? "mode-switch-btn active"
                  : "mode-switch-btn"
              }
              onClick={() => onColorModeChange("dark")}
              aria-pressed={colorMode === "dark"}
            >
              🌙 Dark
            </button>
            <button
              className={
                colorMode === "light"
                  ? "mode-switch-btn active"
                  : "mode-switch-btn"
              }
              onClick={() => onColorModeChange("light")}
              aria-pressed={colorMode === "light"}
            >
              ☀️ Light
            </button>
          </div>
        </div>

        <div className="settings-grid">
          <div className="settings-stat">
            <span>LEVEL</span>
            <strong>{player.level}</strong>
          </div>
          <div className="settings-stat">
            <span>STREAK</span>
            <strong>🔥 {player.currentStreak}</strong>
          </div>
          <div className="settings-stat">
            <span>TESTS</span>
            <strong>{player.testsCompleted}</strong>
          </div>
          <div className="settings-stat">
            <span>THEME</span>
            <strong>{player.equippedTheme}</strong>
          </div>
        </div>

        <div className="settings-note">
          Progress is saved on this device after each completed run and syncs to your TypeQuest cloud account when Supabase is configured. Local-only profiles stay on this device. Clearing app/browser data can erase local copies, so download a backup regularly.
        </div>

        <div className="backup-card">
          <div>
            <span>KEEP YOUR PROGRESS SAFE</span>
            <strong>Backup & Restore</strong>
            <p>Download a portable JSON copy of this profile or restore one from a previous device.</p>
          </div>
          <div className="backup-actions">
            <button className="start-btn" type="button" onClick={handleExportBackup}>
              ⬇ Download Backup
            </button>
            <button
              className="shop-btn"
              type="button"
              onClick={() => backupFileRef.current?.click()}
            >
              ⬆ Restore Backup
            </button>
          </div>
          <input
            ref={backupFileRef}
            className="backup-file-input"
            type="file"
            accept="application/json,.json"
            onChange={handleImportBackup}
            aria-label="Select TypeQuest backup JSON file"
          />
          {backupMessage && <p className="backup-message" role="status">{backupMessage}</p>}
        </div>

        <button className="danger-btn" onClick={handleReset}>
          Reset Progress
        </button>
      </section>
    </div>
  );
}

export default SettingsModal;
