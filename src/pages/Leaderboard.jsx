/* eslint-disable react-hooks/set-state-in-effect -- Leaderboard data is fetched asynchronously from the cloud service. */
import { useEffect, useState } from "react";
import { fetchCloudLeaderboard, getCloudUserId, isCloudConfigured } from "../utils/cloud";

function Leaderboard({ onBack }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadLeaderboard = async () => {
      if (!isCloudConfigured()) {
        setError("Cloud leaderboard is not configured yet. Add the values from a dedicated TypeQuest Supabase project to .env.local and apply the TypeQuest migration.");
        setLoading(false);
        return;
      }

      try {
        const rows = await fetchCloudLeaderboard();
        if (active) setPlayers(rows);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load the leaderboard."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLeaderboard();
    return () => { active = false; };
  }, []);

  const currentUserId = getCloudUserId();

  return (
    <main className="leaderboard-page">
      <header className="leaderboard-header">
        <button className="back-btn" onClick={onBack}>← Dashboard</button>
        <div>
          <span>TYPEQUEST COMPETITION</span>
          <h1>Global Leaderboard 🏆</h1>
          <p>Compare best typing speed with players using TypeQuest cloud accounts.</p>
        </div>
      </header>

      <section className="leaderboard-card">
        <div className="leaderboard-table-head">
          <span>RANK / PLAYER</span>
          <span>BEST WPM</span>
          <span>LEVEL</span>
          <span>TESTS</span>
        </div>

        {loading && <p className="leaderboard-state">Loading player rankings…</p>}
        {!loading && error && <p className="leaderboard-state" role="status">{error}</p>}
        {!loading && !error && players.length === 0 && (
          <p className="leaderboard-state">No players yet. Finish a test while signed in to add your first score.</p>
        )}

        {!loading && !error && players.map((player, index) => (
          <div
            className={"leaderboard-row" + (player.userId === currentUserId ? " leaderboard-row-you" : "")}
            key={player.userId || player.displayName + index}
          >
            <div className="leaderboard-player">
              <span className="leaderboard-rank">{index + 1}</span>
              <div>
                <strong>{player.displayName}</strong>
                {player.userId === currentUserId && <small>YOU</small>}
              </div>
            </div>
            <strong className="leaderboard-wpm">{player.bestWpm} <small>WPM</small></strong>
            <span>Lv. {player.level}</span>
            <span>{player.testsCompleted}</span>
          </div>
        ))}
      </section>

      <p className="leaderboard-footnote">Only display names and public performance stats are shown. Emails and private save data are never listed.</p>
    </main>
  );
}

export default Leaderboard;
