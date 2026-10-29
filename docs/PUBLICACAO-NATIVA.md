# GitHub → Hostinger: publicação estática

## Branches

- `develop`: código editável, originais, Vite, scripts e testes.
- `publish/sorrimed-<source>-<main>`: candidato gerado com os arquivos compilados na raiz; abre PR para `main`.
- `main`: somente a raiz de produção: `index.html`, `.htaccess`, `favicon.svg`, `assets/`, `images/`, `publication.json`. Sem fonte, testes, originais, npm ou servidor Node.

A Hostinger continua com branch `main`, destino `public_html` e implantação automática. Não é necessário comando de build, FTP, ZIP ou GitHub Actions na hospedagem. Aprovar o PR inicial ativa essa estrutura. O deploy real no domínio deve ser verificado depois do merge; não foi feito merge nesta entrega.

## Preparar o ambiente de desenvolvimento uma vez por checkout

Use Node 22.12+ ou 24, npm, Python 3 e Chromium (ou o navegador instalado pelo Playwright). Clone somente este repositório e selecione `develop`, depois execute `npm ci`. O script `prepare` instala um hook local de pre-push, preservando hooks existentes em vez de sobrescrevê-los. Confirme `git config --local --get core.hooksPath`: deve retornar `.githooks`.

## Atualizações

Edite os fontes em `develop`, faça commit e use `git push origin develop`. O hook executa automaticamente `npm run build` e `npm test`, valida o HTML de produção e gera/envia uma branch de publicação. Falhas interrompem o push. Nenhum comando de build precisa ser executado manualmente para esse fluxo. Abra o PR da branch indicada para `main`, revise e autorize seu merge. Depois do merge, o webhook nativo da Hostinger deve fazer checkout da raiz estática em `public_html`.

O hook nunca faz push para `main`, nunca executa merge e não chama a API do GitHub. Ele imprime o link de criação do PR. O commit de publicação é filho da `main` atual e contém apenas a árvore do build; não faça merge de `develop` diretamente na `main`, pois isso reintroduziria os fontes na hospedagem. Use a branch de publicação como origem do PR. A identificação do fonte consta em `publication.json`.

## Limites da automação

O build é automático **no ambiente de desenvolvimento com o hook instalado**. Não existe build remoto nessa arquitetura. Edições e commits pelo site do GitHub, clientes que ignoram hooks, `--no-verify` e clones que não executaram `npm ci` não executam a compilação. Não use esses caminhos para publicar. Sem um runner remoto (por exemplo, CI ou serviço de build), não é possível compilar automaticamente toda edição feita diretamente no GitHub. A revisão/abertura de PR e sua autorização continuam etapas humanas; o deploy após atualizar `main` é responsabilidade da integração nativa configurada.

## Limpeza da primeira implantação

Confira se o checkout da Hostinger removeu os antigos `src/`, `tests/`, `public/`, `scripts/`, `entrega/`, manifests e demais arquivos que não existem mais na `main`. Alguns mecanismos de deploy preservam arquivos antigos; nesse caso, remova os resíduos pelo gerenciador do hPanel. Isso é uma limpeza inicial, sem comando de compilação, e evita expor material de desenvolvimento e originais. O `.htaccess` impede listagem de diretórios.

Todos os recursos usam caminhos a partir de `/`, adequados à raiz de domínio ou subdomínio. Não há URL de domínio fixa. O bundle inclui os componentes originais GSAP, BounceCards e Lanyard/Three.js; nenhuma simplificação visual foi aplicada.
