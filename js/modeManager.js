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

  // Function to toggle settings visibility with styling
  function toggleSettings(settingsDiv, toggleBtn) {
    settingsDiv.classList.toggle("hidden");

    if (!settingsDiv.classList.contains("hidden")) {
      // Add container styling when visible
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

  // Switch mode function
  function switchMode(mode) {
    currentMode = mode;

    if (mode === "classic") {
      classicBtn.classList.add("color-red");
      classicBtn.classList.remove("color-dark");

      randomBtn.classList.add("color-dark");
      randomBtn.classList.remove("color-red");

      // Show classic container, hide random
      classicSettingsContainer.classList.remove("hidden");
      randomSettingsContainer.classList.add("hidden");
    } else {
      randomBtn.classList.add("color-red");
      randomBtn.classList.remove("color-dark");

      classicBtn.classList.add("color-dark");
      classicBtn.classList.remove("color-red");

      // Show random container, hide classic
      randomSettingsContainer.classList.remove("hidden");
      classicSettingsContainer.classList.add("hidden");
    }
  }

  // Initialize default mode
  switchMode(currentMode);

  // Event listeners for mode buttons
  classicBtn.addEventListener("click", () => switchMode("classic"));
  randomBtn.addEventListener("click", () => switchMode("random"));
}
