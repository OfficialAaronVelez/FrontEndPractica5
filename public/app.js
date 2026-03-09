const API = 'http://localhost:3000/tasks';
const REQUEST_TIMEOUT_MS = 10000;

const listEl = document.getElementById('taskList');
const inputEl = document.getElementById('newTask');
const btnAdd = document.getElementById('btnAdd');
const emptyMsg = document.getElementById('emptyMsg');
const errorEl = document.getElementById('error');

function getErrorMessage(err) {
  if (err.name === 'AbortError') return 'La solicitud tardó demasiado. Revisa tu conexión.';
  if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('network'))) return 'Sin conexión. Revisa tu internet.';
  if (err.status >= 500) return 'Error del servidor. Intenta de nuevo en un momento.';
  if (err.status === 429) return 'Demasiadas peticiones. Espera un poco.';
  if (err.status >= 400) return 'Error en la solicitud. Verifica los datos.';
  return err.message || 'Algo salió mal. Intenta de nuevo.';
}

function showError(msg) {
  errorEl.textContent = msg || '';
  errorEl.style.display = msg ? 'block' : 'none';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderTasks(tasks) {
  listEl.innerHTML = '';
  emptyMsg.style.display = tasks.length ? 'none' : 'block';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = '<span>' + escapeHtml(task.title) + '</span><button type="button" class="btn-delete">Eliminar</button>';
    li.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));
    listEl.appendChild(li);
  });
}

function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).then(res => {
    clearTimeout(id);
    return res;
  }, err => {
    clearTimeout(id);
    throw err;
  });
}

async function loadTasks() {
  try {
    showError('');
    const res = await fetchWithTimeout(API);
    if (!res.ok) {
      const err = new Error('Error al cargar tareas');
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    renderTasks(data);
  } catch (e) {
    showError(getErrorMessage(e));
    renderTasks([]);
  }
}

async function addTask() {
  const title = inputEl.value.trim();
  if (!title) return;
  try {
    showError('');
    const res = await fetchWithTimeout(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, completed: false })
    });
    if (!res.ok) {
      const err = new Error('Error al crear tarea');
      err.status = res.status;
      throw err;
    }
    inputEl.value = '';
    await loadTasks();
  } catch (e) {
    showError(getErrorMessage(e));
  }
}

async function deleteTask(id) {
  try {
    showError('');
    const res = await fetchWithTimeout(API + '/' + id, { method: 'DELETE' });
    if (!res.ok) {
      const err = new Error('Error al eliminar');
      err.status = res.status;
      throw err;
    }
    await loadTasks();
  } catch (e) {
    showError(getErrorMessage(e));
  }
}

btnAdd.addEventListener('click', addTask);
inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

loadTasks();
