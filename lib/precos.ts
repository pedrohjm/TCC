import type { RegraPreco } from '@/app/generated/prisma/enums'

// Como o preço de uma linha da venda é formado. As regras em si estão
// documentadas no enum `RegraPreco` do prisma/schema.prisma; aqui está a
// conta.
//
// Este arquivo é usado nos dois lados de propósito: a tela mostra o total
// enquanto o atendente monta o carrinho, e a rota POST /api/vendas refaz a
// mesma conta com os dados do banco antes de gravar. O que vale é o do
// servidor — a tela é só pra pessoa ver o valor na hora.

/** O que a conta precisa saber de um produto. */
export interface ProdutoComRegra {
  id: number
  nome: string
  preco: number
  regraPreco: RegraPreco
  quantidadeRegra: number | null
  precoRegra: number | null
  grupoPreco: string | null
}

/** Uma linha do carrinho / do pedido. */
export interface LinhaVenda {
  produtoId: number
  quantidade: number
  /** Só na regra LIVRE (self-service): o valor digitado no balcão. */
  valor?: number | null
}

export interface LinhaCalculada {
  produtoId: number
  quantidade: number
  /** Preço de referência de uma unidade, do jeito que ela foi cobrada. */
  precoUnitario: number
  /** Quanto a linha custou de fato. */
  subtotal: number
}

/** Dinheiro só existe até os centavos — sem isso, somar valores digitados
 *  no self-service acumula sobra de ponto flutuante (0,1 + 0,2 = 0,30000004). */
export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Quantidade que decide se a regra ESCALONADO pegou: a soma de todas as
 *  linhas que dividem o mesmo `grupoPreco`. É o que faz 1 pote comum +
 *  1 pote de açaí já contarem como 2 potes. Produto sem grupo conta só a
 *  própria quantidade. */
export function quantidadeDoGatilho(
  produto: ProdutoComRegra,
  linhas: LinhaVenda[],
  produtoPorId: Map<number, ProdutoComRegra>
): number {
  const daLinha = linhas
    .filter((linha) => linha.produtoId === produto.id)
    .reduce((soma, linha) => soma + linha.quantidade, 0)

  if (!produto.grupoPreco) return daLinha

  return linhas.reduce((soma, linha) => {
    const outro = produtoPorId.get(linha.produtoId)
    return outro?.grupoPreco === produto.grupoPreco ? soma + linha.quantidade : soma
  }, 0)
}

/** `quantidadeGatilho` só é usada pela regra ESCALONADO. PACOTE fecha
 *  pacotes com a quantidade da própria linha: juntar produtos diferentes
 *  num pacote deixaria em aberto de quem é o preço do pacote. */
export function calcularLinha(
  produto: ProdutoComRegra,
  linha: LinhaVenda,
  quantidadeGatilho: number
): LinhaCalculada {
  const { quantidade } = linha
  const base = { produtoId: produto.id, quantidade }

  switch (produto.regraPreco) {
    case 'LIVRE': {
      // Não tem preço de tabela: quem diz o valor é quem pesou o pote.
      const valor = arredondar(linha.valor ?? 0)
      return { ...base, precoUnitario: valor, subtotal: arredondar(valor * quantidade) }
    }

    case 'ESCALONADO': {
      const minimo = produto.quantidadeRegra ?? 0
      const precoCheio = produto.preco
      const pegou = produto.precoRegra !== null && minimo > 0 && quantidadeGatilho >= minimo
      const unitario = pegou ? produto.precoRegra! : precoCheio
      return { ...base, precoUnitario: unitario, subtotal: arredondar(unitario * quantidade) }
    }

    case 'PACOTE': {
      const tamanho = produto.quantidadeRegra ?? 0
      if (produto.precoRegra === null || tamanho <= 0) break
      const pacotes = Math.floor(quantidade / tamanho)
      const avulsas = quantidade % tamanho
      const subtotal = arredondar(pacotes * produto.precoRegra + avulsas * produto.preco)
      return { ...base, precoUnitario: produto.preco, subtotal }
    }
  }

  return {
    ...base,
    precoUnitario: produto.preco,
    subtotal: arredondar(produto.preco * quantidade),
  }
}

/** Calcula o pedido inteiro. As linhas precisam ser resolvidas juntas
 *  porque o gatilho de uma depende das outras (ver `quantidadeDoGatilho`). */
export function calcularVenda(
  linhas: LinhaVenda[],
  produtoPorId: Map<number, ProdutoComRegra>
): { linhas: LinhaCalculada[]; total: number } {
  const calculadas = linhas.map((linha) => {
    const produto = produtoPorId.get(linha.produtoId)
    if (!produto) {
      throw new Error(`Produto ${linha.produtoId} não está na lista de preços`)
    }
    return calcularLinha(produto, linha, quantidadeDoGatilho(produto, linhas, produtoPorId))
  })

  const total = arredondar(calculadas.reduce((soma, linha) => soma + linha.subtotal, 0))
  return { linhas: calculadas, total }
}

/** Frase curta da regra, pro botão do produto na tela de venda. */
export function descreverRegra(produto: ProdutoComRegra): string | null {
  switch (produto.regraPreco) {
    case 'ESCALONADO':
      if (produto.precoRegra === null || !produto.quantidadeRegra) return null
      return `${produto.quantidadeRegra} ou mais: ${formatarMoeda(produto.precoRegra)} cada`
    case 'PACOTE':
      if (produto.precoRegra === null || !produto.quantidadeRegra) return null
      return `${produto.quantidadeRegra} por ${formatarMoeda(produto.precoRegra)}`
    case 'LIVRE':
      return 'valor digitado na hora'
    default:
      return null
  }
}

/** Explica de onde saiu o subtotal daquela linha, quando ele não é só
 *  preço × quantidade. Aparece embaixo do item no carrinho, pra quem está
 *  no balcão conferir a conta na frente do cliente. */
export function explicarLinha(
  produto: ProdutoComRegra,
  quantidade: number,
  quantidadeGatilho: number
): string | null {
  if (produto.regraPreco === 'ESCALONADO') {
    const minimo = produto.quantidadeRegra ?? 0
    if (produto.precoRegra === null || minimo <= 0 || quantidadeGatilho < minimo) return null
    return `${quantidade} × ${formatarMoeda(produto.precoRegra)} (${minimo} ou mais)`
  }

  if (produto.regraPreco === 'PACOTE') {
    const tamanho = produto.quantidadeRegra ?? 0
    if (produto.precoRegra === null || tamanho <= 0) return null
    const pacotes = Math.floor(quantidade / tamanho)
    const avulsas = quantidade % tamanho
    if (pacotes === 0) return null
    const partePacote = `${pacotes} × ${tamanho} por ${formatarMoeda(produto.precoRegra)}`
    return avulsas === 0
      ? partePacote
      : `${partePacote} + ${avulsas} a ${formatarMoeda(produto.preco)}`
  }

  return null
}
