'use client'

import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GradientMenuItem {
  titulo: string
  icone: LucideIcon
  gradienteDe: string
  gradienteAte: string
  ativo?: boolean
  // Um item é um link (navega) ou um botão (ex.: abre um submenu) — nunca
  // os dois. `key` some por fora porque React já usa a prop especial.
  href?: string
  onClick?: () => void
}

interface GradientMenuProps {
  itens: GradientMenuItem[]
  className?: string
}

// Adaptado do componente "Gradient Menu" (bolinhas que viram pílulas com
// gradiente ao passar o mouse/tocar): usa ícones lucide-react — já é a
// biblioteca de ícones do resto do projeto — em vez de react-icons, e os
// itens vêm por prop em vez de uma lista fixa. Cada item ou navega (href)
// ou dispara uma ação (onClick, usado pelo botão "Cardápio" que abre o
// submenu em vez de ir pra algum lugar).
export function GradientMenu({ itens, className }: GradientMenuProps) {
  return (
    <ul className={cn('flex items-center gap-3', className)}>
      {itens.map((item) => {
        const Icone = item.icone

        const conteudo: ReactNode = (
          <>
            {/* fundo em gradiente, só aparece no hover/toque */}
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            {/* brilho desfocado atrás */}
            <span className="absolute inset-x-0 top-[8px] -z-10 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 blur-[15px] transition-opacity duration-500 group-hover:opacity-50" />

            <span className="relative z-10 text-muted-foreground transition-transform duration-500 group-hover:scale-0">
              <Icone className="h-5 w-5" />
            </span>

            <span className="absolute scale-0 text-xs font-medium tracking-wide whitespace-nowrap text-white uppercase transition-transform delay-150 duration-500 group-hover:scale-100">
              {item.titulo}
            </span>
          </>
        )

        const classeBotao = cn(
          'relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-card shadow-lg ring-1 ring-border transition-shadow duration-500 group-hover:shadow-none',
          item.ativo && 'ring-2 ring-primary'
        )

        return (
          <li
            key={item.href ?? item.titulo}
            style={
              {
                '--gradient-from': item.gradienteDe,
                '--gradient-to': item.gradienteAte,
              } as CSSProperties
            }
            className="group relative h-[52px] w-[52px] shrink-0 transition-all duration-500 hover:w-[136px]"
          >
            {item.href ? (
              <Link
                href={item.href}
                aria-label={item.titulo}
                onClick={item.onClick}
                className={classeBotao}
              >
                {conteudo}
              </Link>
            ) : (
              <button
                type="button"
                aria-label={item.titulo}
                onClick={item.onClick}
                className={classeBotao}
              >
                {conteudo}
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
