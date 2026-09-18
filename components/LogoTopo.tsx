'use client'

import { Store } from 'lucide-react'
import { useImagemComFallback } from '@/hooks/use-imagem-com-fallback'

const SRC = '/images/logo/Logo.png'

// A logo solta na barra do topo, sem moldura — do jeito da referência que o
// usuário mandou (ideiaLogo.png). Já foi uma "bandeira" (hexágono alongado
// em duas camadas, ver o histórico deste arquivo como LogoBandeira.tsx);
// com a paleta amarela a própria oval da logo já é a marca, e a bandeira em
// volta só disputava atenção com ela.
//
// O arquivo é a oval recortada rente (493×237), então a altura aqui é a
// altura da oval de verdade — antes o PNG era 500×500 com a oval ocupando
// menos da metade, e a logo saía miúda por mais que se aumentasse a caixa.
// Cai no ícone de loja se o arquivo não existir (convenção do site, ver
// hooks/use-imagem-com-fallback.ts).
export function LogoTopo() {
  const { falhou, imgRef, onError } = useImagemComFallback(SRC)

  if (falhou) {
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary sm:h-14 sm:w-14">
        <Store className="h-6 w-6" />
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={SRC}
      alt="Q10 Sorvetes"
      className="h-12 w-auto object-contain drop-shadow-sm sm:h-14"
      onError={onError}
    />
  )
}
