# EstoqSaaS 📦

Sistema de Controle de Estoque estilo SaaS — baseado em Google Sheets, hospedado no GitHub Pages.

## 🚀 Como publicar no GitHub Pages

### 1. Crie um repositório no GitHub
```
Vá em github.com → New Repository → nome: estoq-saas → Public
```

### 2. Faça upload dos arquivos
Arraste toda a pasta do projeto para o repositório, ou use Git:

```bash
git init
git add .
git commit -m "Initial commit — EstoqSaaS"
git remote add origin https://github.com/SEU_USUARIO/estoq-saas.git
git push -u origin main
```

### 3. Ative o GitHub Pages
```
Repositório → Settings → Pages → Source: Deploy from branch → Branch: main → / (root) → Save
```

Após alguns minutos o sistema estará em:
**https://SEU_USUARIO.github.io/estoq-saas**

---

## 🔑 Credenciais padrão

| Usuário | Senha | Nível   |
|---------|-------|---------|
| admin   | 1234  | master  |
| user    | 1234  | comum   |

**master** tem acesso a todas as páginas, incluindo Admin.  
**comum** tem acesso apenas a leitura/visualização.

---

## 📁 Estrutura de arquivos

```
estoq-saas/
├── index.html          # Tela de login
├── dashboard.html      # Painel operacional com alertas
├── relatorios.html     # Tabela completa com filtros e exportação
├── etiquetas.html      # Gerador de etiquetas + PDF
├── ferramentas.html    # Calculadora, validador, simulador, contador
├── admin.html          # Painel admin (somente master)
├── css/
│   └── main.css        # Design system completo
└── js/
    ├── api.js          # Camada de dados (CSV → JSON)
    ├── auth.js         # Autenticação e sessão
    └── nav.js          # Navegação compartilhada
```

---

## 🔧 Configuração

### Trocar a planilha do Google Sheets

1. Abra sua planilha no Google Sheets
2. Arquivo → Compartilhar → Publicar na web → CSV → Obter link
3. Edite `js/api.js`:

```javascript
const CSV_URL = 'SUA_URL_DO_SHEETS_AQUI';
```

### Adicionar usuários

Edite `js/auth.js`:

```javascript
const USERS = [
  { username: 'admin', password: '1234', role: 'master', name: 'Administrador' },
  { username: 'user',  password: '1234', role: 'comum',  name: 'Operador' },
  // adicione mais aqui:
  { username: 'joao',  password: 'senha', role: 'comum', name: 'João Silva' },
];
```

---

## 🔄 Evolução para Google Apps Script (API real)

Quando quiser trocar CSV por API em tempo real:

1. No Google Sheets, abra **Extensões → Apps Script**
2. Crie um endpoint GET que retorne JSON:

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows    = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return ContentService
    .createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Implante como Web App (acesso: Qualquer pessoa)
4. Em `js/api.js`, troque `CSV_URL` pela URL do Apps Script e altere a função `fetchData`:

```javascript
// USE_API = true → busca via Apps Script
const data = await fetch(APPS_SCRIPT_URL).then(r => r.json());
```

---

## 📋 Funcionalidades

| Página        | Funcionalidade |
|---------------|----------------|
| Login         | Autenticação local, sessão via localStorage |
| Dashboard     | Alertas inteligentes, stats, ranking, auto-refresh |
| Relatórios    | Tabela paginada, filtros múltiplos, exportação CSV |
| Etiquetas     | Seleção múltipla, pré-visualização, geração de PDF |
| Ferramentas   | Calculadora, validador, simulador de vencimento, contador |
| Admin         | Logs, usuários, status do sistema, teste de conexão |

---

## 🧠 Lógica de alertas

O sistema detecta automaticamente:
- 🔴 Produtos **vencidos** (data de validade no passado)
- 🟡 Produtos **vencendo em até 3 dias**
- 🔵 Produtos **vencendo em até 30 dias**
- ⚠ Campos obrigatórios vazios (nome, quantidade)
- 📊 Ranking por quantidade em estoque

---

## 🎨 Tecnologias

- HTML5 + CSS3 + JavaScript puro (sem frameworks)
- Google Sheets como banco de dados (CSV)
- jsPDF para geração de etiquetas em PDF
- Google Fonts (Syne + Inter + DM Mono)
- GitHub Pages para hospedagem gratuita

---

Feito para funcionar como um SaaS real, mesmo sendo 100% frontend + Google Sheets. 🚀
