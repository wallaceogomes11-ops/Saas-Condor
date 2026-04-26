# EstoqueFlow SaaS

Sistema completo de controle de estoque com integração Google Sheets.

## 🚀 Deploy no GitHub Pages

1. Crie um repositório público no GitHub
2. Faça upload de **todos** os arquivos desta pasta
3. Acesse **Settings → Pages → Branch: main → Save**
4. Seu sistema estará em: `https://seu-usuario.github.io/nome-do-repo/`

## 📁 Estrutura

```
index.html          → Login
dashboard.html      → Painel principal (dados + gráficos + filtros)
relatorios.html     → Relatórios consolidados
etiquetas.html      → Gerador de etiquetas A4
ferramentas.html    → Validador, Insights, Diagnóstico, Calculadora, Relatório
admin.html          → Área administrativa (só admin)
js/
  auth.js           → Autenticação localStorage
  api.js            → Integração CSV Google Sheets
styles/
  global.css        → Design system
```

## 🔑 Credenciais padrão

| Usuário | Senha | Nível |
|---------|-------|-------|
| admin   | 1234  | Master (acessa /admin) |
| user    | 1234  | Comum |

## 📊 Fonte de dados

Google Sheets CSV público configurado em `js/api.js`:
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vRb.../pub?gid=0&single=true&output=csv
```

## ✨ Funcionalidades

- **Dashboard**: KPIs, 4 gráficos interativos, filtros sidebar, busca global, tabela ordenável
- **Relatórios**: Visão consolidada por status, estado e pedido com exportação CSV
- **Etiquetas**: Geração A4 por ID, por Endereço, e seleção múltipla
- **Ferramentas**: Validador, Insights automáticos, Detecção de inconsistências, Diagnóstico, Calculadora, Gerador de relatório PDF
- **Admin**: Gerenciamento de usuários, config do sistema, log de atividades, teste de conexão

## 🛠 Tecnologias

- HTML5 + CSS3 + JavaScript Puro
- Chart.js 4 + ChartDataLabels
- QRCode.js
- Google Fonts (Poppins)
- Sem frameworks — pronto para GitHub Pages
