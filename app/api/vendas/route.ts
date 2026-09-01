import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { criarVendaSchema } from '@/lib/validations/venda'
import { calcularVenda, type ProdutoComRegra } from '@/lib/precos'
import { exigirSessao } from '@/lib/auth-helpers'
import { limitesDoMes } from '@/lib/relatorios'

const incluirRelacoes = {
  itens: { include: { produto: true } },
  usuario: { select: { id: true, nome: true } },
  reserva: true,
} as const

export async function GET(request: NextRequest) {
  const { erro: erroSessao } = await exigirSessao()
  if (erroSessao) return erroSessao

  const { searchParams } = new URL(request.url)
  const data = searchParams.get('data') // AAAA-MM-DD, filtra as vendas de um único dia
  const mes = searchParams.get('mes') // AAAA-MM, filtra as vendas do mês inteiro

  if (data && mes) {
    return NextResponse.json({ erro: 'Use apenas um dos parâmetros: "data" ou "mes"' }, { status: 400 })
  }

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

  if (mes) {
    const match = /^(\d{4})-(\d{2})$/.exec(mes)
    if (!match) {
      return NextResponse.json({ erro: 'Parâmetro "mes" deve estar no formato AAAA-MM' }, { status: 400 })
    }
    const { inicio, fim } = limitesDoMes(Number(match[1]), Number(match[2]) - 1)
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
  const { sessao, erro: erroSessao } = await exigirSessao()
  if (erroSessao) return erroSessao

  const corpo = await request.json().catch(() => null)
  const resultado = criarVendaSchema.safeParse(corpo)

  if (!resultado.success) {
    return NextResponse.json(
      { erro: 'Dados inválidos', detalhes: resultado.error.flatten() },
      { status: 400 }
    )
  }

  const { formaPagamento, reservaId, descricao, itens } = resultado.data
  const usuarioId = Number(sessao.user.id)

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
    // O valor digitado só faz sentido no self-service. Exigir aqui evita
    // dois enganos opostos: uma venda de self-service gravada como zero, e
    // um valor mandado por fora tentando furar o preço de tabela.
    if (produto.regraPreco === 'LIVRE' && !item.valor) {
      return NextResponse.json(
        { erro: `Informe o valor de "${produto.nome}"` },
        { status: 400 }
      )
    }
    if (produto.regraPreco !== 'LIVRE' && item.valor !== undefined) {
      return NextResponse.json(
        { erro: `"${produto.nome}" tem preço de tabela — não aceita valor digitado` },
        { status: 400 }
      )
    }
  }

  // Os preços vêm do banco, nunca do corpo da requisição — assim um valor
  // adulterado no request não muda quanto o cliente paga. A exceção é o
  // self-service (regra LIVRE), que não tem preço de tabela: aí o valor é
  // digitado mesmo, e o que a rota faz é conferir que o produto é desse
  // tipo (o laço acima) e respeitar o teto do schema.
  //
  // A conta em si mora em lib/precos.ts, o mesmo arquivo que a tela usa
  // pra mostrar o total enquanto o pedido é montado. Precisa ser refeita
  // aqui porque quem manda é o servidor — e porque uma linha depende das
  // outras: 1 pote comum + 1 pote de açaí já são 2 potes, e isso muda o
  // preço do comum.
  const paraCalculo: ProdutoComRegra[] = produtos.map((produto) => ({
    id: produto.id,
    nome: produto.nome,
    preco: Number(produto.preco),
    regraPreco: produto.regraPreco,
    quantidadeRegra: produto.quantidadeRegra,
    precoRegra: produto.precoRegra === null ? null : Number(produto.precoRegra),
    grupoPreco: produto.grupoPreco,
  }))

  const { linhas, total: valorTotal } = calcularVenda(
    itens,
    new Map(paraCalculo.map((produto) => [produto.id, produto]))
  )

  const venda = await prisma.venda.create({
    data: {
      usuarioId,
      formaPagamento,
      reservaId,
      descricao,
      valorTotal,
      itens: { create: linhas },
    },
    include: incluirRelacoes,
  })

  return NextResponse.json(venda, { status: 201 })
}
