import { BlocoLocalizacao } from '@/components/BlocoLocalizacao'

// O conteúdo em si está em components/BlocoLocalizacao.tsx, porque o
// mesmo bloco aparece no topo da seção "Contato" da landing.
export default function PaginaEstabelecimento() {
  return (
    <div className="flex w-full flex-1 flex-col p-4">
      <BlocoLocalizacao />
    </div>
  )
}
