-- CreateEnum
CREATE TYPE "RegraPreco" AS ENUM ('UNITARIO', 'ESCALONADO', 'PACOTE', 'LIVRE');

-- AlterTable
-- `subtotal` e obrigatorio, mas ja existem itens no banco. Entao entra
-- primeiro como opcional, recebe o valor que a conta antiga dava
-- (precoUnitario x quantidade, que era exatamente o total da linha antes
-- de existirem pacotes) e so depois vira NOT NULL. Assim nenhuma venda ja
-- registrada se perde nem muda de valor.
ALTER TABLE "ItemVenda" ADD COLUMN     "subtotal" DECIMAL(10,2);
UPDATE "ItemVenda" SET "subtotal" = "precoUnitario" * "quantidade" WHERE "subtotal" IS NULL;
ALTER TABLE "ItemVenda" ALTER COLUMN "subtotal" SET NOT NULL;

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "grupoPreco" TEXT,
ADD COLUMN     "precoRegra" DECIMAL(10,2),
ADD COLUMN     "quantidadeRegra" INTEGER,
ADD COLUMN     "regraPreco" "RegraPreco" NOT NULL DEFAULT 'UNITARIO';

-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "descricao" TEXT;
