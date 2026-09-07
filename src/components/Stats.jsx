import { getPlayerData } from "../utils/storage";

function Stats() {
  const player = getPlayerData();

  const totalMinutes = Math.floor(player.totalTime / 60);

  const stats = [
    {
      icon: "⚡",
      value: player.bestWpm,
      label: "Best WPM",
    },
    {
      icon: "🎯",
      value: `${player.bestAccuracy}%`,
      label: "Best Accuracy",
    },
    {
      icon: "🏆",
      value: player.testsCompleted,
      label: "Tests Completed",
    },
    {
      icon: "⏱️",
      value: `${totalMinutes}m`,
      label: "Typing Time",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div className="stat-card" key={stat.label}>
          <span className="stat-icon">
            {stat.icon}
          </span>

          <div>
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Stats;