export function initTaskManager() {
  const pomodoroBtn = document.querySelector("#pomodoro-tasks-btn");
  const dayBtn = document.querySelector("#day-list-btn");
  const pomodoroContainer = document.querySelector("#pomodoro-tasks-container");
  const dayContainer = document.querySelector("#day-tasks-container");
  const pomodoroList = document.querySelector("#pomodoro-list");
  const dayList = document.querySelector("#day-list");

  const MAX_POMODORO = 3;
  const MIN_POMODORO = 3;

  // --- Toggle views ---
  function toggleTasks(showPomodoro) {
    if (showPomodoro) {
      pomodoroContainer.classList.remove("hidden");
      dayContainer.classList.add("hidden");
      pomodoroBtn.classList.add("color-red");
      pomodoroBtn.classList.remove("color-dark");
      dayBtn.classList.add("color-dark");
      dayBtn.classList.remove("color-red");
    } else {
      dayContainer.classList.remove("hidden");
      pomodoroContainer.classList.add("hidden");
      dayBtn.classList.add("color-red");
      dayBtn.classList.remove("color-dark");
      pomodoroBtn.classList.add("color-dark");
      pomodoroBtn.classList.remove("color-red");
    }
  }
  pomodoroBtn.addEventListener("click", () => toggleTasks(true));
  dayBtn.addEventListener("click", () => toggleTasks(false));

  // --- Pomodoro task ---
  function createPomodoroTask(text = "") {
    const li = document.createElement("li");
    li.className = "flex flex-wrap items-center gap-2 mb-1"; // wrap for mobile

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "w-5 h-5 accent-red-500";
    li.appendChild(checkbox);

    const input = document.createElement("input");
    input.type = "text";
    input.value = text;
    input.maxLength = 50;
    input.className = "flex-1 border rounded px-2 py-1 bg-gray-600 text-white";
    li.appendChild(input);

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "Done";
    doneBtn.className =
      "px-2 py-1 bg-green-500 rounded text-white text-sm hover:opacity-90";
    doneBtn.addEventListener("click", () => {
      checkbox.checked = false;
      input.value = "";
      input.classList.remove("line-through", "opacity-50");
      saveTasks();
    });
    li.appendChild(doneBtn);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) input.classList.add("line-through", "opacity-50");
      else input.classList.remove("line-through", "opacity-50");
      saveTasks();
    });

    return li;
  }

  // --- Day task ---
  function createDayTask(text = "") {
    const li = document.createElement("li");
    li.className = "flex flex-wrap items-center gap-2 mb-1"; // wrap for mobile

    const input = document.createElement("input");
    input.type = "text";
    input.value = text;
    input.maxLength = 50;
    input.className = "flex-1 border rounded px-2 py-1 bg-gray-600 text-white";
    li.appendChild(input);

    const moveBtn = document.createElement("button");
    moveBtn.textContent = "→ Pomodoro";
    moveBtn.className =
      "px-2 py-1 bg-blue-500 rounded text-white text-sm hover:opacity-90";
    moveBtn.addEventListener("click", () => {
      const emptySlot = Array.from(pomodoroList.children).find(
        (li) => li.querySelector("input[type=text]").value === ""
      );
      if (!emptySlot && pomodoroList.children.length >= MAX_POMODORO) {
        showPomodoroFullModal();
        return;
      }
      if (emptySlot) {
        emptySlot.querySelector("input[type=text]").value = input.value;
      } else {
        pomodoroList.appendChild(createPomodoroTask(input.value));
      }
      li.remove();
      saveTasks();
    });
    li.appendChild(moveBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className =
      "px-2 py-1 bg-red-500 rounded text-white text-sm hover:opacity-90";
    deleteBtn.addEventListener("click", () => {
      li.remove();
      saveTasks();
    });
    li.appendChild(deleteBtn);

    return li;
  }

  // --- + button for Day List ---
  const addDayBtn = document.createElement("button");
  addDayBtn.textContent = "+";
  addDayBtn.className =
    "px-2 py-1 bg-blue-500 rounded text-white text-sm hover:opacity-90 mt-2 float-right";
  addDayBtn.addEventListener("click", () => {
    dayList.appendChild(createDayTask());
    saveTasks();
  });
  dayContainer.appendChild(addDayBtn);

  // --- Pomodoro full modal ---
  const pomodoroFullModal = document.createElement("div");
  pomodoroFullModal.className =
    "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-50";
  pomodoroFullModal.innerHTML = `
    <div class="bg-gray-800 p-6 rounded shadow-lg flex flex-col space-y-4 w-80">
      <p class="text-white text-lg font-bold text-center">
        Pomodoro list is full!
      </p>
      <p class="text-white text-center">
        Complete a task first to move a new one here.
      </p>
      <div class="flex justify-center">
        <button id="close-pomodoro-full" class="px-4 py-2 bg-blue-500 text-white rounded hover:opacity-90">
          OK
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(pomodoroFullModal);
  const closePomodoroFullBtn = pomodoroFullModal.querySelector(
    "#close-pomodoro-full"
  );
  closePomodoroFullBtn.addEventListener("click", () => {
    pomodoroFullModal.classList.add("hidden");
  });
  function showPomodoroFullModal() {
    pomodoroFullModal.classList.remove("hidden");
  }

  // --- Initialize lists ---
  function initPomodoroList() {
    pomodoroList.innerHTML = "";
    for (let i = 0; i < MIN_POMODORO; i++) {
      pomodoroList.appendChild(createPomodoroTask());
    }
  }

  function initDayList() {
    dayList.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      dayList.appendChild(createDayTask());
    }
  }

  // --- Save / Load ---
  function saveTasks() {
    const pomodoroTasks = Array.from(pomodoroList.children).map((li) => ({
      text: li.querySelector("input[type=text]").value,
      done: li.querySelector("input[type=checkbox]")?.checked || false,
    }));
    const dayTasks = Array.from(dayList.children).map((li) => ({
      text: li.querySelector("input[type=text]").value,
    }));
    localStorage.setItem("pomodoro-tasks", JSON.stringify(pomodoroTasks));
    localStorage.setItem("day-tasks", JSON.stringify(dayTasks));
  }

  function loadTasks() {
    const savedPomodoro = JSON.parse(localStorage.getItem("pomodoro-tasks"));
    const savedDay = JSON.parse(localStorage.getItem("day-tasks"));

    if (savedPomodoro) {
      pomodoroList.innerHTML = "";
      for (let i = 0; i < MIN_POMODORO; i++) {
        const t = savedPomodoro[i] || { text: "", done: false };
        const li = createPomodoroTask(t.text);
        li.querySelector("input[type=checkbox]").checked = t.done;
        if (t.done)
          li.querySelector("input[type=text]").classList.add(
            "line-through",
            "opacity-50"
          );
        pomodoroList.appendChild(li);
      }
    } else initPomodoroList();

    if (savedDay) {
      dayList.innerHTML = "";
      savedDay.forEach((t) => dayList.appendChild(createDayTask(t.text)));
    } else initDayList();
  }

  [pomodoroList, dayList].forEach((ul) =>
    ul.addEventListener("input", saveTasks)
  );

  loadTasks();
  toggleTasks(true); // default view
}
