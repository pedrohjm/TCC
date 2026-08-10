'use client'

import { useEffect, useRef, useState } from 'react'

// Fallback de <img> pra quando o arquivo ainda não existe em public/images.
// O onError sozinho não é suficiente: como a página é renderizada no
// servidor, o navegador já começa a baixar a imagem antes do React
// terminar de hidratar — se o 404 chegar rápido (comum em localhost), o
// evento "error" nativo dispara e se perde antes do listener do React ser
// anexado, e o onError nunca roda. Por isso checamos também
// img.complete/naturalWidth logo no mount, que pega esse caso.
export function useImagemComFallback(src: string | null) {
  const [falhou, setFalhou] = useState(!src)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth === 0) {
      setFalhou(true)
    }
  }, [src])

  return { falhou, imgRef, onError: () => setFalhou(true) } as const
}
