const STORAGE_KEY = "todoListTasks";

let tasks = [];
let editId = null;
let currentFilter = "all";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const submitBtn = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter-btn");
const statTotal = document.getElementById("statTotal");
const statActive = document.getElementById("statActive");
const statDone = document.getElementById("statDone");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const editIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const deleteIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    tasks = JSON.parse(stored);
  }
}

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }
  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }
  return tasks;
}

function updateStats() {
  const total = tasks.length;
  const active = tasks.filter((t) => !t.completed).length;
  const done = tasks.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  statTotal.textContent = total;
  statActive.textContent = active;
  statDone.textContent = done;
  progressFill.style.width = percent + "%";
  progressText.textContent = percent + "%";
}

function updateUI() {
  const filtered = getFilteredTasks();
  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.filter((task) => task.completed).length;

  taskList.innerHTML = "";

  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");
    li.dataset.id = task.id;

    li.innerHTML = `
      <div class="check-wrap">
        <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
      </div>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <div class="task-actions">
        <button type="button" class="icon-btn btn-edit" title="Edit">${editIcon}</button>
        <button type="button" class="icon-btn btn-delete" title="Delete">${deleteIcon}</button>
      </div>
    `;

    li.querySelector(".task-checkbox").addEventListener("change", () => toggleComplete(task.id));
    li.querySelector(".btn-edit").addEventListener("click", () => startEdit(task.id));
    li.querySelector(".btn-delete").addEventListener("click", () => deleteTask(task.id));

    taskList.appendChild(li);
  });

  const hasTasks = tasks.length > 0;
  const hasFiltered = filtered.length > 0;

  emptyState.classList.toggle("hidden", hasFiltered);

  if (hasFiltered) {
    emptyState.classList.add("hidden");
  } else {
    emptyState.classList.remove("hidden");
    emptyState.querySelector("h3").textContent = hasTasks
      ? "No matching tasks"
      : "No tasks yet";
    emptyState.querySelector("p").textContent = hasTasks
      ? "Try a different filter to see your tasks."
      : "Add your first task above and start being productive!";
  }

  taskCount.textContent = activeCount === 1 ? "1 left" : `${activeCount} left`;
  clearCompletedBtn.hidden = completedCount === 0;
  updateStats();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function setSubmitMode(editing) {
  submitText.textContent = editing ? "Update" : "Add";
  submitBtn.classList.toggle("editing", editing);
}

function addOrUpdateTask(text) {
  if (editId) {
    const task = tasks.find((t) => t.id === editId);
    if (task) task.text = text;
    editId = null;
    setSubmitMode(false);
  } else {
    tasks.unshift({ id: generateId(), text, completed: false });
  }

  saveTasks();
  updateUI();
}

function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    updateUI();
  }
}

function startEdit(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  editId = id;
  taskInput.value = task.text;
  taskInput.focus();
  setSubmitMode(true);
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);

  if (editId === id) {
    editId = null;
    taskInput.value = "";
    setSubmitMode(false);
  }

  saveTasks();
  updateUI();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  updateUI();
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }
  addOrUpdateTask(text);
  taskInput.value = "";
  taskInput.focus();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    updateUI();
  });
});

loadTasks();
updateUI();
