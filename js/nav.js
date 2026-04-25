// ============================================================
// nav.js — Shared navigation injector
// ============================================================

function injectNav(activePage) {
  const session = AUTH.getSession();
  const isMaster = session && session.role === 'master';

  const html = `
  <nav class="topbar">
    <a href="dashboard.html" class="topbar-brand">
      <div class="brand-dot"></div>
      Estoq<span class="brand-accent">SaaS</span>
    </a>
    <div class="topbar-right">
      <div class="refresh-badge">
        <div class="refresh-dot"></div>
        <span id="lastUpdate">—</span>
      </div>
      <div class="user-badge">
        <span data-user-name>${session ? session.name : ''}</span>
        <span class="role-tag" data-user-role>${session ? session.role : ''}</span>
      </div>
      <button class="btn-logout" data-action="logout">Sair</button>
    </div>
  </nav>

  <aside class="sidebar">
    <div class="nav-group">
      <div class="nav-label">Principal</div>
      <a href="dashboard.html" class="nav-link ${activePage==='dashboard'?'active':''}">
        <span class="nav-icon">⊞</span> Dashboard
      </a>
      <a href="relatorios.html" class="nav-link ${activePage==='relatorios'?'active':''}">
        <span class="nav-icon">◫</span> Relatórios
      </a>
      <a href="etiquetas.html" class="nav-link ${activePage==='etiquetas'?'active':''}">
        <span class="nav-icon">◪</span> Etiquetas
      </a>
    </div>
    <div class="nav-group">
      <div class="nav-label">Sistema</div>
      <a href="ferramentas.html" class="nav-link ${activePage==='ferramentas'?'active':''}">
        <span class="nav-icon">⚙</span> Ferramentas
      </a>
      ${isMaster ? `<a href="admin.html" class="nav-link ${activePage==='admin'?'active':''}">
        <span class="nav-icon">◈</span> Admin
      </a>` : ''}
    </div>
    <div style="flex:1"></div>
    <div class="nav-group" style="padding-bottom:12px">
      <div style="font-size:10px;color:var(--text3);font-family:var(--font-mono);padding:8px 8px 0">
        Fonte: Google Sheets<br>
        <a href="${API.CSV_URL}" target="_blank" style="color:var(--amber);text-decoration:none">↗ Ver planilha</a>
      </div>
    </div>
  </aside>`;

  const wrapper = document.getElementById('nav-placeholder');
  if (wrapper) wrapper.innerHTML = html;

  initNav();

  // Last update stamp
  setInterval(() => {
    const el = document.getElementById('lastUpdate');
    if (el) el.textContent = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
  }, 1000);
}

window.injectNav = injectNav;
