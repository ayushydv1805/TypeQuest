import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Game from "./pages/Game";
import SpeedRush from "./pages/SpeedRush";
import Combo from "./pages/Combo";
import Survival from "./pages/Survival";
import Ghost from "./pages/Ghost";
import Boss from "./pages/Boss";
import Shop from "./pages/Shop";

function App() {
  const [page, setPage] = useState("home");
  //const [theme, setTheme] = useState("default");
const [theme, setTheme] = useState(() => {
  const data = localStorage.getItem("typequest-player");

  if (!data) {
    return "default";
  }

  const player = JSON.parse(data);

  return player.equippedTheme ?? "default";
});
  useEffect(() => {
  document.body.dataset.theme = theme;
}, [theme]);
  if (page === "classic") {
    return (
      <Game
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "speed") {
    return (
      <SpeedRush
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "combo") {
    return (
      <Combo
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "survival") {
    return (
      <Survival
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "ghost") {
    return (
      <Ghost
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "boss") {
    return (
      <Boss
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "shop") {
  return (
    <Shop
      onBack={() => setPage("home")}
      onThemeChange={setTheme}
    />
  );
}

  return (
    <Home
      onStart={() => setPage("classic")}
      onSpeed={() => setPage("speed")}
      onCombo={() => setPage("combo")}
      onSurvival={() => setPage("survival")}
      onGhost={() => setPage("ghost")}
      onBoss={() => setPage("boss")}
      onShop={() => setPage("shop")}
        theme={theme}
  onThemeChange={setTheme}
    />
  );
}

export default App;