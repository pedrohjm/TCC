'use client'

import { useId, useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

// Nunca notifica: só serve pra `useSyncExternalStore` devolver um valor
// diferente no servidor e no cliente (ver `montado` abaixo).
const naoInscreve = () => () => {}

// Alternador de tema no formato de chave: sol de um lado, lua do outro e
// o interruptor no meio (ligado = escuro). Os dois ícones também trocam o
// tema ao clicar.
//
// Duas diferenças em relação ao componente de referência:
//
// - o `Switch` vem do shadcn deste projeto (`components/ui/switch.tsx`,
//   adicionado pela CLI), que é feito sobre **Base UI** — o projeto todo
//   usa `@base-ui/react`, e o exemplo trazia a versão de Radix. Instalar
//   `@radix-ui/react-switch` colocaria uma segunda biblioteca de
//   primitivos pra fazer o que a de casa já faz. Também não precisou do
//   `@radix-ui/react-label`: o próprio exemplo usa `<span>`, não `Label`;
// - os ícones são `<button>` em vez de `<span onClick>`. Um `<span>` com
//   clique não recebe foco nem responde ao teclado, ou seja, quem navega
//   por Tab não conseguiria usar essa metade do controle.
export function ThemeToggle() {
  const id = useId()
  const { resolvedTheme, setTheme } = useTheme()

  // O servidor não sabe qual tema está salvo no navegador, então até a
  // hidratação terminar o controle é desenhado no estado claro; sem isso
  // o HTML do servidor e o do cliente divergem. `useSyncExternalStore`
  // resolve isso sem `setState` dentro de efeito (que era o padrão antigo
  // aqui e o lint reclamava, com razão — causa uma renderização extra).
  const montado = useSyncExternalStore(
    naoInscreve,
    () => true,
    () => false
  )
  const escuro = montado && resolvedTheme === 'dark'

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-label="Usar tema claro"
        aria-controls={id}
        className={cn(
          'cursor-pointer transition-colors hover:text-foreground',
          escuro ? 'text-foreground/50' : 'text-foreground'
        )}
      >
        <Sun className="size-4" aria-hidden />
      </button>

      <Switch
        id={id}
        checked={escuro}
        onCheckedChange={(marcado) => setTheme(marcado ? 'dark' : 'light')}
        aria-label="Alternar entre tema claro e escuro"
      />

      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-label="Usar tema escuro"
        aria-controls={id}
        className={cn(
          'cursor-pointer transition-colors hover:text-foreground',
          escuro ? 'text-foreground' : 'text-foreground/50'
        )}
      >
        <Moon className="size-4" aria-hidden />
      </button>
    </div>
  )
}
