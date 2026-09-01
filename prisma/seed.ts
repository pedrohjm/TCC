import 'dotenv/config'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client.js'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Senha única pros dois usuários de teste — só pra desenvolvimento local,
// nunca use algo assim fora do seed.
const SENHA_TESTE = '123456'

async function limparBanco() {
  // Ordem respeita as chaves estrangeiras (dependentes primeiro).
  await prisma.itemVenda.deleteMany()
  await prisma.venda.deleteMany()
  await prisma.reserva.deleteMany()
  await prisma.produto.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.fechamentoCaixa.deleteMany()
  await prisma.sabor.deleteMany()
}

async function main() {
  await limparBanco()

  const senhaHash = await bcrypt.hash(SENHA_TESTE, 10)

  const [dona, atendente] = await Promise.all([
    prisma.usuario.create({
      data: {
        nome: 'Ana Souza',
        email: 'ana@sorveteria.com',
        senhaHash,
        papel: 'DONO',
      },
    }),
    prisma.usuario.create({
      data: {
        nome: 'João Pereira',
        email: 'joao@sorveteria.com',
        senhaHash,
        papel: 'ATENDENTE',
      },
    }),
  ])

  // Tabela de preços da loja. As regras estão explicadas no enum
  // `RegraPreco` do schema; o cálculo em si mora em lib/precos.ts.
  //
  // Os dois potes dividem o grupo POTE_1800: eles somam quantidade pra
  // decidir se o desconto pegou, então 1 pote comum + 1 de açaí já contam
  // como 2 potes (o comum cai pra 25,00; o açaí, que é UNITARIO, fica nos
  // 33,00 dele).
  const [pote, poteAcai, picole, caixa, caixaAcai, selfService] = await Promise.all([
    prisma.produto.create({
      data: {
        nome: 'Pote 1800 mL',
        preco: 27.0,
        ordem: 1,
        regraPreco: 'ESCALONADO',
        quantidadeRegra: 2,
        precoRegra: 25.0,
        grupoPreco: 'POTE_1800',
      },
    }),
    prisma.produto.create({
      data: { nome: 'Pote 1800 mL — Açaí', preco: 33.0, grupoPreco: 'POTE_1800', ordem: 2 },
    }),
    prisma.produto.create({
      data: {
        nome: 'Picolé',
        preco: 3.0,
        ordem: 3,
        regraPreco: 'PACOTE',
        quantidadeRegra: 4,
        precoRegra: 10.0,
      },
    }),
    prisma.produto.create({ data: { nome: 'Caixa', preco: 120.0, ordem: 4 } }),
    prisma.produto.create({ data: { nome: 'Caixa — Açaí', preco: 160.0, ordem: 5 } }),
    prisma.produto.create({
      data: { nome: 'SelfService', preco: 0, regraPreco: 'LIVRE', ordem: 6 },
    }),
  ])

  const reservaConcluida = await prisma.reserva.create({
    data: {
      nomeCliente: 'Pedro Alves',
      data: new Date('2026-07-28T15:00:00'),
      status: 'CONCLUIDA',
    },
  })

  await prisma.reserva.create({
    data: {
      nomeCliente: 'Carla Lima',
      data: new Date('2026-08-05T18:00:00'),
      status: 'PENDENTE',
    },
  })

  // As vendas de exemplo cobrem de propósito uma regra de preço cada, pra
  // o dashboard ter número pra mostrar e pra dar pra conferir a conta.

  // Venda 1: 2 potes comuns — o desconto pegou, os DOIS a 25,00.
  await prisma.venda.create({
    data: {
      valorTotal: 50.0,
      formaPagamento: 'PIX',
      usuarioId: atendente.id,
      descricao: 'Cliente levou os dois potes de uma vez.',
      itens: {
        create: [{ produtoId: pote.id, quantidade: 2, precoUnitario: 25.0, subtotal: 50.0 }],
      },
    },
  })

  // Venda 2: 5 picolés — 1 pacote de 4 (10,00) + 1 avulso (3,00).
  await prisma.venda.create({
    data: {
      valorTotal: 13.0,
      formaPagamento: 'DINHEIRO',
      usuarioId: dona.id,
      reservaId: reservaConcluida.id,
      itens: {
        create: [{ produtoId: picole.id, quantidade: 5, precoUnitario: 3.0, subtotal: 13.0 }],
      },
    },
  })

  // Venda 3: 1 pote comum + 1 de açaí. São 2 potes no grupo, então o comum
  // saiu a 25,00; o açaí fica nos 33,00 dele.
  await prisma.venda.create({
    data: {
      valorTotal: 58.0,
      formaPagamento: 'CARTAO',
      usuarioId: atendente.id,
      itens: {
        create: [
          { produtoId: pote.id, quantidade: 1, precoUnitario: 25.0, subtotal: 25.0 },
          { produtoId: poteAcai.id, quantidade: 1, precoUnitario: 33.0, subtotal: 33.0 },
        ],
      },
    },
  })

  // Venda 4: self-service, valor pesado no balcão.
  await prisma.venda.create({
    data: {
      valorTotal: 18.5,
      formaPagamento: 'PIX',
      usuarioId: atendente.id,
      descricao: 'Pote montado no self-service, 370 g.',
      itens: {
        create: [
          { produtoId: selfService.id, quantidade: 1, precoUnitario: 18.5, subtotal: 18.5 },
        ],
      },
    },
  })

  await prisma.fechamentoCaixa.create({
    data: {
      data: new Date('2026-07-29T23:59:59'),
      totalDinheiro: 13.0,
      totalCartao: 58.0,
      totalPix: 68.5,
      observacoes: 'Fechamento de exemplo gerado pelo seed.',
    },
  })

  // As caixas ficam sem venda de propósito, pra testar produto "sem saída"
  // no dashboard.
  void caixa
  void caixaAcai

  // Sabores dos potes de 1800ml — catálogo só pra exibição no cardápio
  // público (/cardapio/sabores-1800ml), sem relação com Produto/Venda.
  // Sem foto real ainda: o campo aponta pro caminho onde ela entraria
  // (public/images/cardapio/<slug>.jpg) e a tela cai num ícone quando o
  // arquivo não existe.
  await prisma.sabor.createMany({
    data: [
      {
        nome: 'Chocolate Belga',
        categoria: 'DOCE',
        descricao: 'Sorvete cremoso de chocolate belga meio amargo.',
        foto: '/images/cardapio/chocolate-belga.jpg',
      },
      {
        nome: 'Ninho com Nutella',
        categoria: 'DOCE',
        descricao: 'Leite ninho cremoso com mesclas de Nutella.',
        foto: '/images/cardapio/ninho-nutella.jpg',
      },
      {
        nome: 'Brigadeiro',
        categoria: 'DOCE',
        descricao: 'Sabor de brigadeiro caseiro com granulado.',
        foto: '/images/cardapio/brigadeiro.jpg',
      },
      {
        nome: 'Morango',
        categoria: 'FRUTA',
        descricao: 'Sorvete de morango com pedaços da fruta.',
        foto: '/images/cardapio/morango.jpg',
      },
      {
        nome: 'Manga',
        categoria: 'FRUTA',
        descricao: 'Polpa de manga bem madura, sabor tropical.',
        foto: '/images/cardapio/manga.jpg',
      },
      {
        nome: 'Maracujá',
        categoria: 'FRUTA',
        descricao: 'Sorvete de maracujá com um leve toque azedinho.',
        foto: '/images/cardapio/maracuja.jpg',
      },
      {
        nome: 'Limão Siciliano',
        categoria: 'AZEDO',
        descricao: 'Bem azedo e refrescante, com raspas de limão siciliano.',
        foto: '/images/cardapio/limao-siciliano.jpg',
      },
      {
        nome: 'Tangerina',
        categoria: 'AZEDO',
        descricao: 'Sabor cítrico e ácido de tangerina.',
        foto: '/images/cardapio/tangerina.jpg',
      },
      {
        nome: 'Framboesa',
        categoria: 'AZEDO',
        descricao: 'Acidez marcante da framboesa, equilibrada com o creme.',
        foto: '/images/cardapio/framboesa.jpg',
      },
    ],
  })

  console.log('Seed concluído: 2 usuários, 6 produtos, 2 reservas, 4 vendas, 1 fechamento de caixa, 9 sabores.')
  console.log(`Login de teste: ana@sorveteria.com / joao@sorveteria.com — senha "${SENHA_TESTE}"`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
