import { AvisosHome } from '@/components/AvisosHome'
import { BlocoLocalizacao } from '@/components/BlocoLocalizacao'
import { CardapioLanding } from '@/components/CardapioLanding'
import { FaleConosco } from '@/components/FaleConosco'
import { HeroLanding } from '@/components/HeroLanding'
import { SobreNos } from '@/components/SobreNos'

// Home pública — visão do cliente, em formato de landing. Não exige
// login: qualquer visitante (num tablet da loja ou no celular) enxerga o
// cardápio. As telas de atendente (registro de venda) e dono (dashboard)
// ficam atrás de login, veja proxy.ts.
//
// A ordem das seções é a mesma de lib/secoes-landing.ts, que alimenta o
// menu de navegação rápida da barra do topo. Cada seção carrega o `id`
// correspondente (as âncoras) — os `scroll-mt-*` compensam a altura do
// cabeçalho fixo, senão o título da seção ficaria escondido atrás dele.
export default function Home() {
  return (
    <>
      <HeroLanding />
      <CardapioLanding />

      <section
        id="avisos"
        className="mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-14 md:scroll-mt-20 md:py-20"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">
            Fique por dentro
          </span>
          <h2 className="font-heading text-2xl font-semibold text-balance sm:text-3xl">Avisos</h2>
        </div>
        <AvisosHome />
      </section>

      <div
        id="sobre"
        className="mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-4 md:scroll-mt-20"
      >
        <SobreNos />
      </div>

      {/* Contato começa pela localização (o botão "Como chegar" do hero
          aponta pra cá) e termina nas redes sociais. */}
      <section
        id="contato"
        className="mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-14 md:scroll-mt-20 md:py-20"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">
            Venha nos visitar
          </span>
          <h2 className="font-heading text-2xl font-semibold text-balance sm:text-3xl">Contato</h2>
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <BlocoLocalizacao />
          <FaleConosco />
        </div>
      </section>
    </>
  )
}
