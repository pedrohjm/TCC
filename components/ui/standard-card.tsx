'use client'

import { useRef } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { ArrowRight, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StandardCardItem {
  titulo: string
  descricao: string
  icone: LucideIcon
  /** Etiqueta curta no topo do card (ex.: "Novidade", "Promoção"). */
  rotulo?: string
  /** Se existir, o card inteiro vira link e ganha o "Ver mais". */
  href?: string
}

// Card que inclina levemente seguindo o mouse (efeito 3D) e entra com um
// fade ao aparecer na tela. Adaptado do componente de terceiros
// "standard-card". O que mudou em relação ao original, e por quê:
//
// - usa `motion/react` (pacote `motion`, já instalado pro mapa da página
//   Estabelecimento) em vez de `framer-motion` — é a mesma API, instalar
//   `framer-motion` junto seria uma segunda cópia da mesma biblioteca;
// - cores vêm dos tokens do tema (`bg-card`, `text-muted-foreground`…) em
//   vez de `bg-white`/`text-black` fixos, senão o card ficaria branco no
//   modo escuro do site;
// - o original era uma página inteira (fundo #0a0a0a, spotlight seguindo o
//   mouse, textura de ruído vinda de uma URL externa e um `<style>` que
//   pintava o `body`). Aqui sobrou só o card + o carrossel: o resto
//   sobrescreveria o layout e o tema do site;
// - sem `cursor-none` (o original tinha um cursor customizado; sem ele, o
//   cursor simplesmente sumiria em cima do card) e sem o hook `useLenis`,
//   que mexia no `scroll-behavior` do documento inteiro;
// - tamanhos menores: o painel de conteúdo tem ~730px úteis, os cards de
//   380x450px do original não caberiam.
function StandardCard({ item, indice }: { item: StandardCardItem; indice: number }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xSuave = useSpring(x)
  const ySuave = useSpring(y)

  const rotateX = useTransform(ySuave, [-0.5, 0.5], ['10deg', '-10deg'])
  const rotateY = useTransform(xSuave, [-0.5, 0.5], ['-10deg', '10deg'])

  const aoMoverMouse = (evento: MouseEvent<HTMLDivElement>) => {
    const area = evento.currentTarget.getBoundingClientRect()
    x.set((evento.clientX - area.left) / area.width - 0.5)
    y.set((evento.clientY - area.top) / area.height - 0.5)
  }

  const aoSairMouse = () => {
    x.set(0)
    y.set(0)
  }

  const Icone = item.icone

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      // delay limitado: sem o `min`, uma lista longa faria o último card
      // demorar segundos pra aparecer.
      transition={{ duration: 0.6, delay: Math.min(indice, 3) * 0.12, ease: [0.23, 1, 0.32, 1] }}
      viewport={{ once: true }}
      onMouseMove={aoMoverMouse}
      onMouseLeave={aoSairMouse}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="group relative flex h-64 w-60 flex-col rounded-3xl bg-card p-6 shadow-sm ring-1 ring-foreground/10 transition-shadow duration-500 hover:shadow-xl sm:h-72 sm:w-72"
    >
      {/* Link cobrindo o card inteiro — mais simples do que compor o
          motion.div com o <Link> e mantém o card todo clicável. */}
      {item.href && (
        <Link href={item.href} aria-label={item.titulo} className="absolute inset-0 z-10 rounded-3xl" />
      )}

      <div style={{ transform: 'translateZ(50px)' }} className="flex h-full flex-col">
        <div className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground shadow-sm transition-all duration-500 ease-out group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg">
          <Icone size={24} strokeWidth={1.4} />
        </div>

        {item.rotulo && (
          <span className="mb-1 text-[0.65rem] font-semibold tracking-widest text-primary uppercase">
            {item.rotulo}
          </span>
        )}

        <h3 className="font-heading text-lg leading-snug font-bold tracking-tight text-balance">
          {item.titulo}
        </h3>

        <p className="mt-2 line-clamp-4 text-sm leading-relaxed font-light text-muted-foreground">
          {item.descricao}
        </p>

        {item.href && (
          <div className="mt-auto flex items-center pt-4 text-xs font-bold tracking-widest uppercase">
            <span className="relative">
              Ver mais
              <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-foreground transition-transform duration-500 group-hover:scale-x-100" />
            </span>
            <motion.span
              className="ml-2 flex"
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight size={16} />
            </motion.span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface StandardCardCarouselProps {
  itens: StandardCardItem[]
  className?: string
}

export function StandardCardCarousel({ itens, className }: StandardCardCarouselProps) {
  const carrosselRef = useRef<HTMLDivElement>(null)

  // Rola pela largura do próprio carrossel, não pela da janela (o original
  // usava `window.innerWidth * 0.8`, que aqui passaria muito do fim).
  const rolar = (direcao: -1 | 1) => {
    const elemento = carrosselRef.current
    if (!elemento) return
    elemento.scrollBy({ left: direcao * elemento.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className={cn('relative w-full', className)}>
      <div className="mb-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => rolar(-1)}
          aria-label="Ver avisos anteriores"
          className="group rounded-full border border-border bg-card p-2.5 transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
        </button>
        <button
          type="button"
          onClick={() => rolar(1)}
          aria-label="Ver próximos avisos"
          className="group rounded-full border border-border bg-card p-2.5 transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* py-*: dá espaço pro card crescer/inclinar sem ser cortado pelo
          overflow do carrossel. */}
      <div
        ref={carrosselRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 py-3"
        style={{ perspective: '2000px' }}
      >
        {itens.map((item, indice) => (
          <div key={item.titulo} className="shrink-0 snap-center">
            <StandardCard item={item} indice={indice} />
          </div>
        ))}
      </div>
    </div>
  )
}
