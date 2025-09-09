// main.js
import { initSoundManager } from "./soundManager.js";
import { initModeManager } from "./modeManager.js";
import { initTaskManager } from "./taskManager.js";

document.addEventListener("DOMContentLoaded", () => {
  initSoundManager();
  initModeManager();
  initTaskManager();
});
