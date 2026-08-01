-- DropForeignKey
ALTER TABLE "ItemVenda" DROP CONSTRAINT "ItemVenda_vendaId_fkey";

-- AddForeignKey
ALTER TABLE "ItemVenda" ADD CONSTRAINT "ItemVenda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;
