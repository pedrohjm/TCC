import { Prisma } from '@/app/generated/prisma/client'

export type VendaComItens = Prisma.VendaGetPayload<{
  include: { itens: { include: { produto: true } } }
}>

export interface Relatorio {
  faturamentoTotal: number
  totalVendas: number
  ticketMedio: number
  porFormaPagamento: { formaPagamento: string; quantidade: number; total: number }[]
  porDia: { dia: string; total: number }[]
  produtosMaisVendidos: { produtoId: number; nome: string; quantidade: number; total: number }[]
  reservas: { comReserva: number; semReserva: number }
  heatmap: { diaSemana: number; hora: number; quantidade: number }[]
}

// A sorveteria fica no fuso America/Sao_Paulo, que é UTC-3 fixo (Brasil não
// tem mais horário de verão desde 2019 — por isso um offset fixo é seguro
// aqui, sem precisar de biblioteca de fuso horário). O servidor em produção
// normalmente roda em UTC, então sem essa conversão os dias/horários do
// relatório ficariam errados.
const OFFSET_FUSO_LOJA_MS = 3 * 60 * 60 * 1000

function comoLocalDaLoja(data: Date): Date {
  return new Date(data.getTime() - OFFSET_FUSO_LOJA_MS)
}

function chaveDia(data: Date): string {
  const local = comoLocalDaLoja(data)
  const ano = local.getUTCFullYear()
  const mes = String(local.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(local.getUTCDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function diaSemanaEHora(data: Date): { diaSemana: number; hora: number } {
  const local = comoLocalDaLoja(data)
  return { diaSemana: local.getUTCDay(), hora: local.getUTCHours() }
}

// Limites (em UTC) do mês `mesIndex0` (0-11) de `ano`, já considerando que
// "meia-noite local da loja" é 03:00 UTC.
export function limitesDoMes(ano: number, mesIndex0: number): { inicio: Date; fim: Date } {
  const offsetHoras = OFFSET_FUSO_LOJA_MS / (60 * 60 * 1000)
  const inicio = new Date(Date.UTC(ano, mesIndex0, 1, offsetHoras, 0, 0))
  const fim = new Date(Date.UTC(ano, mesIndex0 + 1, 1, offsetHoras, 0, 0))
  return { inicio, fim }
}

export function calcularRelatorio(vendas: VendaComItens[]): Relatorio {
  const totalVendas = vendas.length
  const faturamentoTotal = vendas.reduce((soma, venda) => soma + Number(venda.valorTotal), 0)
  const ticketMedio = totalVendas > 0 ? faturamentoTotal / totalVendas : 0

  const porFormaPagamentoMap = new Map<string, { quantidade: number; total: number }>()
  const porDiaMap = new Map<string, number>()
  const produtoMap = new Map<number, { nome: string; quantidade: number; total: number }>()
  const heatmapMap = new Map<string, number>()
  let comReserva = 0

  for (const venda of vendas) {
    const valor = Number(venda.valorTotal)

    const forma = porFormaPagamentoMap.get(venda.formaPagamento) ?? { quantidade: 0, total: 0 }
    forma.quantidade += 1
    forma.total += valor
    porFormaPagamentoMap.set(venda.formaPagamento, forma)

    const dia = chaveDia(venda.dataHora)
    porDiaMap.set(dia, (porDiaMap.get(dia) ?? 0) + valor)

    const { diaSemana, hora } = diaSemanaEHora(venda.dataHora)
    const chaveHeatmap = `${diaSemana}-${hora}`
    heatmapMap.set(chaveHeatmap, (heatmapMap.get(chaveHeatmap) ?? 0) + 1)

    if (venda.reservaId) comReserva += 1

    for (const item of venda.itens) {
      const atual = produtoMap.get(item.produtoId) ?? {
        nome: item.produto.nome,
        quantidade: 0,
        total: 0,
      }
      atual.quantidade += item.quantidade
      atual.total += Number(item.precoUnitario) * item.quantidade
      produtoMap.set(item.produtoId, atual)
    }
  }

  const porFormaPagamento = Array.from(porFormaPagamentoMap.entries()).map(([formaPagamento, dados]) => ({
    formaPagamento,
    ...dados,
  }))

  const porDia = Array.from(porDiaMap.entries())
    .map(([dia, total]) => ({ dia, total }))
    .sort((a, b) => a.dia.localeCompare(b.dia))

  const produtosMaisVendidos = Array.from(produtoMap.entries())
    .map(([produtoId, dados]) => ({ produtoId, ...dados }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10)

  const heatmap = Array.from(heatmapMap.entries()).map(([chave, quantidade]) => {
    const [diaSemana, hora] = chave.split('-').map(Number)
    return { diaSemana, hora, quantidade }
  })

  return {
    faturamentoTotal,
    totalVendas,
    ticketMedio,
    porFormaPagamento,
    porDia,
    produtosMaisVendidos,
    reservas: { comReserva, semReserva: totalVendas - comReserva },
    heatmap,
  }
}
