import Navbar from "../components/Navbar";
import LevelBar from "../components/LevelBar";
import Stats from "../components/Stats";
import ProfileCard from "../components/ProfileCard";
import Achievements from "../components/Achievements";
import { getPlayerData } from "../utils/storage";

function Home({
  onStart,
  onDaily,
  onSpeed,
  onCombo,
  onSurvival,
  onGhost,
  onBoss,
  onShop,
  onSettings,
}) {
  const player = getPlayerData();

  const isUnlocked = (mode) => player.unlockedModes.includes(mode);

  return (
    <div className="app">
      <Navbar player={player} onSettings={onSettings} />

      <main className="home">
        <section className="hero">
          <p className="welcome">WELCOME TO TYPEQUEST</p>

          <h1>
            Type faster.
            <br />
            <span>Level up.</span>
          </h1>

          <p className="hero-text">
            Improve your typing speed through quests, streaks, achievements,
            boss battles and daily challenges.
          </p>

          <div className="hero-buttons">
            <button className="start-btn" onClick={onStart}>
              START TYPING ⚡
            </button>
            <button className="shop-btn" onClick={onShop}>
              🛒 SHOP
            </button>
          </div>
        </section>

        <LevelBar player={player} />
        <ProfileCard />
        <Stats />
        <Achievements />

        <section className="daily-card">
          <div>
            <p>EVERY DAY</p>
            <h2>Daily Quest 🌟</h2>
            <span>
              A deterministic challenge for today with boosted first-clear rewards.
              Replay it later without farming the daily bonus.
            </span>
          </div>
          <button className="start-btn" onClick={onDaily}>
            START DAILY
          </button>
        </section>

        <section className="modes-section">
          <div className="section-heading">
            <div>
              <p>CHALLENGES</p>
              <h2>Typing Modes</h2>
            </div>
            <span>{player.unlockedModes.length} / 6 Unlocked</span>
          </div>

          <div className="modes-grid">
            <div className="mode-card active" onClick={onStart} role="button" tabIndex="0">
              <div className="mode-icon">⌨️</div>
              <h3>Classic</h3>
              <p>Practice with real sentences and track your WPM and accuracy.</p>
              <span className="unlocked">UNLOCKED</span>
            </div>

            <div className={`mode-card ${isUnlocked("speed") ? "active" : "locked"}`} onClick={isUnlocked("speed") ? onSpeed : undefined}>
              <div className="mode-icon">⚡</div>
              <h3>Speed Rush</h3>
              <p>Type as many words as possible before the 60 second clock ends.</p>
              <span>{isUnlocked("speed") ? "UNLOCKED" : "🔒 Level 2"}</span>
            </div>

            <div className={`mode-card ${isUnlocked("combo") ? "active" : "locked"}`} onClick={isUnlocked("combo") ? onCombo : undefined}>
              <div className="mode-icon">🔥</div>
              <h3>Combo</h3>
              <p>Keep your streak alive and push the multiplier higher.</p>
              <span>{isUnlocked("combo") ? "UNLOCKED" : "🔒 Level 3"}</span>
            </div>

            <div className={`mode-card ${isUnlocked("survival") ? "active" : "locked"}`} onClick={isUnlocked("survival") ? onSurvival : undefined}>
              <div className="mode-icon">💀</div>
              <h3>Survival</h3>
              <p>Three lives. Infinite time. Increasing pressure after every 10 words.</p>
              <span>{isUnlocked("survival") ? "UNLOCKED" : "🔒 Level 5"}</span>
            </div>

            <div className={`mode-card ${isUnlocked("ghost") ? "active" : "locked"}`} onClick={isUnlocked("ghost") ? onGhost : undefined}>
              <div className="mode-icon">👻</div>
              <h3>Ghost</h3>
              <p>Race against a live simulation of your previous best WPM.</p>
              <span>{isUnlocked("ghost") ? "UNLOCKED" : "🔒 Level 7"}</span>
            </div>

            <div className={`mode-card ${isUnlocked("boss") ? "active" : "locked"}`} onClick={isUnlocked("boss") ? onBoss : undefined}>
              <div className="mode-icon">👾</div>
              <h3>Boss Battle</h3>
              <p>Attack the typing boss with streaks and critical hits.</p>
              <span>{isUnlocked("boss") ? "UNLOCKED" : "🔒 Level 10"}</span>
            </div>
          </div>
        </section>

        <section className="recent-section">
          <div className="section-heading">
            <div>
              <p>PROGRESS</p>
              <h2>Recent Runs</h2>
            </div>
            <span>{player.testsCompleted} total tests</span>
          </div>

          {player.recentRuns.length === 0 ? (
            <div className="empty-history">
              Your completed runs will appear here. Start your first quest above.
            </div>
          ) : (
            <div className="history-list">
              {player.recentRuns.map((run) => (
                <div className="history-row" key={run.id}>
                  <div>
                    <strong>{run.mode}</strong>
                    <small>{run.date}</small>
                  </div>
                  <div>
                    <span>{run.wpm} WPM</span>
                    <small>{run.accuracy}% accuracy</small>
                  </div>
                  <div>
                    <span>{run.score} score</span>
                    <small>+{run.xp} XP</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;
