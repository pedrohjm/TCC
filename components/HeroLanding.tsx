'use client'

import { motion } from 'motion/react'
import { ArrowRight, BadgeCheck, MapPin, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useImagemComFallback } from '@/hooks/use-imagem-com-fallback'
import { NUMEROS_SOBRE_NOS } from '@/lib/sobre-nos'

const SRC_HERO = '/images/banners/home.jpg'

// Hero no formato do modelo em public/images/modelo/homepage.png: texto
// à esquerda (rótulo pequeno, título grande em duas cores, parágrafo,
// botões e uma linha de números embaixo) e uma imagem grande à direita.
// As cores são as do tema da loja (morango/menta), não o verde escuro do
// modelo, pra continuar funcionando nos dois temas do site.
export function HeroLanding() {
  const { falhou, imgRef, onError } = useImagemComFallback(SRC_HERO)

  // Os três primeiros números do "Sobre nós" — mesma fonte de dados, pra
  // não ter dois lugares com os mesmos valores (ver lib/sobre-nos.ts,
  // onde eles ainda são placeholder).
  const numeros = NUMEROS_SOBRE_NOS.slice(0, 3)

  return (
    <section
      id="inicio"
      className="relative scroll-mt-28 overflow-hidden border-b border-border/60 md:scroll-mt-20"
    >
      {/* manchas de cor no fundo — radial-gradient em vez de blur, que
          trava a rolagem (ver components/ui/about-us-section.tsx) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--primary) 20%, transparent), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-32 h-[28rem] w-[28rem] rounded-full"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--accent) 50%, transparent), transparent 70%)',
        }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase">
            A sorveteria do bairro
            <BadgeCheck className="h-4 w-4" />
          </span>

          {/* Título em duas cores, como no modelo */}
          <h1 className="font-heading text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Sorvete de verdade,
            <br />
            <span className="text-primary">feito pra você.</span>
          </h1>

          <p className="mt-5 max-w-lg text-base text-muted-foreground">
            Sabores de 1800 ml, self-service, picolés, acompanhamentos e bebidas. Escolha pela
            categoria e veja o que está disponível na loja hoje.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" nativeButton={false} render={<a href="#cardapio" />}>
              Ver o cardápio
              <ArrowRight className="h-4 w-4" />
            </Button>
            {/* Âncora pra seção "Contato" da própria landing, que agora
                começa pela localização — antes ia pra página
                /estabelecimento. */}
            <Button size="lg" variant="outline" nativeButton={false} render={<a href="#contato" />}>
              <MapPin className="h-4 w-4" />
              Como chegar
            </Button>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6">
            {numeros.map((numero) => (
              <div key={numero.rotulo}>
                <p className="font-heading text-2xl font-bold">
                  {numero.valor.toLocaleString('pt-BR')}
                  {numero.sufixo}
                </p>
                <p className="text-xs text-muted-foreground">{numero.rotulo}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        >
          <div className="aspect-4/3 w-full overflow-hidden rounded-3xl bg-muted shadow-2xl ring-1 ring-foreground/10">
            {!falhou ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={SRC_HERO}
                alt="Q10 Sorvetes"
                className="h-full w-full object-cover"
                onError={onError}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/25 via-muted to-accent/25">
                <Store className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
