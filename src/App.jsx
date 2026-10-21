import { useEffect, useState } from "react";
import AuthGate from "./components/AuthGate";
import Home from "./pages/Home";
import Game from "./pages/Game";
import SpeedRush from "./pages/SpeedRush";
import Combo from "./pages/Combo";
import Survival from "./pages/Survival";
import Ghost from "./pages/Ghost";
import Boss from "./pages/Boss";
import WeakPractice from "./pages/WeakPractice";
import Leaderboard from "./pages/Leaderboard";
import Shop from "./pages/Shop";
import SettingsModal from "./components/SettingsModal";
import { getPlayerData, savePlayerData } from "./utils/storage";
import { getActiveUser, signOutLocalUser } from "./utils/auth";
import { completeCloudAuthRedirect } from "./utils/cloud";

function readInitialTheme() {
  try {
    return getPlayerData().equippedTheme;
  } catch {
    return "default";
  }
}

function readInitialColorMode() {
  try {
    return getPlayerData().colorMode === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function App() {
  const [user, setUser] = useState(getActiveUser);
  const [authReady, setAuthReady] = useState(false);
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState(readInitialTheme);
  const [colorMode, setColorMode] = useState(readInitialColorMode);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.body.dataset.colorMode = colorMode;
    document.documentElement.style.colorScheme = colorMode;
  }, [theme, colorMode]);

  useEffect(() => {
    let active = true;

    completeCloudAuthRedirect()
      .then((cloudProfile) => {
        if (active) setUser(cloudProfile || getActiveUser());
      })
      .catch(() => {
        if (active) setUser(getActiveUser());
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAuthenticated = (profile) => {
    setUser(profile);
    setPage("home");
    setTheme(readInitialTheme());
    setColorMode(readInitialColorMode());
  };

  const handleLogout = async () => {
    await signOutLocalUser();
    setUser(null);
    setPage("home");
    setSettingsOpen(false);
  };

  const handleColorModeChange = (nextMode) => {
    const normalizedMode = nextMode === "light" ? "light" : "dark";
    setColorMode(normalizedMode);
    savePlayerData({
      ...getPlayerData(),
      colorMode: normalizedMode,
    });
  };

  const toggleColorMode = () => {
    handleColorModeChange(colorMode === "dark" ? "light" : "dark");
  };

  const goHome = () => setPage("home");

  if (!authReady) {
    return (
      <main className="auth-shell">
        <section className="auth-card auth-loading-card">
          <div className="auth-brand"><span className="auth-logo">⚡</span><span>TYPEQUEST</span></div>
          <p className="auth-description">Checking your saved profile…</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return <AuthGate onAuthenticated={handleAuthenticated} />;
  }

  let content;

  switch (page) {
    case "classic":
      content = <Game onBack={goHome} />;
      break;
    case "daily":
      content = <Game onBack={goHome} daily />;
      break;
    case "speed":
      content = <SpeedRush onBack={goHome} />;
      break;
    case "combo":
      content = <Combo onBack={goHome} />;
      break;
    case "survival":
      content = <Survival onBack={goHome} />;
      break;
    case "ghost":
      content = <Ghost onBack={goHome} />;
      break;
    case "boss":
      content = <Boss onBack={goHome} />;
      break;
    case "weak-practice":
      content = <WeakPractice onBack={goHome} />;
      break;
    case "leaderboard":
      content = <Leaderboard onBack={goHome} />;
      break;
    case "shop":
      content = <Shop onBack={goHome} onThemeChange={setTheme} />;
      break;
    default:
      content = (
        <Home
          user={user}
          onLogout={handleLogout}
          onStart={() => setPage("classic")}
          onDaily={() => setPage("daily")}
          onSpeed={() => setPage("speed")}
          onCombo={() => setPage("combo")}
          onSurvival={() => setPage("survival")}
          onGhost={() => setPage("ghost")}
          onBoss={() => setPage("boss")}
          onWeakPractice={() => setPage("weak-practice")}
          onLeaderboard={() => setPage("leaderboard")}
          onShop={() => setPage("shop")}
          onSettings={() => setSettingsOpen(true)}
          onToggleColorMode={toggleColorMode}
          colorMode={colorMode}
        />
      );
      break;
  }

  return (
    <>
      {content}
      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          colorMode={colorMode}
          onColorModeChange={handleColorModeChange}
        />
      )}
    </>
  );
}

export default App;
