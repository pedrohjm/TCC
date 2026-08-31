import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { exigirSessao, exigirDono } from '@/lib/auth-helpers'
import { agruparPorMes, calcularRelatorio, limitesDoMes, ultimosMeses } from '@/lib/relatorios'

// Quantos meses a série "por mês" do dashboard mostra, terminando no mês
// selecionado.
const MESES_NA_SERIE = 12

export async function GET(request: NextRequest) {
  const { sessao, erro: erroSessao } = await exigirSessao()
  if (erroSessao) return erroSessao
  const erroPermissao = exigirDono(sessao)
  if (erroPermissao) return erroPermissao

  const { searchParams } = new URL(request.url)
  const mesParam = searchParams.get('mes') // "AAAA-MM", padrão: mês atual

  const agora = new Date()
  let ano = agora.getUTCFullYear()
  let mesIndex0 = agora.getUTCMonth()

  if (mesParam) {
    const match = /^(\d{4})-(\d{2})$/.exec(mesParam)
    if (!match) {
      return NextResponse.json({ erro: 'Parâmetro "mes" deve estar no formato AAAA-MM' }, { status: 400 })
    }
    ano = Number(match[1])
    mesIndex0 = Number(match[2]) - 1
  }

  const { inicio, fim } = limitesDoMes(ano, mesIndex0)

  const vendas = await prisma.venda.findMany({
    where: { dataHora: { gte: inicio, lt: fim } },
    include: { itens: { include: { produto: true } } },
  })

  const relatorio = calcularRelatorio(vendas)
  const mes = `${ano}-${String(mesIndex0 + 1).padStart(2, '0')}`

  // Série mês a mês: consulta à parte porque, ao contrário do resto do
  // relatório, ela olha pra trás além do mês selecionado. Só traz data e
  // valor (sem os itens), que é tudo que a soma por mês precisa.
  const meses = ultimosMeses(ano, mesIndex0, MESES_NA_SERIE)
  const inicioSerie = limitesDoMes(ano, mesIndex0 - (MESES_NA_SERIE - 1)).inicio
  const vendasDaSerie = await prisma.venda.findMany({
    where: { dataHora: { gte: inicioSerie, lt: fim } },
    select: { dataHora: true, valorTotal: true },
  })
  const porMes = agruparPorMes(vendasDaSerie, meses)

  return NextResponse.json({ mes, ...relatorio, porMes })
}
