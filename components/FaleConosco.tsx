import type { CSSProperties } from 'react'
import { siWhatsapp, siInstagram, siFacebook } from 'simple-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RedeSocial {
  nome: string
  path: string
  hex: string
}

// Ícones e cor oficial de cada rede vêm do pacote simple-icons (traço
// exato da marca, sem depender de transcrever o SVG na mão). Ainda não tem
// link nenhum configurado (número de WhatsApp, @ do Instagram, página do
// Facebook) — por isso é um <button>, não um <a>: sem destino real ainda,
// não faz sentido fingir que é um link. Quando tiver os links de verdade,
// trocar o <button> por <a href={...}> em IconeRedeSocial.
const REDES: RedeSocial[] = [
  { nome: 'WhatsApp', path: siWhatsapp.path, hex: siWhatsapp.hex },
  { nome: 'Instagram', path: siInstagram.path, hex: siInstagram.hex },
  { nome: 'Facebook', path: siFacebook.path, hex: siFacebook.hex },
]

// Adaptado do componente de terceiros "connect-with-us": ícone circular que
// levanta e ganha um brilho na cor oficial da rede ao passar o mouse/tocar.
// Bastante diferente do original em relação ao visual — que era uma página
// inteira (fundo preto, degradê roxo/rosa, `<style jsx>`, que não é usado
// em nenhum outro lugar do projeto) — virou só uma seção que se encaixa no
// tema claro/escuro do site: fundo ocioso vem dos tokens do tema
// (`bg-muted`) em vez de branco translúcido sobre fundo escuro fixo, e o
// brilho por marca usa uma CSS var por item (mesma técnica do GradientMenu
// em components/ui/gradient-menu.tsx) em vez de uma classe fixa por rede.
function IconeRedeSocial({ rede }: { rede: RedeSocial }) {
  return (
    <button
      type="button"
      aria-label={rede.nome}
      style={{ '--cor-marca': `#${rede.hex}` } as CSSProperties}
      className="group flex flex-col items-center gap-2"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted ring-1 ring-border transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-[var(--cor-marca)] group-hover:shadow-[0_0_24px_var(--cor-marca)] group-hover:ring-transparent">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-7 w-7 text-muted-foreground transition-colors duration-300 group-hover:text-white">
          <path d={rede.path} />
        </svg>
      </span>
      <span className="text-xs font-medium text-muted-foreground opacity-70 transition-opacity group-hover:opacity-100">
        {rede.nome}
      </span>
    </button>
  )
}

export function FaleConosco() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Fale conosco</CardTitle>
        <p className="text-sm text-muted-foreground">
          Siga nossas redes sociais e mande uma mensagem.
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap justify-center gap-8 py-2">
        {REDES.map((rede) => (
          <IconeRedeSocial key={rede.nome} rede={rede} />
        ))}
      </CardContent>
    </Card>
  )
}
