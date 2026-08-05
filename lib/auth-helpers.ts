import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { auth } from '@/auth'

type Sessao = Session

// Toda rota de /app/api chama isto primeiro. Se não houver sessão válida,
// devolve a resposta 401 pronta pra retornar; senão devolve a sessão.
export async function exigirSessao(): Promise<
  { sessao: Sessao; erro: null } | { sessao: null; erro: NextResponse }
> {
  const sessao = await auth()
  if (!sessao?.user) {
    return { sessao: null, erro: NextResponse.json({ erro: 'Não autenticado' }, { status: 401 }) }
  }
  return { sessao, erro: null }
}

// Operações destrutivas (apagar venda/produto/reserva) são restritas ao
// DONO — o ATENDENTE só registra e consulta.
export function exigirDono(sessao: Sessao): NextResponse | null {
  if (sessao.user.papel !== 'DONO') {
    return NextResponse.json({ erro: 'Apenas o DONO pode fazer isso' }, { status: 403 })
  }
  return null
}
