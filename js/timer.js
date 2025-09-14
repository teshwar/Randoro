export function initTimer(modeManager) {
  // Service Worker to play sounds
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "PLAY_SOUND") {
        playSound(event.data.sound);
      }
    });
  }

  const timerState = document.querySelector("#timer-state");
  const timerCount = document.querySelector("#timer-count");

  // Controls
  const controls = document.createElement("div");
  controls.className = "flex space-x-2 justify-center mt-3";
  controls.innerHTML = `
    <button id="start-btn" class="color-blue hover:opacity-90 px-3 py-1 rounded">Start</button>
    <button id="pause-btn" class="color-orange hover:opacity-90 px-3 py-1 rounded">Pause</button>
    <button id="reset-btn" class="color-red hover:opacity-90 px-3 py-1 rounded">Reset</button>
  `;
  timerCount.parentNode.appendChild(controls);

  let stopwatchNextBtn = null; // keep reference for dynamic button

  // --- New Game Button ---
  const resetAllBtn = document.querySelector("#reset-all-btn");
  resetAllBtn.addEventListener("click", () => {
    // Stop any running timergit
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
  let modalAudio = null;

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
    // Stop any existing interval
    clearInterval(timerInterval);

    // Initialize timeLeft and timestamp
    timeLeft = Math.round(seconds);
    lastTimestamp = Date.now();

    // For countdown (Classic / Random), compute the target end time
    let targetEnd = stopwatchMode ? null : Date.now() + timeLeft * 1000;

    // Initial UI update
    updateUI();

    // Main interval: updates every 200ms for smoother display
    timerInterval = setInterval(() => {
      const now = Date.now();

      if (stopwatchMode) {
        // --- Stopwatch Mode ---
        // Counts UP from the start time + any initial seconds offset
        timeLeft = Math.round((now - lastTimestamp) / 1000) + (seconds || 0);
      } else {
        // --- Countdown Mode (Classic / Random) ---
        timeLeft = Math.round((targetEnd - now) / 1000);
      }

      // Update the timer display and colors
      updateUI();

      // Only trigger modal/sound for countdown timers
      if (!stopwatchMode && timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;

        const selectedSound = document.querySelector("#sound-selector")?.value;

        // Send notification via service worker if available
        if (navigator.serviceWorker.controller && "Notification" in window) {
          navigator.serviceWorker.controller.postMessage({
            type: "TIMER_FINISHED",
            sound: selectedSound,
          });
        }

        // Always play sound locally
        playSound(selectedSound);

        showModal();
      }
    }, 200); // update every 0.2s for smoothness
  }

  function advanceToNextState() {
    currentStateIndex = (currentStateIndex + 1) % cycleStates.length;
    if (currentStateIndex === 0) currentCycle++;
    loadCurrentStateDuration();
    startTimerWithSeconds(currentDurationSec);
  }

  function playSound(sound) {
    const selected = sound || document.querySelector("#sound-selector")?.value;
    if (!selected) return;

    if (modalAudio) {
      modalAudio.pause();
      modalAudio = null;
    }

    const audioSrc = selected.startsWith("blob:")
      ? selected
      : `./sounds/${selected}`;
    modalAudio = new Audio(audioSrc);
    modalAudio.loop = true; // loop if desired
    modalAudio.play().catch(() => {});
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

    // Add "Next State" button if not already there
    if (!stopwatchNextBtn) {
      stopwatchNextBtn = document.createElement("button");
      stopwatchNextBtn.id = "stopwatch-next-btn";
      stopwatchNextBtn.textContent = "Next State";
      stopwatchNextBtn.className =
        "color-green hover:opacity-90 px-3 py-1 rounded";
      controls.appendChild(stopwatchNextBtn);

      stopwatchNextBtn.addEventListener("click", () => {
        stopwatchMode = false; // go back into normal cycle
        advanceToNextState();
        // Remove the button after advancing
        stopwatchNextBtn.remove();
        stopwatchNextBtn = null;
      });
    }
  });
  nextBtn.addEventListener("click", () => {
    hideModal();
    advanceToNextState();
  });

  [snoozeBtn, stopwatchBtn, nextBtn].forEach((btn) =>
    btn.addEventListener("click", () => {
      if (modalAudio) {
        modalAudio.pause();
        modalAudio.currentTime = 0;
        modalAudio = null;
      }
    })
  );

  function showModal() {
    modal.classList.remove("hidden");
  }
  function hideModal() {
    modal.classList.add("hidden");
  }

  // --- Controls ---
  function startOrResume() {
    if (!timerInterval) {
      // If timer hasn't started yet (full time or 0), reload duration from inputs
      if (timeLeft === 0 || timeLeft === currentDurationSec) {
        loadCurrentStateDuration();
        timeLeft = currentDurationSec;
      }
      startTimerWithSeconds(timeLeft);
    }
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

  document.querySelector("#reset-btn").addEventListener("click", () => {
    resetTimer(); // your existing reset logic
    // extra cleanup for stopwatch-next button
    stopwatchMode = false;
    if (stopwatchNextBtn) {
      stopwatchNextBtn.remove();
      stopwatchNextBtn = null;
    }
  });

  // --- Initialize ---
  loadState();
  loadCurrentStateDuration();
  updateUI();

  return { start: startOrResume, pause: pauseTimer, reset: resetTimer };
}
