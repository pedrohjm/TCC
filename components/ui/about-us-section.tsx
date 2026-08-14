'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView, useSpring, useTransform, type Variants } from 'motion/react'
import { Store, Zap, type LucideIcon } from 'lucide-react'
import { useImagemComFallback } from '@/hooks/use-imagem-com-fallback'

export interface AboutItem {
  titulo: string
  descricao: string
  icone: LucideIcon
  iconeSecundario: LucideIcon
}

export interface AboutStat {
  valor: number
  sufixo: string
  rotulo: string
  icone: LucideIcon
}

interface AboutUsSectionProps {
  rotuloTopo: string
  titulo: string
  texto: string
  itens: AboutItem[]
  numeros: AboutStat[]
  imagemSrc: string
  imagemAlt: string
}

// Adaptado do componente de terceiros "about-us-section". O que mudou, e
// por quê:
//
// - `motion/react` no lugar de `framer-motion` (mesma API, e o pacote
//   `motion` já é o usado no mapa e no carrossel de avisos);
// - cores dos tokens do tema em vez das cores fixas do original
//   (#F2F2EB / #202e44 / #88734C / #A9BBC8), que ignoravam o modo escuro;
// - **layout reorganizado**: o original põe a imagem no meio com os itens
//   em colunas dos dois lados (grid de 3 colunas, `max-w-6xl`). Aqui o
//   painel de conteúdo tem ~680px úteis (o quadro central é limitado a
//   1080px e o menu lateral come 252px), o que daria ~200px por coluna —
//   estreito demais pra um parágrafo. Então virou: imagem centralizada no
//   topo e itens numa grade de 2 colunas abaixo, mantendo o resto do
//   visual (moldura deslocada atrás da foto, bolinhas flutuantes, ícone em
//   caixa arredondada, contadores animados);
// - a imagem vem de `public/images/` com fallback (convenção do site) em
//   vez do link do Unsplash do original;
// - saiu o CTA final ("Ready to transform your space?"): a seção "Fale
//   conosco" vem logo abaixo na home e faz exatamente esse papel;
// - saiu o "Learn more" de cada item — no original ele é invisível de
//   qualquer jeito (`initial` e `animate` ambos com `opacity: 0`, só uma
//   classe de hover que o Framer sobrescreve), e não teria pra onde levar.
export function AboutUsSection({
  rotuloTopo,
  titulo,
  texto,
  itens,
  numeros,
  imagemSrc,
  imagemAlt,
}: AboutUsSectionProps) {
  const secaoRef = useRef<HTMLElement>(null)
  const numerosRef = useRef<HTMLDivElement>(null)
  const estaVisivel = useInView(secaoRef, { once: true, amount: 0.1 })
  const numerosVisiveis = useInView(numerosRef, { once: true, amount: 0.3 })

  const variantesContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  }

  const variantesItem: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  return (
    <section ref={secaoRef} className="relative overflow-hidden rounded-xl bg-muted/40 px-4 py-12 sm:px-6">
      {/* Manchas decorativas do fundo. O original usava um círculo sólido
          com `blur(64px)` e ainda o movia com a rolagem (parallax) — as
          duas coisas custam caro: medindo os quadros durante a rolagem,
          com parallax dava ~16 de 105 quadros acima de 32ms; parado mas
          ainda com `blur`, ~12; sem nada, 0. O desfoque é refeito a cada
          repintura da rolagem, e `will-change: transform` só piorou (42).
          Um `radial-gradient` dá o mesmo visual de mancha suave sem passar
          por filtro nenhum — é só pintura de gradiente. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 rounded-full"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--accent) 55%, transparent), transparent 70%)',
        }}
      />

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-col"
        initial="hidden"
        animate={estaVisivel ? 'visible' : 'hidden'}
        variants={variantesContainer}
      >
        <motion.div className="flex flex-col items-center" variants={variantesItem}>
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase">
            <Zap className="h-3.5 w-3.5" />
            {rotuloTopo}
          </span>
          <h2 className="font-heading text-2xl font-semibold text-balance sm:text-3xl">{titulo}</h2>
          <motion.div
            className="mt-3 h-1 rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={estaVisivel ? { width: 96 } : { width: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </motion.div>

        <motion.p
          className="mx-auto mt-5 max-w-xl text-center text-sm text-muted-foreground"
          variants={variantesItem}
        >
          {texto}
        </motion.p>

        <motion.div className="mt-10 flex justify-center" variants={variantesItem}>
          <FotoSobreNos src={imagemSrc} alt={imagemAlt} />
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {itens.map((item, indice) => (
            <ItemSobre key={item.titulo} item={item} variantes={variantesItem} atraso={indice * 0.1} />
          ))}
        </div>

        <div ref={numerosRef} className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {numeros.map((numero, indice) => (
            <ContadorNumero
              key={numero.rotulo}
              numero={numero}
              visivel={numerosVisiveis}
              atraso={indice * 0.1}
            />
          ))}
        </div>
      </motion.div>
    </section>
  )
}

// Foto com a moldura deslocada atrás e as bolinhas flutuantes do original.
function FotoSobreNos({ src, alt }: { src: string; alt: string }) {
  const { falhou, imgRef, onError } = useImagemComFallback(src)

  return (
    <div className="relative w-full max-w-xs">
      <motion.div
        className="relative overflow-hidden rounded-lg shadow-xl"
        whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
      >
        <div className="flex aspect-4/3 w-full items-center justify-center bg-muted">
          {!falhou ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              className="h-full w-full object-cover"
              onError={onError}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-muted to-accent/20">
              <Store className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </div>
      </motion.div>

      {/* moldura deslocada atrás da foto */}
      <div aria-hidden className="absolute inset-0 -z-10 -m-3 rounded-lg border-4 border-accent" />

      {/* bolinhas de enfeite */}
      <div aria-hidden className="absolute -top-4 -right-6 h-14 w-14 rounded-full bg-primary/10" />
      <div aria-hidden className="absolute -bottom-5 -left-8 h-16 w-16 rounded-full bg-accent/25" />
      <motion.div
        aria-hidden
        className="absolute -top-7 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-primary"
        animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function ItemSobre({
  item,
  variantes,
  atraso,
}: {
  item: AboutItem
  variantes: Variants
  atraso: number
}) {
  const Icone = item.icone
  const IconeSecundario = item.iconeSecundario

  return (
    <motion.div
      className="group flex flex-col"
      variants={variantes}
      transition={{ delay: atraso }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="mb-3 flex items-center gap-3">
        <motion.span
          className="relative rounded-lg bg-primary/10 p-3 text-primary transition-colors duration-300 group-hover:bg-primary/20"
          whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.5 } }}
        >
          <Icone className="h-5 w-5" />
          <IconeSecundario className="absolute -top-1 -right-1 h-3.5 w-3.5 text-accent-foreground/70" />
        </motion.span>
        <h3 className="font-heading text-base font-medium transition-colors duration-300 group-hover:text-primary">
          {item.titulo}
        </h3>
      </div>
      <p className="pl-14 text-sm leading-relaxed text-muted-foreground">{item.descricao}</p>
    </motion.div>
  )
}

function ContadorNumero({
  numero,
  visivel,
  atraso,
}: {
  numero: AboutStat
  visivel: boolean
  atraso: number
}) {
  const Icone = numero.icone
  const valorSuave = useSpring(0, { stiffness: 50, damping: 12 })
  const valorExibido = useTransform(valorSuave, (atual) => Math.floor(atual).toLocaleString('pt-BR'))

  useEffect(() => {
    if (visivel) valorSuave.set(numero.valor)
  }, [visivel, numero.valor, valorSuave])

  return (
    <motion.div
      className="group flex flex-col items-center rounded-xl bg-background/70 p-4 text-center backdrop-blur-sm transition-colors duration-300 hover:bg-background"
      initial={{ opacity: 0, y: 20 }}
      animate={visivel ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: atraso }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.span
        className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20"
        whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
      >
        <Icone className="h-5 w-5" />
      </motion.span>
      <span className="flex items-baseline font-heading text-xl font-bold sm:text-2xl">
        <motion.span>{valorExibido}</motion.span>
        <span>{numero.sufixo}</span>
      </span>
      <p className="mt-1 text-xs text-muted-foreground">{numero.rotulo}</p>
      <span className="mt-2 h-0.5 w-8 bg-primary transition-all duration-300 group-hover:w-14" />
    </motion.div>
  )
}
