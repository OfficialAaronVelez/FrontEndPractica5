// --- API config ---
const isLocal = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE = isLocal ? 'http://localhost:3000' : (window.PRODUCTION_API_URL || window.location.origin);
const API = API_BASE + '/tasks';
const LOGIN_URL = API_BASE + '/login';
const REGISTER_URL = API_BASE + '/register';
const REQUEST_TIMEOUT_MS = 10000;

// --- Token storage (ISIP05 / ISIP03)
// We use localStorage for simplicity. Alternatives:
// - Cookies: can be httpOnly so JS cannot read them → avoids XSS stealing the token.
//   Downside: need backend to set the cookie and same-site/CSRF handling.
// - localStorage: easy for SPA, but if the site has an XSS bug, script can read the token.
// For production, prefer httpOnly cookies set by the API and same-site policy.
const TOKEN_KEY = 'task_manager_access_token';
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(token) { localStorage.setItem(TOKEN_KEY, token); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

// Get user id from JWT payload (sub claim) so we can tag new tasks with userId
function getUserIdFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub != null ? payload.sub : null;
  } catch (_) { return null; }
}

// --- DOM refs ---
const authSection = document.getElementById('authSection');
const tasksSection = document.getElementById('tasksSection');
const authForm = document.getElementById('authForm');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authError = document.getElementById('authError');
const btnAuth = document.getElementById('btnAuth');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const btnLogout = document.getElementById('btnLogout');
const listEl = document.getElementById('taskList');
const inputEl = document.getElementById('newTask');
const btnAdd = document.getElementById('btnAdd');
const emptyMsg = document.getElementById('emptyMsg');
const errorEl = document.getElementById('error');

function showAuth() {
  authSection.classList.remove('hidden');
  tasksSection.classList.add('hidden');
  if (btnLogout) btnLogout.classList.add('hidden');
}
function showTasks() {
  authSection.classList.add('hidden');
  tasksSection.classList.remove('hidden');
  if (btnLogout) btnLogout.classList.remove('hidden');
}

function getErrorMessage(err) {
  if (err.status === 401) return 'Sesión expirada o no válida. Vuelve a iniciar sesión.';
  if (err.name === 'AbortError') return 'La solicitud tardó demasiado. Revisa tu conexión.';
  if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('network'))) return 'Sin conexión. Revisa tu internet.';
  if (err.status >= 500) return 'Error del servidor. Intenta de nuevo en un momento.';
  if (err.status === 429) return 'Demasiadas peticiones. Espera un poco.';
  if (err.status >= 400) return err.message || 'Error en la solicitud. Verifica los datos.';
  return err.message || 'Algo salió mal. Intenta de nuevo.';
}

function showError(msg) {
  if (errorEl) {
    errorEl.textContent = msg || '';
    errorEl.style.display = msg ? 'block' : 'none';
  }
}
function showAuthError(msg) {
  authError.textContent = msg || '';
  authError.style.display = msg ? 'block' : 'none';
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

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return fetch(url, { ...options, signal: controller.signal, headers }).then(res => {
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
    if (res.status === 401) {
      clearToken();
      showAuth();
      return;
    }
    if (!res.ok) {
      const err = new Error('Error al cargar tareas');
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    renderTasks(data);
  } catch (e) {
    if (e.status === 401 || (e.name === 'TypeError' && !getToken())) {
      clearToken();
      showAuth();
      return;
    }
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
      body: JSON.stringify({ title, completed: false, userId: getUserIdFromToken() })
    });
    if (res.status === 401) {
      clearToken();
      showAuth();
      return;
    }
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
    if (res.status === 401) {
      clearToken();
      showAuth();
      return;
    }
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

async function login(email, password) {
  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Correo o contraseña incorrectos');
    err.status = res.status;
    throw err;
  }
  if (!data.accessToken) throw new Error('El servidor no devolvió un token');
  setToken(data.accessToken);
}

async function register(email, password) {
  const res = await fetch(REGISTER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Error al registrarse');
    err.status = res.status;
    throw err;
  }
  if (!data.accessToken) throw new Error('El servidor no devolvió un token');
  setToken(data.accessToken);
}

let isLoginMode = true;
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showAuthError('');
  const email = authEmail.value.trim();
  const password = authPassword.value;
  if (!email || !password) return;
  btnAuth.disabled = true;
  try {
    if (isLoginMode) await login(email, password);
    else await register(email, password);
    showTasks();
    loadTasks();
    authForm.reset();
  } catch (err) {
    showAuthError(getErrorMessage(err));
  } finally {
    btnAuth.disabled = false;
  }
});

tabLogin.addEventListener('click', () => {
  isLoginMode = true;
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  btnAuth.textContent = 'Iniciar sesión';
  showAuthError('');
});
tabRegister.addEventListener('click', () => {
  isLoginMode = false;
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  btnAuth.textContent = 'Registrarse';
  showAuthError('');
});

btnLogout.addEventListener('click', () => {
  clearToken();
  showAuth();
  authForm.reset();
  showAuthError('');
});

btnAdd.addEventListener('click', addTask);
inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

if (getToken()) {
  showTasks();
  loadTasks();
} else {
  showAuth();
}
