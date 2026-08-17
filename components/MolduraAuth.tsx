import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FotoAuth } from '@/components/FotoAuth'

interface MolduraAuthProps {
  titulo: string
  subtitulo: string
  /** O formulário da tela. */
  children: ReactNode
  /** Linha de baixo: link pra outra tela (entrar <-> criar conta). */
  rodape: ReactNode
}

// Moldura das telas de autenticação, no formato da imagem de referência:
// a foto ocupa a metade esquerda e o formulário fica numa coluna à
// direita. No celular a foto sai (não sobra altura pra ela sem espremer o
// formulário) e fica só a coluna do formulário.
//
// O "Login with Google" da referência não entrou: o projeto só tem login
// por e-mail e senha (auth.ts, provider Credentials), e um botão que não
// faz nada seria pior do que não ter botão.
export function MolduraAuth({ titulo, subtitulo, children, rodape }: MolduraAuthProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="hidden lg:block">
        <FotoAuth />
      </div>

      <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o site
          </Link>

          <h1 className="font-heading text-3xl font-bold tracking-tight">{titulo}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitulo}</p>

          <div className="mt-8">{children}</div>

          <div className="mt-6 text-center text-sm text-muted-foreground">{rodape}</div>
        </div>
      </div>
    </div>
  )
}
