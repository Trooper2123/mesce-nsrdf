# Guia de instalação e uso do MESCE (PWA)

**Versão atual:** demonstração de desenvolvimento. Dados apenas fictícios, sem autenticação Auth0, persistência Neon ou notificações push. A instalação ainda **não foi validada em dispositivos reais**.

## Instalação no Android (Chrome)
1. Abra a URL HTTPS da versão MESCE autorizada para testes no Chrome.
2. Toque no menu de três pontos (⋮).
3. Escolha **Instalar app** ou **Adicionar à tela inicial**, conforme o navegador.
4. Confirme. Procure o ícone MESCE na tela inicial.
5. Se não houver opção, continue usando o site: o suporte depende de requisitos de instalação, incluindo ícones compatíveis.

## Instalação no iPhone/iPad (Safari)
1. Abra o endereço HTTPS do MESCE no Safari.
2. Toque em **Compartilhar**; em algumas versões primeiro toque no menu da página.
3. Escolha **Adicionar à Tela de Início**.
4. Se disponível, ative **Abrir como App da Web** e toque em **Adicionar**.
5. Abra o ícone MESCE. Se a opção não aparecer, procure em **Editar Ações** do menu de compartilhamento.

## Instalação no computador (Chrome/Edge)
1. Abra o site em HTTPS.
2. No menu do navegador ou barra de endereços, escolha **Instalar** ou **Apps > Instalar este site como aplicativo**.
3. Confirme; abra pelo menu de aplicativos. Se a opção não existir, use a versão no navegador.

## Como usar a demonstração
1. Selecione **Coordenador** ou **Ministro** em "Visualização de desenvolvimento" (isso **não é login real**).
2. Registre impedimentos para missa específica, dia(s) avulsos ou período.
3. Como coordenador, inclua uma celebração, ajuste a quantidade de ministros e gere a escala preliminar.
4. Revise designações e substitua ministros quando necessário.
5. Simule aprovação e use **Imprimir / Salvar como PDF**. O resultado não é uma escala oficial.

## Atualizações, offline e privacidade
- A atualização da PWA depende do navegador. Feche e abra o aplicativo com internet; se continuar mostrando uma versão antiga, atualize a página ou reinstale o atalho.
- O service worker guarda **arquivos estáticos públicos**. Não há funcionalidade offline completa, persistência de dados ou sincronização. Alterações são perdidas ao recarregar.
- A POC não utiliza notificações push; não há motivo para conceder permissões de notificação.
- Não insira nomes, endereços, contatos ou outros dados reais.
- Para desinstalar, remova o aplicativo/atalho pelo sistema operacional.
- Para testar localmente em computador execute `npm run dev` e acesse `http://127.0.0.1:4173`. O mesmo endereço **não abre no celular**, pois aponta para o próprio dispositivo. Para teste móvel é necessária uma publicação HTTPS autorizada.
- O manifesto atual usa ícone SVG. Alguns navegadores exigem ícones PNG 192x192 e 512x512; a instalação será validada e os recursos ajustados antes da distribuição.

## Referências
- [Apple: adicionar site à Tela de Início](https://support.apple.com/en-mide/guide/iphone/iph42ab2f3a7/ios)
- [MDN: requisitos para instalação PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [web.dev: instalação de PWA](https://web.dev/learn/pwa/installation)
