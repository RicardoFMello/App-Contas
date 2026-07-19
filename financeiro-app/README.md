# App Financeiro Pessoal

Aplicativo financeiro pessoal (PWA), Vanilla JS + Supabase + Cloudflare Pages.

## Estrutura de pastas

```
financeiro-app/
├── index.html              → tela principal (shell da aplicação)
├── manifest.json           → configuração PWA
├── service-worker.js       → cache offline / instalação
├── css/
│   ├── variables.css       → cores, espaçamentos, tipografia (temas claro/escuro)
│   ├── base.css            → reset e estilos globais
│   ├── components.css      → botões, cards, inputs, modais
│   └── dashboard.css        → estilos específicos do dashboard
├── js/
│   ├── config/
│   │   └── supabase.js     → inicialização do cliente Supabase
│   ├── auth/
│   │   └── auth.js         → login, logout, sessão
│   ├── data/
│   │   ├── contas.js       → CRUD de contas
│   │   ├── lancamentos.js  → CRUD de lançamentos/parcelas
│   │   ├── receitas.js     → CRUD de receitas
│   │   ├── investimentos.js
│   │   └── metas.js
│   ├── ui/
│   │   ├── dashboard.js    → renderização dos indicadores/gráficos
│   │   ├── router.js       → navegação entre telas (SPA simples)
│   │   └── theme.js        → alternância claro/escuro
│   └── app.js               → ponto de entrada, inicializa tudo
├── assets/
│   └── icons/               → ícones do PWA (vários tamanhos)
├── sql/
│   └── schema.sql            → schema completo do Supabase (Fase 1)
└── README.md
```

## Status do desenvolvimento

- [x] Fase 1 — Estrutura de pastas + Schema SQL + RLS
- [x] Fase 2 — Autenticação
- [x] Fase 3 — Camada de dados (CRUD)
- [x] Fase 4 — Dashboard
- [x] Fase 5 — Módulo Contas
- [ ] Fase 6 — Módulo Receitas
- [ ] Fase 7 — Módulo Investimentos
- [ ] Fase 8 — Módulo Metas
- [ ] Fase 9 — Tema e Configurações
- [ ] Fase 10 — PWA
- [ ] Fase 11 — QA
- [ ] Fase 12 — Importação da planilha
- [ ] Fase 13 — Deploy (GitHub → Cloudflare Pages)
- [ ] Fase 14 — Documentação final

## Rodando o schema no Supabase

1. Criar projeto em supabase.com
2. Abrir SQL Editor
3. Colar o conteúdo de `sql/schema.sql`
4. Executar (RUN)

Detalhes completos de configuração virão na Fase 1 (documentação) e Fase 13 (deploy).

## Fase 2 — Autenticação (configuração)

1. No Supabase: **Authentication → Providers** → deixar apenas Email/Password ativo.
2. Em **Authentication → Users** → criar o primeiro usuário manualmente (seu e-mail e senha). Não haverá tela de cadastro público — acesso restrito por design.
3. Em **Project Settings → API**, copiar `Project URL` e `anon public key`.
4. Colar esses dois valores em `js/config/supabase.js` (`SUPABASE_URL` e `SUPABASE_ANON_KEY`).
5. Abrir `index.html` num servidor local (ex: extensão "Live Server" do VS Code) — **não abrir como arquivo `file://` direto**, pois módulos ES exigem HTTP.
6. Testar login com o usuário criado no passo 2.

Cada novo usuário (esposa, mãe, irmão) é criado do mesmo jeito no passo 2 — a trigger do schema já cria a linha em `configuracoes` automaticamente, e o RLS isola os dados sem nenhuma configuração extra.

## Fase 3 — Camada de dados

Módulos em `js/data/`: `categorias.js`, `contas.js`, `lancamentos.js`, `receitas.js`, `investimentos.js`, `metas.js`, mais `util.js` (compartilhado).

**Padrão único de retorno em toda função:** `{ dados, erro }`. `erro` nunca é o objeto bruto do Supabase — sempre uma mensagem pronta para exibir na tela. Exemplo de uso (Fase 4 em diante):

```js
import { listarPorMes } from './data/lancamentos.js';

const { dados, erro } = await listarPorMes(new Date());
if (erro) {
  mostrarAlerta(erro);
} else {
  renderizarLista(dados);
}
```

Pontos de confiabilidade implementados:
- `lancamentos.js`: status "atrasado" é **calculado no momento da leitura** (pendente + vencimento no passado), nunca depende de um job/cron para ficar correto.
- `contas.js`: exclusão é **soft delete** (`ativa = false`) por padrão — preserva o histórico de lançamentos já pagos. Exclusão definitiva só é permitida para contas sem lançamentos.
- `investimentos.js` e `metas.js`: cálculos de rendimento e progresso centralizados em uma função só, para evitar fórmulas divergentes em telas diferentes.

## Fase 4 — Dashboard

Arquivos: `js/ui/dashboard.js`, `css/dashboard.css`, seção `#tela-app` em `index.html`.

Indicadores exibidos: saldo disponível, receitas do mês, despesas do mês (com % da receita comprometida), fluxo de caixa, patrimônio investido (com rendimento), reserva de emergência (com % da meta), contas vencidas, contas pagas no mês. Alertas de contas atrasadas e a vencer em até 7 dias aparecem no topo. Gráfico de evolução (receitas x despesas, últimos 6 meses) via Chart.js. Progresso de cada conta parcelada aparece em barras individuais.

**Dependência nova:** Chart.js via CDN (`cdnjs.cloudflare.com`) — carregado direto no `index.html`, sem necessidade de instalação.

**Convenção adotada:** a "reserva de emergência" é identificada automaticamente como a meta (tabela `metas`) cujo nome contém a palavra "reserva" — crie uma meta com esse nome para o card aparecer preenchido. Se nenhuma meta com esse nome existir, o card mostra "—".

**Limitação conhecida (revisar na Fase 11 — QA):** o gráfico de evolução usa as cores do tema no momento em que é desenhado; ao alternar claro/escuro com o dashboard já carregado, as cores do gráfico só atualizam se a página for recarregada.

## Fase 5 — Módulo Contas

Arquivos: `js/ui/contas.js`, `js/ui/router.js`, `css/contas.css`, `css/app-shell.css`, vistas e modais em `index.html`.

- Navegação por abas (Dashboard/Contas) via `router.js` — sem recarregar a página.
- Seletor de mês (‹ ›) na vista Contas — lista sempre reflete o mês selecionado.
- "Nova conta" abre modal para cadastrar o molde (nome, categoria opcional, tipo, valor/vencimento padrão).
- Cada conta do mês mostra: sem lançamento → botão "Lançar mês" (usa valor/vencimento padrão como sugestão); com lançamento pendente → "Marcar pago" / "Editar"; pago → "Reverter".
- Parcelas: número da parcela sugerido automaticamente (histórico + 1) ao lançar uma conta parcelada.
- "Arquivar" faz soft delete (pede confirmação) — preserva o histórico.
- Chamado `js/data/categorias.js` (Fase 3) para popular o seletor — ainda não existe uma tela dedicada para criar categorias; por enquanto elas ficam "Sem categoria" até você decidir se quer esse módulo (posso incluir como extra numa fase futura).
