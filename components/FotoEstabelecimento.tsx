'use client'

import { MapPin, Store } from 'lucide-react'
import { useImagemComFallback } from '@/hooks/use-imagem-com-fallback'

const SRC = '/images/banners/estabelecimento.jpg'

// Foto da fachada/interior da loja, no estilo do modelo em
// public/images/modelo/Localizacao.pdf (foto grande com um pino
// sobreposto na base). Enquanto public/images/banners/estabelecimento.jpg
// não existir, cai num fundo em gradiente com o ícone da loja — mesmo
// truque de fallback usado no FundoPagina/FotoSabor.
export function FotoEstabelecimento() {
  const { falhou, imgRef, onError } = useImagemComFallback(SRC)

  return (
    <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
      {!falhou ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={SRC}
          alt="Fachada da Q10 Sorvetes"
          className="h-full w-full object-cover"
          onError={onError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-muted to-accent/20">
          <Store className="h-12 w-12 text-muted-foreground/40" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-primary p-2.5 text-primary-foreground shadow-lg ring-4 ring-background/80">
        <MapPin className="h-5 w-5" />
      </div>
    </div>
  )
}
