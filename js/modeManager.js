export function initModeManager() {
  // Buttons
  const classicBtn = document.querySelector("#classic-btn");
  const randomBtn = document.querySelector("#random-btn");

  // Settings containers
  const classicSettingsContainer = document.querySelector(
    "#classic-settings-container"
  );
  const randomSettingsContainer = document.querySelector(
    "#random-settings-container"
  );
  const classicSettings = document.querySelector("#classic-settings");
  const randomSettings = document.querySelector("#random-settings");

  let currentMode = "classic";

  // --- HISTORY --- MUST be defined BEFORE load ---
  let pomodoroHistory = [];

  // --- TOGGLE ---
  const toggleClassicBtn = classicSettingsContainer.querySelector(
    "#toggle-classic-settings"
  );
  const toggleRandomBtn = randomSettingsContainer.querySelector(
    "#toggle-random-settings"
  );

  function toggleSettings(settingsDiv, toggleBtn) {
    settingsDiv.classList.toggle("hidden");
    if (!settingsDiv.classList.contains("hidden")) {
      settingsDiv.classList.add(
        "container-bg-light",
        "border",
        "rounded",
        "shadow",
        "p-2"
      );
    } else {
      settingsDiv.classList.remove(
        "container-bg-light",
        "border",
        "rounded",
        "shadow",
        "p-2"
      );
    }
    toggleBtn.textContent = settingsDiv.classList.contains("hidden")
      ? "Show Settings"
      : "Hide Settings";
  }

  toggleClassicBtn.addEventListener("click", () =>
    toggleSettings(classicSettings, toggleClassicBtn)
  );
  toggleRandomBtn.addEventListener("click", () =>
    toggleSettings(randomSettings, toggleRandomBtn)
  );

  // --- SWITCH MODE ---
  function switchMode(mode) {
    currentMode = mode;

    if (mode === "classic") {
      classicBtn.classList.add("color-red");
      classicBtn.classList.remove("color-dark");
      randomBtn.classList.add("color-dark");
      randomBtn.classList.remove("color-red");

      classicSettingsContainer.classList.remove("hidden");
      randomSettingsContainer.classList.add("hidden");
    } else {
      randomBtn.classList.add("color-red");
      randomBtn.classList.remove("color-dark");
      classicBtn.classList.add("color-dark");
      classicBtn.classList.remove("color-red");

      randomSettingsContainer.classList.remove("hidden");
      classicSettingsContainer.classList.add("hidden");
    }

    saveModeManager(); // save mode change
  }

  classicBtn.addEventListener("click", () => switchMode("classic"));
  randomBtn.addEventListener("click", () => switchMode("random"));

  // --- LOCAL STORAGE ---
  function saveModeManager() {
    const state = {
      currentMode,
      pomodoroHistory,
      classicPom: document.querySelector("#classic-pomodoro")?.value,
      classicShort: document.querySelector("#classic-short")?.value,
      classicLong: document.querySelector("#classic-long")?.value,
      randomMin: document.querySelector("#random-pomodoro-min")?.value,
      randomMax: document.querySelector("#random-pomodoro-max")?.value,
    };
    localStorage.setItem("randoro-mode", JSON.stringify(state));
  }

  function loadModeManager() {
    const state = JSON.parse(localStorage.getItem("randoro-mode"));
    if (state) {
      currentMode = state.currentMode || "classic";
      pomodoroHistory = state.pomodoroHistory || [];

      // restore inputs
      if (state.classicPom)
        document.querySelector("#classic-pomodoro").value = state.classicPom;
      if (state.classicShort)
        document.querySelector("#classic-short").value = state.classicShort;
      if (state.classicLong)
        document.querySelector("#classic-long").value = state.classicLong;
      if (state.randomMin)
        document.querySelector("#random-pomodoro-min").value = state.randomMin;
      if (state.randomMax)
        document.querySelector("#random-pomodoro-max").value = state.randomMax;
    }
  }

  // --- RANDOM HELPERS ---
  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  // --- API ---
  function getCurrentTimes() {
    let times;
    if (currentMode === "classic") {
      const pom =
        parseFloat(document.querySelector("#classic-pomodoro")?.value) || 25;
      const sh =
        parseFloat(document.querySelector("#classic-short")?.value) || 5;
      const lg =
        parseFloat(document.querySelector("#classic-long")?.value) || 15;
      times = { pomodoro: pom, short: sh, long: lg };
    } else {
      const min =
        parseFloat(document.querySelector("#random-pomodoro-min")?.value) ||
        0.1;
      const max =
        parseFloat(document.querySelector("#random-pomodoro-max")?.value) ||
        0.3;
      const pom = parseFloat(randomBetween(min, max).toFixed(2));
      pomodoroHistory.push(pom);
      const short = Math.max(0.1, parseFloat((pom * 0.2).toFixed(2)));
      let long = 0.1;
      if (pomodoroHistory.length % 3 === 0) {
        const lastThree = pomodoroHistory.slice(-3);
        const avg = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
        long = Math.max(0.1, parseFloat((avg * 0.6).toFixed(2)));
      }
      times = { pomodoro: pom, short, long };
    }

    // keep history unique-ish
    if (!pomodoroHistory.includes(times.pomodoro))
      pomodoroHistory.push(times.pomodoro);

    saveModeManager(); // save whenever times are requested
    return times;
  }

  function getCurrentMode() {
    return currentMode;
  }

  // --- INIT ---
  loadModeManager();
  switchMode(currentMode);

  return { getCurrentTimes, getCurrentMode };
}
