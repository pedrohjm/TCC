'use client'

import { Store } from 'lucide-react'
import { useImagemComFallback } from '@/hooks/use-imagem-com-fallback'

const SRC = '/images/logo/Logo.png'

// Formato "bandeira": um hexágono alongado (pontas em vez de cantos retos
// nas duas laterais), no estilo do "TBH" do topo do site de referência de
// então (o modelo.pdf que ficava em public/images/modelo/, hoje removido).
// Duas camadas com o mesmo recorte,
// uma um pouco maior por baixo (cor de acento = "menta" da paleta da loja),
// criam o efeito de borda/moldura ao redor da bandeira em si (cor primária).
const FORMA_BANDEIRA = 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)'

// Logo dentro de uma bandeira/flâmula, dupla camada com "moldura" mais fina
// atrás (a imagem em si vai direto sobre o corpo da bandeira, sem placa —
// o arquivo já tem fundo transparente). Cai no ícone de loja se o arquivo
// não existir (mesma convenção do resto do site, ver
// hooks/use-imagem-com-fallback.ts).
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

      {!falhou ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={SRC}
          alt="Q10 Sorvetes"
          className="relative z-10 h-9 w-9 object-contain drop-shadow-sm sm:h-10 sm:w-10"
          onError={onError}
        />
      ) : (
        <Store className="relative z-10 h-5 w-5 text-primary-foreground/80" />
      )}
    </span>
  )
}
