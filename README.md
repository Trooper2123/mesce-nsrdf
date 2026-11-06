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
- Coordenador monta a escala preliminar; cada ministro confirma ou recusa individualmente suas designações; coordenador revisa, aprova e publica.
- Revisão e aprovação, trilha de auditoria, PDF oficial após aprovação e relatórios gerenciais.
- **Notificações push** para novas designações, confirmação pendente, confirmações, recusas, substituições, mudanças de horário/local, cancelamentos, publicação e lembretes de serviço. Histórico de avisos dentro do sistema.

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
- **Banco escolhido para avaliação:** **Neon PostgreSQL** integrado ao Vercel; verificar conectividade com KofLang antes de provisionar e criar schema.
- **Autenticação escolhida para avaliação:** **Auth0** via Marketplace do Vercel; integração pronta é focada em Next.js, portanto validar OIDC/OAuth com KofLang.
- **Backend:** hospedagem a definir após prova técnica.
- **Regra arquitetural:** regras de escalas, autorizações, confirmações individuais e auditoria não devem ficar duplicadas nos clientes.

**Situação:** fase de especificação; Neon e Auth0 ainda não estão conectados a este projeto.  o backend, os cadastros e o algoritmo de escalas ainda não foram implementados. A compilação KofLang/KofJS, persistência e pipeline de deploy precisam ser validados antes de definir comandos de execução. O protótipo visual publicado anteriormente no Vercel não representa ainda estas funcionalidades.

Repositório: [Trooper2123/mesce-nsrdf](https://github.com/Trooper2123/mesce-nsrdf) · branch principal: `main`.

## Privacidade
O aplicativo tratará informações pessoais, inclusive endereços e contatos de ministros e assistidos. Dados reais não devem ser adicionados ao repositório público. As regras de autenticação, autorização e proteção de dados deverão ser definidas antes de implantar os cadastros.
