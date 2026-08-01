import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { criarVendaSchema } from '@/lib/validations/venda'

const incluirRelacoes = {
  itens: { include: { produto: true } },
  usuario: { select: { id: true, nome: true } },
  reserva: true,
} as const

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const data = searchParams.get('data') // AAAA-MM-DD, filtra as vendas de um único dia

  let filtroData: { gte: Date; lt: Date } | undefined
  if (data) {
    const inicio = new Date(`${data}T00:00:00`)
    if (Number.isNaN(inicio.getTime())) {
      return NextResponse.json(
        { erro: 'Parâmetro "data" inválido, use o formato AAAA-MM-DD' },
        { status: 400 }
      )
    }
    const fim = new Date(inicio)
    fim.setDate(fim.getDate() + 1)
    filtroData = { gte: inicio, lt: fim }
  }

  const vendas = await prisma.venda.findMany({
    where: filtroData ? { dataHora: filtroData } : undefined,
    orderBy: { dataHora: 'desc' },
    include: incluirRelacoes,
  })

  return NextResponse.json(vendas)
}

export async function POST(request: NextRequest) {
  const corpo = await request.json().catch(() => null)
  const resultado = criarVendaSchema.safeParse(corpo)

  if (!resultado.success) {
    return NextResponse.json(
      { erro: 'Dados inválidos', detalhes: resultado.error.flatten() },
      { status: 400 }
    )
  }

  const { usuarioId, formaPagamento, reservaId, itens } = resultado.data

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } })
  if (!usuario) {
    return NextResponse.json({ erro: 'Usuário não encontrado' }, { status: 400 })
  }

  if (reservaId) {
    const reserva = await prisma.reserva.findUnique({ where: { id: reservaId } })
    if (!reserva) {
      return NextResponse.json({ erro: 'Reserva não encontrada' }, { status: 400 })
    }
  }

  const produtoIds = itens.map((item) => item.produtoId)
  const produtos = await prisma.produto.findMany({ where: { id: { in: produtoIds } } })
  const produtoPorId = new Map(produtos.map((produto) => [produto.id, produto]))

  for (const item of itens) {
    const produto = produtoPorId.get(item.produtoId)
    if (!produto) {
      return NextResponse.json({ erro: `Produto ${item.produtoId} não encontrado` }, { status: 400 })
    }
    if (!produto.ativo) {
      return NextResponse.json({ erro: `Produto "${produto.nome}" está inativo` }, { status: 400 })
    }
  }

  // O preço unitário vem do banco, nunca do corpo da requisição — assim um
  // valor adulterado no request não muda quanto o cliente paga.
  const itensComPreco = itens.map((item) => {
    const produto = produtoPorId.get(item.produtoId)!
    return {
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnitario: produto.preco,
    }
  })

  const valorTotal = itensComPreco.reduce(
    (total, item) => total + Number(item.precoUnitario) * item.quantidade,
    0
  )

  const venda = await prisma.venda.create({
    data: {
      usuarioId,
      formaPagamento,
      reservaId,
      valorTotal,
      itens: { create: itensComPreco },
    },
    include: incluirRelacoes,
  })

  return NextResponse.json(venda, { status: 201 })
}
