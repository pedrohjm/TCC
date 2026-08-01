import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/app/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { atualizarVendaSchema } from '@/lib/validations/venda'

type Params = { params: Promise<{ id: string }> }

const incluirRelacoes = {
  itens: { include: { produto: true } },
  usuario: { select: { id: true, nome: true } },
  reserva: true,
} as const

function converterId(idTexto: string): number | null {
  const id = Number(idTexto)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function GET(_request: NextRequest, { params }: Params) {
  const id = converterId((await params).id)
  if (!id) {
    return NextResponse.json({ erro: 'ID inválido' }, { status: 400 })
  }

  const venda = await prisma.venda.findUnique({ where: { id }, include: incluirRelacoes })
  if (!venda) {
    return NextResponse.json({ erro: 'Venda não encontrada' }, { status: 404 })
  }

  return NextResponse.json(venda)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = converterId((await params).id)
  if (!id) {
    return NextResponse.json({ erro: 'ID inválido' }, { status: 400 })
  }

  const corpo = await request.json().catch(() => null)
  const resultado = atualizarVendaSchema.safeParse(corpo)
  if (!resultado.success) {
    return NextResponse.json(
      { erro: 'Dados inválidos', detalhes: resultado.error.flatten() },
      { status: 400 }
    )
  }

  if (resultado.data.reservaId) {
    const reserva = await prisma.reserva.findUnique({ where: { id: resultado.data.reservaId } })
    if (!reserva) {
      return NextResponse.json({ erro: 'Reserva não encontrada' }, { status: 400 })
    }
  }

  try {
    const venda = await prisma.venda.update({
      where: { id },
      data: resultado.data,
      include: incluirRelacoes,
    })
    return NextResponse.json(venda)
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2025') {
      return NextResponse.json({ erro: 'Venda não encontrada' }, { status: 404 })
    }
    throw erro
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const id = converterId((await params).id)
  if (!id) {
    return NextResponse.json({ erro: 'ID inválido' }, { status: 400 })
  }

  try {
    await prisma.venda.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2025') {
      return NextResponse.json({ erro: 'Venda não encontrada' }, { status: 404 })
    }
    throw erro
  }
}
