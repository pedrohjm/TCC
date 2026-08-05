import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { criarProdutoSchema } from '@/lib/validations/produto'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ativoParam = searchParams.get('ativo') // "true" | "false" | ausente (todos)

  let ativo: boolean | undefined
  if (ativoParam === 'true') ativo = true
  else if (ativoParam === 'false') ativo = false
  else if (ativoParam !== null) {
    return NextResponse.json({ erro: 'Parâmetro "ativo" deve ser "true" ou "false"' }, { status: 400 })
  }

  const produtos = await prisma.produto.findMany({
    where: ativo === undefined ? undefined : { ativo },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(produtos)
}

export async function POST(request: NextRequest) {
  const corpo = await request.json().catch(() => null)
  const resultado = criarProdutoSchema.safeParse(corpo)

  if (!resultado.success) {
    return NextResponse.json(
      { erro: 'Dados inválidos', detalhes: resultado.error.flatten() },
      { status: 400 }
    )
  }

  const produto = await prisma.produto.create({ data: resultado.data })
  return NextResponse.json(produto, { status: 201 })
}
