// ============================================================
// auth.js — Authentication & Session
// ============================================================

const AUTH = (() => {
  const USERS = [
    { username: 'admin', password: '1234', role: 'master', name: 'Administrador' },
    { username: 'user',  password: '1234', role: 'comum',  name: 'Operador' },
  ];

  const SESSION_KEY = 'estoq_session';
  const LOG_KEY     = 'estoq_logs';

  function login(username, password) {
    const u = USERS.find(u => u.username === username && u.password === password);
    if (!u) return null;
    const session = { ...u, loginAt: new Date().toISOString() };
    delete session.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    addLog(`Login: ${u.name} (${u.role})`);
    return session;
  }

  function logout() {
    const s = getSession();
    if (s) addLog(`Logout: ${s.name}`);
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  }

  function requireAuth(redirect = 'index.html') {
    const s = getSession();
    if (!s) { window.location.href = redirect; return null; }
    return s;
  }

  function requireMaster() {
    const s = requireAuth();
    if (!s) return null;
    if (s.role !== 'master') { window.location.href = 'dashboard.html'; return null; }
    return s;
  }

  function isMaster() {
    const s = getSession();
    return s && s.role === 'master';
  }

  function addLog(msg) {
    const logs = getLogs();
    logs.unshift({ ts: new Date().toISOString(), msg });
    if (logs.length > 100) logs.length = 100;
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  }

  function getLogs() {
    try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; }
    catch { return []; }
  }

  function getAllUsers() { return USERS.map(u => ({ ...u, password: '****' })); }

  return { login, logout, getSession, requireAuth, requireMaster, isMaster, addLog, getLogs, getAllUsers };
})();

window.AUTH = AUTH;

// ── Nav helpers ────────────────────────────────────────────
function initNav() {
  const session = AUTH.getSession();
  if (!session) return;

  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = session.name);
  document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = session.role);

  const adminLinks = document.querySelectorAll('[data-role="master"]');
  adminLinks.forEach(el => {
    if (session.role !== 'master') el.style.display = 'none';
  });

  const logoutBtns = document.querySelectorAll('[data-action="logout"]');
  logoutBtns.forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); AUTH.logout(); }));
}

// ── Toast notifications ────────────────────────────────────
function toast(msg, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span class="toast-icon">${{ info: 'ℹ', success: '✓', warning: '⚠', error: '✕' }[type]}</span><span>${msg}</span>`;
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, duration);
}

window.toast = toast;
window.initNav = initNav;
