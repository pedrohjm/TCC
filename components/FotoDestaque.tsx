'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useImagemComFallback } from '@/hooks/use-imagem-com-fallback'

interface FotoDestaqueProps {
  src: string
  alt: string
  /** Ícone que aparece no lugar da foto enquanto o arquivo não existe. */
  iconeFallback: ReactNode
  /** Ícone do selo redondo sobreposto na base da foto. */
  iconeBadge: ReactNode
  /** Sobrescreve a proporção padrão (16:10). */
  className?: string
}

// Foto grande de topo de página, no estilo do modelo em
// public/images/modelo/Localizacao.pdf: imagem, um degradê pra escurecer a
// base e um selo redondo sobreposto. Usada na página Estabelecimento (selo
// de pino) e na home (selo de sorvete). Enquanto o arquivo não existir em
// public/images/, cai num fundo em degradê com o ícone de fallback —
// mesma convenção do resto do site (ver hooks/use-imagem-com-fallback.ts).
//
// Os ícones vêm como ReactNode (JSX pronto), não como componente: assim
// páginas que rodam no servidor podem usar este componente client sem
// esbarrar em "Functions cannot be passed directly to Client Components".
// O tamanho é aplicado por CSS no <svg> filho pra o chamador não precisar
// repetir as classes.
export function FotoDestaque({
  src,
  alt,
  iconeFallback,
  iconeBadge,
  className,
}: FotoDestaqueProps) {
  const { falhou, imgRef, onError } = useImagemComFallback(src)

  return (
    <div className={cn('relative aspect-16/10 w-full overflow-hidden bg-muted', className)}>
      {!falhou ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={onError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-muted to-accent/20 text-muted-foreground/40 [&_svg]:h-12 [&_svg]:w-12">
          {iconeFallback}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-soft p-2.5 text-primary-foreground shadow-lg ring-4 ring-background/80 [&_svg]:h-5 [&_svg]:w-5">
        {iconeBadge}
      </div>
    </div>
  )
}
