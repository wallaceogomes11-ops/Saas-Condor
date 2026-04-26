// ═══════════════════════════════════════════════
// js/api.js — Fonte de dados: Google Sheets CSV
// ═══════════════════════════════════════════════

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRbILRYzVo-Q8guL_4yZUJCJGHCov90qcO_c09w0haXphoDG8Va6UEZyqDIppOLn-N-4WWADRuNtIF7/pub?gid=0&single=true&output=csv';

const API = {
  _cache: null,
  _cacheTs: 0,
  _cacheTTL: 2 * 60 * 1000, // 2 min

  parseCSV(txt) {
    const rows = []; let row = [], cell = '', inQ = false;
    for (let i = 0; i < txt.length; i++) {
      const c = txt[i], nx = txt[i+1];
      if (inQ) {
        if (c === '"' && nx === '"') { cell += '"'; i++; }
        else if (c === '"') inQ = false;
        else cell += c;
      } else if (c === '"') inQ = true;
      else if (c === ',') { row.push(cell.trim()); cell = ''; }
      else if (c === '\n') { row.push(cell.trim()); cell = ''; if (row.some(x => x !== '')) rows.push(row); row = []; }
      else if (c !== '\r') cell += c;
    }
    if (cell || row.length) { row.push(cell.trim()); if (row.some(x => x !== '')) rows.push(row); }
    return rows;
  },

  mapRow(r, idx) {
    return {
      endereco:    r[idx.endereco]    || '',
      microsiga:   r[idx.microsiga]   || '',
      descricao:   r[idx.descricao]   || '',
      quantidade:  r[idx.quantidade]  || '',
      volume:      r[idx.volume]      || '',
      pedido:      r[idx.pedido]      || '',
      estado:      r[idx.estado]      || '',
      lote:        r[idx.lote]        || '',
      dataEntrada: r[idx.dataEntrada] || '',
      validade:    r[idx.validade]    || '',
      status:      r[idx.status]      || '',
    };
  },

  async fetch(force = false) {
    if (!force && this._cache && (Date.now() - this._cacheTs) < this._cacheTTL) {
      return this._cache;
    }
    const res = await window.fetch(CSV_URL + '&t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const txt = await res.text();
    const rows = this.parseCSV(txt);
    if (rows.length < 2) throw new Error('CSV sem dados.');
    const N = s => (s || '').toString().toUpperCase().trim();
    const h = rows[0].map(N);
    const ci = k => { const i = h.indexOf(k); return i >= 0 ? i : h.findIndex(x => x.includes(k)); };
    const idx = {
      endereco: ci('ENDER'), microsiga: ci('MICROSIGA'), descricao: ci('DESCRI'),
      quantidade: ci('QUANTIDADE'), volume: ci('VOLUME'), pedido: ci('PEDIDO'),
      estado: ci('ESTADO'), lote: ci('LOTE'), dataEntrada: ci('ENTRADA'),
      validade: ci('VALIDADE'), status: ci('STATUS'),
    };
    const data = rows.slice(1)
      .map(r => this.mapRow(r, idx))
      .filter(d => d.endereco || d.microsiga || d.status);
    this._cache = data;
    this._cacheTs = Date.now();
    return data;
  },

  clearCache() { this._cache = null; this._cacheTs = 0; }
};

// Helpers globais — declarados com var para evitar conflito de redeclaração entre páginas
var parseDate = parseDate || function(s) {
  if (!s || !s.trim()) return null;
  s = s.trim();
  var m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return new Date(+m[3], +m[2]-1, +m[1]);
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(+m[1], +m[2]-1, +m[3]);
  var d = new Date(s); return isNaN(d) ? null : d;
};
var _apiYearOf = function(s) { var d = parseDate(s); return d ? d.getFullYear() : null; };

// Toast notification
function showToast(msg, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = {
    success: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    error:   '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
    warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
    info:    '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
  };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = (icons[type] || '') + msg;
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add('fade-out');
    setTimeout(() => t.remove(), 300);
  }, duration);
}
