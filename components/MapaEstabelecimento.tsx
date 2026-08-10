/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { LocationMap } from '@/components/ui/expanded-map'
import { LOCALIZACAO_MAPA } from '@/lib/estabelecimento'

// Mapa interativo no lugar do @ do Instagram do modelo (clique expande,
// mesma ideia do componente "expanded-map"). tileProvider muda com o tema
// pra não destoar do resto do site, que já tem dark mode de verdade.
export function MapaEstabelecimento() {
  const { resolvedTheme } = useTheme()
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  return (
    <LocationMap
      location={LOCALIZACAO_MAPA.nome}
      latitude={LOCALIZACAO_MAPA.latitude}
      longitude={LOCALIZACAO_MAPA.longitude}
      zoom={LOCALIZACAO_MAPA.zoom}
      tileProvider={montado && resolvedTheme === 'dark' ? 'carto-dark' : 'carto-light'}
      className="mx-auto"
    />
  )
}
