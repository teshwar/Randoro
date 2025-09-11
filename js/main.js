// main.js
import { initSoundManager } from "./soundManager.js";
import { initModeManager } from "./modeManager.js";
import { initTaskManager } from "./taskManager.js";
import { initTimer } from "./timer.js";
import { initFontManager } from "./fontManager.js";

document.addEventListener("DOMContentLoaded", () => {
  initSoundManager();
  initTaskManager();
  initFontManager();

  const modeManager = initModeManager();
  initTimer(modeManager);
});
