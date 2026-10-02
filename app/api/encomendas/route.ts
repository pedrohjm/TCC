import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { criarEncomendaSchema, statusEncomenda } from '@/lib/validations/encomenda'
import { exigirSessao } from '@/lib/auth-helpers'

// O sabor e a venda vêm juntos em toda resposta. O sabor porque a tela
// mostra o nome dele (sem o include seria uma consulta por linha). A venda
// porque a linha de uma encomenda entregue mostra quanto ela virou — e
// precisa ser a MESMA forma que o PATCH devolve, senão o valor aparecia ao
// entregar e sumia no primeiro F5.
const incluirSabor = {
  sabor: { select: { id: true, nome: true, ativo: true } },
  venda: { select: { id: true, valorTotal: true, formaPagamento: true } },
} as const

export async function GET(request: NextRequest) {
  const { erro: erroSessao } = await exigirSessao()
  if (erroSessao) return erroSessao

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  if (status !== null && !statusEncomenda.includes(status as (typeof statusEncomenda)[number])) {
    return NextResponse.json(
      { erro: `Parâmetro "status" deve ser um de: ${statusEncomenda.join(', ')}` },
      { status: 400 }
    )
  }

  const encomendas = await prisma.encomenda.findMany({
    where: status ? { status: status as (typeof statusEncomenda)[number] } : undefined,
    include: incluirSabor,
    // Quem vence antes primeiro: a lista é, na prática, a fila de produção.
    orderBy: [{ dataEntrega: 'asc' }, { id: 'asc' }],
  })

  return NextResponse.json(encomendas)
}

// Limpeza da lista: apaga de uma vez todas as encomendas de um status.
// Existe porque a aba "Entregues" só cresce, e apagar uma a uma depois de
// alguns meses seria inviável. Só aceita um status explícito — sem ele a
// rota recusa, pra não existir um "apaga tudo" a um descuido de distância.
//
// As vendas geradas pelas entregas NÃO são apagadas: o vínculo é
// `ON DELETE SET NULL`, elas continuam no faturamento com o nome do
// cliente na descrição (ver o DELETE em [id]/route.ts).
export async function DELETE(request: NextRequest) {
  const { erro: erroSessao } = await exigirSessao()
  if (erroSessao) return erroSessao

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  if (!status || !statusEncomenda.includes(status as (typeof statusEncomenda)[number])) {
    return NextResponse.json(
      { erro: `Informe o status a limpar, um de: ${statusEncomenda.join(', ')}` },
      { status: 400 }
    )
  }

  const { count } = await prisma.encomenda.deleteMany({
    where: { status: status as (typeof statusEncomenda)[number] },
  })

  return NextResponse.json({ apagadas: count })
}

export async function POST(request: NextRequest) {
  const { erro: erroSessao } = await exigirSessao()
  if (erroSessao) return erroSessao

  const corpo = await request.json().catch(() => null)
  const resultado = criarEncomendaSchema.safeParse(corpo)

  if (!resultado.success) {
    return NextResponse.json(
      { erro: 'Dados inválidos', detalhes: resultado.error.flatten() },
      { status: 400 }
    )
  }

  // O sabor precisa existir de verdade — sem isto o Prisma devolveria um
  // erro de chave estrangeira cru, que não diz nada pra quem está no balcão.
  const sabor = await prisma.sabor.findUnique({ where: { id: resultado.data.saborId } })
  if (!sabor) {
    return NextResponse.json({ erro: 'Sabor não encontrado' }, { status: 400 })
  }

  // Toda encomenda nasce PENDENTE, venha o que vier no corpo.
  const encomenda = await prisma.encomenda.create({
    data: { ...resultado.data, status: 'PENDENTE' },
    include: incluirSabor,
  })

  return NextResponse.json(encomenda, { status: 201 })
}
