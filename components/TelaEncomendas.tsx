/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useCallback, useEffect, useState } from 'react'
import { CalendarClock, Check, Eraser, PackageCheck, Plus, Trash2, Undo2, X } from 'lucide-react'
import {
  QUANTIDADE_MAXIMA,
  type StatusEncomendaValor,
  type TipoEncomendaValor,
} from '@/lib/validations/encomenda'
import { formasPagamento } from '@/lib/validations/venda'
import { formatarMoeda } from '@/lib/precos'
import { cn } from '@/lib/utils'

type FormaPagamento = (typeof formasPagamento)[number]

const ROTULO_PAGAMENTO: Record<FormaPagamento, string> = {
  DINHEIRO: 'Dinheiro',
  CARTAO: 'Cartão',
  PIX: 'Pix',
}

interface SaborResumo {
  id: number
  nome: string
}

interface Encomenda {
  id: number
  nomeCliente: string
  saborId: number
  sabor: SaborResumo
  tipo: TipoEncomendaValor
  quantidade: number
  dataEntrega: string
  status: StatusEncomendaValor
  observacao: string | null
  /** A venda gerada ao entregar. Null enquanto a encomenda não foi entregue. */
  venda: { id: number; valorTotal: string; formaPagamento: string } | null
}

const TIPOS: { valor: TipoEncomendaValor; rotulo: string }[] = [
  { valor: 'POTE', rotulo: 'Pote' },
  { valor: 'CAIXA', rotulo: 'Caixa' },
]

// A ordem aqui é a ordem das abas e também o caminho que a encomenda
// percorre: chega pendente, é produzida, o cliente retira.
const STATUS: {
  valor: StatusEncomendaValor
  rotulo: string
  descricao: string
  cor: string
}[] = [
  {
    valor: 'PENDENTE',
    rotulo: 'A fazer',
    descricao: 'Ainda precisa ser produzida.',
    cor: 'bg-destructive/10 text-destructive',
  },
  {
    valor: 'FEITO',
    rotulo: 'Pronta',
    descricao: 'Já está feita, esperando o cliente buscar.',
    cor: 'bg-primary/15 text-primary',
  },
  {
    valor: 'ENTREGUE',
    rotulo: 'Entregue',
    descricao: 'O cliente já retirou.',
    cor: 'bg-secondary text-secondary-foreground',
  },
]

type Aba = StatusEncomendaValor | 'TODAS'

const ABAS: { valor: Aba; rotulo: string }[] = [
  { valor: 'PENDENTE', rotulo: 'A fazer' },
  { valor: 'FEITO', rotulo: 'Prontas' },
  { valor: 'ENTREGUE', rotulo: 'Entregues' },
  { valor: 'TODAS', rotulo: 'Todas' },
]

function infoStatus(valor: StatusEncomendaValor) {
  return STATUS.find((status) => status.valor === valor)!
}

/** A mesma ordem que `GET /api/encomendas` usa: quem vence antes primeiro.
 *  Precisa existir aqui também porque a tela insere a encomenda nova sem
 *  recarregar — sem reordenar, um pedido atrasado lançado agora apareceria
 *  no fim da fila, que é justamente o contrário do que a tela serve pra
 *  mostrar. */
function emOrdemDeEntrega(lista: Encomenda[]): Encomenda[] {
  return [...lista].sort(
    (a, b) => a.dataEntrega.localeCompare(b.dataEntrega) || a.id - b.id
  )
}

/** `dataEntrega` vem do banco em UTC; sem o fatiar, um pedido do dia 5
 *  aparece como dia 4 pra quem está no Brasil. Aqui só interessa o dia. */
function formatarData(iso: string) {
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

function hojeISO() {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}

/** "Hoje", "Amanhã", "Atrasada há 2 dias" — no balcão isso diz mais que a
 *  data crua, que é o que decide o que produzir primeiro. */
function prazoEmPalavras(iso: string): { texto: string; atrasada: boolean } | null {
  const dias = Math.round(
    (Date.parse(`${iso.slice(0, 10)}T00:00:00`) - Date.parse(`${hojeISO()}T00:00:00`)) / 86_400_000
  )
  if (dias === 0) return { texto: 'hoje', atrasada: false }
  if (dias === 1) return { texto: 'amanhã', atrasada: false }
  if (dias > 1) return { texto: `em ${dias} dias`, atrasada: false }
  return { texto: dias === -1 ? 'atrasada 1 dia' : `atrasada ${-dias} dias`, atrasada: true }
}

export default function TelaEncomendas() {
  const [encomendas, setEncomendas] = useState<Encomenda[]>([])
  const [sabores, setSabores] = useState<SaborResumo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [aba, setAba] = useState<Aba>('PENDENTE')

  // Formulário
  const [nomeCliente, setNomeCliente] = useState('')
  const [saborId, setSaborId] = useState<string>('')
  const [tipo, setTipo] = useState<TipoEncomendaValor>('POTE')
  const [quantidade, setQuantidade] = useState('1')
  const [dataEntrega, setDataEntrega] = useState(hojeISO())
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState<string | null>(null)

  // Entregar gera a venda, e venda precisa de forma de pagamento — então
  // o botão "Entregue" abre esta escolha em vez de agir direto.
  const [entregando, setEntregando] = useState<Encomenda | null>(null)
  // Limpar a lista inteira é irreversível — pede confirmação na própria tela.
  const [confirmandoLimpeza, setConfirmandoLimpeza] = useState(false)

  const carregar = useCallback(async () => {
    setErro(null)
    try {
      const [respEncomendas, respSabores] = await Promise.all([
        fetch('/api/encomendas'),
        fetch('/api/sabores'),
      ])
      if (!respEncomendas.ok) throw new Error('Não foi possível carregar as encomendas')
      if (!respSabores.ok) throw new Error('Não foi possível carregar os sabores')
      setEncomendas(await respEncomendas.json())
      setSabores(await respSabores.json())
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const podeSalvar =
    nomeCliente.trim().length > 0 && saborId !== '' && Number(quantidade) > 0 && !salvando

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault()
    if (!podeSalvar) return

    setSalvando(true)
    setErro(null)
    setSucesso(null)
    try {
      const resposta = await fetch('/api/encomendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCliente: nomeCliente.trim(),
          saborId: Number(saborId),
          tipo,
          quantidade: Number(quantidade),
          // Meio-dia e não meia-noite: salvando a data "crua" em UTC, o
          // fuso do Brasil (-3) jogaria o pedido pro dia anterior.
          dataEntrega: `${dataEntrega}T12:00:00`,
          observacao: observacao.trim() || undefined,
        }),
      })
      const dados = await resposta.json()
      if (!resposta.ok) throw new Error(dados?.erro ?? 'Não foi possível salvar a encomenda')

      setEncomendas((atual) => emOrdemDeEntrega([...atual, dados]))
      setSucesso(`Encomenda de ${dados.nomeCliente} registrada.`)
      setNomeCliente('')
      setQuantidade('1')
      setObservacao('')
      // Sabor, tipo e data continuam preenchidos de propósito: no balcão,
      // encomendas costumam vir em sequência com os mesmos valores.
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado')
    } finally {
      setSalvando(false)
    }
  }

  async function mudarStatus(
    encomenda: Encomenda,
    status: StatusEncomendaValor,
    formaPagamento?: FormaPagamento
  ) {
    setErro(null)
    setSucesso(null)
    // Troca na tela antes da resposta: no balcão o clique precisa responder
    // na hora. Se a rota recusar, o estado anterior volta.
    const anterior = encomendas
    setEncomendas((atual) =>
      atual.map((item) => (item.id === encomenda.id ? { ...item, status } : item))
    )
    try {
      const resposta = await fetch(`/api/encomendas/${encomenda.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formaPagamento ? { status, formaPagamento } : { status }),
      })
      const dados = await resposta.json().catch(() => null)
      if (!resposta.ok) {
        throw new Error(dados?.erro ?? 'Não foi possível mudar o status')
      }
      // A resposta traz a encomenda já com (ou já sem) a venda amarrada —
      // é o que faz o valor aparecer na linha logo depois de entregar.
      if (dados) {
        setEncomendas((atual) =>
          atual.map((item) => (item.id === encomenda.id ? dados : item))
        )
      }
      if (status === 'ENTREGUE' && dados?.venda) {
        setSucesso(
          `Entrega de ${dados.nomeCliente} registrada — venda de ${formatarMoeda(Number(dados.venda.valorTotal))} lançada.`
        )
      }
      if (anterior.find((item) => item.id === encomenda.id)?.venda && status !== 'ENTREGUE') {
        setSucesso(`Entrega desfeita — a venda de ${encomenda.nomeCliente} foi apagada.`)
      }
    } catch (e) {
      setEncomendas(anterior)
      setErro(e instanceof Error ? e.message : 'Erro inesperado')
    }
  }

  async function apagar(encomenda: Encomenda) {
    setErro(null)
    setSucesso(null)
    const anterior = encomendas
    setEncomendas((atual) => atual.filter((item) => item.id !== encomenda.id))
    try {
      const resposta = await fetch(`/api/encomendas/${encomenda.id}`, { method: 'DELETE' })
      if (!resposta.ok && resposta.status !== 204) {
        const dados = await resposta.json().catch(() => null)
        throw new Error(dados?.erro ?? 'Não foi possível apagar')
      }
    } catch (e) {
      setEncomendas(anterior)
      setErro(e instanceof Error ? e.message : 'Erro inesperado')
    }
  }

  async function limparEntregues() {
    setConfirmandoLimpeza(false)
    setErro(null)
    setSucesso(null)
    const anterior = encomendas
    setEncomendas((atual) => atual.filter((item) => item.status !== 'ENTREGUE'))
    try {
      const resposta = await fetch('/api/encomendas?status=ENTREGUE', { method: 'DELETE' })
      const dados = await resposta.json().catch(() => null)
      if (!resposta.ok) throw new Error(dados?.erro ?? 'Não foi possível limpar')
      setSucesso(
        `${dados.apagadas} encomenda(s) entregue(s) apagada(s). As vendas continuam no faturamento.`
      )
    } catch (e) {
      setEncomendas(anterior)
      setErro(e instanceof Error ? e.message : 'Erro inesperado')
    }
  }

  const visiveis = encomendas.filter((item) => aba === 'TODAS' || item.status === aba)
  const contagem = (valor: Aba) =>
    valor === 'TODAS'
      ? encomendas.length
      : encomendas.filter((item) => item.status === valor).length

  const classeCampo =
    'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4">
      {/* ---------- nova encomenda ---------- */}
      <form onSubmit={salvar} className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Plus className="h-4 w-4" />
          Nova encomenda
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="nomeCliente" className="mb-1 block text-xs text-muted-foreground">
              Nome do cliente
            </label>
            <input
              id="nomeCliente"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              placeholder="Quem encomendou"
              className={classeCampo}
            />
          </div>

          <div>
            <label htmlFor="sabor" className="mb-1 block text-xs text-muted-foreground">
              Sabor
            </label>
            <select
              id="sabor"
              value={saborId}
              onChange={(e) => setSaborId(e.target.value)}
              className={classeCampo}
            >
              <option value="">Escolha o sabor…</option>
              {sabores.map((sabor) => (
                <option key={sabor.id} value={sabor.id}>
                  {sabor.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-1 block text-xs text-muted-foreground">Tipo</span>
            <div className="flex gap-2">
              {TIPOS.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => setTipo(opcao.valor)}
                  aria-pressed={tipo === opcao.valor}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    tipo === opcao.valor
                      ? 'border-primary bg-primary-soft text-primary-foreground shadow-sm'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="quantidade" className="mb-1 block text-xs text-muted-foreground">
              Quantidade
            </label>
            <input
              id="quantidade"
              type="number"
              min={1}
              max={QUANTIDADE_MAXIMA}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className={classeCampo}
            />
          </div>

          <div>
            <label htmlFor="dataEntrega" className="mb-1 block text-xs text-muted-foreground">
              Data de entrega
            </label>
            <input
              id="dataEntrega"
              type="date"
              value={dataEntrega}
              onChange={(e) => setDataEntrega(e.target.value)}
              className={classeCampo}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="observacao" className="mb-1 block text-xs text-muted-foreground">
              Observação <span className="text-muted-foreground/70">(opcional)</span>
            </label>
            <input
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              maxLength={500}
              placeholder="Ex.: sem açúcar, escrever Parabéns na tampa."
              className={classeCampo}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!podeSalvar}
          className="mt-4 w-full rounded-lg bg-primary-soft py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-soft/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {salvando ? 'Salvando…' : 'Registrar encomenda'}
        </button>
      </form>

      {/* ---------- lista ---------- */}
      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {ABAS.map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              onClick={() => setAba(opcao.valor)}
              aria-pressed={aba === opcao.valor}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                aba === opcao.valor
                  ? 'border-primary bg-primary-soft text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
              )}
            >
              {opcao.rotulo}
              <span className="ml-1.5 text-xs opacity-70">{contagem(opcao.valor)}</span>
            </button>
          ))}

          {/* A aba "Entregues" só cresce; sem isto, limpar a lista depois de
              alguns meses seria apagar uma a uma. Só aparece quando há o
              que limpar. */}
          {contagem('ENTREGUE') > 0 && (
            <button
              type="button"
              onClick={() => setConfirmandoLimpeza(true)}
              className="ml-auto flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
            >
              <Eraser className="h-3.5 w-3.5" />
              Limpar entregues
            </button>
          )}
        </div>

        {confirmandoLimpeza && (
          <div className="mb-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
            <p className="text-sm text-foreground">
              Apagar as {contagem('ENTREGUE')} encomendas já entregues?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              As vendas que elas geraram <strong className="font-semibold">continuam</strong> no
              faturamento — só o registro da encomenda sai da lista. Não dá pra desfazer.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={limparEntregues}
                className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                Apagar
              </button>
              <button
                type="button"
                onClick={() => setConfirmandoLimpeza(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* As mensagens ficam aqui, coladas na lista, e não lá em cima
            junto do formulário: mudar o status tira a linha da aba atual
            (entregar move de "Prontas" pra "Entregues"), e sem a confirmação
            ao alcance do olho a tela parece não ter feito nada. */}
        {erro && (
          <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {erro}
          </p>
        )}
        {sucesso && (
          <p className="mb-3 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
            {sucesso}
          </p>
        )}

        {carregando && <p className="text-sm text-muted-foreground">Carregando encomendas…</p>}

        {!carregando && visiveis.length === 0 && (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            {aba === 'PENDENTE'
              ? 'Nenhuma encomenda esperando ser feita.'
              : 'Nada por aqui ainda.'}
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {visiveis.map((encomenda) => {
            const status = infoStatus(encomenda.status)
            // Encomenda já entregue não tem prazo a cobrar.
            const prazo =
              encomenda.status === 'ENTREGUE' ? null : prazoEmPalavras(encomenda.dataEntrega)

            return (
              <li
                key={encomenda.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-foreground">
                      {encomenda.nomeCliente}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase',
                        status.cor
                      )}
                    >
                      {status.rotulo}
                    </span>
                  </div>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {encomenda.quantidade}× {encomenda.tipo === 'POTE' ? 'pote' : 'caixa'} de{' '}
                    <span className="text-foreground">{encomenda.sabor.nome}</span>
                  </p>

                  <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                    {formatarData(encomenda.dataEntrega)}
                    {prazo && (
                      <span className={cn(prazo.atrasada && 'font-semibold text-destructive')}>
                        · {prazo.texto}
                      </span>
                    )}
                  </p>

                  {encomenda.observacao && (
                    <p className="mt-1 text-xs text-muted-foreground italic">
                      {encomenda.observacao}
                    </p>
                  )}

                  {/* Entregue = venda lançada. Mostrar o valor aqui é o que
                      deixa claro que a entrega mexeu no caixa. */}
                  {encomenda.venda && (
                    <p className="mt-1 text-xs font-medium text-primary">
                      Venda de {formatarMoeda(Number(encomenda.venda.valorTotal))} ·{' '}
                      {ROTULO_PAGAMENTO[encomenda.venda.formaPagamento as FormaPagamento] ??
                        encomenda.venda.formaPagamento}
                    </p>
                  )}
                </div>

                {/* Um botão por vez: o próximo passo do pedido, e o
                    desfazer pra quem clicou errado. */}
                <div className="flex shrink-0 items-center gap-2">
                  {encomenda.status === 'PENDENTE' && (
                    <button
                      type="button"
                      onClick={() => mudarStatus(encomenda, 'FEITO')}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Marcar como pronta
                    </button>
                  )}
                  {encomenda.status === 'FEITO' && (
                    <>
                      <button
                        type="button"
                        onClick={() => mudarStatus(encomenda, 'PENDENTE')}
                        aria-label={`Voltar encomenda de ${encomenda.nomeCliente} para a fazer`}
                        title="Voltar para 'a fazer'"
                        className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEntregando(encomenda)}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                      >
                        <PackageCheck className="h-3.5 w-3.5" />
                        Entregue
                      </button>
                    </>
                  )}
                  {encomenda.status === 'ENTREGUE' && (
                    <button
                      type="button"
                      onClick={() => mudarStatus(encomenda, 'FEITO')}
                      aria-label={`Desfazer entrega de ${encomenda.nomeCliente}`}
                      title="Desfazer a entrega (apaga a venda gerada)"
                      className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => apagar(encomenda)}
                    aria-label={`Apagar encomenda de ${encomenda.nomeCliente}`}
                    title={
                      encomenda.venda
                        ? 'Apagar da lista (a venda gerada continua no faturamento)'
                        : 'Apagar'
                    }
                    className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Escolha da forma de pagamento: aparece na própria linha
                    ao clicar em "Entregue", porque a entrega vira venda. */}
                {entregando?.id === encomenda.id && (
                  <div className="mt-1 w-full rounded-lg border border-primary/40 bg-primary/5 p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        Entregar lança a venda no caixa. Como o cliente pagou?
                      </p>
                      <button
                        type="button"
                        onClick={() => setEntregando(null)}
                        aria-label="Cancelar entrega"
                        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formasPagamento.map((forma) => (
                        <button
                          key={forma}
                          type="button"
                          onClick={() => {
                            setEntregando(null)
                            mudarStatus(encomenda, 'ENTREGUE', forma)
                          }}
                          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                        >
                          {ROTULO_PAGAMENTO[forma]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
