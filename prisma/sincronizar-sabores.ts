import 'dotenv/config'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client.js'
import { SABORES } from './sabores.js'

// Leva a lista de prisma/sabores.ts pro banco. Pelo NOME:
//   - nome que já existe  → atualiza descrição, categorias e foto;
//   - nome novo           → cria;
//   - sabor no banco que não está mais na lista → desativa (some do
//     cardápio, mas fica no banco — vendas antigas não apontam pra Sabor,
//     então apagar seria seguro, mas desativar deixa voltar sem retrabalho).
//
// É separado do `prisma db seed` de propósito: o seed zera o banco inteiro
// (vendas, produtos, usuários) pra montar um ambiente de teste, e ninguém
// deve rodar isso numa loja com venda registrada só pra acrescentar um
// sabor. Este script mexe só na tabela Sabor.
//
// Uso:  npm run sabores
export async function sincronizarSabores(prisma: PrismaClient) {
  validar()

  let criados = 0
  let atualizados = 0

  for (const sabor of SABORES) {
    const existente = await prisma.sabor.findUnique({ where: { nome: sabor.nome } })
    await prisma.sabor.upsert({
      where: { nome: sabor.nome },
      create: { ...sabor, ativo: true },
      update: { ...sabor, ativo: true },
    })
    if (existente) atualizados++
    else criados++
  }

  const { count: desativados } = await prisma.sabor.updateMany({
    where: { nome: { notIn: SABORES.map((sabor) => sabor.nome) }, ativo: true },
    data: { ativo: false },
  })

  return { criados, atualizados, desativados }
}

// Erros de digitação na lista que só apareceriam como sabor sumido ou foto
// quebrada no cardápio — melhor parar aqui, com a linha certa.
function validar() {
  const nomes = new Set<string>()
  for (const sabor of SABORES) {
    if (nomes.has(sabor.nome)) {
      throw new Error(`prisma/sabores.ts: o sabor "${sabor.nome}" aparece duas vezes`)
    }
    nomes.add(sabor.nome)

    if (sabor.categorias.length === 0) {
      throw new Error(`prisma/sabores.ts: "${sabor.nome}" precisa de pelo menos uma categoria`)
    }

    // Foto faltando não é erro (o cartão cai no ícone), mas avisa — é o
    // engano mais comum: o nome no arquivo não bate com o nome aqui.
    if (sabor.foto && !existsSync(join(process.cwd(), 'public', sabor.foto))) {
      console.warn(`aviso: "${sabor.nome}" aponta pra ${sabor.foto}, que não existe em public/`)
    }
  }
}

// Só executa quando chamado direto (npm run sabores); quando o seed
// importa a função, este bloco não roda.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  sincronizarSabores(prisma)
    .then(({ criados, atualizados, desativados }) => {
      console.log(
        `Sabores sincronizados: ${criados} criado(s), ${atualizados} atualizado(s), ${desativados} desativado(s). Total na lista: ${SABORES.length}.`
      )
    })
    .catch((erro) => {
      console.error(erro)
      process.exitCode = 1
    })
    .finally(async () => {
      await prisma.$disconnect()
      await pool.end()
    })
}
