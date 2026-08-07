'use client'

import { useCallback, useEffect, useState } from 'react'

interface Produto {
  id: number
  nome: string
  preco: string // Decimal vem como string no JSON
  ativo: boolean
}

interface ItemCarrinho {
  produtoId: number
  nome: string
  preco: number
  quantidade: number
}

const FORMAS_PAGAMENTO = [
  { valor: 'DINHEIRO', rotulo: 'Dinheiro', tecla: 'D' },
  { valor: 'CARTAO', rotulo: 'Cartão', tecla: 'C' },
  { valor: 'PIX', rotulo: 'Pix', tecla: 'P' },
] as const

type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number]['valor']

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function TelaRegistroVendas() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregandoProdutos, setCarregandoProdutos] = useState(true)
  const [erroProdutos, setErroProdutos] = useState<string | null>(null)

  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | null>(null)

  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/produtos?ativo=true')
      .then((res) => {
        if (!res.ok) throw new Error('Não foi possível carregar os produtos')
        return res.json()
      })
      .then((dados: Produto[]) => setProdutos(dados))
      .catch((erro: Error) => setErroProdutos(erro.message))
      .finally(() => setCarregandoProdutos(false))
  }, [])

  const adicionarAoCarrinho = useCallback((produto: Produto) => {
    setSucesso(null)
    setErroEnvio(null)
    setCarrinho((atual) => {
      const existente = atual.find((item) => item.produtoId === produto.id)
      if (existente) {
        return atual.map((item) =>
          item.produtoId === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      }
      return [...atual, { produtoId: produto.id, nome: produto.nome, preco: Number(produto.preco), quantidade: 1 }]
    })
  }, [])

  const removerUmDoCarrinho = useCallback((produtoId: number) => {
    setCarrinho((atual) =>
      atual
        .map((item) => (item.produtoId === produtoId ? { ...item, quantidade: item.quantidade - 1 } : item))
        .filter((item) => item.quantidade > 0)
    )
  }, [])

  const removerItem = useCallback((produtoId: number) => {
    setCarrinho((atual) => atual.filter((item) => item.produtoId !== produtoId))
  }, [])

  const limparCarrinho = useCallback(() => {
    setCarrinho([])
    setFormaPagamento(null)
    setErroEnvio(null)
    setSucesso(null)
  }, [])

  const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0)
  const podeFinalizar = carrinho.length > 0 && formaPagamento !== null && !enviando

  const finalizarVenda = useCallback(async () => {
    if (!formaPagamento || carrinho.length === 0 || enviando) return

    setEnviando(true)
    setErroEnvio(null)
    setSucesso(null)

    try {
      const resposta = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formaPagamento,
          itens: carrinho.map((item) => ({ produtoId: item.produtoId, quantidade: item.quantidade })),
        }),
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        const mensagem = dados?.erro ?? 'Não foi possível registrar a venda'
        throw new Error(mensagem)
      }

      setSucesso(`Venda registrada: ${formatarMoeda(Number(dados.valorTotal))}`)
      setCarrinho([])
      setFormaPagamento(null)
    } catch (erro) {
      setErroEnvio(erro instanceof Error ? erro.message : 'Erro inesperado')
    } finally {
      setEnviando(false)
    }
  }, [carrinho, formaPagamento, enviando])

  // Atalhos de teclado: 1-9 escolhe o produto pela posição, D/C/P escolhe a
  // forma de pagamento, Enter finaliza, Esc limpa. É o que faz o lançamento
  // ser mais rápido que escrever no caderno.
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
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

  // O título "Registrar venda" já vem da faixa no topo do painel
  // (components/TituloPagina.tsx).
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4">
      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-600">
          Produtos <span className="font-normal text-gray-400">(clique ou tecle o número)</span>
        </h2>

        {carregandoProdutos && <p className="text-sm text-gray-500">Carregando produtos…</p>}
        {erroProdutos && <p className="text-sm text-red-600">{erroProdutos}</p>}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {produtos.map((produto, indice) => (
            <button
              key={produto.id}
              type="button"
              onClick={() => adicionarAoCarrinho(produto)}
              className="flex flex-col items-start rounded border border-gray-300 bg-white p-3 text-left hover:border-gray-900 hover:bg-gray-50"
            >
              <span className="text-xs text-gray-400">{indice < 9 ? indice + 1 : ''}</span>
              <span className="font-medium text-gray-900">{produto.nome}</span>
              <span className="text-sm text-gray-600">{formatarMoeda(Number(produto.preco))}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-600">Carrinho</h2>

        {carrinho.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum item ainda — clique em um produto acima.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded border border-gray-200">
            {carrinho.map((item) => (
              <li key={item.produtoId} className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-gray-900">
                  {item.quantidade}× {item.nome}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{formatarMoeda(item.preco * item.quantidade)}</span>
                  <button
                    type="button"
                    onClick={() => removerUmDoCarrinho(item.produtoId)}
                    className="text-gray-400 hover:text-gray-900"
                    aria-label={`Remover uma unidade de ${item.nome}`}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => removerItem(item.produtoId)}
                    className="text-gray-400 hover:text-red-600"
                    aria-label={`Remover ${item.nome} do carrinho`}
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-2 text-right text-lg font-semibold text-gray-900">Total: {formatarMoeda(total)}</p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-600">
          Forma de pagamento <span className="font-normal text-gray-400">(ou tecle D/C/P)</span>
        </h2>
        <div className="flex gap-2">
          {FORMAS_PAGAMENTO.map((forma) => (
            <button
              key={forma.valor}
              type="button"
              onClick={() => setFormaPagamento(forma.valor)}
              className={`rounded border px-4 py-2 text-sm font-medium ${
                formaPagamento === forma.valor
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-900'
              }`}
            >
              {forma.rotulo} ({forma.tecla})
            </button>
          ))}
        </div>
      </section>

      {erroEnvio && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{erroEnvio}</p>}
      {sucesso && <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">{sucesso}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={finalizarVenda}
          disabled={!podeFinalizar}
          className="flex-1 rounded bg-gray-900 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {enviando ? 'Registrando…' : 'Finalizar venda (Enter)'}
        </button>
        <button
          type="button"
          onClick={limparCarrinho}
          className="rounded border border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-gray-900"
        >
          Limpar (Esc)
        </button>
      </div>
    </div>
  )
}
