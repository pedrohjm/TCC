'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Home, LayoutDashboard, PackageX, ShoppingCart, Store, UtensilsCrossed } from 'lucide-react'
import { GradientMenu, type GradientMenuItem } from '@/components/ui/gradient-menu'
import { ITENS_CARDAPIO } from '@/lib/nav-cardapio'

interface MenuMobileProps {
  papel: 'DONO' | 'ATENDENTE' | null
}

const GRADIENTES_CARDAPIO: [string, string][] = [
  ['#f9a8d4', '#ec4899'],
  ['#c4b5fd', '#8b5cf6'],
  ['#7dd3fc', '#0ea5e9'],
  ['#fde68a', '#f59e0b'],
  ['#6ee7b7', '#10b981'],
]

// Navegação mobile: 3 botões fixos na visão do cliente (Início, Cardápio,
// Estabelecimento) + os botões da função de quem estiver logado (Registrar
// venda / Dashboard). "Cardápio" não navega — abre um submenu com as 5
// categorias empilhado pra cima do botão, no mesmo estilo visual dos
// outros (bolinha que vira pílula com gradiente).
export function MenuMobile({ papel }: MenuMobileProps) {
  const pathname = usePathname()
  const [cardapioAberto, setCardapioAberto] = useState(false)

  const itensCardapio: GradientMenuItem[] = ITENS_CARDAPIO.map((item, indice) => {
    const href = `/cardapio/${item.slug}`
    const [gradienteDe, gradienteAte] = GRADIENTES_CARDAPIO[indice % GRADIENTES_CARDAPIO.length]
    return {
      titulo: item.titulo,
      icone: item.icone,
      href,
      gradienteDe,
      gradienteAte,
      ativo: pathname === href,
      onClick: () => setCardapioAberto(false),
    }
  })

  const itensPrincipais: GradientMenuItem[] = [
    {
      titulo: 'Início',
      icone: Home,
      href: '/',
      gradienteDe: '#fda4af',
      gradienteAte: '#fb7185',
      ativo: pathname === '/',
    },
    {
      titulo: 'Cardápio',
      icone: UtensilsCrossed,
      gradienteDe: '#f9a8d4',
      gradienteAte: '#ec4899',
      ativo: cardapioAberto || pathname.startsWith('/cardapio'),
      onClick: () => setCardapioAberto((aberto) => !aberto),
    },
    {
      titulo: 'Estabelecimento',
      icone: Store,
      href: '/estabelecimento',
      gradienteDe: '#fdba74',
      gradienteAte: '#f97316',
      ativo: pathname === '/estabelecimento',
    },
    ...(papel
      ? [
          {
            titulo: 'Venda',
            icone: ShoppingCart,
            href: '/vendas',
            gradienteDe: '#7dd3fc',
            gradienteAte: '#0ea5e9',
            ativo: pathname === '/vendas',
          },
          {
            titulo: 'Estoque',
            icone: PackageX,
            href: '/estoque',
            gradienteDe: '#fca5a5',
            gradienteAte: '#ef4444',
            ativo: pathname === '/estoque',
          },
        ]
      : []),
    ...(papel === 'DONO'
      ? [
          {
            titulo: 'Painel',
            icone: LayoutDashboard,
            href: '/dashboard',
            gradienteDe: '#a5b4fc',
            gradienteAte: '#6366f1',
            ativo: pathname === '/dashboard',
          },
        ]
      : []),
  ]

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="relative">
        {cardapioAberto && (
          <>
            {/* tocar fora fecha o submenu */}
            <button
              type="button"
              aria-label="Fechar cardápio"
              onClick={() => setCardapioAberto(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <div className="absolute bottom-full left-1/2 z-50 mb-3 -translate-x-1/2 rounded-3xl bg-background/90 p-2 shadow-xl ring-1 ring-border backdrop-blur-sm">
              <GradientMenu itens={itensCardapio} className="flex-col" />
            </div>
          </>
        )}

        <div className="relative z-50 max-w-full overflow-x-auto rounded-full bg-background/90 p-2 shadow-xl ring-1 ring-border backdrop-blur-sm">
          <GradientMenu itens={itensPrincipais} />
        </div>
      </div>
    </nav>
  )
}
