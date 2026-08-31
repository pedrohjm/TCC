/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarDays, ChevronLeft, ChevronRight, Receipt, TrendingUp, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Relatorio {
  mes: string
  faturamentoTotal: number
  totalVendas: number
  ticketMedio: number
  porFormaPagamento: { formaPagamento: string; quantidade: number; total: number }[]
  porDia: { dia: string; total: number }[]
  porSemana: { semana: string; total: number }[]
  porMes: { mes: string; total: number }[]
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

type Granularidade = 'mes' | 'semana' | 'dia'

// Cores vindas dos tokens do tema (globals.css), não fixas como antes —
// assim o painel acompanha claro/escuro igual ao resto do site. O Recharts
// aceita `var(...)` direto porque o valor vai parar num atributo SVG.
const COR_FATURAMENTO = 'var(--chart-1)'
const CORES_PAGAMENTO: Record<string, string> = {
  DINHEIRO: 'var(--chart-2)',
  CARTAO: 'var(--chart-5)',
  PIX: 'var(--chart-3)',
}
const COR_PAGAMENTO_PADRAO = 'var(--chart-4)'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const GRANULARIDADES: { valor: Granularidade; rotulo: string }[] = [
  { valor: 'mes', rotulo: 'Por mês' },
  { valor: 'semana', rotulo: 'Por semana' },
  { valor: 'dia', rotulo: 'Por dia' },
]

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Valores grandes no eixo Y viram "1,2 mil" pra não estourar a largura.
function formatarMoedaCurta(valor: number) {
  if (Math.abs(valor) >= 1000) return `${(valor / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
  return String(valor)
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

const NOMES_MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function formatarMesCurto(mes: string): string {
  const [ano, m] = mes.split('-').map(Number)
  return `${NOMES_MES[m - 1]}/${String(ano).slice(2)}`
}

// "2026-08-03" (a segunda-feira) vira "03/08 a 09/08".
function formatarSemana(semana: string): string {
  const [ano, m, d] = semana.split('-').map(Number)
  const segunda = new Date(Date.UTC(ano, m - 1, d))
  const domingo = new Date(segunda.getTime() + 6 * 24 * 60 * 60 * 1000)
  const dd = (data: Date) =>
    `${String(data.getUTCDate()).padStart(2, '0')}/${String(data.getUTCMonth() + 1).padStart(2, '0')}`
  return `${dd(segunda)} a ${dd(domingo)}`
}

function Cartao({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-xl bg-card p-4 ring-1 ring-foreground/10', className)}>{children}</div>
  )
}

// Cartão de número grande, no formato do modelo: quadradinho colorido +
// rótulo pequeno em cima, número grande embaixo.
function CartaoIndicador({
  rotulo,
  valor,
  icone: Icone,
}: {
  rotulo: string
  valor: string
  icone: typeof Wallet
}) {
  return (
    <Cartao>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/15 text-primary">
          <Icone className="h-3 w-3" />
        </span>
        {rotulo}
      </div>
      <p className="mt-3 font-heading text-2xl font-bold tracking-tight">{valor}</p>
    </Cartao>
  )
}

function TituloCartao({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
      {children}
    </h2>
  )
}

function SemDados() {
  return <p className="py-8 text-center text-sm text-muted-foreground">Sem vendas neste período.</p>
}

// Cor de linha/eixo dos gráficos: o Recharts pinta em SVG, então dá pra
// usar os mesmos tokens do tema.
const EIXO = { fontSize: 11, stroke: 'var(--muted-foreground)' }

export default function PainelDashboard() {
  const [mes, setMes] = useState(mesAtualString())
  const [granularidade, setGranularidade] = useState<Granularidade>('dia')
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

  // Os três recortes do faturamento pedidos: mês, semana e dia. "Por mês"
  // olha os últimos 12 meses (comparação entre meses); os outros dois ficam
  // dentro do mês selecionado.
  const serieFaturamento = (() => {
    if (!relatorio) return { dados: [] as { rotulo: string; total: number }[], titulo: '' }
    if (granularidade === 'mes') {
      return {
        dados: relatorio.porMes.map((p) => ({ rotulo: formatarMesCurto(p.mes), total: p.total })),
        titulo: 'Faturamento mês a mês (últimos 12 meses)',
      }
    }
    if (granularidade === 'semana') {
      return {
        dados: relatorio.porSemana.map((p) => ({ rotulo: formatarSemana(p.semana), total: p.total })),
        titulo: 'Faturamento por semana (dentro do mês)',
      }
    }
    return {
      dados: relatorio.porDia.map((p) => ({ rotulo: formatarDataCurta(p.dia), total: p.total })),
      titulo: 'Faturamento por dia',
    }
  })()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4">
      {/* O título "Dashboard" já vem da faixa no topo do painel
          (components/TituloPagina.tsx), então aqui ficam só os controles. */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setMes((m) => somarMeses(m, -1))}
          aria-label="Mês anterior"
          className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          aria-label="Mês do relatório"
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button
          type="button"
          onClick={() => setMes((m) => somarMeses(m, 1))}
          aria-label="Próximo mês"
          className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {carregando && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {erro && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{erro}</p>}

      {relatorio && (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <CartaoIndicador
              rotulo="Faturamento no mês"
              valor={formatarMoeda(relatorio.faturamentoTotal)}
              icone={Wallet}
            />
            <CartaoIndicador
              rotulo="Total de vendas"
              valor={String(relatorio.totalVendas)}
              icone={Receipt}
            />
            <CartaoIndicador
              rotulo="Ticket médio"
              valor={formatarMoeda(relatorio.ticketMedio)}
              icone={TrendingUp}
            />
            <CartaoIndicador
              rotulo="Vendas com reserva"
              valor={`${percentualReserva}%`}
              icone={CalendarDays}
            />
          </section>

          <Cartao>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <TituloCartao>{serieFaturamento.titulo}</TituloCartao>
              {/* Os três recortes pedidos: mês, semana e dia. */}
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                {GRANULARIDADES.map((opcao) => (
                  <button
                    key={opcao.valor}
                    type="button"
                    onClick={() => setGranularidade(opcao.valor)}
                    aria-pressed={granularidade === opcao.valor}
                    className={cn(
                      'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                      granularidade === opcao.valor
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>
            </div>

            {serieFaturamento.dados.length === 0 ? (
              <SemDados />
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={serieFaturamento.dados} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="rotulo" tick={EIXO} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={EIXO}
                      tickLine={false}
                      axisLine={false}
                      width={56}
                      tickFormatter={(v: number) => formatarMoedaCurta(v)}
                    />
                    <Tooltip
                      formatter={(valor: ValorTooltip) => [formatarMoeda(paraNumero(valor)), 'Faturamento']}
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 12,
                        color: 'var(--popover-foreground)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke={COR_FATURAMENTO}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: COR_FATURAMENTO }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Cartao>

          <section className="grid gap-4 lg:grid-cols-2">
            <Cartao>
              <TituloCartao>Forma de pagamento</TituloCartao>
              {relatorio.porFormaPagamento.length === 0 ? (
                <SemDados />
              ) : (
                // Rosca em cima e legenda embaixo (e não lado a lado): o
                // cartão tem ~330px dentro do quadro central, e lado a lado
                // sobrava tão pouco pra legenda que o valor em reais saía
                // cortado no meio ("R$ 31,0…").
                <div className="flex flex-col items-center gap-3">
                  <div style={{ width: 150, height: 150 }} className="shrink-0">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={relatorio.porFormaPagamento}
                          dataKey="total"
                          nameKey="formaPagamento"
                          innerRadius={38}
                          outerRadius={68}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {relatorio.porFormaPagamento.map((item) => (
                            <Cell
                              key={item.formaPagamento}
                              fill={CORES_PAGAMENTO[item.formaPagamento] ?? COR_PAGAMENTO_PADRAO}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(valor: ValorTooltip) => formatarMoeda(paraNumero(valor))}
                          contentStyle={{
                            background: 'var(--popover)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            fontSize: 12,
                            color: 'var(--popover-foreground)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legenda escrita à mão: o Legend do Recharts não mostra
                      valor nem percentual, e é isso que interessa aqui. */}
                  <ul className="flex w-full flex-col gap-2 text-sm">
                    {relatorio.porFormaPagamento.map((item) => {
                      const fatia =
                        relatorio.faturamentoTotal > 0
                          ? Math.round((item.total / relatorio.faturamentoTotal) * 100)
                          : 0
                      return (
                        <li key={item.formaPagamento} className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                            style={{
                              background:
                                CORES_PAGAMENTO[item.formaPagamento] ?? COR_PAGAMENTO_PADRAO,
                            }}
                          />
                          <span className="flex-1 text-muted-foreground capitalize">
                            {item.formaPagamento.toLowerCase()}
                          </span>
                          <span className="font-medium">{fatia}%</span>
                          <span className="shrink-0 text-right text-xs whitespace-nowrap text-muted-foreground">
                            {formatarMoeda(item.total)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </Cartao>

            <Cartao>
              <TituloCartao>Produtos mais vendidos</TituloCartao>
              {relatorio.produtosMaisVendidos.length === 0 ? (
                <SemDados />
              ) : (
                <div style={{ width: '100%', height: 190 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={relatorio.produtosMaisVendidos.slice(0, 5)}
                      layout="vertical"
                      margin={{ left: 8, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" tick={EIXO} tickLine={false} axisLine={false} />
                      <YAxis
                        type="category"
                        dataKey="nome"
                        width={110}
                        tick={EIXO}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'var(--muted)' }}
                        formatter={(valor: ValorTooltip) => [`${paraNumero(valor)} un.`, 'Vendidos']}
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 12,
                          color: 'var(--popover-foreground)',
                        }}
                      />
                      <Bar dataKey="quantidade" fill={COR_FATURAMENTO} radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Cartao>
          </section>

          <Cartao>
            <TituloCartao>Horários de maior movimento (dia × hora)</TituloCartao>
            <div className="overflow-x-auto">
              <table className="border-collapse text-[0.65rem]">
                <thead>
                  <tr>
                    <th className="w-8" />
                    {Array.from({ length: 24 }, (_, hora) => (
                      <th key={hora} className="w-5 px-0.5 py-1 text-center font-normal text-muted-foreground">
                        {hora}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DIAS_SEMANA.map((nomeDia, diaSemana) => (
                    <tr key={nomeDia}>
                      <td className="pr-2 text-right text-muted-foreground">{nomeDia}</td>
                      {Array.from({ length: 24 }, (_, hora) => {
                        const quantidade = heatmapPorCelula.get(`${diaSemana}-${hora}`) ?? 0
                        const intensidade = quantidade / heatmapMax
                        return (
                          <td key={hora} className="p-0.5">
                            <div
                              title={`${nomeDia} ${hora}h — ${quantidade} venda(s)`}
                              className={cn('h-4 w-4 rounded-sm', quantidade === 0 && 'bg-muted')}
                              style={
                                quantidade === 0
                                  ? undefined
                                  : {
                                      backgroundColor: COR_FATURAMENTO,
                                      opacity: 0.25 + intensidade * 0.75,
                                    }
                              }
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Cartao>

          <Cartao>
            <TituloCartao>Vendas do mês (agrupadas por dia)</TituloCartao>
            {carregandoVendas && <p className="text-sm text-muted-foreground">Carregando…</p>}
            {erroVendas && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{erroVendas}</p>
            )}
            {!carregandoVendas && diasComVendas.length === 0 && <SemDados />}
            {diasComVendas.length > 0 && (
              // Rolagem interna: a lista cresce com o mês inteiro e, solta,
              // empurraria o resto do painel pra bem longe.
              <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
                {diasComVendas.map((dia) => {
                  const vendasDoDia = vendasPorDia.get(dia)!
                  const totalDoDia = vendasDoDia.reduce((soma, v) => soma + Number(v.valorTotal), 0)
                  return (
                    <div key={dia} className="overflow-hidden rounded-lg border border-border">
                      <div className="flex items-center justify-between border-b border-border bg-muted/60 px-3 py-1.5">
                        <span className="text-sm font-medium">{formatarDataCurta(dia)}</span>
                        <span className="text-sm font-medium">{formatarMoeda(totalDoDia)}</span>
                      </div>
                      <ul className="divide-y divide-border">
                        {vendasDoDia.map((venda) => (
                          <li
                            key={venda.id}
                            className="flex items-center justify-between gap-3 px-3 py-1.5 text-sm"
                          >
                            <span className="text-muted-foreground">
                              {horaLocal(venda.dataHora)} —{' '}
                              {venda.itens
                                .map((item) => `${item.quantidade}x ${item.produto.nome}`)
                                .join(', ')}
                            </span>
                            <span className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                              <span className="text-xs text-muted-foreground">{venda.formaPagamento}</span>
                              {formatarMoeda(Number(venda.valorTotal))}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}
          </Cartao>
        </>
      )}
    </div>
  )
}
