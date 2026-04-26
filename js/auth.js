// ═══════════════════════════════════════════════
// js/auth.js — Autenticação simples com localStorage
// ═══════════════════════════════════════════════

const USERS = {
  'admin': { password: '1234', role: 'admin', name: 'Administrador' },
  'user':  { password: '1234', role: 'user',  name: 'Usuário' }
};

const Auth = {
  login(username, password) {
    const u = USERS[username.toLowerCase().trim()];
    if (u && u.password === password) {
      const session = { username: username.toLowerCase().trim(), role: u.role, name: u.name, ts: Date.now() };
      localStorage.setItem('estoqueflow_session', JSON.stringify(session));
      return { ok: true, session };
    }
    return { ok: false, error: 'Usuário ou senha inválidos.' };
  },
  logout() {
    localStorage.removeItem('estoqueflow_session');
    window.location.href = 'index.html';
  },
  getSession() {
    try {
      const s = localStorage.getItem('estoqueflow_session');
      if (!s) return null;
      const session = JSON.parse(s);
      // Sessão expira em 8h
      if (Date.now() - session.ts > 8 * 60 * 60 * 1000) {
        this.logout();
        return null;
      }
      return session;
    } catch { return null; }
  },
  require(adminOnly = false) {
    const s = this.getSession();
    if (!s) { window.location.href = 'index.html'; return null; }
    if (adminOnly && s.role !== 'admin') { window.location.href = 'dashboard.html'; return null; }
    return s;
  },
  isAdmin() {
    const s = this.getSession();
    return s && s.role === 'admin';
  }
};
