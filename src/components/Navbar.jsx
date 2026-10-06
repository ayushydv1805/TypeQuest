function Navbar({ player, onSettings, onToggleColorMode, colorMode }) {
  const progress = Math.min(100, Math.max(0, player.xp));
  const isLight = colorMode === "light";

  return (
    <nav className="navbar">
      <button
        className="logo-button"
        onClick={onSettings}
        aria-label="Open settings"
      >
        <span className="logo">⚡ TypeQuest</span>
      </button>

      <div className="nav-right">
        <div className="level">
          <span>Level {player.level}</span>
          <div
            className="xp-bar"
            aria-label={player.xp + " of 100 XP"}
          >
            <div
              className="xp-fill"
              style={{ width: progress + "%" }}
            />
          </div>
          <small>{player.xp} / 100 XP</small>
        </div>

        <div className="coins">🪙 {player.coins}</div>

        <button
          className="profile-btn color-mode-btn"
          onClick={onToggleColorMode}
          aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
          title={isLight ? "Dark mode" : "Light mode"}
        >
          {isLight ? "🌙" : "☀️"}
        </button>

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
