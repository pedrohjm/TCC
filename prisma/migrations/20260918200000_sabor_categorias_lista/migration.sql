-- Sabor.categoria (um valor) vira Sabor.categorias (lista): a tabela de
-- sabores real da loja tem gosto que e Fruta E Doce ao mesmo tempo.
-- O que ja existe no banco vira uma lista de um item so, nada se perde.
ALTER TABLE "Sabor" ADD COLUMN "categorias" "CategoriaSabor"[] NOT NULL DEFAULT ARRAY[]::"CategoriaSabor"[];
UPDATE "Sabor" SET "categorias" = ARRAY["categoria"];
ALTER TABLE "Sabor" DROP COLUMN "categoria";

-- nome unico: e a chave pela qual prisma/sabores.ts atualiza o banco
CREATE UNIQUE INDEX "Sabor_nome_key" ON "Sabor"("nome");
