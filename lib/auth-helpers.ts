import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

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

// Para as rotas que GRAVAM algo em nome de quem está logado (venda tem
// `usuarioId`). A sessão é um JWT: ela não consulta o banco, então continua
// válida mesmo que o usuário tenha sido apagado — foi o que aconteceu ao
// rodar o seed (que recria os usuários com ids novos) com alguém logado.
// Sem esta checagem o Prisma estourava uma violação de chave estrangeira
// crua, com 500 na tela e nenhuma pista do que fazer.
export async function exigirUsuarioDaSessao(): Promise<
  { usuarioId: number; erro: null } | { usuarioId: null; erro: NextResponse }
> {
  const { sessao, erro } = await exigirSessao()
  if (erro) return { usuarioId: null, erro }

  const usuarioId = Number(sessao.user.id)
  const existe = await prisma.usuario.findUnique({ where: { id: usuarioId }, select: { id: true } })
  if (!existe) {
    return {
      usuarioId: null,
      erro: NextResponse.json(
        { erro: 'Sua sessão não vale mais para esta conta. Saia e entre de novo.' },
        { status: 401 }
      ),
    }
  }
  return { usuarioId, erro: null }
}

// Operações destrutivas (apagar venda/produto) são restritas ao
// DONO — o ATENDENTE só registra e consulta.
export function exigirDono(sessao: Sessao): NextResponse | null {
  if (sessao.user.papel !== 'DONO') {
    return NextResponse.json({ erro: 'Apenas o DONO pode fazer isso' }, { status: 403 })
  }
  return null
}
