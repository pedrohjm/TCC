'use client'

import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, MapPin, UtensilsCrossed } from 'lucide-react'
import { GradientMenu, type GradientMenuItem } from '@/components/ui/gradient-menu'
import type { Papel } from '@/app/generated/prisma/client'

interface MenuMobileProps {
  papel: Papel | null
}

// Barra flutuante de navegação do celular. Os itens do cliente são
// âncoras da home (é lá que o cardápio e a localização moram agora, desde
// que a home virou landing); quem está logado ganha um item a mais pro
// painel da equipe.
//
// Antes daqui saíam links pras 5 páginas de `/cardapio/<slug>` e pra
// `/estabelecimento`, num submenu — essas páginas não existem mais, o
// conteúdo delas está na própria home.
export function MenuMobile({ papel }: MenuMobileProps) {
  const pathname = usePathname()
  const naHome = pathname === '/'

  const itens: GradientMenuItem[] = [
    {
      titulo: 'Início',
      icone: Home,
      href: '/',
      gradienteDe: '#fda4af',
      gradienteAte: '#fb7185',
      ativo: naHome,
    },
    // Âncoras: só destacam quando a pessoa já está na home; fora dela são
    // links de volta pra seção.
    {
      titulo: 'Cardápio',
      icone: UtensilsCrossed,
      href: '/#cardapio',
      gradienteDe: '#f9a8d4',
      gradienteAte: '#ec4899',
    },
    {
      titulo: 'Onde estamos',
      icone: MapPin,
      href: '/#contato',
      gradienteDe: '#fdba74',
      gradienteAte: '#f97316',
    },
    ...(papel
      ? [
          {
            titulo: 'Painel',
            icone: LayoutGrid,
            href: '/painel',
            gradienteDe: '#a5b4fc',
            gradienteAte: '#6366f1',
            ativo: pathname === '/painel',
          },
        ]
      : []),
  ]

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="relative z-50 max-w-full overflow-x-auto rounded-full bg-background/90 p-2 shadow-xl ring-1 ring-border backdrop-blur-sm">
        <GradientMenu itens={itens} />
      </div>
    </nav>
  )
}
