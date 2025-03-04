import { Start } from "./scenes/Start.js";

const config = {
  type: Phaser.AUTO,
  title: "third",
  parent: "game-container",
  width: 1920,
  height: 1080,
  pixelArt: true,
  scene: [Start],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
new Phaser.Game(config);
