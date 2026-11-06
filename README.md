# MESCE NSR-DF

Aplicativo para gerenciamento das atividades dos **Ministros Extraordinários da Sagrada Comunhão Eucarística (MESCE)**.

## Objetivo
Organizar ministros, celebrações/missas, assistidos e visitas dominicais, permitindo criar escalas mensais equilibradas.

### Funcionalidades planejadas
- Cadastro de ministros, vínculos conjugais e disponibilidades.
- Agenda dinâmica: celebrações habituais e eventos avulsos (casamentos, sétimo dia, datas comemorativas) a qualquer momento.
- Cadastro de assistidos e contatos de familiares.
- Calendário de visitas aos assistidos exclusivamente aos domingos.
- Geração de escalas: respeitar indisponibilidades e conflitos; equilibrar participações; observar preferências conjugais; considerar proximidade dos endereços nas visitas.
- Limites mensais individuais, preferências de locais, histórico de 12 meses e casais que servem juntos.
- **Fluxo vigente:** coordenador solicita impedimentos para o mês seguinte; ministros informam ausências **até dia 25 do mês anterior**; coordenador consolida dados e celebrações extras, gera a escala preliminar, ajusta manualmente, aprova, gera PDFs finais e envia aos ministros. **Não há aceite individual de cada designação para aprovação.**
- Revisão e aprovação, trilha de auditoria, PDF oficial após aprovação e relatórios gerenciais.
- **Notificações push** para solicitação de impedimentos, lembretes antes do dia 25, atualizações recebidas, escala final/PDF, alterações, cancelamentos e lembretes de serviço. Histórico de avisos dentro do sistema.

## POC web/PWA (demonstração mínima)

A raiz do repositório contém uma POC estática navegável em `index.html`, com `manifest.webmanifest`, `sw.js` e ícone. O deploy via GitHub/Vercel é automático quando a integração está operacional.

**Fluxo demonstrativo (dados fictícios, somente em memória):**
1. Escolher um dos três ministros fictícios e registrar um impedimento dentro do próximo mês.
2. Adicionar uma celebração extraordinária com data e horário.
3. Gerar uma escala preliminar simplificada, que evita ministros impedidos nas datas e distribui a menor quantidade de compromissos.
4. Aprovar a escala na simulação e usar a impressão do navegador para **Salvar como PDF**.

**Limitações intencionais:**
- Não é sistema operacional: **não inserir nomes, endereços ou contatos reais**. Tudo é perdido ao recarregar.
- O fluxo do coordenador não possui autenticação. A POC não chama **Auth0**, **Neon** ou APIs de produção, não dispara push, não implementa casais, limite mensal, visitas, locais ou algoritmo histórico completo.
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
