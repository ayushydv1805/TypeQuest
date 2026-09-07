import { achievements } from "../utils/achievements";
import { getPlayerData } from "../utils/storage";

function Achievements() {
  const player = getPlayerData();

  const unlocked = player.unlockedAchievements ?? [];

  return (
    <section className="achievements-section">
      <div className="section-heading">
        <div>
          <p>REWARDS</p>
          <h2>Achievements</h2>
        </div>

        <span>
          {unlocked.length} / {achievements.length} Unlocked
        </span>
      </div>

      <div className="achievements-grid">
        {achievements.map((achievement) => {
          const isUnlocked = unlocked.includes(
            achievement.id
          );

          return (
            <div
              className={`achievement-card ${
                isUnlocked ? "unlocked" : "locked"
              }`}
              key={achievement.id}
            >
              <div className="achievement-icon">
                {isUnlocked
                  ? achievement.icon
                  : "🔒"}
              </div>

              <div className="achievement-info">
                <h3>{achievement.name}</h3>

                <p>
                  {achievement.description}
                </p>

                <div className="achievement-reward">
                  <span>⭐ +{achievement.xp} XP</span>
                  <span>🪙 +{achievement.coins}</span>
                </div>
              </div>

              <div className="achievement-status">
                {isUnlocked
                  ? "✓ UNLOCKED"
                  : "LOCKED"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Achievements;