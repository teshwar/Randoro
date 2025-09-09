// timer.js
export function initTimer(modeManager) {
  const timerState = document.querySelector("#timer-state");
  const timerCount = document.querySelector("#timer-count");

  // create controls under the timer display (Start / Pause / Reset)
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

  // seconds
  let currentDurationSec = 0; // total seconds for current state
  let timeLeft = 0;
  let timerInterval = null;

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(Math.floor(sec % 60)).padStart(2, "0");
    return `${m}:${s}`;
  }

  function updateUI() {
    timerState.textContent = `Cycle ${currentCycle} - State: ${cycleStates[currentStateIndex]}`;
    timerCount.textContent = formatTime(timeLeft);
  }

  // read durations for the CURRENT state from modeManager
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

    // convert minutes to seconds, enforce minimal 1 second so UI isn't broken
    currentDurationSec = Math.max(1, Math.round(durationMin * 60));
    timeLeft = currentDurationSec;
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
    currentDurationSec = Math.max(1, Math.round(seconds));
    timeLeft = currentDurationSec;
    updateUI();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateUI();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        playSound();
        advanceToNextState();
      }
    }, 1000);
  }

  // Start the next state (advance index, load duration, start)
  function advanceToNextState() {
    currentStateIndex = (currentStateIndex + 1) % cycleStates.length;
    if (currentStateIndex === 0) currentCycle++;
    loadCurrentStateDuration();
    startTimerWithSeconds(currentDurationSec);
  }

  // Public controls
  function startOrResume() {
    if (timerInterval) return; // already running

    if (timeLeft > 0 && timeLeft < currentDurationSec) {
      // resume from pause
      startTimerWithSeconds(timeLeft);
    } else {
      // start fresh for current state (if timeLeft is 0 or equals full)
      loadCurrentStateDuration(); // ensures durations updated from modeManager
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
    timeLeft = currentDurationSec; // reset to start of current state
    updateUI();
  }

  // bind buttons
  document.querySelector("#start-btn").addEventListener("click", startOrResume);
  document.querySelector("#pause-btn").addEventListener("click", pauseTimer);
  document.querySelector("#reset-btn").addEventListener("click", resetTimer);

  // initialize display to Cycle 1 - Pomodoro and show initial time
  loadCurrentStateDuration();
  updateUI();

  // expose API if you want
  return {
    start: startOrResume,
    pause: pauseTimer,
    reset: resetTimer,
  };
}
