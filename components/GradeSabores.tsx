'use client'

import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { cn } from '@/lib/utils'
import { CATEGORIAS_SABOR, type CategoriaSaborValor, type InfoCategoriaSabor } from '@/lib/categorias-sabor'
import { useImagemComFallback } from '@/hooks/use-imagem-com-fallback'

export interface Sabor {
  id: number
  nome: string
  /** Uma ou mais. A primeira é a "principal": dá o ícone de fallback da foto. */
  categorias: CategoriaSaborValor[]
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
// — mesma ideia usada nas outras imagens do site (hooks/use-imagem-com-fallback). className/
// tamanhoIcone permitem reaproveitar isso tanto no cartão (foto grande,
// quadrada) quanto na miniatura ao lado do nome no preview do hover.
function FotoSabor({
  src,
  alt,
  icone: Icone,
  className,
  tamanhoIcone = 'h-10 w-10',
}: {
  src: string | null
  alt: string
  icone: LucideIcon
  className?: string
  tamanhoIcone?: string
}) {
  const { falhou, imgRef, onError } = useImagemComFallback(src)

  return (
    <div className={cn('flex aspect-square items-center justify-center overflow-hidden bg-muted', className)}>
      {!falhou && src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={onError}
        />
      )}
      {falhou && <Icone className={cn('text-muted-foreground/40', tamanhoIcone)} />}
    </div>
  )
}

function TagCategoria({ info }: { info: InfoCategoriaSabor }) {
  return (
    <span className={`text-[0.65rem] font-semibold tracking-wide uppercase ${info.corTexto}`}>
      {info.rotulo}
    </span>
  )
}

// Todas as categorias do sabor, lado a lado, cada uma na sua cor — o
// cliente vê de cara que Morango é "Fruta · Doce".
function TagsCategoria({ infos }: { infos: InfoCategoriaSabor[] }) {
  return (
    <span className="flex flex-wrap items-center gap-x-1.5">
      {infos.map((info, indice) => (
        <span key={info.valor} className="flex items-center gap-x-1.5">
          {indice > 0 && <span className="text-[0.65rem] text-muted-foreground/60">·</span>}
          <TagCategoria info={info} />
        </span>
      ))}
    </span>
  )
}

// Cartão com foto + tag + nome. Passando o mouse, abre uma janela pro lado
// (nunca pra cima/baixo — ver collisionAvoidance em components/ui/hover-card.tsx)
// no estilo do modelo em public/images/modelo/Mouse_Sabores.pdf: tag+nome
// no topo, foto no meio, descrição embaixo.
function CartaoSabor({ sabor }: { sabor: Sabor }) {
  // Mantém a ordem da lista em prisma/sabores.ts (a primeira é a principal).
  const infos = sabor.categorias
    .map((valor) => CATEGORIAS_SABOR.find((categoria) => categoria.valor === valor))
    .filter((info): info is InfoCategoriaSabor => info !== undefined)
  const principal = infos[0] ?? CATEGORIAS_SABOR[0]

  return (
    <HoverCard>
      <HoverCardTrigger
        render={<div />}
        delay={150}
        closeDelay={100}
        className="cursor-default overflow-hidden rounded-lg border border-border transition-colors hover:border-primary/50"
      >
        <FotoSabor src={sabor.foto} alt={sabor.nome} icone={principal.icone} />
        <div className="space-y-1 p-3">
          <TagsCategoria infos={infos} />
          <p className="text-sm leading-tight font-semibold">{sabor.nome}</p>
        </div>
      </HoverCardTrigger>

      <HoverCardContent className="w-72 overflow-hidden rounded-lg p-0">
        {/* topo: foto pequena + tag/nome ao lado, como no modelo (ícone do
            item à esquerda, nome/atributos à direita) */}
        <div className="flex items-center gap-3 border-b border-border bg-muted/40 p-3">
          <FotoSabor
            src={sabor.foto}
            alt={sabor.nome}
            icone={principal.icone}
            className="h-14 w-14 shrink-0 rounded-md"
            tamanhoIcone="h-6 w-6"
          />
          <div className="space-y-0.5">
            <TagsCategoria infos={infos} />
            <p className="text-sm leading-tight font-semibold">{sabor.nome}</p>
          </div>
        </div>
        {/* embaixo de tudo: descrição */}
        <div className="p-3">
          <p className="text-xs text-muted-foreground">{sabor.descricao}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

function pluralizar(quantidade: number) {
  return quantidade === 1 ? 'sabor encontrado' : 'sabores encontrados'
}

// "Quadrado" 2 da tela de sabores — grade de cartões no estilo do modelo
// em public/images/modelo/Sabores.pdf (contador no topo + grade de cards).
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
