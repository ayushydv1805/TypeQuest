function Navbar({ player, onSettings }) {
  const progress = Math.min(100, Math.max(0, player.xp));

  return (
    <nav className="navbar">
      <button className="logo-button" onClick={onSettings} aria-label="Open settings">
        <span className="logo">⚡ TypeQuest</span>
      </button>

      <div className="nav-right">
        <div className="level">
          <span>Level {player.level}</span>
          <div className="xp-bar" aria-label={`${player.xp} of 100 XP`}>
            <div className="xp-fill" style={{ width: `${progress}%` }} />
          </div>
          <small>{player.xp} / 100 XP</small>
        </div>

        <div className="coins">🪙 {player.coins}</div>

        <button
          className="profile-btn"
          onClick={onSettings}
          aria-label="Open TypeQuest settings"
          title="Settings"
        >
          ⚙️
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
