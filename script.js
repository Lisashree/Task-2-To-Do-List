const STORAGE_KEY = "daylist_tasks";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyMessage = document.getElementById("emptyMessage");
const inputHint = document.getElementById("inputHint");
const clearCompletedButton = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-button");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch (error) {
    console.error("Could not load saved tasks:", error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(taskText) {
  const newTask = {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    text: taskText,
    completed: false
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
}

function toggleTask(taskId) {
  tasks = tasks.map(task =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function getVisibleTasks() {
  if (currentFilter === "active") return tasks.filter(task => !task.completed);
  if (currentFilter === "completed") return tasks.filter(task => task.completed);
  return tasks;
}

function updateSummary() {
  const completedCount = tasks.filter(task => task.completed).length;
  const activeCount = tasks.length - completedCount;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  document.getElementById("allCount").textContent = tasks.length;
  document.getElementById("activeCount").textContent = activeCount;
  document.getElementById("completedCount").textContent = completedCount;
  document.getElementById("progressLabel").textContent = `${progress}% done`;
  document.getElementById("progressFill").style.width = `${progress}%`;

  document.getElementById("remainingText").textContent =
    activeCount === 0
      ? (tasks.length === 0 ? "No tasks yet" : "All tasks completed — great work!")
      : `${activeCount} task${activeCount === 1 ? "" : "s"} left`;

  clearCompletedButton.disabled = completedCount === 0;
  clearCompletedButton.style.opacity = completedCount === 0 ? "0.45" : "1";
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  taskList.replaceChildren();

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkButton = document.createElement("button");
    checkButton.className = "task-check";
    checkButton.type = "button";
    checkButton.setAttribute("aria-label", task.completed ? "Mark task as active" : "Mark task as completed");
    checkButton.setAttribute("aria-pressed", String(task.completed));
    const checkMark = document.createElement("span");
    checkMark.textContent = task.completed ? "✓" : "";
    checkButton.appendChild(checkMark);
    checkButton.addEventListener("click", () => toggleTask(task.id));

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(checkButton, taskText, deleteButton);
    taskList.appendChild(item);
  });

  const showEmpty = visibleTasks.length === 0;
  emptyState.hidden = !showEmpty;

  if (showEmpty) {
    if (tasks.length === 0) {
      emptyTitle.textContent = "Your list is a blank canvas.";
      emptyMessage.textContent = "Add your first task and make today count.";
    } else if (currentFilter === "active") {
      emptyTitle.textContent = "Nothing left to do!";
      emptyMessage.textContent = "All your tasks are completed. Nice work.";
    } else if (currentFilter === "completed") {
      emptyTitle.textContent = "No completed tasks yet.";
      emptyMessage.textContent = "Completed tasks will appear here.";
    }
  }

  updateSummary();
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const taskText = taskInput.value.trim();

  if (!taskText) {
    inputHint.textContent = "Please enter a task before adding.";
    inputHint.style.color = "#d65c6c";
    taskInput.focus();
    return;
  }

  addTask(taskText);
  taskInput.value = "";
  inputHint.textContent = "Task added successfully!";
  inputHint.style.color = "#38a887";
  taskInput.focus();
});

taskInput.addEventListener("input", () => {
  inputHint.textContent = "Press Enter to add a task";
  inputHint.style.color = "#a0a5ae";
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(filterButton => {
      filterButton.classList.toggle("active", filterButton === button);
    });
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

const today = new Date();
document.getElementById("todayDate").textContent =
  today.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();

renderTasks();
