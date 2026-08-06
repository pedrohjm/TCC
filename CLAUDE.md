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
- **Tailwind CSS**
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

## Convenções de código

- Componentes em `/app` ou `/components`; acesso a dados via route handlers em `/app/api`
- Validação de entrada com Zod nas rotas
- Commits pequenos e descritivos, em português
- Sempre explique brevemente decisões técnicas não óbvias (é material de TCC)

## Status atual

Etapas 1 a 5 do roadmap concluídas: CRUD completo de Venda, Produto e Reserva
em `/app/api`, autenticação (Auth.js v5, credentials + JWT, login em
`/login`), tela de registro de vendas em `/` (funcional, sem design) e
dashboard em `/dashboard` (Recharts + heatmap, restrito ao DONO). Páginas
protegidas por `proxy.ts`. Login de teste: `ana@sorveteria.com` (DONO) /
`joao@sorveteria.com` (ATENDENTE), senha `123456` (gerada pelo
`prisma/seed.ts` — nunca usar essa senha fora de dev local). A etapa 6
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
