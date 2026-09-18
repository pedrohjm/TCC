'use client'

import { LayoutGrid } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CATEGORIAS_SABOR, type CategoriaSaborValor } from '@/lib/categorias-sabor'

interface FiltroCategoriaSaborProps {
  categoriaAtiva: CategoriaSaborValor | null
  aoSelecionar: (categoria: CategoriaSaborValor | null) => void
}

// "Quadrado" 1 da tela de sabores — filtro por categoria, no estilo do
// modelo em public/images/modelo/Search.pdf (rótulo com ícone + chips
// coloridos numa linha, cada opção com sua própria cor quando ativa).
export function FiltroCategoriaSabor({ categoriaAtiva, aoSelecionar }: FiltroCategoriaSaborProps) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <LayoutGrid className="h-4 w-4" />
          Categoria
        </span>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => aoSelecionar(null)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
              categoriaAtiva === null
                ? 'border-primary bg-primary-soft text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
            )}
          >
            Todos
          </button>

          {CATEGORIAS_SABOR.map((categoria) => {
            const Icone = categoria.icone
            const ativo = categoriaAtiva === categoria.valor
            return (
              <button
                key={categoria.valor}
                type="button"
                onClick={() => aoSelecionar(categoria.valor)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                  ativo
                    ? cn(categoria.corBg, categoria.corBorda, categoria.corTexto)
                    : 'border-border text-muted-foreground hover:border-current'
                )}
              >
                <Icone className="h-3.5 w-3.5" />
                {categoria.rotulo}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
