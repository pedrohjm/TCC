'use client'

import { IceCreamBowl } from 'lucide-react'
import { useImagemComFallback } from '@/hooks/use-imagem-com-fallback'

const SRC = '/images/banners/login.jpg'

// Painel da esquerda das telas de entrar/criar conta: só o lugar da foto,
// como pedido. Enquanto public/images/banners/login.jpg não existir, cai
// num fundo em degradê com o ícone — mesma convenção do resto do site
// (ver hooks/use-imagem-com-fallback.ts).
export function FotoAuth() {
  const { falhou, imgRef, onError } = useImagemComFallback(SRC)

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted">
      {!falhou ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={SRC}
          alt=""
          className="h-full w-full object-cover"
          onError={onError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 via-muted to-accent/30">
          <IceCreamBowl className="h-20 w-20 text-muted-foreground/30" />
        </div>
      )}

      {/* faixa escura na base pro texto ficar legível sobre qualquer foto */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-8">
        <p className="font-heading text-2xl font-bold text-white">Q10 Sorvetes</p>
        <p className="mt-1 text-sm text-white/80">Sistema de registro de vendas</p>
      </div>
    </div>
  )
}
