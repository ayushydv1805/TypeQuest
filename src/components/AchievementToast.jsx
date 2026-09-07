import { useEffect } from "react";

function AchievementToast({ achievement, onClose }) {
  useEffect(() => {
    if (!achievement) return;

    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) {
    return null;
  }

  return (
    <div className="achievement-toast">
      <div className="achievement-toast-icon">
        {achievement.icon}
      </div>

      <div className="achievement-toast-content">
        <span>🏆 ACHIEVEMENT UNLOCKED</span>

        <h3>{achievement.name}</h3>

        <p>{achievement.description}</p>

        <div className="achievement-toast-reward">
          <span>⭐ +{achievement.xp} XP</span>
          <span>🪙 +{achievement.coins}</span>
        </div>
      </div>

      <button
        className="achievement-toast-close"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

export default AchievementToast;