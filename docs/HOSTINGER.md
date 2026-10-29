# Publicar na Hostinger

O site é estático. A hospedagem precisa apenas servir HTML, CSS, JavaScript, fontes e imagens. Node.js é usado para gerar os arquivos, não para manter o site no ar.

Para visualizar com duplo clique no computador, use `release/visualizacao/index.html`, gerado por `npm run package:offline`. Esse HTML é completo e independente. O `index.html` do pacote Hostinger foi feito para ser servido pela hospedagem junto com suas pastas; abri-lo isoladamente no computador pode resultar em tela branca.

## Preparar

1. Confirme nome profissional completo, CRO e eventual especialidade antes da publicação do perfil, conforme solicitado. Edite `src/App.jsx` com os dados confirmados; nenhum registro foi inventado.
2. Execute `npm ci`, `npm run build` e `npm test` no ambiente de desenvolvimento.
3. Execute `npm run package:hostinger`. O comando valida `release/sorrimed-hostinger.zip` e atualiza automaticamente `entrega/sorrimed-hostinger.zip`, a cópia disponível para download no GitHub. Inclua essa cópia no commit.

## Enviar

1. No hPanel, abra o Gerenciador de Arquivos do domínio escolhido.
2. Se houver outro site, faça uma cópia de segurança antes de substituir seus arquivos.
3. Envie o ZIP à pasta `public_html` do domínio e extraia seu conteúdo. O `index.html`, a pasta `assets`, a pasta `images`, o favicon e o `.htaccess` precisam ficar diretamente em `public_html`, sem uma pasta `dist` intermediária.
4. Remova o ZIP da pasta pública após a extração. Não publique `src`, `assets/originals`, arquivos de teste ou `node_modules`.
5. Ative o certificado SSL e a opção de redirecionamento para HTTPS no hPanel. O site não força um domínio específico.
6. Teste no domínio: abertura no celular e desktop, imagens, galeria, WhatsApp, telefone, Instagram e Google Maps.

O pacote foi preparado para a raiz do domínio. Para hospedagem em subpasta, ajuste `base` no Vite e os caminhos de imagens antes de gerar outro pacote.

## Atualizar

Edite os fontes, gere outro build e repita o envio. Preserve cópia da versão anterior. Como imagens têm nomes estáveis, limpe o cache/CDN da Hostinger quando substituir imagens. `.htaccess` configura cache de 7 dias para imagens, um ano para fontes e revalidação do HTML; os arquivos de aplicação produzidos pelo Vite possuem hash.

## Antes de divulgar

- Horários semanais não foram informados e não aparecem como horários confirmados. O site orienta consultar a equipe pelo WhatsApp.
- A nota 5,0 e as 101 avaliações vieram de uma captura antiga; não são mostradas como avaliação atual.
- Resultados aparecem com observação de que cada caso é individual. O site não faz promessas de resultado.
- Depois de definir o domínio público, você pode adicionar URL canônica e URLs absolutas de compartilhamento em `index.html`.

Esta entrega prepara os arquivos. Publicação e funcionamento no domínio da Hostinger só podem ser confirmados após o envio e a verificação nessa hospedagem.
