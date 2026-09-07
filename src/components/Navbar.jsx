function Navbar({ player }) {
  return (
    <nav className="navbar">
      <div className="logo">
        ⚡ TypeQuest
      </div>

      <div className="nav-right">
        <div className="level">
          <span>Level {player.level}</span>

          <div className="xp-bar">
            <div
              className="xp-fill"
              style={{
                width: `${player.xp}%`,
              }}
            ></div>
          </div>

          <small>
            {player.xp} / 100 XP
          </small>
        </div>

        <div className="coins">
          🪙 {player.coins}
        </div>

        <button className="profile-btn">
          👤
        </button>
      </div>
    </nav>
  );
}

export default Navbar;