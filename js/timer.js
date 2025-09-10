export function initTimer(modeManager) {
  const timerState = document.querySelector("#timer-state");
  const timerCount = document.querySelector("#timer-count");

  // Controls
  const controls = document.createElement("div");
  controls.className = "flex space-x-2 justify-center mt-3";
  controls.innerHTML = `
    <button id="start-btn" class="color-blue px-3 py-1 rounded">Start</button>
    <button id="pause-btn" class="color-orange px-3 py-1 rounded">Pause</button>
    <button id="reset-btn" class="color-red px-3 py-1 rounded">Reset</button>
  `;
  timerCount.parentNode.appendChild(controls);

  // --- New Game Button ---
  const resetAllBtn = document.querySelector("#reset-all-btn");
  resetAllBtn.addEventListener("click", () => {
    // Stop any running timer
    clearInterval(timerInterval);
    timerInterval = null;

    // Reset cycle, state, and stopwatch
    currentCycle = 1;
    currentStateIndex = 0;
    stopwatchMode = false;

    // Reset timer durations to defaults
    currentDurationSec = 25 * 60;
    timeLeft = currentDurationSec;

    // Reset DOM inputs for Classic mode
    document.querySelector("#classic-pomodoro").value = 25;
    document.querySelector("#classic-short").value = 5;
    document.querySelector("#classic-long").value = 15;

    // Reset DOM inputs for Random mode
    document.querySelector("#random-pomodoro-min").value = 10;
    document.querySelector("#random-pomodoro-max").value = 30;
    localStorage.removeItem("randoro-timer");
    localStorage.removeItem("randoro-mode");

    // Update the UI
    updateUI();
  });

  const cycleStates = [
    "Pomodoro",
    "Short",
    "Pomodoro",
    "Short",
    "Pomodoro",
    "Long",
  ];
  let currentStateIndex = 0;
  let currentCycle = 1;
  let currentDurationSec = 0;
  let timeLeft = 0;
  let timerInterval = null;
  let stopwatchMode = false;
  let lastTimestamp = null;

  // --- Persistence ---
  function saveState() {
    const modeSettings = {
      classicPom: document.querySelector("#classic-pomodoro")?.value,
      classicShort: document.querySelector("#classic-short")?.value,
      classicLong: document.querySelector("#classic-long")?.value,
      randomMin: document.querySelector("#random-pomodoro-min")?.value,
      randomMax: document.querySelector("#random-pomodoro-max")?.value,
      currentMode: modeManager?.getCurrentMode?.() || "classic",
    };
    const timerStateData = {
      currentCycle,
      currentStateIndex,
      timeLeft,
      stopwatchMode,
      lastTimestamp: timerInterval ? Date.now() : null,
    };
    localStorage.setItem("randoro-mode", JSON.stringify(modeSettings));
    localStorage.setItem("randoro-timer", JSON.stringify(timerStateData));
  }

  function loadState() {
    const savedMode = JSON.parse(localStorage.getItem("randoro-mode"));
    const savedTimer = JSON.parse(localStorage.getItem("randoro-timer"));

    if (savedMode) {
      if (savedMode.classicPom)
        document.querySelector("#classic-pomodoro").value =
          savedMode.classicPom;
      if (savedMode.classicShort)
        document.querySelector("#classic-short").value = savedMode.classicShort;
      if (savedMode.classicLong)
        document.querySelector("#classic-long").value = savedMode.classicLong;
      if (savedMode.randomMin)
        document.querySelector("#random-pomodoro-min").value =
          savedMode.randomMin;
      if (savedMode.randomMax)
        document.querySelector("#random-pomodoro-max").value =
          savedMode.randomMax;
      modeManager?.getCurrentMode?.() === savedMode.currentMode &&
        modeManager?.getCurrentMode();
    }

    if (savedTimer) {
      currentCycle = savedTimer.currentCycle || 1;
      currentStateIndex = savedTimer.currentStateIndex || 0;
      timeLeft = savedTimer.timeLeft || 0;
      stopwatchMode = savedTimer.stopwatchMode || false;
      lastTimestamp = savedTimer.lastTimestamp || null;

      loadCurrentStateDuration();

      if (lastTimestamp) {
        const elapsed = Math.floor((Date.now() - lastTimestamp) / 1000);
        timeLeft -= elapsed;
        if (timeLeft <= 0) advanceToNextState();
        else startTimerWithSeconds(timeLeft);
      }
    }
  }

  // --- Timer functions ---
  function formatTime(sec) {
    const m = String(Math.floor(Math.abs(sec) / 60)).padStart(2, "0");
    const s = String(Math.floor(Math.abs(sec) % 60)).padStart(2, "0");
    return sec < 0 ? `-${m}:${s}` : `${m}:${s}`;
  }

  function updateUI() {
    const state = cycleStates[currentStateIndex];
    timerState.textContent = `Cycle ${currentCycle} - State: ${state} (${
      currentStateIndex + 1
    })`;
    timerCount.textContent = formatTime(timeLeft);

    timerCount.classList.remove("color-red", "color-blue", "color-green");
    timerCount.classList.add(
      state === "Pomodoro"
        ? "color-red"
        : state === "Long"
        ? "color-green"
        : "color-blue"
    );

    saveState();
  }

  function loadCurrentStateDuration() {
    const times = modeManager?.getCurrentTimes?.() || {
      pomodoro: 25,
      short: 5,
      long: 15,
    };
    const state = cycleStates[currentStateIndex];
    const durationMin =
      state === "Pomodoro"
        ? times.pomodoro
        : state === "Short"
        ? times.short
        : times.long;
    currentDurationSec = Math.max(1, Math.round(durationMin * 60));
    if (!timeLeft) timeLeft = currentDurationSec;
  }

  function startTimerWithSeconds(seconds) {
    clearInterval(timerInterval);
    timeLeft = Math.round(seconds);
    lastTimestamp = Date.now();
    updateUI();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateUI();
      if (!stopwatchMode && timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        playSound();
        showModal();
      }
    }, 1000);
  }

  function advanceToNextState() {
    currentStateIndex = (currentStateIndex + 1) % cycleStates.length;
    if (currentStateIndex === 0) currentCycle++;
    loadCurrentStateDuration();
    startTimerWithSeconds(currentDurationSec);
  }

  function playSound() {
    const sel = document.querySelector("#sound-selector");
    const selected = sel?.value;
    if (!selected) return;
    const audioSrc = selected.startsWith("blob:")
      ? selected
      : `./sounds/${selected}`;
    new Audio(audioSrc).play().catch(() => {});
  }

  // --- Modal ---
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-50";
  modal.innerHTML = `
    <div class="bg-gray-800 p-6 rounded shadow-lg flex flex-col space-y-4">
      <p class="text-white text-lg font-bold text-center">Time's up! Choose an action:</p>
      <div class="flex justify-center space-x-3">
        <button id="snooze-btn" class="px-4 py-2 bg-orange-500 text-white rounded">Snooze 10min</button>
        <button id="stopwatch-btn" class="px-4 py-2 bg-red-500 text-white rounded">Stopwatch</button>
        <button id="next-btn" class="px-4 py-2 bg-blue-500 text-white rounded">Next State</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const snoozeBtn = modal.querySelector("#snooze-btn");
  const stopwatchBtn = modal.querySelector("#stopwatch-btn");
  const nextBtn = modal.querySelector("#next-btn");

  snoozeBtn.addEventListener("click", () => {
    hideModal();
    startTimerWithSeconds(10 * 60);
  });
  stopwatchBtn.addEventListener("click", () => {
    hideModal();
    stopwatchMode = true;
    startTimerWithSeconds(timeLeft);
  });
  nextBtn.addEventListener("click", () => {
    hideModal();
    advanceToNextState();
  });

  function showModal() {
    modal.classList.remove("hidden");
  }
  function hideModal() {
    modal.classList.add("hidden");
  }

  // --- Controls ---
  function startOrResume() {
    if (!timerInterval) startTimerWithSeconds(timeLeft || currentDurationSec);
  }
  function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    saveState();
  }
  function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 0;
    stopwatchMode = false;
    loadCurrentStateDuration();
    updateUI();
  }

  document.querySelector("#start-btn").addEventListener("click", startOrResume);
  document.querySelector("#pause-btn").addEventListener("click", pauseTimer);
  document.querySelector("#reset-btn").addEventListener("click", resetTimer);

  // --- Initialize ---
  loadState();
  updateUI();

  return { start: startOrResume, pause: pauseTimer, reset: resetTimer };
}
