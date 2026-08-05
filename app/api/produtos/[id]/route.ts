import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/app/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { atualizarProdutoSchema } from '@/lib/validations/produto'

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

  const produto = await prisma.produto.findUnique({ where: { id } })
  if (!produto) {
    return NextResponse.json({ erro: 'Produto não encontrado' }, { status: 404 })
  }

  return NextResponse.json(produto)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = converterId((await params).id)
  if (!id) {
    return NextResponse.json({ erro: 'ID inválido' }, { status: 400 })
  }

  const corpo = await request.json().catch(() => null)
  const resultado = atualizarProdutoSchema.safeParse(corpo)
  if (!resultado.success) {
    return NextResponse.json(
      { erro: 'Dados inválidos', detalhes: resultado.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const produto = await prisma.produto.update({ where: { id }, data: resultado.data })
    return NextResponse.json(produto)
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2025') {
      return NextResponse.json({ erro: 'Produto não encontrado' }, { status: 404 })
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
    await prisma.produto.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError) {
      if (erro.code === 'P2025') {
        return NextResponse.json({ erro: 'Produto não encontrado' }, { status: 404 })
      }
      if (erro.code === 'P2003') {
        // Produto já foi usado em alguma venda — apagar quebraria o histórico.
        return NextResponse.json(
          { erro: 'Produto já foi vendido antes e não pode ser apagado. Use PATCH com {"ativo": false} para desativá-lo.' },
          { status: 409 }
        )
      }
    }
    throw erro
  }
}
