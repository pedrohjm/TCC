# Imagens do site

Pasta pra colocar as imagens usadas no cardápio/site. Tudo aqui vira uma URL
pública em `/images/...` (ex.: `public/images/logo/logo.png` fica acessível
em `/images/logo/logo.png`).

- `logo/Logo.png` — logo da Q10 Sorvetes, solta na barra do topo
  (`components/LogoTopo.tsx`). O arquivo está **recortado rente à oval**
  (493×237): o original era 500×500 com a oval ocupando menos da metade da
  altura, e por isso a logo saía miúda por mais que a caixa crescesse. Se
  trocar o arquivo, recorte as margens transparentes antes. Enquanto ele não
  existir (ou tiver outro nome), aparece um ícone de loja no lugar.
  Atenção ao nome exato do arquivo (`Logo.png`, com L maiúsculo) — no
  Windows não faz diferença, mas em produção (Linux) faz.
- `banners/fundo.jpg` — imagem de fundo atrás da "janela" do app
  (`components/FundoPagina.tsx`). Sem esse arquivo, cai num gradiente.
- `cardapio/` — fotos dos sabores de 1800 ml. **Quem manda é
  `prisma/sabores.ts`**: cada sabor de lá diz o nome do arquivo que espera
  aqui (campo `foto`). Pra adicionar um sabor: foto aqui + bloco novo lá +
  `npm run sabores`. Nome de arquivo sem espaço nem acento (vira URL —
  `torta-alema.jpeg`, não `Torta Alemã.jpeg`). Sem o arquivo, o card cai
  num ícone da categoria em vez de quebrar. As outras categorias
  (SelfService, Picolés, Acompanhamentos, Bebidas) ainda são só "em breve",
  sem uso de imagem ainda.
- `banners/estabelecimento.png` — foto da fachada/interior da loja, usada
  na seção "Contato" da home (`/`). Sem esse arquivo, cai num fundo em
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
