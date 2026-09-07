import Navbar from "../components/Navbar";
import LevelBar from "../components/LevelBar";
import Stats from "../components/Stats";
import ProfileCard from "../components/ProfileCard";
import Achievements from "../components/Achievements";
import { getPlayerData } from "../utils/storage";

function Home({
  onStart,
  onSpeed,
  onCombo,
  onSurvival,
  onGhost,
  onBoss,
  onShop,
  theme,
  onThemeChange,
}) {
  const player = getPlayerData();

  const isUnlocked = (mode) =>
    player.unlockedModes.includes(mode);

  return (
    <div className="app">
      <Navbar player={player} />

      <main className="home">
        {/* HERO */}
        <section className="hero">
          <p className="welcome">
            WELCOME TO TYPEQUEST
          </p>

          <h1>
            Type faster.
            <br />
            <span>Level up.</span>
          </h1>

          <p className="hero-text">
            Improve your typing speed, complete challenges,
            unlock new modes and become a typing master.
          </p>

          <div className="hero-buttons">
            <button
              className="start-btn"
              onClick={onStart}
            >
              START TYPING ⚡
            </button>

            <button
              className="shop-btn"
              onClick={onShop}
            >
              🛒 SHOP
            </button>
          </div>
        </section>

        {/* LEVEL */}
        <LevelBar player={player} />
<ProfileCard />
        {/* STATS */}
        <Stats />
<Achievements />
        {/* MODES */}
        <section className="modes-section">
          <div className="section-heading">
            <div>
              <p>CHALLENGES</p>
              <h2>Typing Modes</h2>
            </div>

            <span>
              {player.unlockedModes.length} / 6 Unlocked
            </span>
          </div>

          <div className="modes-grid">

            {/* CLASSIC */}
            <div
              className="mode-card active"
              onClick={onStart}
            >
              <div className="mode-icon">
                ⌨️
              </div>

              <h3>Classic</h3>

              <p>
                Practice your typing with normal text.
              </p>

              <span className="unlocked">
                UNLOCKED
              </span>
            </div>

            {/* SPEED RUSH */}
            <div
              className={`mode-card ${
                isUnlocked("speed")
                  ? "active"
                  : "locked"
              }`}
              onClick={
                isUnlocked("speed")
                  ? onSpeed
                  : undefined
              }
            >
              <div className="mode-icon">
                ⚡
              </div>

              <h3>Speed Rush</h3>

              <p>
                Type as many words as possible.
              </p>

              <span>
                {isUnlocked("speed")
                  ? "UNLOCKED"
                  : "🔒 Level 2"}
              </span>
            </div>

            {/* COMBO */}
            <div
              className={`mode-card ${
                isUnlocked("combo")
                  ? "active"
                  : "locked"
              }`}
              onClick={
                isUnlocked("combo")
                  ? onCombo
                  : undefined
              }
            >
              <div className="mode-icon">
                🔥
              </div>

              <h3>Combo</h3>

              <p>
                Build a huge typing combo.
              </p>

              <span>
                {isUnlocked("combo")
                  ? "UNLOCKED"
                  : "🔒 Level 3"}
              </span>
            </div>

            {/* SURVIVAL */}
            <div
              className={`mode-card ${
                isUnlocked("survival")
                  ? "active"
                  : "locked"
              }`}
              onClick={
                isUnlocked("survival")
                  ? onSurvival
                  : undefined
              }
            >
              <div className="mode-icon">
                💀
              </div>

              <h3>Survival</h3>

              <p>
                Survive as long as you can.
              </p>

              <span>
                {isUnlocked("survival")
                  ? "UNLOCKED"
                  : "🔒 Level 5"}
              </span>
            </div>

            {/* GHOST */}
            <div
              className={`mode-card ${
                isUnlocked("ghost")
                  ? "active"
                  : "locked"
              }`}
              onClick={
                isUnlocked("ghost")
                  ? onGhost
                  : undefined
              }
            >
              <div className="mode-icon">
                👻
              </div>

              <h3>Ghost</h3>

              <p>
                Race against your best score.
              </p>

              <span>
                {isUnlocked("ghost")
                  ? "UNLOCKED"
                  : "🔒 Level 7"}
              </span>
            </div>

            {/* BOSS */}
            <div
              className={`mode-card ${
                isUnlocked("boss")
                  ? "active"
                  : "locked"
              }`}
              onClick={
                isUnlocked("boss")
                  ? onBoss
                  : undefined
              }
            >
              <div className="mode-icon">
                👾
              </div>

              <h3>Boss Battle</h3>

              <p>
                Defeat the typing boss.
              </p>

              <span>
                {isUnlocked("boss")
                  ? "UNLOCKED"
                  : "🔒 Level 10"}
              </span>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;