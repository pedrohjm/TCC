# Imagens do site

Pasta pra colocar as imagens usadas no cardápio/site. Tudo aqui vira uma URL
pública em `/images/...` (ex.: `public/images/logo/logo.png` fica acessível
em `/images/logo/logo.png`).

- `logo/Logo.png` — logo da Q10 Sorvetes, usada no topo da janela
  (`app/layout.tsx`). Enquanto o arquivo não existir (ou tiver outro nome),
  aparece um ícone de loja no lugar (fallback automático, não quebra nada).
  Atenção ao nome exato do arquivo (`Logo.png`, com L maiúsculo) — no
  Windows não faz diferença, mas em produção (Linux) faz.
- `banners/fundo.jpg` — imagem de fundo atrás da "janela" do app
  (`components/FundoPagina.tsx`). Sem esse arquivo, cai num gradiente.
- `cardapio/` — fotos dos sabores/produtos. A tela de Sabores 1800ml já usa
  isso de verdade: os nomes esperados (definidos em `prisma/seed.ts`) são
  `chocolate-belga.jpg`, `ninho-nutella.jpg`, `brigadeiro.jpg`, `morango.jpg`,
  `manga.jpg`, `maracuja.jpg`, `limao-siciliano.jpg`, `tangerina.jpg` e
  `framboesa.jpg`. Sem o arquivo, o card cai num ícone da categoria (Doce/
  Fruta/Azedo) em vez de quebrar. As outras categorias (SelfService,
  Picolés, Acompanhamentos, Bebidas) ainda são só "em breve", sem uso de
  imagem ainda.
- `banners/estabelecimento.jpg` — foto da fachada/interior da loja, usada
  no topo da página `/estabelecimento`. Sem esse arquivo, cai num fundo em
  gradiente com o ícone da loja.
- `banners/home.jpg` — foto do topo da home (`/`), mesmo formato e mesmo
  fallback da de cima (as duas usam `components/FotoDestaque.tsx`).
  Proporção 16:10 é a que melhor se encaixa sem cortar.
- `banners/sobre.jpg` — foto da seção "Sobre nós" da home (equipe, loja
  por dentro, o que fizer sentido). Proporção 4:3. Sem o arquivo, cai no
  ícone de loja.
- `banners/login.jpg` — foto da metade esquerda das telas de entrar e
  criar conta (`/login` e `/registrar`). Ocupa a coluna inteira, então
  prefira uma imagem "em pé" (mais alta que larga). Sem o arquivo, cai
  num degradê com o ícone de sorvete.
- `banners/` — imagens maiores (ex. banner da home), se um dia a home
  precisar de uma foto em vez do fundo colorido atual.

Formatos recomendados: `.png` (com fundo transparente) ou `.jpg`/`.webp`
pra fotos. Não precisa avisar o Claude Code depois de adicionar os
arquivos — o `<img>`/`<Avatar>` já aponta pro caminho certo.
