import type { CategoriaSabor } from '../app/generated/prisma/enums.js'

// ============================================================================
//  SABORES DO CARDÁPIO — é AQUI que se edita.
// ============================================================================
//
// Pra mudar uma descrição, trocar categoria ou ADICIONAR um sabor novo:
//
//   1. edite a lista abaixo (copie um bloco pra adicionar);
//   2. coloque a foto em public/images/cardapio/ com o nome que está em
//      `foto` — sem espaço nem acento no nome do arquivo, porque vira URL
//      (ex.: "torta-alema.jpeg", não "Torta Alemã.jpeg");
//   3. rode  npm run sabores
//
// Isso atualiza SÓ a tabela de sabores, pelo nome: sabor que já existe é
// atualizado, nome novo é criado, e sabor que sumiu daqui é DESATIVADO
// (some do cardápio, mas fica no banco). Vendas, produtos e usuários não
// são tocados — diferente do `prisma db seed`, que zera tudo.
//
// Categorias possíveis: 'DOCE', 'FRUTA', 'AZEDO'. Pode ter mais de uma —
// o sabor aparece no filtro de qualquer uma delas. A primeira da lista é a
// que dá a cor do cartão.

export interface SaborDoCardapio {
  nome: string
  descricao: string
  categorias: CategoriaSabor[]
  /** Caminho a partir de public/. Deixe null enquanto não tiver foto —
   *  o cartão mostra o ícone da categoria no lugar. */
  foto: string | null
}

export const SABORES: SaborDoCardapio[] = [
  {
    nome: 'Abacaxi ao Vinho',
    descricao: 'Abacaxi macerado no vinho tinto, doce e aromático.',
    categorias: ['FRUTA', 'DOCE'],
    foto: '/images/cardapio/abacaxi-ao-vinho.jpeg',
  },
  {
    nome: 'Ameixa',
    descricao: 'Sabor suave e levemente adocicado de ameixa madura.',
    categorias: ['FRUTA', 'DOCE'],
    foto: '/images/cardapio/ameixa.png',
  },
  {
    nome: 'Chiclete',
    descricao: 'Doce intenso e colorido, lembrando bala de chiclete.',
    categorias: ['DOCE'],
    foto: '/images/cardapio/chiclete.jpeg',
  },
  {
    nome: 'Chocomenta',
    descricao: 'Chocolate cremoso com toque refrescante de menta.',
    categorias: ['DOCE'],
    foto: '/images/cardapio/chocomenta.jpeg',
  },
  {
    nome: 'Diplomata',
    descricao: 'Creme com castanha.',
    categorias: ['DOCE'],
    foto: '/images/cardapio/diplomata.jpeg',
  },
  {
    nome: 'Frutos do Bosque',
    descricao: 'Mix de amora, framboesa e mirtilo, doce e levemente ácido.',
    categorias: ['FRUTA', 'AZEDO'],
    foto: '/images/cardapio/frutos-do-bosque.png',
  },
  {
    nome: 'Iogurte com Amora',
    descricao: 'Cremoso e levemente ácido, com pedaços de amora.',
    categorias: ['FRUTA', 'AZEDO'],
    foto: '/images/cardapio/iogurte-com-amora.jpeg',
  },
  {
    nome: 'Limão',
    descricao: 'Refrescante e cítrico, com acidez marcante.',
    categorias: ['FRUTA', 'AZEDO'],
    foto: '/images/cardapio/limao.jpeg',
  },
  {
    nome: 'Maracujá',
    descricao: 'Tropical e ácido, sabor intenso da fruta.',
    categorias: ['FRUTA', 'AZEDO'],
    foto: '/images/cardapio/maracuja.jpeg',
  },
  {
    nome: 'Milho Verde',
    descricao: 'Cremoso e adocicado, lembrando milho cozido.',
    categorias: ['DOCE'],
    foto: '/images/cardapio/milho-verde.jpeg',
  },
  {
    nome: 'Morango',
    descricao: 'Clássico e frutado, doce com leve acidez.',
    categorias: ['FRUTA', 'DOCE'],
    foto: '/images/cardapio/morango.png',
  },
  {
    nome: 'Prestígio',
    descricao: 'Chocolate com coco, inspirado no doce famoso.',
    categorias: ['DOCE'],
    foto: '/images/cardapio/prestigio.jpeg',
  },
  {
    nome: 'Torta Alemã',
    descricao: 'Creme amanteigado com biscoito, lembrando a sobremesa clássica.',
    categorias: ['DOCE'],
    foto: '/images/cardapio/torta-alema.jpeg',
  },
]
