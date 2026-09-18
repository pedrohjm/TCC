import bcrypt from 'bcryptjs'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import { CampoSenha, CampoTexto } from '@/components/CamposAuth'
import { MolduraAuth } from '@/components/MolduraAuth'
import { prisma } from '@/lib/prisma'
import { mensagemErroAuth, registrarSchema } from '@/lib/validations/auth'

async function criarConta(formData: FormData) {
  'use server'

  const dados = registrarSchema.safeParse({
    nome: formData.get('nome'),
    email: formData.get('email'),
    senha: formData.get('senha'),
    confirmarSenha: formData.get('confirmarSenha'),
  })

  if (!dados.success) {
    const senhaDiferente = dados.error.issues.some((i) => i.path[0] === 'confirmarSenha')
    redirect(`/registrar?erro=${senhaDiferente ? 'senha-diferente' : 'invalido'}`)
  }

  const { nome, email, senha } = dados.data

  const jaExiste = await prisma.usuario.findUnique({ where: { email } })
  if (jaExiste) {
    redirect('/registrar?erro=email-em-uso')
  }

  await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash: await bcrypt.hash(senha, 10),
      // Papel fixo no código, nunca vindo do formulário: quem se cadastra
      // sozinho entra como ATENDENTE. Se o papel viesse do formulário,
      // qualquer pessoa poderia se cadastrar como DONO e abrir o
      // faturamento da loja no dashboard.
      papel: 'ATENDENTE',
    },
  })

  // Já entra com a conta recém-criada, pra não pedir os mesmos dados duas
  // vezes seguidas. signIn redireciona lançando exceção, então nada roda
  // depois daqui.
  await signIn('credentials', { email, senha, redirectTo: '/' })
}

export default async function PaginaRegistrar({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams
  const mensagem = mensagemErroAuth(erro)

  return (
    <MolduraAuth
      titulo="Criar conta"
      subtitulo="Cadastre-se para registrar vendas na Q10 Sorvetes."
      rodape={
        <>
          Já tem conta?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form action={criarConta} className="space-y-4">
        {mensagem && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {mensagem}
          </p>
        )}

        <CampoTexto
          id="nome"
          name="nome"
          rotulo="Nome"
          placeholder="Seu nome"
          autoComplete="name"
        />

        <CampoTexto
          id="email"
          name="email"
          rotulo="E-mail"
          tipo="email"
          placeholder="seu@email.com"
          autoComplete="email"
        />

        <CampoSenha
          id="senha"
          name="senha"
          rotulo="Senha"
          placeholder="Pelo menos 6 caracteres"
          autoComplete="new-password"
        />

        <CampoSenha
          id="confirmarSenha"
          name="confirmarSenha"
          rotulo="Confirmar senha"
          placeholder="Repita a senha"
          autoComplete="new-password"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-primary-soft py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-soft/90"
        >
          Criar conta
        </button>
      </form>
    </MolduraAuth>
  )
}
