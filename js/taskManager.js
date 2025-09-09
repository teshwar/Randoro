// taskManager.js
export function initTaskManager() {
  const taskInputs = document.querySelectorAll("#task-list input");

  function saveTasks() {
    const tasks = Array.from(taskInputs).map((input) => input.value);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || ["", "", ""];
    taskInputs.forEach((input, i) => (input.value = tasks[i]));
  }

  taskInputs.forEach((input) => input.addEventListener("input", saveTasks));
  loadTasks();
}
