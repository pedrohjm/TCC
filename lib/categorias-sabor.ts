import { Apple, Candy, Citrus, type LucideIcon } from 'lucide-react'

export type CategoriaSaborValor = 'DOCE' | 'FRUTA' | 'AZEDO'

export interface InfoCategoriaSabor {
  valor: CategoriaSaborValor
  rotulo: string
  icone: LucideIcon
  corTexto: string
  corBorda: string
  corBg: string
}

// Cores por categoria — mesma ideia do filtro por raridade do modelo em
// public/images/modelo/Search.pdf (cada opção com uma cor própria), só que
// aplicada às 3 categorias de sabor por enquanto (dá pra crescer depois).
export const CATEGORIAS_SABOR: InfoCategoriaSabor[] = [
  {
    valor: 'DOCE',
    rotulo: 'Doce',
    icone: Candy,
    corTexto: 'text-pink-600 dark:text-pink-400',
    corBorda: 'border-pink-300 dark:border-pink-800',
    corBg: 'bg-pink-50 dark:bg-pink-950/40',
  },
  {
    valor: 'FRUTA',
    rotulo: 'Fruta',
    icone: Apple,
    corTexto: 'text-emerald-600 dark:text-emerald-400',
    corBorda: 'border-emerald-300 dark:border-emerald-800',
    corBg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    valor: 'AZEDO',
    rotulo: 'Azedo',
    icone: Citrus,
    corTexto: 'text-amber-600 dark:text-amber-400',
    corBorda: 'border-amber-300 dark:border-amber-800',
    corBg: 'bg-amber-50 dark:bg-amber-950/40',
  },
]
