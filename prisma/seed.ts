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

  const [casquinhaSimples, casquinhaDupla, acai, milkShake, sundae] = await Promise.all([
    prisma.produto.create({ data: { nome: 'Casquinha Simples', preco: 8.0 } }),
    prisma.produto.create({ data: { nome: 'Casquinha Dupla', preco: 12.0 } }),
    prisma.produto.create({ data: { nome: 'Açaí 300ml', preco: 15.0 } }),
    prisma.produto.create({ data: { nome: 'Milk-shake', preco: 18.0 } }),
    prisma.produto.create({ data: { nome: 'Sundae', preco: 14.0 } }),
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

  // Venda 1: balcão, sem reserva, pago no Pix.
  await prisma.venda.create({
    data: {
      valorTotal: 31.0, // 2x Casquinha Simples (16) + 1x Açaí (15)
      formaPagamento: 'PIX',
      usuarioId: atendente.id,
      itens: {
        create: [
          { produtoId: casquinhaSimples.id, quantidade: 2, precoUnitario: 8.0 },
          { produtoId: acai.id, quantidade: 1, precoUnitario: 15.0 },
        ],
      },
    },
  })

  // Venda 2: vinculada à reserva do Pedro Alves, pago em dinheiro.
  await prisma.venda.create({
    data: {
      valorTotal: 14.0, // 1x Sundae
      formaPagamento: 'DINHEIRO',
      usuarioId: dona.id,
      reservaId: reservaConcluida.id,
      itens: {
        create: [{ produtoId: sundae.id, quantidade: 1, precoUnitario: 14.0 }],
      },
    },
  })

  // Venda 3: balcão, pago no cartão.
  await prisma.venda.create({
    data: {
      valorTotal: 36.0, // 2x Milk-shake
      formaPagamento: 'CARTAO',
      usuarioId: atendente.id,
      itens: {
        create: [{ produtoId: milkShake.id, quantidade: 2, precoUnitario: 18.0 }],
      },
    },
  })

  await prisma.fechamentoCaixa.create({
    data: {
      data: new Date('2026-07-29T23:59:59'),
      totalDinheiro: 14.0,
      totalCartao: 36.0,
      totalPix: 31.0,
      observacoes: 'Fechamento de exemplo gerado pelo seed.',
    },
  })

  // casquinhaDupla fica sem venda de propósito, pra testar produto "sem saída" no dashboard.
  void casquinhaDupla

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

  console.log('Seed concluído: 2 usuários, 5 produtos, 2 reservas, 3 vendas, 1 fechamento de caixa, 9 sabores.')
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
