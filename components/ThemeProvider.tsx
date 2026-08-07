'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'

// Wrapper fino só pra poder importar com 'use client' — next-themes cuida
// de aplicar a classe "dark" no <html> e persistir a escolha no
// localStorage, sem piscar o tema errado no primeiro render (o script que
// ele injeta roda antes do React hidratar).
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
