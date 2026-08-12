import { MapPin, Store } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { FotoDestaque } from '@/components/FotoDestaque'
import { MapaEstabelecimento } from '@/components/MapaEstabelecimento'
import { ENDERECO_ESTABELECIMENTO } from '@/lib/estabelecimento'

// Estilo do modelo em public/images/modelo/Localizacao.pdf: foto grande
// no topo, "Confira nossa localização!" + endereço em pílula logo abaixo,
// e — no lugar do @ do Instagram do modelo — um mapa interativo (clicável)
// em vez de rede social. Endereço e coordenadas ainda são genéricos, ver
// lib/estabelecimento.ts.
export default function PaginaEstabelecimento() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col p-4">
      <Card className="gap-0 overflow-hidden py-0">
        <FotoDestaque
          src="/images/banners/estabelecimento.jpg"
          alt="Fachada da Q10 Sorvetes"
          iconeFallback={<Store />}
          iconeBadge={<MapPin />}
        />

        <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
          <h2 className="font-heading text-2xl font-semibold text-balance">
            Confira nossa localização!
          </h2>

          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            {ENDERECO_ESTABELECIMENTO}
          </span>

          <MapaEstabelecimento />
        </CardContent>
      </Card>
    </div>
  )
}
