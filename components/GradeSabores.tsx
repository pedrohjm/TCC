'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CATEGORIAS_SABOR, type CategoriaSaborValor } from '@/lib/categorias-sabor'

export interface Sabor {
  id: number
  nome: string
  categoria: CategoriaSaborValor
  descricao: string
  foto: string | null
}

interface GradeSaboresProps {
  sabores: Sabor[]
  carregando: boolean
  erro: string | null
}

// Foto com fallback: se o arquivo em public/images/cardapio/ ainda não
// existir (nenhuma foto real foi tirada ainda), cai no ícone da categoria
// — mesma ideia usada na logo (components/AppSidebar.tsx).
function FotoSabor({ src, alt, icone: Icone }: { src: string | null; alt: string; icone: LucideIcon }) {
  const [falhou, setFalhou] = useState(!src)

  return (
    <div className="flex aspect-square items-center justify-center overflow-hidden bg-muted">
      {!falhou && src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFalhou(true)}
        />
      )}
      {falhou && <Icone className="h-8 w-8 text-muted-foreground/40" />}
    </div>
  )
}

function CartaoSabor({ sabor }: { sabor: Sabor }) {
  const info = CATEGORIAS_SABOR.find((categoria) => categoria.valor === sabor.categoria)!
  const Icone = info.icone

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <FotoSabor src={sabor.foto} alt={sabor.nome} icone={Icone} />
      <div className="space-y-1 p-3">
        <span className={`text-[0.65rem] font-semibold tracking-wide uppercase ${info.corTexto}`}>
          {info.rotulo}
        </span>
        <p className="text-sm leading-tight font-semibold">{sabor.nome}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">{sabor.descricao}</p>
      </div>
    </div>
  )
}

function pluralizar(quantidade: number) {
  return quantidade === 1 ? 'sabor encontrado' : 'sabores encontrados'
}

// "Quadrado" 2 da tela de sabores — grade de cartões no estilo do modelo
// em public/images/modelo/Sabores.pdf (contador no topo + grade de cards
// com imagem, categoria e descrição curta).
export function GradeSabores({ sabores, carregando, erro }: GradeSaboresProps) {
  return (
    <Card>
      <CardHeader className="text-sm font-medium text-muted-foreground">
        {carregando ? 'Carregando…' : `${sabores.length} ${pluralizar(sabores.length)}`}
      </CardHeader>
      <CardContent>
        {erro && (
          <p className="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">{erro}</p>
        )}
        {!carregando && !erro && sabores.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum sabor encontrado nessa categoria.</p>
        )}
        {sabores.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {sabores.map((sabor) => (
              <CartaoSabor key={sabor.id} sabor={sabor} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
