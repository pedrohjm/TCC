'use client'

import { useEffect, useState } from 'react'
import { SECOES_LANDING } from '@/lib/secoes-landing'
import { cn } from '@/lib/utils'

// Distância do topo da janela usada como "linha de leitura": a seção
// ativa é a última cujo topo já passou dessa linha. 40% da altura da
// janela deixa a troca acontecer quando a seção nova ocupa boa parte da
// tela, e não assim que ela encosta na borda de baixo.
const FRACAO_LINHA_DE_LEITURA = 0.4

// Menu de navegação rápida entre as seções da landing, no estilo do
// modelo (public/images/modelo/homepage.png): links no meio da barra do
// topo, com o item da seção atual destacado conforme a pessoa rola.
export function NavSecoes() {
  const [secaoAtiva, setSecaoAtiva] = useState<string>(SECOES_LANDING[0].id)

  useEffect(() => {
    let agendado = false

    function recalcular() {
      agendado = false
      const linha = window.scrollY + window.innerHeight * FRACAO_LINHA_DE_LEITURA

      let ativa = SECOES_LANDING[0].id
      for (const secao of SECOES_LANDING) {
        const el = document.getElementById(secao.id)
        if (el && el.offsetTop <= linha) ativa = secao.id
      }

      // No fim da página, a última seção pode nunca cruzar a linha de
      // leitura (não há mais o que rolar) — foi o que aconteceu com
      // "Contato": clicar no link levava até lá, mas o menu continuava
      // marcando "Sobre". Chegando ao fim, a última é sempre a ativa.
      const noFim = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2
      if (noFim) ativa = SECOES_LANDING[SECOES_LANDING.length - 1].id

      setSecaoAtiva(ativa)
    }

    function aoRolar() {
      if (agendado) return
      agendado = true
      requestAnimationFrame(recalcular)
    }

    recalcular()
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRolar)
    return () => {
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
    }
  }, [])

  return (
    <nav
      aria-label="Seções da página"
      className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto"
    >
      {SECOES_LANDING.map((secao) => (
        <a
          key={secao.id}
          href={`#${secao.id}`}
          aria-current={secaoAtiva === secao.id ? 'true' : undefined}
          className={cn(
            'rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
            secaoAtiva === secao.id
              ? 'bg-primary/10 font-medium text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {secao.rotulo}
        </a>
      ))}
    </nav>
  )
}
