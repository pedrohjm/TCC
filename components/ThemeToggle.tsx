'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  // resolvedTheme só existe depois de montar no client (evita mismatch de
  // hidratação, já que o servidor não sabe a preferência salva no browser).
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Alternar tema claro/escuro"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {montado && resolvedTheme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
