import { useEffect, useState } from "react";
import { getPlayerData, resetPlayerData } from "../utils/storage";

function SettingsModal({ onClose }) {
  const [player] = useState(getPlayerData);

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

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset all TypeQuest progress, coins, achievements, themes and stats?"
    );

    if (!confirmed) return;

    resetPlayerData();
    window.location.reload();
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
          <button className="icon-btn" onClick={onClose} aria-label="Close settings">
            ×
          </button>
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
          Your progress is stored locally in this browser. Clearing browser storage will also clear your TypeQuest save.
        </div>

        <button className="danger-btn" onClick={handleReset}>
          Reset Progress
        </button>
      </section>
    </div>
  );
}

export default SettingsModal;
