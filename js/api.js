// ============================================================
// api.js — Data Layer (CSV → JSON + future API-ready)
// ============================================================

const API = (() => {
  const CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRbILRYzVo-Q8guL_4yZUJCJGHCov90qcO_c09w0haXphoDG8Va6UEZyqDIppOLn-N-4WWADRuNtIF7/pub?gid=0&single=true&output=csv';

  // ── Future hook: swap to Apps Script endpoint ──────────────
  // const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
  // const USE_API = false;

  let _cache = null;
  let _lastFetch = 0;
  const CACHE_TTL = 60_000; // 1 min

  // ── CSV parser (handles quoted fields & line breaks) ───────
  function parseCSV(raw) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === '"') {
        if (inQuotes && raw[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        row.push(cell.trim()); cell = '';
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        if (ch === '\r' && raw[i + 1] === '\n') i++;
        row.push(cell.trim());
        if (row.some(c => c !== '')) rows.push(row);
        row = []; cell = '';
      } else {
        cell += ch;
      }
    }
    if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
    return rows;
  }

  function csvToObjects(rows) {
    if (!rows.length) return [];
    const headers = rows[0].map(h => h.trim());
    return rows.slice(1).map((row, idx) => {
      const obj = { _rowIndex: idx + 2 };
      headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
      return obj;
    }).filter(o => Object.values(o).some(v => v !== '' && v !== undefined));
  }

  // ── Normalise column names (case insensitive lookup) ───────
  function normalise(obj) {
    const map = {};
    Object.keys(obj).forEach(k => { map[k.toLowerCase().replace(/\s+/g, '_')] = k; });

    const get = (...aliases) => {
      for (const a of aliases) {
        const key = map[a.toLowerCase().replace(/\s+/g, '_')];
        if (key !== undefined) return obj[key] ?? '';
      }
      return '';
    };

    return {
      raw: obj,
      id:          get('id', 'codigo', 'code', 'item'),
      nome:        get('nome', 'produto', 'name', 'descricao', 'description', 'item'),
      quantidade:  get('quantidade', 'qtd', 'qty', 'estoque', 'stock', 'amount'),
      validade:    get('validade', 'vencimento', 'expiry', 'expiration', 'data_validade'),
      status:      get('status', 'situacao', 'state'),
      pedido:      get('pedido', 'order', 'nf', 'nota'),
      lote:        get('lote', 'batch', 'lot'),
      local:       get('local', 'localizacao', 'location', 'setor', 'deposito'),
      categoria:   get('categoria', 'category', 'grupo', 'tipo', 'type'),
      preco:       get('preco', 'price', 'custo', 'cost', 'valor'),
      fornecedor:  get('fornecedor', 'supplier', 'vendor'),
      observacao:  get('observacao', 'obs', 'notes', 'note', 'observações'),
      _rowIndex:   obj._rowIndex,
    };
  }

  // ── Main fetch ─────────────────────────────────────────────
  async function fetchData(force = false) {
    const now = Date.now();
    if (!force && _cache && now - _lastFetch < CACHE_TTL) return _cache;

    const raw = await fetch(CSV_URL).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    });

    const rows   = parseCSV(raw);
    const objs   = csvToObjects(rows);
    const data   = objs.map(normalise);

    _cache     = data;
    _lastFetch = now;
    return data;
  }

  // ── Derived stats ──────────────────────────────────────────
  function computeStats(data) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in3days = new Date(today); in3days.setDate(today.getDate() + 3);
    const in30days = new Date(today); in30days.setDate(today.getDate() + 30);

    let vencidos = 0, proxVencimento = 0, semValidade = 0, totalQtd = 0;
    const criticos = [];
    const porStatus = {};
    const porCategoria = {};
    const alertas = [];

    data.forEach(item => {
      const qtd = parseInt(item.quantidade) || 0;
      totalQtd += qtd;

      // Status
      const st = (item.status || 'Indefinido').trim();
      porStatus[st] = (porStatus[st] || 0) + 1;

      // Categoria
      const cat = (item.categoria || 'Geral').trim();
      porCategoria[cat] = (porCategoria[cat] || 0) + 1;

      // Validade
      if (item.validade) {
        const parts = item.validade.split(/[\/\-\.]/);
        let d;
        if (parts.length === 3) {
          // handle dd/mm/yyyy or yyyy-mm-dd
          d = parts[0].length === 4
            ? new Date(parts[0], parts[1] - 1, parts[2])
            : new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
          d = new Date(item.validade);
        }
        if (!isNaN(d.getTime())) {
          d.setHours(0, 0, 0, 0);
          if (d < today) { vencidos++; criticos.push({ item, motivo: 'VENCIDO', urgencia: 3 }); }
          else if (d <= in3days) { proxVencimento++; criticos.push({ item, motivo: 'VENCE EM BREVE', urgencia: 2 }); }
          else if (d <= in30days) { criticos.push({ item, motivo: 'Vence em 30 dias', urgencia: 1 }); }
        }
      } else {
        semValidade++;
      }

      // Campo vazio
      if (!item.nome) alertas.push({ item, msg: `Linha ${item._rowIndex}: nome vazio`, tipo: 'erro' });
      if (!item.quantidade && item.quantidade !== '0') alertas.push({ item, msg: `${item.nome || 'Linha ' + item._rowIndex}: quantidade ausente`, tipo: 'aviso' });
    });

    criticos.sort((a, b) => b.urgencia - a.urgencia);

    return { total: data.length, totalQtd, vencidos, proxVencimento, semValidade, criticos, porStatus, porCategoria, alertas };
  }

  return { fetchData, computeStats, CSV_URL };
})();

// Expose globally
window.API = API;
