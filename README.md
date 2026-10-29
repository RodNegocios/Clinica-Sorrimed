# SorriMed

Site institucional em React + Vite, com GSAP/ScrollTrigger, rolagem suave Lenis e galeria BounceCards. Tipografia, fotos e ícones são servidos localmente. Não depende de backend, banco de dados ou chaves de API.

## Desenvolver

Node.js 22.12+ ou 24 LTS e npm. Ambiente validado com Node 24.19.

```sh
npm ci
npm run dev
```

Use o checkout existente. Não é necessário criar um worktree para desenvolver neste ambiente.

## Produção e Hostinger

```sh
npm run build
npm run package:hostinger
```

O pacote `release/sorrimed-hostinger.zip` contém o conteúdo de `dist/`, pronto para a raiz de `public_html`. Não envie o repositório inteiro nem `node_modules` para a hospedagem. Leia [o guia de publicação](docs/HOSTINGER.md).

Uma cópia pronta para baixar pelo GitHub está em [entrega/sorrimed-hostinger.zip](entrega/sorrimed-hostinger.zip).

## Abrir no computador, sem servidor

```sh
npm run package:offline
```

Abra `release/visualizacao/index.html` com duplo clique. Esse arquivo contém o site completo, incluindo fontes, código e todas as fotos, e pode ser copiado sozinho para outra pasta ou computador. Não requer instalação nem conexão para navegar pelo site; WhatsApp, Instagram e Maps precisam de internet.

O `index.html` da raiz é o ponto de entrada do Vite e precisa de `npm run dev`. O `index.html` de `dist` faz parte do pacote de hospedagem e depende dos outros arquivos e de um servidor HTTP. Para abrir um arquivo isolado, use a versão de `release/visualizacao`.

## Testes no navegador

```sh
npm run build
npx playwright install chromium  # somente se não houver Chromium instalado
npm test
```

Os testes usam Chromium do sistema quando disponível, ou o browser gerenciado pelo Playwright. `CHROMIUM_PATH` permite definir outro executável. Validam a versão de produção em desktop e celular, fotografias, navegação, contatos, filtros, carrossel, lightbox, teclado e movimento reduzido. Capturas e relatórios ficam em `test-results/` e `playwright-report/`.

## Estrutura

- `assets/originals/`: todos os 22 arquivos enviados, preservados sem edição.
- `public/images/`: cópias WebP responsivas para o site.
- `src/components/`: galeria, BounceCards, imagens responsivas e SVGs.
- `src/App.jsx`: conteúdo e seções; contatos oficiais no início do arquivo.
- `src/styles.css`: direção visual, responsividade e acessibilidade de movimento.
- `public/.htaccess`: compressão, cache e cabeçalhos para Hostinger/Apache/LiteSpeed.
- `scripts/`: preparação de imagens e empacotamento da publicação.
- `docs/`: publicação, decisões de conteúdo e uso de cada material.

As versões WebP já estão incluídas. Para regenerar, use `npm run assets` com Python 3 e Pillow instalados. O script nunca modifica os originais.

## Conteúdo e publicação

Não foram inventados serviços, especialidades, avaliações, depoimentos ou horários. O perfil usa o nome fornecido, Dra. Laiane Basílio; a confirmação do nome completo, CRO e especialidade indicada pelo solicitante continua pendente antes de publicar o perfil profissional. Veja [as decisões editoriais](docs/CONTEUDO-E-MATERIAIS.md).

O componente BounceCards foi integrado a partir do código React Bits fornecido no pedido, mantendo a física de molas e adaptando botões nativos, acessibilidade, toque e movimento reduzido. Referência: https://reactbits.dev/components/bounce-cards.
