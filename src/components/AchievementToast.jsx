import { useEffect } from "react";

function AchievementToast({ achievement, onClose }) {
  useEffect(() => {
    if (!achievement) return undefined;

    const timer = window.setTimeout(onClose, 4500);
    return () => window.clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className="achievement-toast" role="status" aria-live="polite">
      <div className="achievement-toast-icon">{achievement.icon}</div>

      <div className="achievement-toast-content">
        <span>🏆 ACHIEVEMENT UNLOCKED</span>
        <h3>{achievement.title ?? achievement.name}</h3>
        <p>{achievement.description}</p>

        <div className="achievement-toast-reward">
          <span>⭐ +{achievement.xp} XP</span>
          <span>🪙 +{achievement.coins}</span>
        </div>
      </div>

      <button
        className="achievement-toast-close"
        onClick={onClose}
        aria-label="Close achievement notification"
      >
        ×
      </button>
    </div>
  );
}

export default AchievementToast;
