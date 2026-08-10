'use client'

import { useImagemComFallback } from '@/hooks/use-imagem-com-fallback'

const SRC = '/images/banners/fundo.jpg'

// Fundo decorativo atrás da "janela" do app (ver public/images/README.md).
// Enquanto public/images/banners/fundo.jpg não existir, cai num gradiente.
export function FundoPagina() {
  const { falhou, imgRef, onError } = useImagemComFallback(SRC)

  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/25 via-background to-accent/30 dark:from-primary/15 dark:via-background dark:to-accent/15">
      {!falhou && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={SRC}
          alt=""
          className="h-full w-full object-cover"
          onError={onError}
        />
      )}
    </div>
  )
}
