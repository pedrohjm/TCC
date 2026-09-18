import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CATEGORIAS_VALIDAS = ['DOCE', 'FRUTA', 'AZEDO'] as const

// Rota pública (sem exigirSessao): o cardápio fica na home, que é
// acessível sem login — qualquer cliente precisa conseguir ver os sabores.
//
// O filtro é "tem essa categoria", não "é dessa categoria": um sabor pode
// estar em mais de uma (Morango é Fruta E Doce), e aparece nas duas.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const categoria = searchParams.get('categoria')

  if (categoria && !CATEGORIAS_VALIDAS.includes(categoria as (typeof CATEGORIAS_VALIDAS)[number])) {
    return NextResponse.json(
      { erro: `Parâmetro "categoria" deve ser um de: ${CATEGORIAS_VALIDAS.join(', ')}` },
      { status: 400 }
    )
  }

  const sabores = await prisma.sabor.findMany({
    where: {
      ativo: true,
      ...(categoria
        ? { categorias: { has: categoria as (typeof CATEGORIAS_VALIDAS)[number] } }
        : {}),
    },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(sabores)
}
