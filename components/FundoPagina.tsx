'use client'

import { useState } from 'react'

// Fundo decorativo atrás da "janela" do app (ver public/images/README.md).
// Enquanto public/images/banners/fundo.jpg não existir, cai num gradiente —
// mesmo truque de fallback usado no Avatar da logo, só que feito na mão
// porque <img> normal não tem um "onError" nativo pra trocar de elemento.
export function FundoPagina() {
  const [imagemFalhou, setImagemFalhou] = useState(false)

  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/25 via-background to-accent/30 dark:from-primary/15 dark:via-background dark:to-accent/15">
      {!imagemFalhou && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/banners/fundo.jpg"
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImagemFalhou(true)}
        />
      )}
    </div>
  )
}
