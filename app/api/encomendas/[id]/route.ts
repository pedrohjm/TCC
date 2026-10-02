import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/app/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { atualizarEncomendaSchema } from '@/lib/validations/encomenda'
import { exigirSessao, exigirUsuarioDaSessao } from '@/lib/auth-helpers'
import { calcularVenda, type ProdutoComRegra } from '@/lib/precos'

interface Params {
  params: Promise<{ id: string }>
}

const incluirSabor = {
  sabor: { select: { id: true, nome: true, ativo: true } },
  venda: { select: { id: true, valorTotal: true, formaPagamento: true } },
} as const

function converterId(valor: string) {
  const id = Number(valor)
  return Number.isInteger(id) && id > 0 ? id : null
}

// Serve tanto pra corrigir o pedido quanto pra andar o status (é o que os
// botões da tela chamam).
//
// A passagem pra ENTREGUE é a única que faz mais do que mudar um campo:
// ela **gera a venda**. O preço não vem do corpo da requisição — sai do
// produto que atende aquele tipo de encomenda (`Produto.tipoEncomenda`),
// passando pelo mesmo `lib/precos.ts` que a tela de vendas usa, então as
// regras de quantidade valem igual (5 potes encomendados saem a 25,00 cada,
// como sairiam no balcão).
//
// Desfazer a entrega apaga a venda gerada: ela só existia por causa dela.
export async function PATCH(request: NextRequest, { params }: Params) {
  const { erro: erroSessao } = await exigirSessao()
  if (erroSessao) return erroSessao

  const id = converterId((await params).id)
  if (!id) {
    return NextResponse.json({ erro: 'ID inválido' }, { status: 400 })
  }

  const corpo = await request.json().catch(() => null)
  const resultado = atualizarEncomendaSchema.safeParse(corpo)
  if (!resultado.success) {
    return NextResponse.json(
      { erro: resultado.error.issues[0]?.message ?? 'Dados inválidos', detalhes: resultado.error.flatten() },
      { status: 400 }
    )
  }

  const { formaPagamento, ...campos } = resultado.data

  const atual = await prisma.encomenda.findUnique({ where: { id }, include: { venda: true } })
  if (!atual) {
    return NextResponse.json({ erro: 'Encomenda não encontrada' }, { status: 404 })
  }

  if (campos.saborId) {
    const sabor = await prisma.sabor.findUnique({ where: { id: campos.saborId } })
    if (!sabor) {
      return NextResponse.json({ erro: 'Sabor não encontrado' }, { status: 400 })
    }
  }

  const virandoEntregue = campos.status === 'ENTREGUE' && atual.status !== 'ENTREGUE'
  const desfazendoEntrega = campos.status !== undefined && campos.status !== 'ENTREGUE' && atual.venda

  // ---- entrega: cria a venda junto, na mesma transação ----
  if (virandoEntregue) {
    // A venda fica no nome de quem entregou, então o usuário da sessão
    // precisa existir de verdade (ver exigirUsuarioDaSessao).
    const { usuarioId, erro: erroUsuario } = await exigirUsuarioDaSessao()
    if (erroUsuario) return erroUsuario

    const tipo = campos.tipo ?? atual.tipo
    const quantidade = campos.quantidade ?? atual.quantidade

    const produto = await prisma.produto.findUnique({ where: { tipoEncomenda: tipo } })
    if (!produto) {
      return NextResponse.json(
        {
          erro: `Nenhum produto está marcado como "${tipo}" na tabela de preços, então não dá pra gerar a venda desta entrega.`,
        },
        { status: 400 }
      )
    }
    if (!produto.ativo) {
      return NextResponse.json(
        { erro: `O produto "${produto.nome}" está inativo — reative antes de entregar.` },
        { status: 400 }
      )
    }

    const paraCalculo: ProdutoComRegra = {
      id: produto.id,
      nome: produto.nome,
      preco: Number(produto.preco),
      regraPreco: produto.regraPreco,
      quantidadeRegra: produto.quantidadeRegra,
      precoRegra: produto.precoRegra === null ? null : Number(produto.precoRegra),
      grupoPreco: produto.grupoPreco,
    }
    const { linhas, total } = calcularVenda(
      [{ produtoId: produto.id, quantidade }],
      new Map([[produto.id, paraCalculo]])
    )

    const encomenda = await prisma.$transaction(async (tx) => {
      const atualizada = await tx.encomenda.update({
        where: { id },
        data: { ...campos, status: 'ENTREGUE' },
      })
      await tx.venda.create({
        data: {
          usuarioId,
          formaPagamento: formaPagamento!,
          encomendaId: atualizada.id,
          deEncomenda: true,
          valorTotal: total,
          descricao: `Encomenda de ${atualizada.nomeCliente}`,
          itens: { create: linhas },
        },
      })
      return tx.encomenda.findUniqueOrThrow({ where: { id }, include: incluirSabor })
    })

    return NextResponse.json(encomenda)
  }

  // ---- desfazendo a entrega: a venda gerada vai junto ----
  if (desfazendoEntrega) {
    const encomenda = await prisma.$transaction(async (tx) => {
      await tx.venda.delete({ where: { id: atual.venda!.id } })
      await tx.encomenda.update({ where: { id }, data: campos })
      return tx.encomenda.findUniqueOrThrow({ where: { id }, include: incluirSabor })
    })
    return NextResponse.json(encomenda)
  }

  try {
    const encomenda = await prisma.encomenda.update({
      where: { id },
      data: campos,
      include: incluirSabor,
    })
    return NextResponse.json(encomenda)
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2025') {
      return NextResponse.json({ erro: 'Encomenda não encontrada' }, { status: 404 })
    }
    throw erro
  }
}

// Apagar é pra pedido lançado errado, cancelado, ou entregue há tempo e
// que só está ocupando espaço na lista. Qualquer papel pode: encomenda não
// é registro contábil, e quem errou o lançamento é quem desfaz na hora.
//
// **A venda gerada não vai junto.** Se a encomenda já foi entregue, existe
// uma venda amarrada a ela — essa é registro de dinheiro e fica. O vínculo
// é `ON DELETE SET NULL`, então a venda só perde a referência; o nome do
// cliente continua na descrição dela, e o `deEncomenda` continua contando
// no dashboard. Pra apagar a venda de verdade é preciso desfazer a entrega
// antes — aí sim ela some, num passo em que isso está explícito.
export async function DELETE(request: NextRequest, { params }: Params) {
  const { erro: erroSessao } = await exigirSessao()
  if (erroSessao) return erroSessao

  const id = converterId((await params).id)
  if (!id) {
    return NextResponse.json({ erro: 'ID inválido' }, { status: 400 })
  }

  try {
    await prisma.encomenda.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2025') {
      return NextResponse.json({ erro: 'Encomenda não encontrada' }, { status: 404 })
    }
    throw erro
  }
}
