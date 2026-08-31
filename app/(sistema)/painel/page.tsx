import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { PainelGestao } from '@/components/PainelGestao'
import { secaoInicial } from '@/lib/secoes-painel'

// As três telas do sistema (registrar venda, falta no estoque, dashboard)
// numa página só, escolhidas por categoria — ver components/PainelGestao.
//
// A categoria vem da URL (`?secao=`) e é validada aqui, no servidor,
// contra o papel de quem entrou: quem não é DONO não recebe a categoria
// do dashboard nem no HTML. Os dados têm a mesma trava do lado da API
// (`exigirDono` em app/api/relatorios/route.ts) — a tela some, mas quem
// garante é a rota.
export default async function PaginaPainel({
  searchParams,
}: {
  searchParams: Promise<{ secao?: string }>
}) {
  const sessao = await auth()

  // O proxy.ts já barra quem não está logado; isto aqui é a rede de
  // segurança (e o que garante pro TypeScript que `papel` existe).
  if (!sessao?.user) {
    redirect('/login')
  }

  const { secao } = await searchParams

  return (
    <PainelGestao papel={sessao.user.papel} secaoInicial={secaoInicial(secao, sessao.user.papel)} />
  )
}
