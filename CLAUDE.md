@AGENTS.md

# CLAUDE.md — Sistema de Vendas para Sorveteria (TCC)

> Contexto do projeto para o Claude Code. Este arquivo fica na raiz do
> repositório: o Claude Code o lê automaticamente em toda sessão.

## Sobre o projeto

Trabalho de Conclusão de Curso (TCC) de Engenharia de Computação — IFTM,
Campus Avançado Uberaba Parque Tecnológico. Orientador: Prof. Luiz Pessoa.

O objetivo é desenvolver um sistema web *full-stack* com painel analítico
(*dashboard*) para registrar e analisar as vendas de uma **sorveteria de
pequeno porte**, substituindo o controle manual feito hoje em caderno.

No caderno atual são anotados, por dia e em colunas: valor da venda, forma de
pagamento (dinheiro, cartão ou Pix), se houve reserva prévia e o nome do
cliente quando aplicável.

**Importante:** por ser um TCC, o código deve ser claro, explicável e
defensável perante a banca. Priorize simplicidade e boas práticas em vez de
over-engineering. Prefira soluções que eu consiga entender e justificar.

## Idioma

Responda sempre em **português (Brasil)**. Comentários de código, nomes de
domínio (Venda, Reserva...) e mensagens de commit em português.

## Stack definida

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (componentes) + **lucide-react** (ícones)
  + **next-themes** (dark mode)
- **Prisma** (ORM) — v7, com driver adapter (`@prisma/adapter-pg` + `pg`)
- **PostgreSQL** (Neon ou Supabase; local via Docker é opcional)
- Gráficos do dashboard: **Recharts** (alternativa: Chart.js)
- Autenticação: NextAuth/JWT, com papéis **DONO** e **ATENDENTE**
- Validação de dados: **Zod**
- Deploy: **Vercel** + Neon/Supabase

## Arquitetura (camadas)

Balcão/tablet → Frontend Next.js (registro rápido, dashboard, reservas)
→ API REST (route handlers em `/app/api`) → Prisma → PostgreSQL.

## Modelo de dados (entidades principais)

Já modelado em `prisma/schema.prisma`:

- **Usuario** — id, nome, email, senhaHash, papel (DONO | ATENDENTE), timestamps
- **Produto** — id, nome, preco, ativo, timestamps
- **Venda** — id, valorTotal, formaPagamento (DINHEIRO | CARTAO | PIX),
  dataHora, reservaId (opcional), usuarioId, timestamps
- **ItemVenda** — id, vendaId, produtoId, quantidade, precoUnitario
- **Reserva** — id, nomeCliente, data, status (PENDENTE | CONCLUIDA | CANCELADA),
  timestamps
- **FechamentoCaixa** (opcional) — id, data, totalDinheiro, totalCartao,
  totalPix, observacoes

**Nota Prisma 7:** a URL de conexão vai em `prisma.config.ts` (via
`DATABASE_URL` no `.env`), não no `schema.prisma`. O `PrismaClient` exige um
driver adapter explícito (`PrismaPg`) — ver `.agents/skills/prisma-postgres-setup/references/prisma7-client.md`
para o padrão de instanciação.

**Nota Next.js 16 (breaking change vs. treino do modelo — ver `AGENTS.md`):**
o arquivo `middleware.ts` foi renomeado pra `proxy.ts` (`export default
function proxy(...)`), e agora roda no runtime **Node.js por padrão** (antes
era Edge, que não suporta módulos nativos do Node como os que o Prisma usa).
Isso é o que permite `proxy.ts` proteger páginas sem dar erro de import.

## Banco de dados local (Docker)

Por enquanto rodamos Postgres local via `docker-compose.yml` (na raiz do
projeto) para testar tudo antes de migrar pro Supabase. Comandos:

```
docker compose up -d      # sobe o Postgres local
docker compose down       # derruba (mantém os dados no volume)
```

**Porta 5433, não 5432** — a 5432 já está ocupada por um Postgres nativo
instalado no Windows desta máquina, então o container é mapeado em
`5433:5432`. O `.env` local aponta para `localhost:5433`.

Quando migrar para Supabase: só trocar o `DATABASE_URL` no `.env` pela
connection string do Supabase e rodar `prisma migrate deploy` — o schema e a
lógica não mudam, é só a origem da conexão (essa era a ideia de já usar o
driver adapter do Prisma desde o início).

## Variáveis de ambiente (`.env`, nunca commitado)

- `DATABASE_URL` — connection string do Postgres (ver seção acima)
- `AUTH_SECRET` — chave usada pelo NextAuth pra assinar o JWT de sessão.
  Gerar uma nova por ambiente com:
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

## Dashboard — indicadores esperados

Faturamento por dia/semana/mês, ticket médio, distribuição por forma de
pagamento, horários e dias de maior movimento (heatmap), proporção
reserva × balcão e produtos/sabores mais vendidos. Implementado em
`GET /api/relatorios` (ver roadmap etapa 5).

**Nota fuso horário:** `lib/relatorios.ts` assume a loja em
America/Sao_Paulo com offset fixo UTC-3 (Brasil não tem mais horário de
verão desde 2019, então isso é seguro sem biblioteca de fuso horário). Sem
essa conversão, "dia"/"hora" no relatório sairiam errados sempre que o
servidor rodar em UTC (caso comum em produção, ex. Vercel).

## Prioridade de UX

A tela de **registro de vendas precisa ser mais rápida que o caderno**: poucos
cliques, foco em teclado e lançamento ágil. Se for mais lenta, a loja não adota
— e isso inviabiliza a avaliação "antes × depois".

## Roadmap

1. ~~Setup — create-next-app, Git/GitHub, Prisma + PostgreSQL~~ ✅ concluído
   (create-next-app feito, git inicializado, Prisma 7 instalado e configurado
   com driver adapter, schema.prisma modelado)
2. ~~Modelagem do `schema.prisma` + migrations + seed~~ ✅ concluído
   (schema escrito, Postgres local via Docker rodando, migration inicial
   aplicada, `prisma/seed.ts` populando dados de exemplo — 2 usuários, 5
   produtos, 2 reservas, 3 vendas, 1 fechamento de caixa)
3. API REST + autenticação
   - ~~CRUD de vendas (`/app/api/vendas`)~~ ✅ concluído (GET com filtro por
     dia, POST valida com Zod e recalcula o preço a partir do banco, GET por
     id, PATCH, DELETE com cascade nos itens)
   - ~~CRUD de Produto e Reserva~~ ✅ concluído (`/app/api/produtos`,
     `/app/api/reservas` — GET/POST/PATCH/DELETE, ambos bloqueiam DELETE
     com 409 quando há vínculo com uma venda, sugerindo desativar/cancelar
     em vez de apagar)
   - ~~Autenticação (NextAuth/JWT, papéis DONO/ATENDENTE)~~ ✅ concluído
     (Auth.js v5, credentials provider com bcrypt, sessão JWT, login em
     `/login`. `usuarioId` na venda vem da sessão, não mais do corpo da
     requisição. Toda rota de `/app/api` exige sessão; DELETE de
     venda/produto/reserva e criar/editar/apagar produto são exclusivos
     do DONO — o ATENDENTE só opera o dia a dia)
4. ~~Tela de registro de vendas~~ ✅ concluído — versão **funcional, sem
   design** (o protótipo visual fica por conta do usuário; isto aqui só
   valida o comportamento). `app/page.tsx` + `components/TelaRegistroVendas.tsx`:
   grid de produtos, carrinho, forma de pagamento, atalhos de teclado
   (1-9 produto, D/C/P pagamento, Enter finaliza, Esc limpa). Páginas
   protegidas por `proxy.ts` (redireciona pro `/login` sem sessão).
5. ~~Dashboard e relatórios~~ ✅ concluído — `GET /api/relatorios?mes=AAAA-MM`
   (padrão: mês atual) agrega faturamento total, ticket médio, distribuição
   por forma de pagamento, faturamento por dia, produtos mais vendidos,
   proporção reserva×balcão e heatmap dia-da-semana×hora. Tela em
   `/dashboard` (Recharts + grade customizada pro heatmap), restrita ao
   DONO (API e página — `proxy.ts` redireciona ATENDENTE pra `/`). Cálculo
   feito em memória a partir das vendas do mês (`lib/relatorios.ts`), sem
   groupBy/SQL bruto — simples de explicar, e o volume de uma sorveteria
   pequena não justifica otimizar isso agora. Também tem uma seção "Vendas
   do mês" (extrato: cada venda individual, agrupada por dia com o total do
   dia) — o gráfico de faturamento por dia mostra só o agregado, então essa
   lista é o detalhamento por trás dele. Usa `GET /api/vendas?mes=AAAA-MM`
   (mesmo endpoint do CRUD de vendas, só ganhou esse filtro a mais).
6. Avaliação (métricas de tempo/erros + questionário SUS) e escrita da
   monografia — **adiado a pedido do usuário (2026-08-06)**: só será feito
   quando o sistema estiver finalizado, não faz sentido rodar o período
   experimental num sistema ainda incompleto.
7. ~~Site do cliente (cardápio) + navegação por papel com shadcn/ui~~ ✅
   concluído (2026-08-07) — shadcn/ui inicializado (`components.json`, tema
   próprio em `app/globals.css` repaginado pra sorveteria: morango como cor
   primária, menta como accent, ao invés do neutro padrão). Menu lateral
   (`components/AppSidebar.tsx`, bloco `sidebar` do shadcn) com navegação
   agrupada por papel:
   - **Cardápio** (todo mundo vê, sem login): Sabores 1800 ml, SelfService,
     Picolés, Acompanhamentos, Bebidas — cada um em `/cardapio/<slug>`,
     hoje só uma página "em breve" (`components/PaginaCardapioEmBreve.tsx`),
     porque o modelo `Produto` ainda não distingue essas categorias. Lista
     central em `lib/nav-cardapio.ts` (usada pelo menu e pelos cards da home).
   - **Operação** (ATENDENTE e DONO): Registrar venda, agora em `/vendas`
     (antes era a `/`).
   - **Gestão** (só DONO): Dashboard.
   `/` virou a home pública do cliente (cards linkando pro cardápio) — não
   exige mais login. `proxy.ts` ganhou uma lista de caminhos públicos (`/` e
   `/cardapio/*`); todo o resto continua exigindo sessão como antes.
   Pasta `public/images/` criada (`logo/`, `cardapio/`, `banners/`, com um
   README explicando o que colocar em cada uma). MCP server `shadcn`
   (`@jpisnice/shadcn-ui-mcp-server`) registrado no Claude Code pra
   consultar componentes/demos do shadcn durante o desenvolvimento do front.
8. ~~Layout em "janela flutuante" sobre um fundo, a partir de um modelo em
   PDF~~ ✅ concluído (2026-08-07) — o usuário mandou um PDF de referência
   (`public/images/modelo/modelo.pdf`, um wiki de RPG) mostrando o app
   inteiro (topo + menu + conteúdo) como uma janela arredondada e centralizada
   flutuando sobre um fundo decorativo, em vez de ocupar a tela toda.
   Reestruturado `app/layout.tsx`: `components/FundoPagina.tsx` é um fundo
   fixo em tela cheia (`public/images/banners/fundo.jpg` — sem esse arquivo,
   cai num gradiente); por cima, uma div central com `max-w-[1440px]`,
   `rounded-2xl`, borda e sombra contém a janela (header + sidebar + conteúdo).
   **Detalhe técnico importante:** o `<Sidebar>` do shadcn é `position: fixed`
   preso na borda real do navegador — incompatível com ficar dentro de uma
   janela flutuante. `components/AppSidebar.tsx` usa `collapsible="none"`
   no desktop (vira uma div comum que respeita a altura do pai) e um `Sheet`
   próprio no mobile (controlado pelo mesmo estado do `SidebarTrigger`,
   `useSidebar()` ainda funciona normalmente). A logo (`public/images/logo/`)
   revelou o nome real da loja, **Q10 Sorvetes** — atualizado no header, no
   menu e na home (antes era só um "Sorveteria" genérico). Corrigido de
   quebra um bug de fonte do `shadcn init` (`--font-sans: var(--font-sans)`
   era uma referência circular em `app/globals.css`, fazendo o site cair pra
   serifada padrão do navegador em vez da Geist Sans) e um aviso do Base UI
   (`nativeButton`) ao usar `<Button render={<Link .../>}>` pro botão
   "Entrar". Testado com screenshots reais via Playwright (`npx playwright
   screenshot`) em desktop e mobile, e logado como DONO/ATENDENTE — não só
   `tsc`/`build`, já que era uma mudança 100% visual.
9. ~~Layout fiel ao modelo: topo isolado + painéis separados~~ ✅ concluído
   (2026-08-07) — a primeira versão da janela ainda não estava parecida com
   o modelo, então medi o site de referência ao vivo com Playwright
   (`getBoundingClientRect` nos blocos principais) em vez de chutar. Números
   que vieram de lá e foram replicados: quadro central de **1056px**
   (usamos `max-w-[1080px]` — a versão anterior tinha 1440px, "muito grande
   na horizontal"), menu de **252px**, **16px** de espaço entre menu e
   conteúdo. Estrutura final: barra do topo isolada ocupando a largura toda
   (logo + login/usuário), e abaixo dela **dois painéis separados** (menu e
   conteúdo), cada um com borda, sombra e sua própria faixa de cabeçalho
   colorida — o fundo aparece nas laterais e no vão entre eles.
   `components/TituloPagina.tsx` põe o nome da página na faixa do painel de
   conteúdo (derivado da rota, pra não ter que passar o título por todas as
   páginas), e os `<h1>` que as telas de venda/dashboard/login tinham foram
   removidos porque viraram duplicata dessa faixa. Login repaginado com os
   tokens do tema (antes tinha `bg-gray-900`/`border-gray-300` fixos) e sem
   `min-h-screen`, que brigava com o painel.
   **Bug corrigido no caminho:** o `matcher` do `proxy.ts` (`'/((?!api|login|_next).*)'`)
   pegava também os arquivos estáticos de `/public`, respondendo 302 pro
   `/login` — a logo só carregava pra quem já estivesse logado. Agora o
   matcher também ignora qualquer caminho com extensão de arquivo
   (`.*\.`). Depois da mudança, testado por curl que `/`, `/cardapio/*` e
   os estáticos são públicos (200), `/vendas` e `/dashboard` seguem
   exigindo sessão (302), ATENDENTE continua barrado no `/dashboard` e a
   API sem sessão continua 401.
10. ~~Logo em banner, dark mode e edição de perfil~~ ✅ concluído
    (2026-08-07):
    - **Logo em banner** — a caixa/bloco com borda ao redor da logo no header
      virou só a imagem em tamanho maior (`h-10 w-auto`), já que a própria
      logo (`public/images/logo/Logo.png`) traz o nome da loja escrito.
    - **Dark mode de verdade** — instalado `next-themes` (`ThemeProvider` em
      `components/ThemeProvider.tsx`, `attribute="class"`, resolve pelo
      tema do sistema por padrão). Botão de alternar (`components/
      ThemeToggle.tsx`, ícone sol/lua) no header. `<html suppressHydrationWarning>`
      é necessário porque o script do next-themes aplica a classe `dark` antes
      do React hidratar. O tema `.dark` já existia em `app/globals.css` desde
      o `shadcn init`, só faltava algo pra alternar a classe — isso resolve
      de vez o problema de "fundo escuro" que tinha sido adiado lá no início.
    - **Editar perfil** — ícone (`UserCog`) ao lado do nome do usuário no
      header, linkando pra `/perfil` (protegida pelo `proxy.ts`, igual
      `/vendas`/`/dashboard`). Página com formulário funcional pra trocar
      nome e senha (`prisma.usuario`, e-mail não é editável por aqui pra não
      complicar a identidade do login). Server action em `app/perfil/page.tsx`
      (mesmo padrão do `app/login/page.tsx`: função `'use server'` dentro do
      arquivo da página, sem precisar de rota de API). Senha só troca se a
      senha atual bater (`bcrypt.compare`) — validado com Zod em
      `lib/validations/perfil.ts`. **Limitação conhecida:** como a sessão é
      JWT (stateless), trocar o nome não atualiza o que aparece no header até
      sair e entrar de novo — o token guarda o nome desde o login. Testado
      via Playwright de ponta a ponta (senha errada mostra erro, nome muda
      com sucesso, reversão), não só os campos isolados.
11. ~~Tela de Sabores 1800ml (primeira categoria de cardápio implementada de
    verdade)~~ ✅ concluído (2026-08-10) — baseado em dois modelos em PDF
    (`public/images/modelo/Search.pdf` e `Sabores.pdf`). Novo model
    `Sabor` no `schema.prisma` (migration `20260810173426_adiciona_sabor`):
    nome, categoria (`enum CategoriaSabor`: DOCE | FRUTA | AZEDO — dá pra
    crescer depois), descrição, foto (opcional) e ativo. **Importante:**
    `Sabor` é separado de `Produto` de propósito — `Produto` é o que entra
    no carrinho da venda (Casquinha, Sundae...), `Sabor` é só "que gosto tem
    hoje no pote de 1800ml", sem preço nem venda associada. 9 sabores de
    exemplo no `prisma/seed.ts` (3 por categoria). `GET /api/sabores`
    (`?categoria=DOCE|FRUTA|AZEDO` opcional) é uma rota **pública** — não
    chama `exigirSessao()`, porque a tela em `/cardapio/sabores-1800ml` é
    acessível sem login como o resto do cardápio.
    Tela dividida em dois painéis (dois "quadrados" separados, como pedido):
    `components/FiltroCategoriaSabor.tsx` (chips Todos/Doce/Fruta/Azedo,
    cada categoria com cor e ícone próprios — mesma ideia do filtro por
    raridade do `Search.pdf`) e `components/GradeSabores.tsx` (contador +
    grade de cards com foto/categoria/descrição, como o `Sabores.pdf`).
    `components/TelaSabores.tsx` junta os dois e busca a lista via fetch
    toda vez que a categoria selecionada muda. Fotos ainda não existem
    (`public/images/cardapio/<slug>.jpg` no seed é só o caminho reservado)
    — cai num ícone da categoria como fallback, mesmo padrão da logo.
    **Detalhe de ambiente:** `lib/prisma.ts` guarda o `PrismaClient` num
    singleton em `globalThis` de propósito, pra sobreviver ao hot-reload do
    Next sem esgotar conexão — isso também significa que, depois de rodar
    `prisma generate` (schema novo), o servidor de **dev precisa ser
    reiniciado** pra pegar o client atualizado; só recarregar a página não
    basta (foi exatamente isso que causou um 500 durante o desenvolvimento
    dessa etapa).
12. ~~Cartão de sabor com preview lateral ao passar o mouse~~ ✅ concluído
    (2026-08-10), a partir de `public/images/modelo/Mouse_Sabores.pdf` — o
    cartão em `components/GradeSabores.tsx` mostra foto + tag + nome; ao
    passar o mouse, abre uma janela **só pro lado** (nunca em cima/embaixo
    do cartão — testado tanto no meio da grade quanto na coluna da direita,
    onde flipa pra esquerda em vez de cair pra baixo). Usa `HoverCard` do
    shadcn (`components/ui/hover-card.tsx`, por cima do `@base-ui/react/
    preview-card`); o comportamento lateral-only foi configurado ali via
    `collisionAvoidance={{ side: 'flip', fallbackAxisSide: 'none' }}` —
    `fallbackAxisSide: 'none'` é o que impede o eixo perpendicular
    (cima/baixo) de ser usado como fallback quando não cabe nem à direita
    nem à esquerda. Dentro da janela, a foto é pequena (miniatura) com
    tag+nome ao lado — não em cima dela — e a descrição fica embaixo de
    tudo, layout ajustado pra ficar mais parecido com o `Mouse_Sabores.pdf`
    (ícone pequeno + texto ao lado, informação extra abaixo). `FotoSabor`
    ganhou props `className`/`tamanhoIcone` pra dar esses dois tamanhos
    (grande e quadrada no cartão, miniatura no preview) sem duplicar
    componente. **Limitação conhecida:** é uma interação de hover, então
    não existe em telas touch (celular/tablet sem mouse) — aceitável por
    enquanto porque essa tela normalmente é vista no balcão/totem, mas vale
    lembrar se um dia virar prioridade mobile.
13. ~~Navegação mobile: menu flutuante com gradiente em vez de gaveta~~ ✅
    concluído (2026-08-10) — trocado o botão de hambúrguer (canto superior
    esquerdo, abria uma gaveta lateral) por uma barra flutuante fixa embaixo
    da tela, baseada num componente de terceiros ("Gradient Menu": bolinhas
    com ícone que viram pílulas com gradiente ao tocar/passar o mouse).
    Duas adaptações em relação ao componente original: usa **lucide-react**
    em vez de `react-icons` (já é a biblioteca de ícones do projeto inteiro,
    não fazia sentido adicionar uma segunda só pra isso) e os itens vêm por
    prop (`GradientMenuItem[]`) com navegação real via `next/link`, em vez
    de uma lista fixa decorativa. Primitivo reutilizável em
    `components/ui/gradient-menu.tsx`; `components/AppSidebar.tsx` monta a
    lista real (5 categorias do cardápio + Registrar venda se logado +
    Dashboard se DONO) com um gradiente de cor diferente por item e destaca
    o item da página atual (`ring-2 ring-primary`). Como remove a gaveta,
    também não precisa mais do botão de trigger no header
    (`app/layout.tsx`) nem do `Sheet` — `AppSidebar` decide entre o painel
    lateral (desktop) e essa barra (`isMobile`, do `useSidebar()`) sem
    precisar de estado de aberto/fechado. Com mais itens do que cabem na
    tela (DONO vê 7), a barra rola horizontalmente (`overflow-x-auto`) —
    testado que dá pra rolar até o último item e clicar nele. `SidebarInset`
    ganhou `pb-24` no mobile pra o conteúdo não ficar embaixo da barra.
14. ~~Menu mobile reestruturado: 3 botões + submenu do cardápio + página
    Estabelecimento~~ ✅ concluído (2026-08-10) — trocada a barra flutuante
    de 5-7 itens (uma bolinha por categoria) por só **3 botões fixos** na
    visão do cliente: **Início** (`/`), **Cardápio** (não navega — abre um
    submenu vertical com as 5 categorias empilhado *pra cima* do botão,
    mesmo estilo visual das bolinhas) e **Estabelecimento** (nova página,
    `app/estabelecimento/page.tsx` — só reserva o lugar no menu por
    enquanto, foto e descrição do local ficam pra depois). ATENDENTE vê os
    3 + Registrar venda; DONO vê os 3 + Registrar venda + Dashboard.
    `components/ui/gradient-menu.tsx` ganhou suporte a itens que são
    **botão** (`onClick`, ex. o "Cardápio") além de itens que são **link**
    (`href`) — mesmo visual pros dois. Lógica de estado nova em
    `components/MenuMobile.tsx` (`cardapioAberto`), com um backdrop
    invisível (`fixed inset-0`) que fecha o submenu ao tocar fora.
    **Bug pego no teste:** o `onClick` de fechar o submenu só estava ligado
    no botão; nos itens que são `<Link>` (as 5 categorias) ele nunca era
    chamado, então navegar pra uma categoria deixava o submenu aberto por
    cima da página nova. Corrigido passando `onClick` também pro `<Link>`
    em `gradient-menu.tsx`.
    `/estabelecimento` também virou pública no `proxy.ts` (mesmo grupo de
    `/` e `/cardapio/*`) e ganhou um link no painel lateral do desktop
    (grupo novo "Geral" — sem isso a página ficaria inacessível fora do
    mobile).

## Convenções de código

- Componentes em `/app` ou `/components`; acesso a dados via route handlers em `/app/api`
- Validação de entrada com Zod nas rotas
- Commits pequenos e descritivos, em português
- Sempre explique brevemente decisões técnicas não óbvias (é material de TCC)

## Status atual

Etapas 1 a 5 e 7 a 11 do roadmap concluídas: CRUD completo de Venda, Produto
e Reserva em `/app/api`, autenticação (Auth.js v5, credentials + JWT, login
em `/login`), dashboard em `/dashboard` (Recharts + heatmap, restrito ao
DONO), e o site (shadcn/ui) no layout do modelo de referência — topo isolado
com a logo em banner, e abaixo dois painéis separados (menu + conteúdo) num
quadro estreito e centralizado, com o fundo aparecendo em volta, dark mode
de verdade (botão sol/lua) e página de editar perfil (`/perfil`, trocar
nome/senha): `/` é a home pública do cardápio, `/cardapio/<slug>` tem as 5
categorias — **Sabores 1800ml já implementada de verdade** (filtro por
categoria + grade de cards, model `Sabor` novo no banco, `GET /api/sabores`
público), as outras 4 (SelfService, Picolés, Acompanhamentos, Bebidas)
ainda "em breve",
`/vendas` tem a tela de registro de vendas (funcional, sem design refinado —
só ganhou a sidebar/tema do shadcn ao redor). Páginas protegidas por
`proxy.ts` (exceto `/`, `/cardapio/*` e os arquivos estáticos de `/public`,
que são públicos). Login de teste:
`ana@sorveteria.com` (DONO) / `joao@sorveteria.com` (ATENDENTE), senha
`123456` (gerada pelo `prisma/seed.ts` — nunca usar essa senha fora de dev
local). A etapa 6
(avaliação com métricas de tempo/erros + questionário SUS, e escrita da
monografia) foi **adiada a pedido do usuário** para quando o sistema
estiver finalizado — não faz sentido rodar o período experimental num
sistema incompleto. Enquanto isso, o trabalho continua sendo evolução do
próprio sistema (novas telas/funcionalidades, ajustes visuais, migração
pro Supabase quando fizer sentido). A **Introdução da monografia**
(contextualização, problema de pesquisa, justificativa, objetivos,
metodologia e estrutura) já foi redigida nas atividades da disciplina.

**Decisão de escopo (2026-08-05):** Reserva é só um agendamento (nome do
cliente, data, status) — não tem valor nem pagamento, e não gera uma Venda
automaticamente no sistema. Quando o cliente retira o produto reservado, a
venda em si acontece por fora do app (sem registro). `Venda.reservaId`
continua existindo e é opcional, só para o caso raro de alguém querer
vincular manualmente uma venda a uma reserva.
