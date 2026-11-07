# MESCE NSR-DF

Aplicativo para gerenciamento das atividades dos **Ministros Extraordinários da Sagrada Comunhão Eucarística (MESCE)**.

## Objetivo
Organizar ministros, celebrações/missas, assistidos e visitas dominicais, permitindo criar escalas mensais equilibradas.

### Funcionalidades planejadas
- Cadastro de ministros, vínculos conjugais e impedimentos **por celebração específica, por dia(s) avulsos ou por período**.
- Agenda dinâmica: celebrações habituais e eventos avulsos (casamentos, sétimo dia, datas comemorativas) a qualquer momento, com **quantidade configurável de ministros por ocorrência e ajuste direto na escala**.
- Cadastro de assistidos e contatos de familiares.
- Calendário de visitas aos assistidos exclusivamente aos domingos.
- Geração de escalas: respeitar indisponibilidades e conflitos; equilibrar participações; observar preferências conjugais; considerar proximidade dos endereços nas visitas.
- Limites mensais individuais, preferências de locais, histórico de 12 meses e casais que servem juntos.
- **Fluxo vigente:** coordenador solicita impedimentos para o mês seguinte; ministros informam ausências **até dia 25 do mês anterior**; coordenador consolida dados e celebrações extras, gera a escala preliminar, ajusta manualmente, aprova, gera PDFs finais e envia aos ministros. **Não há aceite individual de cada designação para aprovação.**
- Revisão e aprovação, trilha de auditoria, PDF oficial após aprovação e relatórios gerenciais.
- **Notificações push** para solicitação de impedimentos, lembretes antes do dia 25, atualizações recebidas, escala final/PDF, alterações, cancelamentos e lembretes de serviço. Histórico de avisos dentro do sistema.

## Login e cadastros operacionais (ambiente local)

A página [operacional.html](operacional.html) implementa **Auth0 Authorization Code + PKCE**, consulta o perfil autenticado no KofLang e permite **listar celebrações** (ministro/coordenador) e **cadastrar celebrações** (somente coordenador). O servidor local possui proxy limitado às rotas `/api/me` e `/api/celebrations`, desabilitado por padrão. Não usa os dados fictícios da POC como substituição de um login real.

Para configurar o Auth0 SPA e Neon de desenvolvimento, leia [FLUXO-OPERACIONAL-DEV.md](docs/FLUXO-OPERACIONAL-DEV.md). Nenhum segredo vai para o navegador. **Ainda falta provar o fluxo end-to-end com Auth0 e JDBC reais**, portanto não cadastrar pessoas.

## Backend KofLang + Neon + Auth0 (desenvolvimento isolado)

A API KofLang com validação RS256/JWKS do Auth0, autorização pela tabela `mesce_dev.actors` e endpoints de ministros, assistidos e celebrações já está preparada. O schema foi aplicado somente na branch Neon `mesce-dev-2026-11` (sem dados reais) e o `kof check` passou no GitHub Actions. **A conectividade JDBC, os fluxos com tokens reais e a integração da interface ainda não foram validados.**

[Configuração e requisitos de segurança do backend](backend-kof/README.md) · [Migração SQL](backend-kof/sql/001_init.sql).

## Acessibilidade da interface
A POC adota alto contraste, texto base de **18 px**, controles de **48 px**, navegação direta e foco visível. Não utiliza efeitos piscantes ou animações automáticas. Veja [diretrizes e testes pendentes](docs/ACESSIBILIDADE-UI.md).

## Instalação e uso como PWA

Leia o [guia de uso para Android, iPhone/iPad e computadores](docs/GUIA-PWA.md) ou acesse [a ajuda dentro do aplicativo](pwa.html). A versão de desenvolvimento exige dados fictícios e ainda não foi testada instalada nos dispositivos. O endereço local `127.0.0.1` só pode ser aberto no próprio computador.

## CI no GitHub Actions

O workflow `.github/workflows/ci.yml` verifica sintaxe (`npm run check`), testes (`npm test`) e estrutura PWA (`node scripts/validate-pwa.cjs`) em pushes e PRs, **sem deploy no Vercel**. Ele não executa KofLang, pois o compilador ainda não foi integrado à CI.

## Ambiente local de desenvolvimento

A aplicação demonstrativa pode ser executada **localmente, sem Vercel e sem dependências externas**, utilizando Node.js 20+:

```bash
npm run dev
npm test
npm run check
```

Abra `http://127.0.0.1:4173`. Há visualizações simuladas de **coordenador** e **ministro**, visitas dominicais com assistidos fictícios, impedimentos por celebração/dia/período, quantidade variável de ministros, geração de escala, substituição manual e aprovação demonstrativa. O motor JS está isolado em `app/scheduling.js` com testes; ele é transitório e **não substitui o domínio KofLang final**.

[Instruções e limites de segurança do ambiente local](docs/AMBIENTE-DESENVOLVIMENTO.md).

## POC web/PWA (demonstração mínima)

A raiz do repositório contém uma POC estática navegável em `index.html`, com `manifest.webmanifest`, `sw.js` e ícone. Os previews automáticos estão desativados no Vercel; a pipeline de CI não publica o aplicativo.

**Fluxo demonstrativo (dados fictícios, somente em memória):**
1. Escolher um dos ministros fictícios e registrar um impedimento dentro do próximo mês.
2. Adicionar uma celebração extraordinária com data e horário.
3. Selecionar impedimento por **missa específica**, **dia(s)** ou **período**; ajustar o número de ministros de cada celebração diretamente na lista; gerar escala preliminar simplificada, que respeita os três tipos de impedimento e tenta preencher todas as vagas.
4. Aprovar a escala na simulação e usar a impressão do navegador para **Salvar como PDF**.

**Limitações intencionais:**
- Não é sistema operacional: **não inserir nomes, endereços ou contatos reais**. Tudo é perdido ao recarregar.
- As edições do quantitativo ficam apenas na sessão demonstrativa e ainda não geram auditoria persistente. O fluxo do coordenador não possui autenticação. A POC não chama **Auth0**, **Neon** ou APIs de produção, não dispara push, não implementa casais, limite mensal, visitas, locais ou algoritmo histórico completo.
- A aprovação e a impressão são simulações: a geração de PDF usa `window.print()` e não representa um PDF oficial do MESCE.
- O service worker só cacheia recursos estáticos públicos. Não cachear dados pessoais/autenticação em futuras versões.
- PWA: manifesto e service worker são apenas a base. A instalação e compatibilidade no Android/iOS **não foram testadas**; podem requerer ícones PNG, ajustes de navegador e fluxo Auth0.
- Fonte de prova da sintaxe Kof: `poc-kof/main.kf`. Ainda não foi compilada neste ambiente.

**Validação KofLang (após instalar a CLI oficial):**

```bash
kof check poc-kof/main.kf --target js
kof run poc-kof/main.kf --target=js
```

A documentação oficial do KofLang descreve `kof build <dir> --target=js`. Antes de substituir a demonstração HTML/JS por uma UI KofJS, validar a versão instalada e o formato de saída gerado.

## Construção e privacidade
- **Aviso LGPD:** `index.html` apresenta aviso contextual e `privacidade.html` contém explicação ampliada. A política é preliminar; a identificação do controlador, contato, base legal e retenção precisam ser definidos antes da coleta real.

- [Backlog por prioridade e critérios de conclusão](docs/TASKS.md)
- [Política de privacidade, minimização e anonimização](docs/PRIVACIDADE-LGPD.md)
- A POC agora possui um painel de **indicadores agregados** sem nomes ou datas individuais; grupos pequenos são ocultados. Este método é demonstrativo, **não certifica anonimização de dados reais**.
- Testes da transformação: `node --test tests/privacy.test.cjs` (exige Node instalado).
- Os dados de assistidos do PDF de referência **não** foram copiados para o código; não usar dados reais nesta POC.

## Documentação
- [SPEC — Gestão e escalas MESCE, com referência Projeto MESCE v3.0](docs/SPEC-GESTAO-ESCALAS-MESCE.md)
- [Regras dos agentes de desenvolvimento](AGENTS.md)
- [Histórico de alterações](CHANGELOG.md)

## Plataformas e tecnologia
- **Prioridade 1:** aplicação **web responsiva**, utilizável no computador e em navegadores de Android e iOS.
- **Prioridade 2:** **PWA instalável em Android e iOS**, com notificações Web Push e testes reais de login, instalação, confirmação e entrega de alertas. Priorizar a PWA como aplicativo principal se atender ao uso da pastoral.
- **App nativo Android/iOS:** somente após avaliar limitações reais da PWA; preservar as mesmas APIs e regras de domínio.
- **Linguagem principal pretendida:** **KofLang**, sujeita à validação real do compilador e da arquitetura.
- **Publicação web:** **Vercel**.
- **Banco selecionado:** **Neon PostgreSQL**. A integração foi informada como configurada; um projeto Neon via Vercel Marketplace foi encontrado, mas seu vínculo exato e conexão com KofLang ainda exigem validação. Não criar schema em ambiente não identificado.
- **Autenticação selecionada:** **Auth0**. Configuração informada como concluída; confirmar vínculo com o projeto Vercel e validação OIDC/OAuth com backend KofLang.
- **Backend:** hospedagem a definir após prova técnica.
- **Regra arquitetural:** regras de escalas, autorizações, impedimentos, aprovação pela coordenação e auditoria não devem ficar duplicadas nos clientes.

**Situação:** POC web demonstrativa adicionada; domínio e integrações reais continuam em fase de especificação.  Neon e Auth0 foram informados como configurados, mas a vinculação exata e o funcionamento ainda não foram verificados.  o backend, os cadastros e o algoritmo de escalas ainda não foram implementados. A compilação KofLang/KofJS, persistência e pipeline de deploy precisam ser validados antes de definir comandos de execução. O protótipo visual publicado anteriormente no Vercel não representa ainda estas funcionalidades.

Repositório: [Trooper2123/mesce-nsrdf](https://github.com/Trooper2123/mesce-nsrdf) · branch principal: `main`. Projeto Vercel: `mesce-nsrdf`.

## Privacidade
O aplicativo tratará informações pessoais, inclusive endereços e contatos de ministros e assistidos. Dados reais não devem ser adicionados ao repositório público. As regras de autenticação, autorização e proteção de dados deverão ser definidas antes de implantar os cadastros.
