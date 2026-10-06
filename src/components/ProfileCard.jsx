import { getPlayerData } from "../utils/storage";

function ProfileCard() {
  const player = getPlayerData();
  const achievementCount = player.unlockedAchievements.length;
  const unlockedModeCount = player.unlockedModes.length;

  const stats = [
    ["🪙", player.coins, "Coins"],
    ["🎮", `${unlockedModeCount}/6`, "Modes"],
    ["🏆", achievementCount, "Achievements"],
    ["🔥", player.currentStreak, "Day Streak"],
  ];

  return (
    <section className="profile-card">
      <div className="profile-top">
        <div className="profile-avatar">⚡</div>

        <div className="profile-info">
          <span className="profile-label">TYPEQUEST PLAYER</span>
          <h2>Level {player.level}</h2>

          <div className="profile-xp">
            <div className="profile-xp-bar">
              <div
                className="profile-xp-fill"
                style={{ width: `${Math.min(100, player.xp)}%` }}
              />
            </div>
            <span>{player.xp} / 100 XP</span>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        {stats.map(([icon, value, label]) => (
          <div className="profile-stat" key={label}>
            <span>{icon}</span>
            <div>
              <strong>{value}</strong>
              <small>{label}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProfileCard;
