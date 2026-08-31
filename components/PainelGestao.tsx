'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { Papel } from '@/app/generated/prisma/client'
import { PainelEstoque } from '@/components/PainelEstoque'
import TelaRegistroVendas from '@/components/TelaRegistroVendas'
import { secoesDoPapel, type SecaoPainelId } from '@/lib/secoes-painel'
import { cn } from '@/lib/utils'

// O dashboard carrega o Recharts, de longe a parte mais pesada do site.
// Como as três telas agora moram na mesma rota, importar direto faria o
// atendente — que nem enxerga essa categoria — baixar o gráfico à toa, e
// o dono baixar antes de abrir a aba. Por isso ele vem sob demanda.
const PainelDashboard = dynamic(() => import('@/components/PainelDashboard'), {
  ssr: false,
  loading: () => (
    <p className="py-16 text-center text-sm text-muted-foreground">Carregando o dashboard…</p>
  ),
})

interface PainelGestaoProps {
  papel: Papel
  secaoInicial: SecaoPainelId
}

// Painel da equipe: uma página só, no formato da landing (largura cheia,
// quem rola é o documento), com as três telas do sistema — registrar
// venda, falta no estoque e dashboard — trocadas por categoria, do mesmo
// jeito que o cliente troca de categoria no cardápio da home.
//
// Substitui o formato antigo de "janela" (menu lateral + painel de
// conteúdo num quadro estreito), que saiu junto com as páginas de
// cardápio que o menu servia.
export function PainelGestao({ papel, secaoInicial }: PainelGestaoProps) {
  const [ativa, setAtiva] = useState<SecaoPainelId>(secaoInicial)

  const secoes = secoesDoPapel(papel)
  const secaoAtiva = secoes.find((secao) => secao.id === ativa) ?? secoes[0]

  function trocar(id: SecaoPainelId) {
    setAtiva(id)
    // Deixa a categoria escolhida na URL sem recarregar nada: o servidor
    // lê esse mesmo `?secao=` pra saber onde abrir num F5 ou num link
    // colado no navegador. `history.replaceState` é a forma suportada
    // pelo Next de mexer na URL sem disparar navegação — e `replace` (e
    // não `push`) porque trocar de aba não deveria encher o botão
    // "voltar" do navegador.
    window.history.replaceState(null, '', `/painel?secao=${id}`)
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        {/* mesmas manchas de cor do hero da home — radial-gradient em vez
            de blur, que trava a rolagem */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-32 h-[26rem] w-[26rem] rounded-full"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -bottom-40 h-[26rem] w-[26rem] rounded-full"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklab, var(--accent) 45%, transparent), transparent 70%)',
          }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
          <div className="flex flex-col items-center text-center">
            <span className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">
              Área da equipe
            </span>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Painel da loja
            </h1>
            {/* O texto acompanha a categoria aberta, pra a página dizer o
                que ela está mostrando naquele momento. */}
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">{secaoAtiva.descricao}</p>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {secoes.map((secao) => {
              const Icone = secao.icone
              const estaAtiva = secao.id === secaoAtiva.id
              return (
                <button
                  key={secao.id}
                  type="button"
                  onClick={() => trocar(secao.id)}
                  aria-pressed={estaAtiva}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    estaAtiva
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  <Icone className="h-4 w-4" />
                  {secao.rotulo}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Só a categoria aberta é montada: as outras duas não ficam
          buscando dados nem ocupando tela por trás. */}
      <div className="mx-auto w-full max-w-6xl px-0 py-6 md:px-4">
        {secaoAtiva.id === 'vendas' && <TelaRegistroVendas />}
        {secaoAtiva.id === 'estoque' && <PainelEstoque />}
        {secaoAtiva.id === 'dashboard' && <PainelDashboard />}
      </div>
    </>
  )
}
