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

export default function PainelDashboard() {
  const [mes, setMes] = useState(mesAtualString())
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
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
