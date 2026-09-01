'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RegraPreco } from '@/app/generated/prisma/enums'
import {
  calcularVenda,
  descreverRegra,
  explicarLinha,
  formatarMoeda,
  quantidadeDoGatilho,
  type LinhaVenda,
  type ProdutoComRegra,
} from '@/lib/precos'
import { VALOR_LIVRE_MAXIMO } from '@/lib/validations/venda'

// O que GET /api/produtos devolve. Os Decimal do Prisma viram string no
// JSON, por isso os preços chegam como texto.
interface ProdutoApi {
  id: number
  nome: string
  preco: string
  regraPreco: RegraPreco
  quantidadeRegra: number | null
  precoRegra: string | null
  grupoPreco: string | null
  ativo: boolean
}

function comoProdutoComRegra(produto: ProdutoApi): ProdutoComRegra {
  return {
    id: produto.id,
    nome: produto.nome,
    preco: Number(produto.preco),
    regraPreco: produto.regraPreco,
    quantidadeRegra: produto.quantidadeRegra,
    precoRegra: produto.precoRegra === null ? null : Number(produto.precoRegra),
    grupoPreco: produto.grupoPreco,
  }
}

interface LinhaCarrinho {
  /** Id local da linha. O carrinho não é indexado por produto porque o
   *  self-service pode aparecer várias vezes no mesmo pedido, cada pote
   *  com o seu valor pesado. */
  id: number
  produtoId: number
  quantidade: number
  /** Regra LIVRE: o que está digitado no campo, ainda como texto — assim
   *  dá pra digitar "12," sem o campo se corrigir sozinho no meio. */
  valorTexto: string
}

const FORMAS_PAGAMENTO = [
  { valor: 'DINHEIRO', rotulo: 'Dinheiro', tecla: 'D' },
  { valor: 'CARTAO', rotulo: 'Cartão', tecla: 'C' },
  { valor: 'PIX', rotulo: 'Pix', tecla: 'P' },
] as const

type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number]['valor']

/** Aceita vírgula e ponto: no balcão se digita "12,50". */
function lerValor(texto: string): number {
  const numero = Number(texto.replace(',', '.'))
  return Number.isFinite(numero) ? numero : 0
}

export default function TelaRegistroVendas() {
  const [produtos, setProdutos] = useState<ProdutoComRegra[]>([])
  const [carregandoProdutos, setCarregandoProdutos] = useState(true)
  const [erroProdutos, setErroProdutos] = useState<string | null>(null)

  const [carrinho, setCarrinho] = useState<LinhaCarrinho[]>([])
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | null>(null)
  const [descricao, setDescricao] = useState('')

  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  const proximoIdLinha = useRef(1)

  useEffect(() => {
    fetch('/api/produtos?ativo=true')
      .then((res) => {
        if (!res.ok) throw new Error('Não foi possível carregar os produtos')
        return res.json()
      })
      .then((dados: ProdutoApi[]) => setProdutos(dados.map(comoProdutoComRegra)))
      .catch((erro: Error) => setErroProdutos(erro.message))
      .finally(() => setCarregandoProdutos(false))
  }, [])

  const adicionarAoCarrinho = useCallback((produto: ProdutoComRegra) => {
    setSucesso(null)
    setErroEnvio(null)
    setCarrinho((atual) => {
      // Self-service: cada clique é um pote novo, com o seu próprio valor.
      // Os outros produtos se somam na mesma linha, como sempre foi.
      if (produto.regraPreco !== 'LIVRE') {
        const existente = atual.find((linha) => linha.produtoId === produto.id)
        if (existente) {
          return atual.map((linha) =>
            linha.id === existente.id ? { ...linha, quantidade: linha.quantidade + 1 } : linha
          )
        }
      }
      return [
        ...atual,
        { id: proximoIdLinha.current++, produtoId: produto.id, quantidade: 1, valorTexto: '' },
      ]
    })
  }, [])

  const removerUmDaLinha = useCallback((linhaId: number) => {
    setCarrinho((atual) =>
      atual
        .map((linha) =>
          linha.id === linhaId ? { ...linha, quantidade: linha.quantidade - 1 } : linha
        )
        .filter((linha) => linha.quantidade > 0)
    )
  }, [])

  const removerLinha = useCallback((linhaId: number) => {
    setCarrinho((atual) => atual.filter((linha) => linha.id !== linhaId))
  }, [])

  const mudarValorLinha = useCallback((linhaId: number, texto: string) => {
    setCarrinho((atual) =>
      atual.map((linha) => (linha.id === linhaId ? { ...linha, valorTexto: texto } : linha))
    )
  }, [])

  const limparCarrinho = useCallback(() => {
    setCarrinho([])
    setFormaPagamento(null)
    setDescricao('')
    setErroEnvio(null)
    setSucesso(null)
  }, [])

  // A conta é a mesma de lib/precos.ts que o servidor refaz ao gravar —
  // aqui ela existe só pra mostrar o valor enquanto o pedido é montado.
  const produtoPorId = new Map(produtos.map((produto) => [produto.id, produto]))
  const linhasParaCalculo: LinhaVenda[] = carrinho.map((linha) => ({
    produtoId: linha.produtoId,
    quantidade: linha.quantidade,
    valor: lerValor(linha.valorTexto),
  }))
  const { linhas: calculadas, total } =
    carrinho.length > 0 && produtos.length > 0
      ? calcularVenda(linhasParaCalculo, produtoPorId)
      : { linhas: [], total: 0 }

  // Uma linha de self-service sem valor digitado seria uma venda de zero
  // real — a rota recusa, e aqui o botão nem habilita.
  const faltaValor = carrinho.some((linha) => {
    const produto = produtoPorId.get(linha.produtoId)
    return produto?.regraPreco === 'LIVRE' && lerValor(linha.valorTexto) <= 0
  })
  const passouDoTeto = carrinho.some((linha) => lerValor(linha.valorTexto) > VALOR_LIVRE_MAXIMO)
  const podeFinalizar =
    carrinho.length > 0 && formaPagamento !== null && !faltaValor && !passouDoTeto && !enviando

  const finalizarVenda = useCallback(async () => {
    if (!formaPagamento || carrinho.length === 0 || enviando) return

    setEnviando(true)
    setErroEnvio(null)
    setSucesso(null)

    try {
      const porId = new Map(produtos.map((produto) => [produto.id, produto]))
      const resposta = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formaPagamento,
          descricao: descricao.trim() || undefined,
          itens: carrinho.map((linha) => ({
            produtoId: linha.produtoId,
            quantidade: linha.quantidade,
            // Só o self-service manda valor; nos outros o preço é o do
            // banco e a rota recusa um valor vindo daqui.
            ...(porId.get(linha.produtoId)?.regraPreco === 'LIVRE'
              ? { valor: lerValor(linha.valorTexto) }
              : {}),
          })),
        }),
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados?.erro ?? 'Não foi possível registrar a venda')
      }

      setSucesso(`Venda registrada: ${formatarMoeda(Number(dados.valorTotal))}`)
      setCarrinho([])
      setFormaPagamento(null)
      setDescricao('')
    } catch (erro) {
      setErroEnvio(erro instanceof Error ? erro.message : 'Erro inesperado')
    } finally {
      setEnviando(false)
    }
  }, [carrinho, formaPagamento, descricao, enviando, produtos])

  // Atalhos de teclado: 1-9 escolhe o produto pela posição, D/C/P escolhe a
  // forma de pagamento, Enter finaliza, Esc limpa. É o que faz o lançamento
  // ser mais rápido que escrever no caderno.
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      // Com campo de texto na tela (valor do self-service, descrição), os
      // atalhos precisam sair da frente: senão digitar "3" na descrição
      // lançaria um produto e o Enter fecharia a venda no meio da frase.
      const alvo = evento.target
      if (alvo instanceof HTMLInputElement || alvo instanceof HTMLTextAreaElement) return

      if (evento.key >= '1' && evento.key <= '9') {
        const indice = Number(evento.key) - 1
        const produto = produtos[indice]
        if (produto) {
          evento.preventDefault()
          adicionarAoCarrinho(produto)
        }
        return
      }

      const forma = FORMAS_PAGAMENTO.find((f) => f.tecla.toLowerCase() === evento.key.toLowerCase())
      if (forma) {
        evento.preventDefault()
        setFormaPagamento(forma.valor)
        return
      }

      if (evento.key === 'Enter') {
        evento.preventDefault()
        finalizarVenda()
        return
      }

      if (evento.key === 'Escape') {
        evento.preventDefault()
        limparCarrinho()
      }
    }

    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [produtos, adicionarAoCarrinho, finalizarVenda, limparCarrinho])

  // O nome da categoria já vem do cabeçalho do painel
  // (components/PainelGestao.tsx).
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4">
      <section>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
          Produtos{' '}
          <span className="font-normal text-muted-foreground/70">(clique ou tecle o número)</span>
        </h2>

        {carregandoProdutos && <p className="text-sm text-muted-foreground">Carregando produtos…</p>}
        {erroProdutos && <p className="text-sm text-destructive">{erroProdutos}</p>}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {produtos.map((produto, indice) => {
            const regra = descreverRegra(produto)
            return (
              <button
                key={produto.id}
                type="button"
                onClick={() => adicionarAoCarrinho(produto)}
                className="flex flex-col items-start rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/60 hover:bg-accent/40"
              >
                <span className="text-xs text-muted-foreground/70">
                  {indice < 9 ? indice + 1 : ''}
                </span>
                <span className="font-medium text-foreground">{produto.nome}</span>
                <span className="text-sm text-muted-foreground">
                  {produto.regraPreco === 'LIVRE' ? 'por peso' : formatarMoeda(produto.preco)}
                </span>
                {/* A regra fica no botão pra quem está no balcão não
                    precisar decorar a tabela de preços. */}
                {regra && <span className="mt-0.5 text-xs text-primary">{regra}</span>}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Carrinho</h2>

        {carrinho.length === 0 ? (
          <p className="text-sm text-muted-foreground/70">
            Nenhum item ainda — clique em um produto acima.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {carrinho.map((linha, indice) => {
              const produto = produtoPorId.get(linha.produtoId)
              if (!produto) return null

              const ehLivre = produto.regraPreco === 'LIVRE'
              const subtotal = calculadas[indice]?.subtotal ?? 0
              const explicacao = explicarLinha(
                produto,
                linha.quantidade,
                quantidadeDoGatilho(produto, linhasParaCalculo, produtoPorId)
              )

              return (
                <li key={linha.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                  <span className="min-w-0 flex-1 text-sm text-foreground">
                    {!ehLivre && `${linha.quantidade}× `}
                    {produto.nome}
                    {/* Como o subtotal foi formado — dá pra conferir a
                        conta na frente do cliente. */}
                    {explicacao && (
                      <span className="block text-xs text-muted-foreground">{explicacao}</span>
                    )}
                  </span>

                  {ehLivre ? (
                    <label className="flex items-center gap-1 text-sm text-muted-foreground">
                      R$
                      <input
                        // Foca sozinho ao adicionar: a linha só monta uma
                        // vez (a chave é o id dela), então isso não rouba o
                        // foco depois.
                        autoFocus
                        value={linha.valorTexto}
                        onChange={(e) => mudarValorLinha(linha.id, e.target.value)}
                        inputMode="decimal"
                        placeholder="0,00"
                        aria-label={`Valor de ${produto.nome}`}
                        className="w-24 rounded-lg border border-input bg-background px-2 py-1 text-right text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    </label>
                  ) : (
                    <span className="text-sm text-muted-foreground">{formatarMoeda(subtotal)}</span>
                  )}

                  <span className="flex items-center gap-3">
                    {!ehLivre && (
                      <button
                        type="button"
                        onClick={() => removerUmDaLinha(linha.id)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={`Remover uma unidade de ${produto.nome}`}
                      >
                        −
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removerLinha(linha.id)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remover ${produto.nome} do carrinho`}
                    >
                      ✕
                    </button>
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        {/* O teto do valor digitado é o mesmo que a rota aplica, pra a tela
            não deixar montar um pedido que o servidor vai recusar. */}
        {passouDoTeto && (
          <p className="mt-2 text-sm text-destructive">
            Valor acima do limite de {formatarMoeda(VALOR_LIVRE_MAXIMO)} — confira o que foi
            digitado.
          </p>
        )}

        <p className="mt-2 text-right text-lg font-semibold text-foreground">
          Total: {formatarMoeda(total)}
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
          Forma de pagamento{' '}
          <span className="font-normal text-muted-foreground/70">(ou tecle D/C/P)</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {FORMAS_PAGAMENTO.map((forma) => (
            <button
              key={forma.valor}
              type="button"
              onClick={() => setFormaPagamento(forma.valor)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                formaPagamento === forma.valor
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {forma.rotulo} ({forma.tecla})
            </button>
          ))}
        </div>
      </section>

      <section>
        <label htmlFor="descricao" className="mb-2 block text-sm font-medium text-muted-foreground">
          Descrição <span className="font-normal text-muted-foreground/70">(opcional)</span>
        </label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Ex.: nome do cliente, o que foi montado no self-service, alguma observação."
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </section>

      {erroEnvio && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{erroEnvio}</p>
      )}
      {sucesso && (
        <p className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
          {sucesso}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={finalizarVenda}
          disabled={!podeFinalizar}
          className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {enviando ? 'Registrando…' : 'Finalizar venda (Enter)'}
        </button>
        <button
          type="button"
          onClick={limparCarrinho}
          className="rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          Limpar (Esc)
        </button>
      </div>
    </div>
  )
}
