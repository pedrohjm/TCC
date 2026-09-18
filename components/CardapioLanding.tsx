/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FiltroCategoriaSabor } from '@/components/FiltroCategoriaSabor'
import { GradeSabores, type Sabor } from '@/components/GradeSabores'
import { ITENS_CARDAPIO } from '@/lib/nav-cardapio'
import type { CategoriaSaborValor } from '@/lib/categorias-sabor'
import { cn } from '@/lib/utils'

// Único slug com dados de verdade no banco por enquanto (model Sabor +
// GET /api/sabores). Os outros quatro ainda são "em breve".
const SLUG_COM_DADOS = 'sabores-1800ml'

// Seção "Cardápio" da landing: o cliente escolhe a categoria nos chips e
// vê os itens dela ali mesmo, sem trocar de página. É o único lugar do
// site onde os produtos aparecem — as páginas `/cardapio/<slug>`, que
// mostravam a mesma coisa uma categoria por vez, foram removidas.
export function CardapioLanding() {
  const [slugAtivo, setSlugAtivo] = useState(SLUG_COM_DADOS)
  const [categoriaSabor, setCategoriaSabor] = useState<CategoriaSaborValor | null>(null)
  const [sabores, setSabores] = useState<Sabor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const itemAtivo = ITENS_CARDAPIO.find((item) => item.slug === slugAtivo)!
  const temDados = slugAtivo === SLUG_COM_DADOS

  useEffect(() => {
    if (!temDados) return
    setCarregando(true)
    setErro(null)
    const query = categoriaSabor ? `?categoria=${categoriaSabor}` : ''
    fetch(`/api/sabores${query}`)
      .then((res) => {
        if (!res.ok) throw new Error('Não foi possível carregar os sabores')
        return res.json()
      })
      .then((dados: Sabor[]) => setSabores(dados))
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [categoriaSabor, temDados])

  return (
    <section
      id="cardapio"
      className="mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-14 md:scroll-mt-20 md:py-20"
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">
          O que tem hoje
        </span>
        <h2 className="font-heading text-2xl font-semibold text-balance sm:text-3xl">
          Escolha pela categoria
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Toque numa categoria pra ver o que está disponível na loja.
        </p>
      </div>

      {/* Chips das 5 categorias do cardápio */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {ITENS_CARDAPIO.map((item) => {
          const Icone = item.icone
          const ativo = item.slug === slugAtivo
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => setSlugAtivo(item.slug)}
              aria-pressed={ativo}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                ativo
                  ? 'border-primary bg-primary-soft text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
              )}
            >
              <Icone className="h-4 w-4" />
              {item.titulo}
            </button>
          )
        })}
      </div>

      {temDados ? (
        <div className="flex flex-col gap-4">
          {/* Sub-filtro por sabor (Doce/Fruta/Azedo) */}
          <FiltroCategoriaSabor
            categoriaAtiva={categoriaSabor}
            aoSelecionar={setCategoriaSabor}
          />
          <GradeSabores sabores={sabores} carregando={carregando} erro={erro} />
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <itemAtivo.icone className="h-6 w-6" />
            </span>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg font-medium">{itemAtivo.titulo}</h3>
              <Badge variant="secondary">Em breve</Badge>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">{itemAtivo.descricao}</p>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
