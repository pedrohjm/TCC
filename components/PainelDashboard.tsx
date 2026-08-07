'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface Relatorio {
  mes: string
  faturamentoTotal: number
  totalVendas: number
  ticketMedio: number
  porFormaPagamento: { formaPagamento: string; quantidade: number; total: number }[]
  porDia: { dia: string; total: number }[]
  produtosMaisVendidos: { produtoId: number; nome: string; quantidade: number; total: number }[]
  reservas: { comReserva: number; semReserva: number }
  heatmap: { diaSemana: number; hora: number; quantidade: number }[]
}

interface VendaDoMes {
  id: number
  valorTotal: string
  formaPagamento: string
  dataHora: string
  itens: { quantidade: number; produto: { nome: string } }[]
}

const CORES_PAGAMENTO: Record<string, string> = {
  DINHEIRO: '#16a34a',
  CARTAO: '#2563eb',
  PIX: '#9333ea',
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// O formatter do Tooltip do Recharts aceita number | string | array — na
// prática aqui é sempre um number, mas o tipo precisa aceitar o formato
// genérico da biblioteca.
type ValorTooltip = string | number | ReadonlyArray<string | number> | undefined

function paraNumero(valor: ValorTooltip): number {
  return Number(Array.isArray(valor) ? valor[0] : (valor ?? 0))
}

function mesAtualString() {
  const agora = new Date()
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`
}

function somarMeses(mes: string, delta: number) {
  const [ano, m] = mes.split('-').map(Number)
  const data = new Date(Date.UTC(ano, m - 1 + delta, 1))
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, '0')}`
}

// Mesma regra de fuso fixo (UTC-3) usada em lib/relatorios.ts, pra agrupar
// as vendas no mesmo "dia da loja" que o gráfico de faturamento por dia.
const OFFSET_FUSO_LOJA_MS = 3 * 60 * 60 * 1000

function comoLocalDaLoja(dataIso: string): Date {
  return new Date(new Date(dataIso).getTime() - OFFSET_FUSO_LOJA_MS)
}

function chaveDia(dataIso: string): string {
  const local = comoLocalDaLoja(dataIso)
  const ano = local.getUTCFullYear()
  const mesN = String(local.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(local.getUTCDate()).padStart(2, '0')
  return `${ano}-${mesN}-${dia}`
}

function horaLocal(dataIso: string): string {
  const local = comoLocalDaLoja(dataIso)
  return `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}`
}

function formatarDataCurta(dia: string): string {
  const [, mesN, diaN] = dia.split('-')
  return `${diaN}/${mesN}`
}

export default function PainelDashboard() {
  const [mes, setMes] = useState(mesAtualString())
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [vendasDoMes, setVendasDoMes] = useState<VendaDoMes[]>([])
  const [carregandoVendas, setCarregandoVendas] = useState(true)
  const [erroVendas, setErroVendas] = useState<string | null>(null)

  useEffect(() => {
    setCarregando(true)
    setErro(null)
    fetch(`/api/relatorios?mes=${mes}`)
      .then((res) => {
        if (!res.ok) throw new Error('Não foi possível carregar o relatório')
        return res.json()
      })
      .then((dados: Relatorio) => setRelatorio(dados))
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [mes])

  useEffect(() => {
    setCarregandoVendas(true)
    setErroVendas(null)
    fetch(`/api/vendas?mes=${mes}`)
      .then((res) => {
        if (!res.ok) throw new Error('Não foi possível carregar as vendas do mês')
        return res.json()
      })
      .then((dados: VendaDoMes[]) => setVendasDoMes(dados))
      .catch((e: Error) => setErroVendas(e.message))
      .finally(() => setCarregandoVendas(false))
  }, [mes])

  const vendasPorDia = new Map<string, VendaDoMes[]>()
  for (const venda of vendasDoMes) {
    const dia = chaveDia(venda.dataHora)
    const lista = vendasPorDia.get(dia) ?? []
    lista.push(venda)
    vendasPorDia.set(dia, lista)
  }
  const diasComVendas = Array.from(vendasPorDia.keys()).sort().reverse()

  const heatmapMax = relatorio ? Math.max(1, ...relatorio.heatmap.map((h) => h.quantidade)) : 1
  const heatmapPorCelula = new Map(
    relatorio?.heatmap.map((h) => [`${h.diaSemana}-${h.hora}`, h.quantidade]) ?? []
  )

  const totalReservaBalcao = relatorio ? relatorio.reservas.comReserva + relatorio.reservas.semReserva : 0
  const percentualReserva =
    totalReservaBalcao > 0 && relatorio
      ? Math.round((relatorio.reservas.comReserva / totalReservaBalcao) * 100)
      : 0

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4">
      {/* O título "Dashboard" já vem da faixa no topo do painel
          (components/TituloPagina.tsx), então aqui ficam só os controles. */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMes((m) => somarMeses(m, -1))}
            className="rounded border border-gray-300 px-2 py-1 text-sm hover:border-gray-900"
          >
            ← Anterior
          </button>
          <input
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          />
          <button
            type="button"
            onClick={() => setMes((m) => somarMeses(m, 1))}
            className="rounded border border-gray-300 px-2 py-1 text-sm hover:border-gray-900"
          >
            Próximo →
          </button>
        </div>
      </div>

      {carregando && <p className="text-sm text-gray-500">Carregando…</p>}
      {erro && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      {relatorio && (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Faturamento no mês</p>
              <p className="text-lg font-semibold text-gray-900">{formatarMoeda(relatorio.faturamentoTotal)}</p>
            </div>
            <div className="rounded border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Ticket médio</p>
              <p className="text-lg font-semibold text-gray-900">{formatarMoeda(relatorio.ticketMedio)}</p>
            </div>
            <div className="rounded border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Total de vendas</p>
              <p className="text-lg font-semibold text-gray-900">{relatorio.totalVendas}</p>
            </div>
            <div className="rounded border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Vendas com reserva</p>
              <p className="text-lg font-semibold text-gray-900">{percentualReserva}%</p>
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-medium text-gray-600">Faturamento por dia</h2>
            {relatorio.porDia.length === 0 ? (
              <p className="text-sm text-gray-400">Sem vendas neste mês.</p>
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={relatorio.porDia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" tickFormatter={(d: string) => d.slice(8, 10)} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(valor: ValorTooltip) => formatarMoeda(paraNumero(valor))} />
                    <Bar dataKey="total" fill="#111827" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-sm font-medium text-gray-600">
              Vendas do mês <span className="font-normal text-gray-400">(agrupadas por dia)</span>
            </h2>
            {carregandoVendas && <p className="text-sm text-gray-500">Carregando…</p>}
            {erroVendas && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{erroVendas}</p>}
            {!carregandoVendas && diasComVendas.length === 0 && (
              <p className="text-sm text-gray-400">Sem vendas neste mês.</p>
            )}
            <div className="flex flex-col gap-3">
              {diasComVendas.map((dia) => {
                const vendasDoDia = vendasPorDia.get(dia)!
                const totalDoDia = vendasDoDia.reduce((soma, v) => soma + Number(v.valorTotal), 0)
                return (
                  <div key={dia} className="rounded border border-gray-200">
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-1.5">
                      <span className="text-sm font-medium text-gray-700">{formatarDataCurta(dia)}</span>
                      <span className="text-sm font-medium text-gray-700">{formatarMoeda(totalDoDia)}</span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {vendasDoDia.map((venda) => (
                        <li key={venda.id} className="flex items-center justify-between px-3 py-1.5 text-sm">
                          <span className="text-gray-600">
                            {horaLocal(venda.dataHora)} —{' '}
                            {venda.itens.map((item) => `${item.quantidade}x ${item.produto.nome}`).join(', ')}
                          </span>
                          <span className="flex items-center gap-2 whitespace-nowrap text-gray-900">
                            <span className="text-xs text-gray-400">{venda.formaPagamento}</span>
                            {formatarMoeda(Number(venda.valorTotal))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-2 text-sm font-medium text-gray-600">Forma de pagamento</h2>
              {relatorio.porFormaPagamento.length === 0 ? (
                <p className="text-sm text-gray-400">Sem vendas neste mês.</p>
              ) : (
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={relatorio.porFormaPagamento} dataKey="total" nameKey="formaPagamento" outerRadius={80} label>
                        {relatorio.porFormaPagamento.map((item) => (
                          <Cell key={item.formaPagamento} fill={CORES_PAGAMENTO[item.formaPagamento] ?? '#999'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(valor: ValorTooltip) => formatarMoeda(paraNumero(valor))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-2 text-sm font-medium text-gray-600">Produtos mais vendidos</h2>
              {relatorio.produtosMaisVendidos.length === 0 ? (
                <p className="text-sm text-gray-400">Sem vendas neste mês.</p>
              ) : (
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <BarChart data={relatorio.produtosMaisVendidos} layout="vertical" margin={{ left: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={12} />
                      <YAxis type="category" dataKey="nome" width={100} fontSize={12} />
                      <Tooltip formatter={(valor: ValorTooltip) => `${paraNumero(valor)} un.`} />
                      <Bar dataKey="quantidade" fill="#111827" radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-medium text-gray-600">
              Horários de maior movimento <span className="font-normal text-gray-400">(dia × hora)</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="w-10" />
                    {Array.from({ length: 24 }, (_, hora) => (
                      <th key={hora} className="w-6 px-0.5 py-1 text-center font-normal text-gray-400">
                        {hora}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DIAS_SEMANA.map((nomeDia, diaSemana) => (
                    <tr key={nomeDia}>
                      <td className="pr-2 text-right text-gray-500">{nomeDia}</td>
                      {Array.from({ length: 24 }, (_, hora) => {
                        const quantidade = heatmapPorCelula.get(`${diaSemana}-${hora}`) ?? 0
                        const intensidade = quantidade / heatmapMax
                        return (
                          <td key={hora} className="p-0.5">
                            <div
                              title={`${nomeDia} ${hora}h — ${quantidade} venda(s)`}
                              className="h-5 w-5 rounded-sm"
                              style={{
                                backgroundColor:
                                  quantidade === 0 ? '#f3f4f6' : `rgba(17, 24, 39, ${0.15 + intensidade * 0.85})`,
                              }}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
