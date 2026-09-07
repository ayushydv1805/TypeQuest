import { getPlayerData } from "../utils/storage";

function ProfileCard() {
  const player = getPlayerData();

  const achievementCount =
    player.unlockedAchievements?.length ?? 0;

  const unlockedModeCount =
    player.unlockedModes?.length ?? 1;

  const xpProgress = Math.min(player.xp, 100);

  return (
    <section className="profile-card">
      <div className="profile-top">
        <div className="profile-avatar">
          ⚡
        </div>

        <div className="profile-info">
          <span className="profile-label">
            TYPEQUEST PLAYER
          </span>

          <h2>Level {player.level}</h2>

          <div className="profile-xp">
            <div className="profile-xp-bar">
              <div
                className="profile-xp-fill"
                style={{
                  width: `${xpProgress}%`,
                }}
              />
            </div>

            <span>
              {player.xp} / 100 XP
            </span>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <span>🪙</span>
          <div>
            <strong>{player.coins}</strong>
            <small>Coins</small>
          </div>
        </div>

        <div className="profile-stat">
          <span>🎮</span>
          <div>
            <strong>{unlockedModeCount}/6</strong>
            <small>Modes</small>
          </div>
        </div>

        <div className="profile-stat">
          <span>🏆</span>
          <div>
            <strong>{achievementCount}</strong>
            <small>Achievements</small>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfileCard;