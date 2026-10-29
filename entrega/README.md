# Pacote para Hostinger

Baixe `sorrimed-hostinger.zip` pelo botão de download do arquivo no GitHub. Extraia o conteúdo na pasta `public_html` da hospedagem. O `index.html` e as pastas `assets` e `images` devem ficar diretamente dentro de `public_html`.

Esse ZIP contém apenas a versão de produção. Não é necessário instalar Node.js na Hostinger. Instruções completas em [docs/HOSTINGER.md](../docs/HOSTINGER.md).

Para atualizar o pacote após alterações:

```sh
npm ci
npm run package:hostinger
```

O comando valida o ZIP e atualiza automaticamente a cópia nesta pasta. Inclua `entrega/sorrimed-hostinger.zip` no commit das alterações. Builds idênticos geram o mesmo ZIP, sem diferenças causadas apenas por datas ou permissões dos arquivos locais.

O HTML do pacote de hospedagem precisa ser servido junto com suas pastas. Para abrir o site com duplo clique no computador, gere a versão independente com `npm run package:offline`.
