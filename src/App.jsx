import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Game from "./pages/Game";
import SpeedRush from "./pages/SpeedRush";
import Combo from "./pages/Combo";
import Survival from "./pages/Survival";
import Ghost from "./pages/Ghost";
import Boss from "./pages/Boss";
import Shop from "./pages/Shop";
import SettingsModal from "./components/SettingsModal";

function readInitialTheme() {
  try {
    const raw = localStorage.getItem("typequest-player");
    if (!raw) return "default";
    const player = JSON.parse(raw);
    return player?.equippedTheme ?? "default";
  } catch {
    return "default";
  }
}

function App() {
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState(readInitialTheme);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const goHome = () => setPage("home");

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
    case "shop":
      content = <Shop onBack={goHome} onThemeChange={setTheme} />;
      break;
    default:
      content = (
        <Home
          onStart={() => setPage("classic")}
          onDaily={() => setPage("daily")}
          onSpeed={() => setPage("speed")}
          onCombo={() => setPage("combo")}
          onSurvival={() => setPage("survival")}
          onGhost={() => setPage("ghost")}
          onBoss={() => setPage("boss")}
          onShop={() => setPage("shop")}
          onSettings={() => setSettingsOpen(true)}
        />
      );
      break;
  }

  return (
    <>
      {content}
      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </>
  );
}

export default App;
