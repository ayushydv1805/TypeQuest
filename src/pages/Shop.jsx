import { useState } from "react";
import {
  getPlayerData,
  savePlayerData,
} from "../utils/storage";

const shopItems = [
  {
    id: "neon",
    name: "Neon Theme",
    description: "A futuristic neon look for TypeQuest.",
    price: 100,
    icon: "🌌",
  },
  {
    id: "fire",
    name: "Fire Theme",
    description: "Turn your typing arena into a fire zone.",
    price: 200,
    icon: "🔥",
  },
  {
    id: "ocean",
    name: "Ocean Theme",
    description: "A calm blue theme for long typing sessions.",
    price: 250,
    icon: "🌊",
  },
  {
    id: "cyber",
    name: "Cyber Theme",
    description: "A dark cyberpunk style for TypeQuest.",
    price: 400,
    icon: "🤖",
  },
];

function Shop({ onBack, onThemeChange }) {
  const [player, setPlayer] = useState(getPlayerData());
  const [message, setMessage] = useState("");

  const buyItem = (item) => {
    if (player.unlockedThemes?.includes(item.id)) {
      setMessage(`${item.name} is already unlocked!`);
      return;
    }

    if (player.coins < item.price) {
      setMessage("Not enough coins 🪙");
      return;
    }

    const updatedPlayer = {
      ...player,
      coins: player.coins - item.price,
      unlockedThemes: [
        ...(player.unlockedThemes ?? []),
        item.id,
      ],
    };

    savePlayerData(updatedPlayer);
    setPlayer(updatedPlayer);

    setMessage(`${item.name} unlocked! 🎉`);
  };

  const equipTheme = (item) => {
    if (!player.unlockedThemes?.includes(item.id)) {
      return;
    }

    const updatedPlayer = {
      ...player,
      equippedTheme: item.id,
    };

    savePlayerData(updatedPlayer);
    setPlayer(updatedPlayer);
onThemeChange(item.id);
    setMessage(`${item.name} equipped! 🎨`);
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <div>
          <span>TYPEQUEST STORE</span>
          <h1>🛒 Shop</h1>
        </div>

        <div className="shop-coins">
          🪙 {player.coins}
        </div>
      </div>

      {message && (
        <div className="shop-message">
          {message}
        </div>
      )}

      <div className="shop-grid">
        {shopItems.map((item) => {
          const unlocked =
            player.unlockedThemes?.includes(item.id);

          const equipped =
            player.equippedTheme === item.id;

          return (
            <div
              className={`shop-item ${
                unlocked ? "unlocked" : ""
              }`}
              key={item.id}
            >
              <div className="shop-icon">
                {item.icon}
              </div>

              <h2>{item.name}</h2>

              <p>{item.description}</p>

              {!unlocked ? (
                <button
                  className="start-btn"
                  onClick={() => buyItem(item)}
                >
                  BUY — 🪙 {item.price}
                </button>
              ) : equipped ? (
                <button
                  className="equipped-btn"
                  disabled
                >
                  ✓ EQUIPPED
                </button>
              ) : (
                <button
                  className="start-btn"
                  onClick={() => equipTheme(item)}
                >
                  EQUIP
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Shop;