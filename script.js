const STORAGE_KEY = "todoListTasks";

let tasks = [];
let editId = null;
let currentFilter = "all";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const submitBtn = document.getElementById("submitBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter-btn");

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
      <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <div class="task-actions">
        <button type="button" class="btn-edit">Edit</button>
        <button type="button" class="btn-delete">Delete</button>
      </div>
    `;

    const checkbox = li.querySelector(".task-checkbox");
    const editBtn = li.querySelector(".btn-edit");
    const deleteBtn = li.querySelector(".btn-delete");

    checkbox.addEventListener("change", () => toggleComplete(task.id));
    editBtn.addEventListener("click", () => startEdit(task.id));
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    taskList.appendChild(li);
  });

  const hasTasks = tasks.length > 0;
  const hasFiltered = filtered.length > 0;

  emptyState.classList.toggle("hidden", hasFiltered);
  emptyState.textContent = hasTasks
    ? "No tasks match this filter."
    : "No tasks yet. Add your first one above!";

  taskCount.textContent =
    activeCount === 1 ? "1 task left" : `${activeCount} tasks left`;

  clearCompletedBtn.hidden = completedCount === 0;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function addOrUpdateTask(text) {
  if (editId) {
    const task = tasks.find((t) => t.id === editId);
    if (task) {
      task.text = text;
    }
    editId = null;
    submitBtn.textContent = "Add Task";
  } else {
    tasks.unshift({
      id: generateId(),
      text,
      completed: false,
    });
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
  submitBtn.textContent = "Update Task";
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);

  if (editId === id) {
    editId = null;
    taskInput.value = "";
    submitBtn.textContent = "Add Task";
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
