// modeManager.js
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

  // Toggle buttons inside each container
  const toggleClassicBtn = classicSettingsContainer.querySelector(
    "#toggle-classic-settings"
  );
  const toggleRandomBtn = randomSettingsContainer.querySelector(
    "#toggle-random-settings"
  );

  // Reusable toggle function that also adds card styling while visible
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

  // Switch mode: update button colors + which container is visible
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
  }

  classicBtn.addEventListener("click", () => switchMode("classic"));
  randomBtn.addEventListener("click", () => switchMode("random"));

  // Read current values from DOM and return { pomodoro, short, long } in minutes.
  // Uses parseFloat to allow fractional minutes (e.g. 0.1 for 6s tests).
  function getCurrentTimes() {
    if (currentMode === "classic") {
      const pom =
        parseFloat(document.querySelector("#classic-pomodoro")?.value) || 25;
      const sh =
        parseFloat(document.querySelector("#classic-short")?.value) || 5;
      const lg =
        parseFloat(document.querySelector("#classic-long")?.value) || 15;
      return { pomodoro: pom, short: sh, long: lg };
    } else {
      const min =
        parseFloat(document.querySelector("#random-pomodoro-min")?.value) || 20;
      const max =
        parseFloat(document.querySelector("#random-pomodoro-max")?.value) || 30;
      // generate integer minutes between min and max
      const pom = Math.floor(
        Math.random() * (Math.max(max, min) - Math.min(max, min) + 1) +
          Math.min(max, min)
      );
      // simple algorithm for breaks — adjust later if you want different ratios
      const short = Math.max(0.1, Math.floor(pom * 0.2));
      const long = Math.max(1, Math.floor(pom * 0.6));
      return { pomodoro: pom, short, long };
    }
  }

  function getCurrentMode() {
    return currentMode;
  }

  // initialize UI to classic
  switchMode(currentMode);

  // Return a small API so other modules (timer) can read current settings
  return {
    getCurrentTimes,
    getCurrentMode,
  };
}
