import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CATEGORIAS_VALIDAS = ['DOCE', 'FRUTA', 'AZEDO'] as const

// Rota pública (sem exigirSessao): a tela de sabores fica em /cardapio,
// que é acessível sem login — qualquer cliente navegando no cardápio
// precisa conseguir ver os sabores disponíveis.
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
      ...(categoria ? { categoria: categoria as (typeof CATEGORIAS_VALIDAS)[number] } : {}),
    },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(sabores)
}
