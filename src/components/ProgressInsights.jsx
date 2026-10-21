import { getPlayerData } from "../utils/storage";

function ProgressInsights({ onPracticeWeakCharacters, onOpenLeaderboard }) {
  const player = getPlayerData();
  const runs = [...player.recentRuns].slice(0, 8).reverse();
  const maxWpm = Math.max(1, ...runs.map((run) => run.wpm));
  const weakCharacters = Object.entries(player.characterErrors || {})
    .filter(([, count]) => Number(count) > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8);

  const averageWpm = runs.length
    ? Math.round(runs.reduce((total, run) => total + run.wpm, 0) / runs.length)
    : 0;

  return (
    <section className="insights-section">
      <div className="section-heading">
        <div>
          <p>TRAIN SMARTER</p>
          <h2>Typing Insights</h2>
        </div>
        <span>{runs.length} recent runs</span>
      </div>

      <div className="insights-grid">
        <article className="insight-card">
          <div className="insight-title-row">
            <div>
              <span className="insight-eyebrow">SPEED TREND</span>
              <h3>{averageWpm} <small>avg WPM</small></h3>
            </div>
            <span className="insight-icon" aria-hidden="true">↗</span>
          </div>

          {runs.length ? (
            <div className="wpm-chart" aria-label="Recent typing speed chart">
              {runs.map((run) => (
                <div className="wpm-chart-column" key={run.id} title={run.mode + ": " + run.wpm + " WPM"}>
                  <span className="wpm-chart-value">{run.wpm}</span>
                  <div className="wpm-chart-track">
                    <div
                      className="wpm-chart-bar"
                      style={{ height: Math.max(5, (run.wpm / maxWpm) * 100) + "%" }}
                    />
                  </div>
                  <small>{run.date.slice(5)}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="insight-empty">Complete a typing test to start building your speed chart.</p>
          )}
        </article>

        <article className="insight-card weak-keys-card">
          <div className="insight-title-row">
            <div>
              <span className="insight-eyebrow">YOUR PRACTICE PRIORITY</span>
              <h3>Weak characters</h3>
            </div>
            <span className="insight-icon" aria-hidden="true">⌨</span>
          </div>

          {weakCharacters.length ? (
            <>
              <p className="insight-copy">These target characters are most often mistyped in your tracked sessions.</p>
              <div className="weak-key-list">
                {weakCharacters.map(([character, count]) => (
                  <span className="weak-key-chip" key={character}>
                    <strong>{character.toUpperCase()}</strong>
                    <small>{count} {Number(count) === 1 ? "mistake" : "mistakes"}</small>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="insight-empty">No character mistakes recorded yet. Your practice session will start building this list.</p>
          )}

          <div className="insight-actions">
            <button className="start-btn" type="button" onClick={onPracticeWeakCharacters}>
              PRACTICE MY WEAK KEYS
            </button>
            <button className="shop-btn" type="button" onClick={onOpenLeaderboard}>
              VIEW LEADERBOARD
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

export default ProgressInsights;
