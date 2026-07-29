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
   (schema já escrito; falta rodar `prisma migrate dev` — depende de uma
   `DATABASE_URL` real de Neon/Supabase no `.env`, ainda não configurada — e
   escrever o seed)
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

Prisma 7 instalado e configurado (driver adapter para PostgreSQL) e
`schema.prisma` modelado com as 6 entidades do domínio. Falta: (1) uma
`DATABASE_URL` real (Neon ou Supabase) para rodar `prisma migrate dev`, e
(2) um script de seed. A **Introdução da monografia** (contextualização,
problema de pesquisa, justificativa, objetivos, metodologia e estrutura) já foi
redigida nas atividades da disciplina.
