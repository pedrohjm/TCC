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

## Dashboard — indicadores esperados

Faturamento por dia/semana/mês, ticket médio, distribuição por forma de
pagamento, horários e dias de maior movimento (heatmap), proporção
reserva × balcão e produtos/sabores mais vendidos.

## Prioridade de UX

A tela de **registro de vendas precisa ser mais rápida que o caderno**: poucos
cliques, foco em teclado e lançamento ágil. Se for mais lenta, a loja não adota
— e isso inviabiliza a avaliação "antes × depois".

## Roadmap

1. ~~Setup — create-next-app, Git/GitHub, Prisma + PostgreSQL~~ ✅ concluído
   (create-next-app feito, git inicializado, Prisma 7 instalado e configurado
   com driver adapter, schema.prisma modelado)
2. **Modelagem do `schema.prisma` + migrations + seed** ← *estamos aqui*
   (schema escrito, Postgres local via Docker rodando, migration inicial
   aplicada e conexão confirmada de ponta a ponta; falta escrever o seed e,
   quando fizer sentido, trocar o `DATABASE_URL` para um Supabase real)
3. API REST + autenticação (CRUD de vendas)
4. Tela de registro de vendas
5. Dashboard e relatórios
6. Avaliação (métricas de tempo/erros + questionário SUS) e escrita da monografia

## Convenções de código

- Componentes em `/app` ou `/components`; acesso a dados via route handlers em `/app/api`
- Validação de entrada com Zod nas rotas
- Commits pequenos e descritivos, em português
- Sempre explique brevemente decisões técnicas não óbvias (é material de TCC)

## Status atual

Prisma 7 instalado e configurado (driver adapter para PostgreSQL),
`schema.prisma` modelado com as 6 entidades do domínio, Postgres local
rodando via Docker (porta 5433) e a migration inicial já aplicada — conexão
via `PrismaClient` confirmada de ponta a ponta. Falta: (1) um script de seed,
e (2) mais pra frente, trocar o `DATABASE_URL` local por um Supabase real
antes de ir pra produção. A **Introdução da monografia** (contextualização,
problema de pesquisa, justificativa, objetivos, metodologia e estrutura) já foi
redigida nas atividades da disciplina.
