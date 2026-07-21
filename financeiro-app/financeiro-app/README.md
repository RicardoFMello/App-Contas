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
- [x] Fase 6 — Módulo Receitas
- [x] Fase 7 — Módulo Investimentos
- [x] Fase 8 — Módulo Metas
- [x] Fase 9 — Tema e Configurações
- [x] Fase 10 — PWA
- [x] Fase 11 — QA
- [x] Fase 12 — Importação da planilha
- [x] Fase 13 — Deploy (GitHub → Cloudflare Pages)
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

## Fase 6 — Módulo Receitas

Arquivos: `js/ui/receitas.js`, `css/receitas.css`, vista e modal em `index.html`.

- Nova aba "Receitas" na navegação, com o mesmo padrão de seletor de mês da vista Contas.
- Cadastro rápido: tipo (salário/hora extra/renda extra/outra), descrição opcional, valor.
- Card de total do mês sempre em destaque no topo.
- Editar e remover diretamente na lista.
- O indicador "Receitas do mês" do Dashboard já usa esses dados automaticamente — nada a ligar manualmente.

## Fase 7 — Módulo Investimentos

Arquivos: `js/ui/investimentos.js`, `css/investimentos.css`, vista e modal em `index.html`.

- Cadastro por tipo (renda fixa, ações, fundos, cripto), valor aportado e valor atual.
- Resumo no topo: patrimônio investido, total aportado, rendimento (R$ e %) — usa `resumoPatrimonio()` da Fase 3, mesma fórmula do card do Dashboard.
- "Atualizar" reabre o modal para você lançar o valor atual mais recente (evolução patrimonial manual — sem integração automática de cotação, conforme escopo original).
- O card "Patrimônio investido" do Dashboard já reflete esses dados automaticamente.

## Fase 8 — Módulo Metas

Arquivos: `js/ui/metas.js`, `css/metas.css`, vistas e modais em `index.html`.

- Cadastro: nome, valor da meta, valor já guardado, prazo opcional.
- Cada card mostra barra de progresso, % concluído e dias restantes até o prazo.
- Botão "Aportar" soma um valor ao progresso sem precisar editar a meta inteira.
- **Importante:** crie uma meta chamada "Reserva de emergência" (ou qualquer nome contendo "reserva") — é assim que o card do Dashboard identifica automaticamente qual meta é a reserva. Você mencionou que ela cobre 6 meses de despesas: calcule esse valor (6x sua despesa mensal média) e use como "Valor da meta".

## Fase 9 — Tema e Configurações

Arquivos: `js/ui/configuracoes.js`, `js/data/configuracoes.js`, `css/configuracoes.css`, vista em `index.html`. `js/ui/theme.js` reescrito.

- Nova aba "Config" com seletor visual de tema (claro/escuro) e e-mail da conta logada.
- **Tema agora é salvo na nuvem** (tabela `configuracoes`, criada automaticamente por usuário na Fase 1) além do `localStorage`. Fluxo: abre o app → aplica o tema salvo localmente (instantâneo, sem flash) → busca o tema da nuvem em paralelo e ajusta se for diferente (ex: você mudou o tema em outro aparelho). Isso já deixa a arquitetura pronta para quando sua esposa/mãe/irmão tiverem contas próprias, cada um com o tema salvo separadamente.
- Alternar o tema em qualquer lugar do app (topbar ou tela de Configurações) atualiza os dois lugares ao mesmo tempo.

## Fase 10 — PWA

Arquivos: `manifest.json`, `service-worker.js`, `assets/icons/*.png`, metatags em `index.html`, registro em `js/app.js`.

- Ícones gerados em 4 versões (192/512, normal/maskable) — cobre Android, iOS e Windows.
- Service worker cacheia só os arquivos do próprio app (HTML/CSS/JS). **Nunca** intercepta chamadas ao Supabase — seus dados financeiros sempre vêm da rede, nunca de um cache desatualizado.
- Estratégia "stale-while-revalidate": abre instantâneo (do cache) e atualiza sozinho em segundo plano quando há internet.
- **Se você mudar algum arquivo CSS/JS no futuro e a mudança não aparecer no celular:** suba o número em `CACHE_NAME` no topo do `service-worker.js` (ex: `v1` → `v2`) — isso força todo mundo a buscar a versão nova.

### Como instalar no celular

- **Android (Chrome):** abra o app pela URL → menu (⋮) → "Adicionar à tela inicial" ou "Instalar app".
- **iPhone (Safari):** abra o app → botão de compartilhar (□↑) → "Adicionar à Tela de Início". *(Só funciona no Safari, não no Chrome do iOS — limitação da Apple, não do app.)*

## Fase 11 — QA (revisão completa)

Revisei todo o código em busca de bugs, cálculos incorretos, duplicação, falhas de segurança e responsividade. Encontrei e corrigi:

1. **Código duplicado:** o Dashboard tinha sua própria função de somar valores por status, repetindo lógica que já existia em `lancamentos.js`. Extraí para `agregarPorStatus()` — uma única fonte de verdade, usada nos dois lugares.
2. **Falha de segurança (XSS):** os nomes de contas nos alertas e na lista de parcelas do Dashboard eram inseridos na tela sem sanitização — um nome de conta malicioso poderia executar código no navegador. Corrigido com a mesma função `escapar()` já usada nas outras telas.
3. **Numeração de parcela frágil:** ao lançar uma nova parcela, o número sugerido contava quantos lançamentos existiam, em vez de olhar o maior número já usado. Se você excluísse uma parcela no meio do caminho, o próximo número podia repetir. Corrigido.
4. **Dias restantes da meta impreciso:** o cálculo comparava hora exata em vez de dia calendário, podendo mostrar 1 dia a mais ou a menos dependendo da hora em que você abria o app. Corrigido normalizando para meia-noite.
5. **Gráfico de evolução não atualizava as cores ao trocar de tema** (limitação que eu tinha documentado na Fase 4) — corrigido: agora o gráfico escuta a troca de tema e se redesenha sozinho, sem precisar recarregar a página.
6. **Integridade do banco:** o formulário já impedia valores inválidos (parcelas negativas, dia de vencimento fora de 1–31, investimentos negativos), mas o banco em si aceitaria se algum dado chegasse por outro caminho. Criei `sql/patch-fase11-qa.sql` com as constraints que faltavam — **rode esse arquivo no SQL Editor do Supabase uma vez** (mesmo processo do `schema.sql`).

**Esclarecimento sobre dois indicadores do Dashboard que parecem parecidos:**
- **Saldo disponível** = receitas − despesas **já pagas**. É "quanto eu tenho na mão agora".
- **Fluxo de caixa** = receitas − despesas **totais do mês** (pagas + pendentes + atrasadas). É "quanto vai sobrar depois que tudo for pago". Pode ser diferente do saldo disponível — isso é esperado, não é bug.

**Responsividade:** conferida em breakpoints de 1180px (desktop), 860px (tablet), 720px, 560px e 380px (celular pequeno) — nenhum texto sobrepõe, nenhum botão some, grids viram coluna única nas telas estreitas.

## Fase 12 — Importação da planilha

Arquivo: `sql/import-fase12-dados.sql`. **Rode no SQL Editor do Supabase, uma única vez**, depois do `schema.sql` e do `patch-fase11-qa.sql`.

**14 contas e 239 lançamentos importados**, cobrindo todo o histórico real da planilha `Contas__1_.xlsx`:

| Conta | Tipo | Parcelas importadas |
|---|---|---|
| Dízimo | mensal | 12 (todas pagas) |
| Seguro de vida - Caixa | mensal | 9 (todas pagas) |
| Consórcio Carro - Cota 258 | parcelada (77 total) | 36 pagas |
| Consórcio Carro - Cota 365 | parcelada (77 total) | 36 pagas |
| Internet - Apartamento | mensal | 23 (1 pendente: jul/2026) |
| Energia - Apartamento | mensal | 23 (todas pagas) |
| Água - Apartamento | mensal | 23 (todas pagas) |
| IPVA + Licenciamento (anual) | única | 2 pagamentos avulsos (2024 e 2025) |
| IPVA + Licenciamento 2026 (parcelado) | parcelada (7 total*) | 7 (1 pendente: jul/2026) |
| Cartão Santander | parcelada (36 total) | 36 (15 pagas, 21 futuras/atrasadas) |
| Cartão Nubank | mensal | 9 (todas pagas) |
| Cartão Caixa | mensal | 8 (1 pendente: jul/2026) |
| Cartão Mercado Pago | mensal | 5 (1 pendente: jul/2026) |
| PS5 - Jessica | parcelada (10 total) | 10 (6 pagas, 4 futuras) |

**Critério usado para decidir o que importar:** contas com plano fixo e conhecido (consórcio, Santander, PS5) entraram **por inteiro**, incluindo parcelas futuras — porque o valor e a data de cada uma já são certos. Contas variáveis (Nubank, Caixa, Mercado Pago, Energia, Água) entraram **só até o mês atual** — meses futuros de uma fatura variável seriam chute, não dado real; a partir de agora você lança cada mês pela tela de Contas conforme a fatura chega.

**Ajustes que apliquei nos dados, conforme sua confirmação no início do projeto:**
- PS5, parcela 6 (jul/2026): R$ 100,00 (desconto real, não erro)
- Cartão Mercado Pago, parcela de maio: data corrigida de "15/15/2026" (inválida na planilha) para 15/05/2026

**Outras decisões que tomei ao transformar a planilha em dados relacionais** (sinalize se quiser mudar algo — é só editar na tela de Contas):
- *"IPVA + Licenciamento 2026 (parcelado)"*: só existiam 7 meses de dados na planilha, então usei **total_parcelas = 7 como estimativa**. Se o plano real tiver mais parcelas, edite a conta e ajuste o número.
- Uma cobrança de energia de dezembro/2025 estava marcada como "JESSICA PAGOU" em vez de uma data — importei como paga, com a observação "Pago por Jessica" no lançamento.
- Todas as contas entraram sem categoria (o módulo de categorias ainda não tem tela própria no app — fica pra uma fase futura se você quiser).
- Nomes ficaram sem acento no banco (ex: "Dizimo", "Consorcio") por segurança na geração do script — é só renomear pela tela de Contas se preferir com acento, é cosmético e não afeta nada.

**A partir de agora a planilha não é mais consultada pelo app** — tudo vive no Supabase.

## Fase 13 — Deploy (consolidação final)

O deploy contínuo já está funcionando desde a Fase 2 (todo `Commit` no GitHub redeploya sozinho na Cloudflare). Esta fase fecha as pontas soltas:

**Arquivo novo:** `_headers` — regras de cache HTTP. O ícone do app pode ficar em cache por mais tempo (raramente muda); o `service-worker.js` e o `manifest.json` nunca podem ficar em cache do navegador, senão atualizações do app deixam de chegar aos seus dispositivos.

### URL atual
`https://app-contas-01.ricardomarquesmello.workers.dev` — funcionando, HTTPS válido.

### Domínio próprio (opcional)
Se você tiver ou comprar um domínio (ex: `financas.seusite.com.br`):
1. Adicione o domínio à sua conta Cloudflare (**Domains** no menu lateral)
2. No seu Worker → **Settings → Domains & Routes → Add → Custom Domain**
3. Escolha o domínio/subdomínio — a Cloudflare emite o certificado HTTPS sozinha, sem custo extra

### Renomear a URL `workers.dev` (sem precisar de domínio próprio)
Worker → **Settings → Rename** — muda `app-contas-01` para o nome que quiser. Atualize o `start_url` no `manifest.json` se fizer isso (ele é relativo, então normalmente não precisa mexer).

### Se um deploy quebrar alguma coisa
Worker → aba **Deployments** → lista todo o histórico → botão **Rollback** no deploy anterior que funcionava. Reverte em segundos, sem precisar mexer no GitHub.

### Checklist de produção (tudo já feito até aqui)
- [x] RLS ativo em todas as tabelas (Fase 1)
- [x] Login restrito, sem cadastro público (Fase 2)
- [x] Constraints de integridade aplicadas (`patch-fase11-qa.sql`)
- [x] Dados reais importados (Fase 12)
- [x] PWA instalável, funciona offline para a interface (Fase 10)
- [x] HTTPS válido, deploy automático a cada commit
