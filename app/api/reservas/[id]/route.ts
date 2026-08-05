import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/app/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { atualizarReservaSchema } from '@/lib/validations/reserva'

type Params = { params: Promise<{ id: string }> }

function converterId(idTexto: string): number | null {
  const id = Number(idTexto)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function GET(_request: NextRequest, { params }: Params) {
  const id = converterId((await params).id)
  if (!id) {
    return NextResponse.json({ erro: 'ID inválido' }, { status: 400 })
  }

  const reserva = await prisma.reserva.findUnique({ where: { id } })
  if (!reserva) {
    return NextResponse.json({ erro: 'Reserva não encontrada' }, { status: 404 })
  }

  return NextResponse.json(reserva)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = converterId((await params).id)
  if (!id) {
    return NextResponse.json({ erro: 'ID inválido' }, { status: 400 })
  }

  const corpo = await request.json().catch(() => null)
  const resultado = atualizarReservaSchema.safeParse(corpo)
  if (!resultado.success) {
    return NextResponse.json(
      { erro: 'Dados inválidos', detalhes: resultado.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const reserva = await prisma.reserva.update({ where: { id }, data: resultado.data })
    return NextResponse.json(reserva)
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2025') {
      return NextResponse.json({ erro: 'Reserva não encontrada' }, { status: 404 })
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
    await prisma.reserva.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError) {
      if (erro.code === 'P2025') {
        return NextResponse.json({ erro: 'Reserva não encontrada' }, { status: 404 })
      }
      if (erro.code === 'P2003') {
        return NextResponse.json(
          { erro: 'Reserva está vinculada a uma venda e não pode ser apagada. Use PATCH com {"status": "CANCELADA"} em vez disso.' },
          { status: 409 }
        )
      }
    }
    throw erro
  }
}
