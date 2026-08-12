'use client'

import { Store } from 'lucide-react'
import { useImagemComFallback } from '@/hooks/use-imagem-com-fallback'

const SRC = '/images/logo/Logo.png'

// Formato "bandeira": um hexágono alongado (pontas em vez de cantos retos
// nas duas laterais), no estilo do modelo em public/images/modelo/modelo.pdf
// (o "TBH" do topo do site de referência). Duas camadas com o mesmo recorte,
// uma um pouco maior por baixo (cor de acento = "menta" da paleta da loja),
// criam o efeito de borda/moldura ao redor da bandeira em si (cor primária).
const FORMA_BANDEIRA = 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)'

// Logo dentro de uma bandeira/flâmula, dupla camada com "moldura" mais fina
// atrás e a logo centralizada numa placa branca — a imagem do logo tem fundo
// branco sólido (sem transparência), então em vez de colar ela direto na cor
// da bandeira (o que deixaria um retângulo branco solto por cima), a placa
// branca assume esse fundo de propósito, como se fosse o "medalhão" da
// bandeira. Cai no ícone de loja se o arquivo não existir (mesma convenção
// do resto do site, ver hooks/use-imagem-com-fallback.ts).
export function LogoBandeira() {
  const { falhou, imgRef, onError } = useImagemComFallback(SRC)

  return (
    <span className="relative flex h-11 w-32 shrink-0 items-center justify-center sm:h-12 sm:w-36">
      <span
        aria-hidden
        className="absolute inset-0 bg-accent"
        style={{ clipPath: FORMA_BANDEIRA }}
      />
      <span
        aria-hidden
        className="absolute inset-[3px] bg-gradient-to-r from-primary/90 via-primary to-primary/90 shadow-md"
        style={{ clipPath: FORMA_BANDEIRA }}
      />

      {/* Placa quadrada — a logo em si é uma composição quadrada (ícone em
          cima, "Q10 Sorvetes" embaixo), então uma placa larga deixaria
          sobrando fundo branco vazio dos dois lados. */}
      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5 sm:h-9 sm:w-9">
        {!falhou ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={SRC}
            alt="Q10 Sorvetes"
            className="h-full w-full rounded-lg object-contain p-0.5"
            onError={onError}
          />
        ) : (
          <Store className="h-5 w-5 text-muted-foreground/50" />
        )}
      </span>
    </span>
  )
}
