# Q10 Sorvetes — sistema de registro de vendas

Sistema web para registrar as vendas de uma sorveteria de bairro e mostrar
esses números para quem é dono do negócio, junto com um cardápio público
para o cliente. Desenvolvido como Trabalho de Conclusão de Curso em
Engenharia da Computação no IFTM.

O problema de partida é concreto: o registro das vendas é feito à mão, num
caderno, e por isso não existe forma prática de saber quanto se vendeu no
mês, qual produto sai mais ou em que horário a loja enche. O sistema
substitui o caderno por um lançamento rápido no balcão — pensado para ser
feito em poucos toques, com atalhos de teclado — e transforma esse registro
num painel de indicadores.

## O que já funciona

O site tem duas páginas, as duas de largura cheia:

- **`/` — a visão do cliente**, pública, sem login. Cardápio por categoria,
  avisos, "sobre nós" e contato com o mapa da loja.
- **`/painel` — a visão da equipe**, atrás de login, com três categorias
  trocadas na própria página:
  - **Registrar venda** — monta a comanda e fecha a venda. Já usa a tabela
    de preços real da loja, com desconto por quantidade (pote de 1800 mL),
    preço de pacote (picolé, 4 por 10) e valor digitado na hora
    (self-service, vendido por peso).
  - **Falta no estoque** — reservada, ainda não implementada.
  - **Dashboard** — só para o dono: faturamento por mês, semana e dia,
    total de vendas, formas de pagamento, produtos mais vendidos e mapa de
    horários de movimento.

Há dois papéis de usuário. O **atendente** registra vendas; o **dono** vê
tudo isso mais o faturamento consolidado.

## Tecnologias

| Camada | Escolha |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Turbopack) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v4 + shadcn/ui (sobre Base UI) |
| Banco | PostgreSQL 16 |
| ORM | Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Autenticação | Auth.js v5 (NextAuth), sessão em JWT, senha com bcrypt |
| Gráficos | Recharts |
| Validação | Zod, nas rotas da API |

## Rodando localmente

Precisa de **Node.js 20+** e **Docker** (para o banco).

```bash
# 1. dependências
npm install

# 2. variáveis de ambiente
cp .env.example .env
npx auth secret          # gera o AUTH_SECRET dentro do .env
#                          e troque as senhas do Postgres no .env

# 3. banco
docker compose up -d     # sobe o Postgres na porta 5433
npx prisma migrate deploy
npx prisma db seed       # produtos, sabores e dois usuários de teste

# 4. aplicação
npm run dev              # http://localhost:3000
```

Usuários criados pelo seed, **só para desenvolvimento**:

| E-mail | Papel | Senha |
| --- | --- | --- |
| `ana@sorveteria.com` | DONO | `123456` |
| `joao@sorveteria.com` | ATENDENTE | `123456` |

## Estrutura

```
app/
  (landing)/      home pública — a visão do cliente
  (sistema)/      /painel e /perfil — a visão da equipe
  (auth)/         entrar e criar conta
  api/            rotas de dados (vendas, produtos, sabores, relatórios…)
components/       componentes de tela; components/ui é o shadcn
lib/              regras que não são de tela
  precos.ts         como o preço de cada linha da venda é formado
  relatorios.ts     os cálculos do dashboard
prisma/
  schema.prisma   modelo de dados
  seed.ts         dados iniciais
proxy.ts          proteção das rotas (o "middleware" do Next 16)
```

Duas decisões que explicam boa parte do código:

- **O preço é sempre recalculado no servidor.** `lib/precos.ts` roda nos dois
  lados: na tela, para mostrar o total enquanto o pedido é montado; e na rota
  `POST /api/vendas`, com os dados do banco, antes de gravar. O navegador não
  decide quanto o cliente paga. A única exceção é o valor do self-service,
  que não existe em lugar nenhum antes de alguém pesar o pote — e nesse caso
  a rota confere que o produto realmente é de preço livre.
- **`ItemVenda` guarda o subtotal da linha**, e não só o preço unitário,
  porque com preço de pacote a linha deixou de ser preço × quantidade
  (6 picolés custam R$ 16,00, e 16/6 não fecha em centavos).

## Comandos

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # sobe o build
npm run lint     # ESLint
```

## Estado do trabalho

O sistema está em evolução. O que ainda não foi feito, e é sabido:

- A marcação de produtos em falta no estoque existe só como lugar reservado.
- O cadastro em `/registrar` é aberto a qualquer visitante (quem se cadastra
  entra sempre como atendente, nunca como dono). Antes de o site ir ao ar,
  isso precisa de código de convite ou de as contas serem criadas pelo dono.
- Endereço, coordenadas do mapa, avisos e o texto do "sobre nós" ainda são
  conteúdo de exemplo, centralizados em `lib/`.
- A avaliação com usuários (métricas de tempo e erro + questionário SUS) está
  prevista para quando o sistema estiver fechado.

## Licença

MIT — veja [LICENSE](LICENSE).
