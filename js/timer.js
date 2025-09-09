// timer.js
export function initTimer(modeManager) {
  const timerState = document.querySelector("#timer-state");
  const timerCount = document.querySelector("#timer-count");

  // Buttons (add these under your HTML timer div)
  const controls = document.createElement("div");
  controls.className = "flex space-x-2 justify-center";
  controls.innerHTML = `
    <button id="start-btn" class="color-blue px-3 py-1 rounded">Start</button>
    <button id="pause-btn" class="color-orange px-3 py-1 rounded">Pause</button>
    <button id="reset-btn" class="color-red px-3 py-1 rounded">Reset</button>
  `;
  timerCount.parentNode.appendChild(controls);

  // State cycle
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

  // Timer variables
  let timeLeft = 0;
  let totalTime = 0;
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

  function startTimer(duration) {
    clearInterval(timerInterval);
    totalTime = Math.round(duration * 60); // allow 0.1 min
    timeLeft = totalTime;
    updateUI();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateUI();

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        playSound();
        nextState();
      }
    }, 1000);
  }

  function playSound() {
    const audio = new Audio("./sounds/alert.mp3"); // add file in your sounds folder
    audio.play();
  }

  function nextState() {
    const times = modeManager.getCurrentTimes();
    const state = cycleStates[currentStateIndex];

    let duration =
      state === "Pomodoro"
        ? times.pomodoro
        : state === "Short"
        ? times.short
        : times.long;

    // Reset cycle index after 6 states
    if (currentStateIndex === cycleStates.length - 1) {
      currentCycle++;
    }
    currentStateIndex = (currentStateIndex + 1) % cycleStates.length;

    startTimer(duration);
  }

  function pauseTimer() {
    clearInterval(timerInterval);
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = totalTime;
    updateUI();
  }

  // Button bindings
  document.querySelector("#start-btn").addEventListener("click", () => {
    if (!timerInterval) {
      // if paused/resumed, continue; otherwise start new
      if (timeLeft > 0 && timeLeft < totalTime) {
        timerInterval = setInterval(() => {
          timeLeft--;
          updateUI();
          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            playSound();
            nextState();
          }
        }, 1000);
      } else {
        nextState(); // new cycle
      }
    }
  });

  document.querySelector("#pause-btn").addEventListener("click", pauseTimer);
  document.querySelector("#reset-btn").addEventListener("click", resetTimer);

  return { startTimer: nextState, pauseTimer, resetTimer };
}
