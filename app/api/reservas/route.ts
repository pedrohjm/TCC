import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { criarReservaSchema, statusReserva } from '@/lib/validations/reserva'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  if (status !== null && !statusReserva.includes(status as (typeof statusReserva)[number])) {
    return NextResponse.json(
      { erro: `Parâmetro "status" deve ser um de: ${statusReserva.join(', ')}` },
      { status: 400 }
    )
  }

  const reservas = await prisma.reserva.findMany({
    where: status ? { status: status as (typeof statusReserva)[number] } : undefined,
    orderBy: { data: 'asc' },
  })

  return NextResponse.json(reservas)
}

export async function POST(request: NextRequest) {
  const corpo = await request.json().catch(() => null)
  const resultado = criarReservaSchema.safeParse(corpo)

  if (!resultado.success) {
    return NextResponse.json(
      { erro: 'Dados inválidos', detalhes: resultado.error.flatten() },
      { status: 400 }
    )
  }

  // Toda reserva nasce PENDENTE, independentemente do que vier no corpo.
  const reserva = await prisma.reserva.create({
    data: { ...resultado.data, status: 'PENDENTE' },
  })

  return NextResponse.json(reserva, { status: 201 })
}
