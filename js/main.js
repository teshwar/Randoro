import { initSoundManager } from "./soundManager.js";
import { initModeManager } from "./modeManager.js";
import { initTaskManager } from "./taskManager.js";
import { initTimer } from "./timer.js";
import { initFontManager } from "./fontManager.js";
import { initPWA } from "./pwaManager.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize core features
  initSoundManager();
  initTaskManager();
  initFontManager();

  const modeManager = initModeManager();
  initTimer(modeManager);

  // Initialize PWA & Service Worker
  initPWA();
});
