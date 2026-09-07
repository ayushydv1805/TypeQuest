import { getPlayerData } from "../utils/storage";

function LevelBar() {
  const player = getPlayerData();

  const currentXP = player.xp;
  const xpNeeded = 100;
  const progress = Math.min((currentXP / xpNeeded) * 100, 100);
  const xpRemaining = xpNeeded - currentXP;

  return (
    <div className="level-section">
      <div className="level-header">
        <div>
          <span className="level-label">CURRENT LEVEL</span>
          <h2>Level {player.level}</h2>
        </div>

        <div className="xp-text">
          {currentXP} / {xpNeeded} XP
        </div>
      </div>

      <div className="xp-bar">
        <div
          className="xp-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="level-footer">
        {xpRemaining > 0 ? (
          <span>{xpRemaining} XP until Level {player.level + 1}</span>
        ) : (
          <span>Ready for Level Up! 🎉</span>
        )}

        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

export default LevelBar;