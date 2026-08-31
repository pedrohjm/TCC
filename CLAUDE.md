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
   (`modelo.pdf`, um wiki de RPG — o arquivo foi removido de
   `public/images/modelo/` depois, quando a home virou landing) mostrando o app
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
15. ~~Página Estabelecimento: foto + endereço + mapa interativo~~ ✅
    concluído (2026-08-10) — conteúdo real de `/estabelecimento`, no estilo
    do modelo em `public/images/modelo/Localizacao.pdf` (foto grande no
    topo com um pino sobreposto, "Confira nossa localização!" + endereço
    em pílula). No lugar do `@` do Instagram do modelo, um **mapa
    interativo clicável** (expande ao clicar, mostra tiles reais
    OpenStreetMap/Carto centrados nas coordenadas). Componente adaptado de
    um componente de terceiros ("expanded-map", usa a lib `motion`) em
    `components/ui/expanded-map.tsx`; `components/MapaEstabelecimento.tsx`
    escolhe tiles claro/escuro (`carto-light`/`carto-dark`) conforme o tema
    do site. Endereço e coordenadas do mapa **ainda são genéricos**
    (placeholder em Brasília) — centralizados em `lib/estabelecimento.ts`
    pra trocar fácil quando o endereço real da loja for definido, sem
    precisar mexer no componente. Foto da fachada segue a mesma convenção
    de fallback das outras imagens do site (`public/images/banners/estabelecimento.jpg`,
    ainda não existe → cai num ícone de loja).
    **Bug real encontrado e corrigido nessa etapa (afetava também `FundoPagina`
    e `FotoSabor`, não só a página nova):** o fallback de imagem quebrada
    (`<img onError>`) não disparava quando o arquivo já não existe desde o
    início (nosso caso — nenhuma imagem real foi adicionada ainda). Como a
    página é renderizada no servidor, o navegador já começa a baixar a
    imagem antes do React terminar de hidratar; num 404 rápido (localhost),
    o evento `error` nativo dispara e se perde antes do listener do React
    ser anexado, e o `onError` nunca roda — o resultado visível era o ícone
    de imagem quebrada do navegador em vez do fallback bonito. Ficava
    escondido no `FundoPagina` (atrás do header semi-transparente, canto
    0,0) e no `FotoSabor` (card pequeno, fácil de não notar), mas ficou bem
    visível no card grande da foto do Estabelecimento. Corrigido com um
    hook compartilhado, `hooks/use-imagem-com-fallback.ts`, que checa
    `img.complete && img.naturalWidth === 0` num `useEffect` de mount (pega
    o 404-antes-da-hidratação) além do `onError` (pega falhas depois de
    montado, ex. rede lenta). `FundoPagina`, `FotoSabor` (em
    `GradeSabores.tsx`) e `FotoEstabelecimento` foram migrados pra esse
    hook único em vez de cada um ter seu próprio `useState`.
16. ~~Home repaginada: foto de topo + carrossel de avisos~~ ✅ concluído
    (2026-08-10) — a home (`/`) agora começa com uma **foto grande no mesmo
    estilo da página Estabelecimento** e, logo abaixo, um **carrossel de
    cards de avisos** com efeito 3D (o card inclina seguindo o mouse). A
    faixa em degradê com "Bem-vindo(a)" saiu; o texto passou pra baixo da
    foto, dentro do mesmo card. Os 5 cards de categoria continuam embaixo.
    - **`components/FotoDestaque.tsx`** (novo) — a foto de topo virou um
      componente só, usado pela home e pela Estabelecimento (que antes
      tinha o seu `FotoEstabelecimento.tsx`, agora removido). Os ícones
      (selo e fallback) entram como `ReactNode` (JSX pronto), não como
      componente: `LucideIcon` é uma *função*, e função não atravessa a
      fronteira server→client — passar o componente quebraria com
      "Functions cannot be passed directly to Client Components". Na home
      a foto é mais baixa (`aspect-16/9 sm:aspect-16/7`) porque, na
      proporção 16:10 da Estabelecimento, ela sozinha ocupava a tela
      inteira e empurrava os avisos pra fora da primeira dobra.
    - **`components/ui/standard-card.tsx`** (novo) — card 3D + carrossel,
      adaptado do componente de terceiros "standard-card". Mudanças em
      relação ao original: usa `motion/react` em vez de `framer-motion`
      (mesma API, e o pacote `motion` já estava instalado pro mapa —
      instalar os dois seria a mesma biblioteca duas vezes); cores vêm dos
      tokens do tema em vez de `bg-white`/`text-black` fixos (senão o card
      ficaria branco no modo escuro); o original era uma página inteira
      (fundo `#0a0a0a`, spotlight, textura de ruído de uma URL externa e um
      `<style>` pintando o `body`) e tudo isso saiu, porque sobrescreveria
      o layout/tema do site; sem `cursor-none` (o cursor sumiria, já que
      não existe cursor customizado aqui) e sem o hook `useLenis` (mexia no
      `scroll-behavior` do documento inteiro); cards menores, porque o
      painel de conteúdo tem ~730px úteis e os 380x450px do original não
      caberiam; e a rolagem do carrossel usa a largura do próprio carrossel
      em vez de `window.innerWidth`, que aqui passaria muito do fim.
    - **`lib/avisos.ts`** (novo) — os avisos em si, ainda com texto
      genérico pra trocar depois (mesma ideia de `lib/estabelecimento.ts`).
      Se um dia a loja precisar editar isso sem mexer no código, vira um
      model no Prisma + tela de gestão pro DONO.
    - `components/AvisosHome.tsx` é client component e importa `AVISOS`
      ele mesmo, em vez de receber a lista por prop da home (que é server
      component) — de novo o problema do ícone-função na fronteira. Mesmo
      padrão do `MenuMobile`, que importa `ITENS_CARDAPIO` direto.
    - `app/globals.css` ganhou a utility `no-scrollbar` (Tailwind v4,
      `@utility`) pro carrossel não mostrar a barra de rolagem no meio do
      conteúdo.
    - **`overflow-y-hidden` explícito no carrossel** (corrigido depois, a
      pedido do usuário: "na parte dos avisos está com um scroll vertical
      esquisito"). Só com `overflow-x-auto`, o CSS promove o eixo Y de
      `visible` pra `auto` sozinho — e havia 18px de sobra vertical porque
      os cards que ainda não entraram na tela ficam parados no `y: 30` da
      animação de entrada. Resultado: dava pra rolar o carrossel pra baixo
      com a rodinha do mouse, e a rodinha em cima dele não rolava a página.
      Conferido depois do conserto: a roda em cima do carrossel rola a
      página normalmente e o `scrollTop` dele fica em 0.
17. ~~Logo em formato de bandeira/flâmula + tirar o papel do lado do nome~~
    ✅ concluído (2026-08-12, ajustado no mesmo dia) — o banner largo da
    logo (item 8 da lista) virou uma **bandeira**: hexágono alongado com
    pontas nas duas laterais (`clip-path: polygon(...)`), moldura menta
    (`bg-accent`) por baixo de um corpo morango (gradiente `primary`).
    Novo componente `components/LogoBandeira.tsx`.
    - Versão inicial: a imagem do logo (`public/images/logo/Logo.png`)
      não tinha fundo transparente (`hasAlpha: false`, canvas branco
      sólido), então a logo ficava centralizada numa placa branca
      quadrada — senão um retângulo branco solto apareceria sobre a cor
      da bandeira.
    - **Depois o usuário trocou o arquivo por uma versão com fundo
      transparente de verdade**, e a placa branca saiu — a logo (só o
      anel amarelo + texto, sem plaquinha) fica direto sobre o corpo da
      bandeira agora, com `drop-shadow-sm` pra não sumir contra o
      morango. Ícone de fallback (`Store`) também mudou de cor pra
      `text-primary-foreground/80` (antes era `text-muted-foreground/50`
      sobre a placa branca).
    - **Bug pego no export do usuário:** o novo `Logo.png` tinha o fundo
      removido só até alpha=128 (50% opaco), não alpha=0 — dava um halo
      esbranquiçado/rosado em volta do desenho em vez de transparência de
      verdade (visível claramente contra o morango da bandeira). Conferido
      com `sharp` (histograma de alpha: platô grande em 128, rampa suave
      129-254 de antialiasing, platô em 255 na arte opaca — a área
      "removida" ficou pela metade, não zerada). Corrigido remapeando o
      canal alpha (`(a-128)/(255-128)*255`, clampado): fundo vira alpha=0
      de verdade e o antialiasing da borda continua suave. Script não
      ficou salvo no repo (rodado uma vez direto no arquivo).
    - Mesma convenção de fallback do resto do site
      (`hooks/use-imagem-com-fallback.ts`): sem o arquivo, cai no ícone de
      loja.
    - Também saiu o texto "Cardápio & sistema" que ficava do lado da logo
      — não tinha mais lugar óbvio ao lado de uma bandeira centralizada, e
      o pedido era só a bandeira.
    - No cabeçalho, o `({papel})` que aparecia do lado do nome do usuário
      logado (ex. "Ana Souza (DONO)") saiu — só o nome fica.
18. ~~Seção "Fale conosco" na home (WhatsApp/Instagram/Facebook)~~ ✅
    concluído (2026-08-14) — nova seção no fim da home
    (`components/FaleConosco.tsx`): ícone circular por rede que levanta e
    ganha um brilho na cor oficial da marca ao passar o mouse/tocar,
    adaptado do componente de terceiros "connect-with-us". Sem
    redirecionamento ainda (pedido explícito do usuário) — por isso os
    ícones são `<button>`, não `<a>`: sem número de WhatsApp/@ do
    Instagram/página do Facebook reais ainda, não fazia sentido fingir que
    é um link. Quando tiver os links de verdade, trocar `<button>` por
    `<a href={...}>` dentro de `IconeRedeSocial`.
    - Ícones vêm do pacote **`simple-icons`** (só `.path`/`.hex` de
      `siWhatsapp`/`siInstagram`/`siFacebook`) em vez de transcrever o SVG
      da marca na mão — `lucide-react` nessa versão não tem mais ícones de
      marca (`Instagram`/`Facebook`/etc. foram removidos, só sobrou
      `MessageCircle` e afins), e transcrever path data de memória arrisca
      erro. Isso não conflita com o "lucide é a única lib de ícones do
      projeto" (decisão anterior sobre `react-icons`): `simple-icons` não é
      uma lib de ícones de UI, é só dado (path + hex oficial de cada
      marca), usada só aqui.
    - **Custo zero no bundle do cliente:** `FaleConosco.tsx` não tem `'use
      client'` — é Server Component puro (sem hook, sem handler de
      evento), então o `path`/`hex` do `simple-icons` só existem no HTML
      renderizado no servidor, nunca viram JS enviado pro navegador.
      Conferido no build: nenhum chunk em `.next/static/chunks` contém o
      path do WhatsApp, e o total de chunks (~1.7MB) é bem menor que o
      pacote `simple-icons` inteiro (~5MB, todas as ~3000 marcas) — o
      import nomeado (`{ siWhatsapp, siInstagram, siFacebook }`) faz o
      bundler descartar o resto.
    - Efeito de brilho na cor da marca usa uma CSS var por item
      (`--cor-marca`, igual à técnica do `GradientMenu` em
      `components/ui/gradient-menu.tsx`) em vez de uma classe fixa por
      rede — o original usava `<style jsx>` com uma classe por marca, que
      não é usado em nenhum outro lugar do projeto.
19. ~~Seção "Sobre nós" na home + tirar os cards de categoria de lá~~ ✅
    concluído (2026-08-14) — nova seção antes do "Fale conosco"
    (`components/ui/about-us-section.tsx` + `components/SobreNos.tsx`,
    dados em `lib/sobre-nos.ts`), adaptada do componente de terceiros
    "about-us-section": rótulo pequeno no topo, título com barrinha que
    cresce, texto de apresentação, foto com moldura deslocada atrás e
    bolinhas flutuantes, itens com ícone em caixa arredondada e
    contadores que sobem quando entram na tela.
    - **Layout reorganizado** em relação ao original: lá a foto fica no
      meio com os itens em colunas dos dois lados (grid de 3 colunas,
      `max-w-6xl`). Aqui o painel de conteúdo tem ~680px úteis (quadro
      central limitado a 1080px, menu lateral come 252px), o que daria
      ~200px por coluna — estreito demais pra um parágrafo. Virou foto
      centralizada no topo + itens em 2 colunas (`lg:grid-cols-2`) abaixo.
    - `motion/react` no lugar de `framer-motion`, cores dos tokens do
      tema no lugar das cores fixas do original (#F2F2EB/#202e44/#88734C),
      foto de `public/images/banners/sobre.jpg` com fallback no lugar do
      link do Unsplash.
    - Saiu o CTA final do original ("Ready to transform your space?") —
      o "Fale conosco" vem logo abaixo e faz esse papel. Saiu também o
      "Learn more" de cada item, que no original é invisível de qualquer
      jeito (`initial` e `animate` os dois com `opacity: 0`).
    - **O parallax do fundo foi removido logo depois (rolagem travada).**
      A primeira versão movia os borrões do fundo conforme a rolagem, como
      no original. O usuário reclamou que "o scroll ficou estranho" e a
      medição confirmou: contando os quadros durante uma rolagem contínua,
      ~16 de 105 passavam de 32ms (contra ~2 sem os borrões). Motivo: mover
      um elemento com `blur(64px)` obriga o navegador a refazer o desfoque
      a cada quadro. `will-change: transform` **piorou** (42 quadros
      longos) — promover pra camada própria não ajuda quando o conteúdo da
      camada é um desfoque grande. Mesmo **parado**, o `blur` ainda custava
      (~12 quadros longos), porque a rolagem repinta a área. Solução:
      trocar o círculo sólido + `blur-3xl` por um `radial-gradient`, que dá
      a mesma mancha suave sem passar por filtro nenhum → 0-2 quadros
      longos. Com isso saiu junto todo o `useScroll` (e a gambiarra de
      achar o painel rolável com `closest('.overflow-y-auto')`, necessária
      porque quem rola aqui não é a janela e sim o painel de conteúdo).
      **Lição pra próxima:** `blur` grande + rolagem não combinam; pra
      manchas decorativas use `radial-gradient`.
    - ~~Números placeholder (30 sabores, 10 anos, 5000 clientes, 98%)~~ —
      **removidos em 2026-08-31** (item 23), junto com o contador animado.
    - Os 5 cards de categoria que ficavam na home (atalho pra
      `/cardapio/<slug>`) saíram a pedido do usuário. A navegação pras
      categorias continua no menu lateral (desktop) e no submenu do botão
      "Cardápio" da barra de baixo (mobile), então nenhuma página ficou
      inacessível.

20. ~~Home vira landing page (hero + escolha de categoria + menu de seções
    no topo)~~ ✅ concluído (2026-08-17) — a home (`/`) deixou de ser uma
    página dentro da "janela" flutuante e virou uma **landing de largura
    cheia**, no formato do modelo em `public/images/modelo/homepage.png`
    (referência de estrutura: texugodasfigs.github.io/texugo-das-figs).
    - **Dois grupos de rota** (`app/(landing)/` e `app/(janela)/`). Grupo
      de rota não aparece na URL, então `/cardapio/picoles` continua sendo
      `/cardapio/picoles` e o `proxy.ts` não precisou mudar. O
      `app/layout.tsx` ficou só com o comum a tudo (fontes, tema, fundo);
      o formato da página desceu pros dois layouts de grupo:
      - `(landing)`: cabeçalho grudado no topo + `<main>` de largura cheia,
        **quem rola é o documento**;
      - `(janela)`: o quadro central de sempre (menu lateral + painel de
        conteúdo), **quem rola é o painel interno** — por isso o
        `h-svh overflow-hidden` saiu do `<body>` e desceu pra esse layout.
        Todas as páginas internas continuam exatamente como estavam.
    - `components/CabecalhoTopo.tsx` é o mesmo cabeçalho pros dois, com
      props (`comNavSecoes`, `fixo`, `largura`) em vez de duas cópias.
    - **Menu de navegação rápida** (`components/NavSecoes.tsx`,
      seções em `lib/secoes-landing.ts`): âncoras pras 5 seções com o item
      da seção atual destacado conforme rola. No celular ele não cabe ao
      lado da logo, então vai pra uma segunda linha (`order-last w-full`)
      que rola na horizontal. Os `scroll-mt-*` das seções compensam a
      altura do cabeçalho fixo (conferido: no celular o cabeçalho ocupa
      109px e as seções param em 112px, sem ficar escondidas atrás dele).
    - **Bug pego no teste — destaque errado na última seção:** a primeira
      versão usava `IntersectionObserver` com uma faixa no meio da tela.
      Clicar em "Contato" levava até lá, mas o menu continuava marcando
      "Sobre": a última seção nunca alcança o meio da janela, porque a
      página acaba antes. Trocado por cálculo de posição (a seção ativa é
      a última cujo topo passou de 40% da altura da janela) + um caso
      explícito pro fim da página, onde a última seção é sempre a ativa.
    - **Seção "Cardápio"** (`components/CardapioLanding.tsx`): chips das 5
      categorias; a escolhida mostra os itens ali mesmo, sem trocar de
      página. Reaproveita `FiltroCategoriaSabor` + `GradeSabores` da tela
      `/cardapio/sabores-1800ml` em vez de duplicar. Só "Sabores 1800 ml"
      tem dados de verdade (model `Sabor`); as outras quatro mostram o
      estado "em breve" com um resumo da categoria.
    - O resto da home antiga (Avisos, Sobre nós, Fale conosco) continua
      igual, agora como seções da landing com seus `id`s. Os 5 cards de
      atalho de categoria não voltaram — quem faz esse papel agora é a
      seção Cardápio.
    - No celular a landing mantém a barra flutuante de baixo
      (`MenuMobile`), que é a navegação pro resto do site. Como ali ela não
      passa mais pelo `AppSidebar` (que era quem decidia mobile x
      desktop), o `md:hidden` foi pro wrapper no layout.
    - **Regressão encontrada e corrigida logo depois (o usuário perguntou
      "onde ficou o dashboard?"):** no computador, quem entrava como
      atendente ou dono e ficava na landing não tinha *nenhum* caminho pra
      "Registrar venda" e "Dashboard". Esses dois links existiam só em dois
      lugares — o menu lateral (que a landing não tem) e a barra de baixo
      do celular (escondida a partir de `md`) — então no desktop sobrava só
      digitar a URL na mão. No celular e nas páginas internas continuava
      funcionando, por isso não apareceu nos testes anteriores. Corrigido
      com dois atalhos em ícone na barra do topo (`comAtalhosEquipe` no
      `CabecalhoTopo`), só na landing: carrinho pra quem tem qualquer papel
      e o painel só pro DONO. Conferido nos três casos (DONO vê os dois,
      ATENDENTE só o carrinho, deslogado não vê nenhum) e que a barra não
      estoura em nenhuma largura de 390px a 1440px.
    - **Localização subiu pro topo do "Contato"** (2026-08-17): o bloco da
      localização (foto + "Confira nossa localização!" + endereço em
      pílula + mapa interativo), que era o conteúdo da página
      `/estabelecimento`, virou `components/BlocoLocalizacao.tsx` e agora
      abre a seção "Contato" da landing, com o "Fale conosco" logo abaixo.
      O botão "Como chegar" do hero deixou de ir pra `/estabelecimento` e
      virou âncora `#contato`. **A página `/estabelecimento` continua
      existindo** e usa o mesmo componente — é o destino do item
      "Estabelecimento" do menu lateral e da barra do celular, então
      apagá-la deixaria esses dois itens sem destino. Se a ideia for tirar
      a página de vez, é só remover a rota e as duas entradas de menu.

21. ~~Alternador de tema vira uma chave (sol / interruptor / lua)~~ ✅
    concluído (2026-08-17) — o botão único de sol-ou-lua virou um
    controle de três partes: ícone do sol, interruptor no meio (ligado =
    escuro) e ícone da lua, com o lado inativo esmaecido. Os três são
    clicáveis. Duas diferenças em relação ao componente de referência:
    - o `Switch` veio da **CLI do shadcn deste projeto**
      (`npx shadcn add switch` → `components/ui/switch.tsx`), que gera a
      versão sobre **Base UI**, e não os `@radix-ui/react-switch` +
      `@radix-ui/react-label` do exemplo. O projeto inteiro é `@base-ui/react`
      (`components.json` → `"style": "base-nova"`), então instalar o Radix
      colocaria uma segunda biblioteca de primitivos pra fazer o que a de
      casa já faz — mesma decisão do lucide-react x react-icons e do
      motion x framer-motion. O `Label` nem era usado: o próprio exemplo
      usa `<span>`. Nenhuma dependência nova foi instalada;
    - os ícones são `<button>`, não `<span onClick>` como no exemplo. Um
      `<span>` com clique não recebe foco nem responde ao teclado — quem
      navega por Tab não conseguiria usar essa metade do controle.
    - De quebra saiu um dos erros de lint antigos: o `montado` (guarda de
      hidratação, porque o servidor não sabe o tema salvo no navegador)
      era um `setState` dentro de `useEffect`; agora é
      `useSyncExternalStore` com snapshot diferente no servidor e no
      cliente, que faz a mesma coisa sem a renderização extra.
    - Testado: começa certo com o sistema em claro e em escuro, os três
      controles trocam o tema, a escolha sobrevive ao recarregar (o
      interruptor nasce marcado, sem divergência de hidratação), funciona
      pelo teclado (Espaço) e não estoura a barra do topo no celular.

22. ~~Telas de entrar e criar conta em página inteira (foto à esquerda)~~
    ✅ concluído (2026-08-17) — a tela de login antiga (que ficava dentro
    da janela, com menu lateral e faixa de título) saiu. No lugar entrou
    um **grupo de rota novo, `app/(auth)/`**, com duas páginas que ocupam
    a janela do navegador inteira: `/login` e `/registrar`. As duas usam a
    mesma moldura (`components/MolduraAuth.tsx`): foto na metade esquerda
    e formulário na direita, no formato da imagem de referência. No
    celular a foto sai (`lg:grid-cols-2`) e fica só o formulário.
    - O lugar da foto é `public/images/banners/login.jpg`, com o mesmo
      fallback do resto do site (`components/FotoAuth.tsx`).
    - Campo de senha com o olhinho de mostrar/esconder
      (`components/CamposAuth.tsx` — precisa ser client component por
      causa do estado, por isso os campos não ficam direto na página, que
      é server component pra poder usar server action no formulário).
    - **Não entrou o "Login with Google" da referência:** o projeto só tem
      login por e-mail e senha (`auth.ts`, provider Credentials). Um botão
      que não faz nada seria pior do que não ter botão.
    - **Cadastro (`/registrar`)**: valida com Zod
      (`lib/validations/auth.ts`), recusa e-mail repetido, guarda a senha
      com bcrypt e já entra com a conta recém-criada.
      **O papel é fixo no código como `ATENDENTE`, nunca vem do
      formulário** — se viesse, qualquer pessoa poderia se cadastrar como
      DONO e abrir o faturamento da loja no `/dashboard`. Testado: uma
      conta criada pela tela não vê o atalho do dashboard e é barrada pelo
      `proxy.ts` ao tentar `/dashboard` na mão.
      ⚠️ **Ainda assim o cadastro é aberto**: hoje qualquer visitante pode
      criar uma conta de atendente e chegar no `/vendas`. Pra uso real
      isso precisa ser fechado — as saídas naturais são exigir um código
      de convite ou deixar só o DONO criar contas (uma tela de gestão de
      usuários). Fica registrado aqui porque é decisão de produto, não de
      código.
    - `proxy.ts` ganhou `registrar` na lista de exclusões do matcher (do
      lado de `login`): são as telas de quem ainda não entrou, se o proxy
      as protegesse elas redirecionariam pra si mesmas em loop.
    - `TituloPagina` perdeu as entradas `/` e `/login` — nenhuma das duas
      passa mais pela faixa de título da janela.

23. ~~Tirar a faixa de números da landing~~ ✅ concluído (2026-08-31) — os
    quatro números ("30+ sabores", "10 anos de história", "5.000+ clientes
    atendidos", "98% voltariam a comprar") saíram dos **dois** lugares
    onde apareciam: a faixa de cartões no fim do "Sobre nós" e a linha
    embaixo dos botões do hero (que mostrava os três primeiros da mesma
    lista). Eram valores inventados — número falso em site de loja é
    informação errada pro cliente, não enfeite — e não havia como
    substituí-los pelos reais.
    Removidos junto: `NUMEROS_SOBRE_NOS` e o tipo `NumeroSobreNos`
    (`lib/sobre-nos.ts`), o tipo `AboutStat` e a prop `numeros`
    (`components/ui/about-us-section.tsx`) e a função `ContadorNumero`
    (o contador animado que subia o número quando entrava na tela) — com
    ela saíram também os imports de `useEffect`, `useSpring` e
    `useTransform`, que só existiam por causa dela. Se um dia existirem os
    números reais, o histórico do git tem o componente pronto.

24. ~~Dashboard repaginado (faturamento por mês/semana/dia) + lugar da
    página de falta no estoque~~ ✅ concluído (2026-08-31) — o dashboard
    foi reescrito no formato do modelo mandado pelo usuário (grade densa
    de cartões: indicadores em cima, gráfico grande no meio, gráficos
    menores embaixo), mas com as cores do tema da loja.
    - **Cores agora vêm dos tokens.** O painel antigo tinha `text-gray-500`,
      `border-gray-200`, `#111827` nas barras e `bg-red-50` nos erros —
      ele é anterior ao tema e nunca tinha sido convertido, então ficava
      cinza-azulado no modo escuro. Agora usa `bg-card`, `text-muted-
      foreground`, `--chart-1..5` etc. O Recharts aceita `var(--chart-1)`
      direto porque o valor vai parar num atributo SVG.
    - **Faturamento com três recortes** (o pedido central), num único
      gráfico com botões Por mês / Por semana / Por dia:
      - *dia* e *semana* saem do mês selecionado. A semana é identificada
        pela data da sua **segunda-feira** (`chaveSemana` em
        `lib/relatorios.ts`) — segunda e não domingo porque é como o
        comércio fecha a semana; o rótulo "04/08 a 10/08" é montado na
        tela;
      - *mês* é a única série que **olha além do mês selecionado**: são os
        últimos 12 meses, pra dar comparação. Como isso não cabia na
        consulta do mês, virou uma segunda consulta na rota
        (`app/api/relatorios/route.ts`), trazendo só data e valor. Meses
        sem venda entram com **zero** em vez de sumirem — senão o gráfico
        daria a impressão de um período mais curto do que foi.
    - Os outros itens pedidos (total de vendas, forma de pagamento,
      produtos mais vendidos) já existiam no `calcularRelatorio`; só
      mudaram de forma: rosca com legenda escrita à mão (o `Legend` do
      Recharts não mostra valor nem percentual) e barras horizontais.
    - **Ajuste depois do primeiro teste:** a legenda da rosca estava ao
      lado dela e o valor em reais saía cortado no meio ("R$ 31,0…") — o
      cartão tem ~330px dentro do quadro central e não sobrava largura.
      Passou pra baixo da rosca.
    - Continuam no painel, agora com as cores do tema: ticket médio,
      % de vendas com reserva, heatmap dia × hora e a lista de vendas do
      mês (essa ganhou rolagem interna, `max-h-80` — solta, ela empurrava
      o resto do painel pra longe).
25. **Falta no estoque — só o lugar da página** (2026-08-31) — o usuário
    pediu a página dizendo que ela "irá ser adicionada posteriormente",
    então por ora é só o lugar dela, como foi feito com Estabelecimento no
    item 14: `app/(janela)/estoque/page.tsx` com um cartão "Em breve", mais
    a entrada no menu lateral e na barra do celular.
    Fica em **"Operação"** (qualquer papel logado), não em "Gestão": quem
    vê o sabor acabar é quem está no balcão. Testado que o ATENDENTE entra
    em `/estoque` e continua barrado no `/dashboard`.
    O que falta, quando for implementar: um campo tipo
    `emFalta Boolean @default(false)` no model `Sabor` (e depois nos
    outros produtos, quando as demais categorias saírem do "em breve"),
    uma rota pra ligar/desligar a marcação, e a faixa vermelha em cima do
    item na `GradeSabores`.

## Convenções de código

- Componentes em `/app` ou `/components`; acesso a dados via route handlers em `/app/api`
- Validação de entrada com Zod nas rotas
- Commits pequenos e descritivos, em português
- Sempre explique brevemente decisões técnicas não óbvias (é material de TCC)

## Status atual

Etapas 1 a 5 e 7 a 11 do roadmap concluídas: CRUD completo de Venda, Produto
e Reserva em `/app/api`, autenticação (Auth.js v5, credentials + JWT, login
em `/login`), dashboard em `/dashboard` (Recharts + heatmap, restrito ao
DONO), dark mode de verdade (botão sol/lua) e página de editar perfil
(`/perfil`, trocar nome/senha). O site tem **dois formatos de página**
(grupos de rota, item 20 do roadmap): `/` é uma **landing pública de
largura cheia** (hero + escolha de categoria + avisos + sobre + contato,
com menu de seções na barra do topo), e as demais páginas ficam no
formato de "janela" do modelo de referência — topo isolado com a logo em
bandeira e, abaixo, dois painéis separados (menu + conteúdo) num quadro
estreito e centralizado, com o fundo aparecendo em volta.
`/cardapio/<slug>` tem as 5
categorias — **Sabores 1800ml já implementada de verdade** (filtro por
categoria + grade de cards, model `Sabor` novo no banco, `GET /api/sabores`
público), as outras 4 (SelfService, Picolés, Acompanhamentos, Bebidas)
ainda "em breve", `/estabelecimento` também já implementada de verdade
(foto + endereço + mapa interativo — endereço/coordenadas ainda genéricos,
ver `lib/estabelecimento.ts`),
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
