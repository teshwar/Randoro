// timer.js
export function initTimer(modeManager) {
  const timerState = document.querySelector("#timer-state");
  const timerCount = document.querySelector("#timer-count");

  // create controls under the timer display
  const controls = document.createElement("div");
  controls.className = "flex space-x-2 justify-center mt-3";
  controls.innerHTML = `
    <button id="start-btn" class="color-blue px-3 py-1 rounded">Start</button>
    <button id="pause-btn" class="color-orange px-3 py-1 rounded">Pause</button>
    <button id="reset-btn" class="color-red px-3 py-1 rounded">Reset</button>
  `;
  timerCount.parentNode.appendChild(controls);

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

  // --- Modal setup ---
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

  function showModal() {
    modal.classList.remove("hidden");
  }
  function hideModal() {
    modal.classList.add("hidden");
  }

  // --- Timer / UI functions ---
  function formatTime(sec) {
    const m = String(Math.floor(Math.abs(sec) / 60)).padStart(2, "0");
    const s = String(Math.floor(Math.abs(sec) % 60)).padStart(2, "0");
    return sec < 0 ? `-${m}:${s}` : `${m}:${s}`;
  }

  function updateUI() {
    timerState.textContent = `Cycle ${currentCycle} - State: ${cycleStates[currentStateIndex]}`;
    timerCount.textContent = formatTime(timeLeft);
  }

  function loadCurrentStateDuration() {
    const times =
      modeManager && typeof modeManager.getCurrentTimes === "function"
        ? modeManager.getCurrentTimes()
        : { pomodoro: 25, short: 5, long: 15 };

    const state = cycleStates[currentStateIndex];
    const durationMin =
      state === "Pomodoro"
        ? times.pomodoro
        : state === "Short"
        ? times.short
        : times.long;

    currentDurationSec = Math.max(1, Math.round(durationMin * 60));
    timeLeft = currentDurationSec;
    stopwatchMode = false;
  }

  function playSound() {
    const sel = document.querySelector("#sound-selector");
    const selected = sel ? sel.value : null;
    if (!selected) return;
    const audioSrc = selected.startsWith("blob:")
      ? selected
      : `./sounds/${selected}`;
    try {
      new Audio(audioSrc).play();
    } catch (e) {
      console.warn("Unable to play audio:", e);
    }
  }

  function startTimerWithSeconds(seconds) {
    clearInterval(timerInterval);
    timeLeft = Math.round(seconds);
    updateUI();

    timerInterval = setInterval(() => {
      timeLeft += stopwatchMode ? -1 : -1;
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

  // --- Modal button events ---
  snoozeBtn.addEventListener("click", () => {
    hideModal();
    startTimerWithSeconds(10 * 60);
  });

  stopwatchBtn.addEventListener("click", () => {
    hideModal();
    stopwatchMode = true;
    timerInterval = setInterval(() => {
      timeLeft--;
      updateUI();
    }, 1000);
  });

  nextBtn.addEventListener("click", () => {
    hideModal();
    advanceToNextState();
  });

  // --- Public controls ---
  function startOrResume() {
    if (timerInterval) return;
    if (timeLeft > 0 && timeLeft < currentDurationSec) {
      startTimerWithSeconds(timeLeft);
    } else {
      loadCurrentStateDuration();
      startTimerWithSeconds(currentDurationSec);
    }
  }

  function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = currentDurationSec;
    stopwatchMode = false;
    updateUI();
  }

  document.querySelector("#start-btn").addEventListener("click", startOrResume);
  document.querySelector("#pause-btn").addEventListener("click", pauseTimer);
  document.querySelector("#reset-btn").addEventListener("click", resetTimer);

  // initialize display
  loadCurrentStateDuration();
  updateUI();

  return { start: startOrResume, pause: pauseTimer, reset: resetTimer };
}
