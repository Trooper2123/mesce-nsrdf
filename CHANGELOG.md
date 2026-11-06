# CHANGELOG

## 2026-11-06 — Backend KofLang com base segura para Auth0/Neon
- **Tipo:** `feat`, `ci`, `docs`, `test`.
- **Arquivos:** `backend-kof/src/Main.kf`, `backend-kof/sql/001_init.sql`, `backend-kof/README.md`, `backend-kof/.env.example`, `.github/workflows/kof-check.yml`, `tests/backend-contract.test.cjs`, `.gitignore`.
- **Resumo:** Auth0 via RS256/JWKS com issuer e audience obrigatórios, verificação de papel pela tabela de atores, operações protegidas de ministros, assistidos e celebrações; nomes, contatos e endereços cifrados com AES-GCM; schema inicial Neon somente na branch de desenvolvimento.
- **Validação:** `kof check --target jvm` aprovado usando Kof 0.7.2 e SHA-256 pinado. Oito tabelas presentes na branch Neon; testes de API/JDBC/token real ainda pendentes.
- **Segurança:** nenhuma senha, token, cliente Auth0 ou dado pessoal real foi gravado. Sem deploy.
- **Branch:** `feature/kof-neon-auth0-backend`, PR dependente de `feature/mesce-app-dev`.


## 2026-11-06 — Visitas dominicais demonstrativas
- **Tipo:** `feat`, `test`, `docs`.
- **Arquivos:** `app/visits.js`, `tests/visits.test.cjs`, `index.html`, `sw.js`, `scripts/dev-server.cjs`, `scripts/validate-pwa.cjs`, `package.json`, `README.md`.
- **Resumo:** visitas em domingos com dados sintéticos, distribuição separada e validação conjunta na aprovação da escala.
- **Segurança:** nenhum dado identificável de assistidos; sem conexão Neon/Auth0 nem deploy.
- **Limite:** alocação conservadora sem visita e celebração no mesmo domingo; proximidade e regras completas pendentes.


## 2026-11-06 — Workflow CI e guia de uso PWA
- **Tipo:** `ci`, `test`, `docs`, `feat`.
- **Arquivos:** `.github/workflows/ci.yml`, `scripts/validate-pwa.cjs`, `docs/GUIA-PWA.md`, `pwa.html`, `index.html`, `sw.js`, `scripts/dev-server.cjs`, `package.json`, `tests/dev-server.test.cjs`, `README.md`, `docs/TASKS.md`.
- **Resumo:** testes no GitHub Actions sem Vercel e instruções acessíveis de instalação/uso em Android, iOS e computadores.
- **Validação:** checagem de sintaxe e estrutura dos arquivos; primeira execução real do Actions e teste em dispositivos pendentes.
- **Branch:** `feature/lgpd-backlog-app`; sem merge na `main` e sem deploy.


## 2026-11-06 — Legibilidade e acessibilidade visual na POC
- **Tipo:** `style`, `feat`, `docs`.
- **Arquivos:** `app/accessibility.css`, `index.html`, `scripts/dev-server.cjs`, `sw.js`, `docs/ACESSIBILIDADE-UI.md`, `README.md`, `docs/TASKS.md`, `AGENTS.md`.
- **Resumo:** alto contraste, texto ampliado, navegação por âncoras, link para ir ao conteúdo, foco evidente e estilos sem animação. Servidor local habilitado para servir a folha CSS.
- **Validação:** revisão estática; testes reais de teclado, zoom, leitor de tela e contraste completo permanecem pendentes. Nenhum deploy executado.
- **Branch:** `feature/lgpd-backlog-app`; `main` preservada.


## 2026-11-06 — Ambiente local e motor demonstrativo de escalas
- **Tipo:** `feat`, `test`, `docs`, `chore`.
- **Arquivos:** `app/scheduling.js`, `tests/scheduling.test.cjs`, `scripts/dev-server.cjs`, `package.json`, `index.html`, `sw.js`, `docs/AMBIENTE-DESENVOLVIMENTO.md`, `docs/TASKS.md`, `README.md`.
- **Resumo:** ambiente de desenvolvimento local sem dependências externas; domínio demonstrativo de bloqueios por celebração/dias/período, quantitativos variáveis, alocação e substituições; interface com visualizações simuladas de coordenador/ministro; testes e cache PWA de recursos estáticos.
- **Validação:** sintaxe de scripts e execução de cenários em runtime JavaScript isolado. **Ainda não executados** `npm test`/teste HTTP real, compilação KofLang, autenticação Auth0, acesso Neon nem testes reais de navegador.
- **Branch:** `feature/lgpd-backlog-app`; sem merge na `main`, sem deploy.


## 2026-11-06 — Planejamento de hashing e criptografia no Neon
- **Tipo:** `docs`.
- **Arquivos:** `docs/PRIVACIDADE-LGPD.md`, `docs/TASKS.md`, `CHANGELOG.md`.
- **Resumo:** definido uso proposto de UUIDs, HMAC-SHA-256 para deduplicação/pesquisa exata de campos normalizados e cifragem autenticada para campos recuperáveis; chave separada do Neon, autorização e rotação obrigatórias.
- **Validação:** revisão documental; **nenhuma migração, criação de segredo ou alteração no banco real**.
- **Branch:** `feature/lgpd-backlog-app` sem merge na `main`.


## 2026-11-06 — Backlog e resumo agregado com proteção LGPD (sem deploy)
- **Tipo:** `feat`, `test`, `docs`.
- **Arquivos:** `docs/TASKS.md`, `docs/PRIVACIDADE-LGPD.md`, `app/privacy.js`, `tests/privacy.test.cjs`, `index.html`, `README.md`, `CHANGELOG.md`.
- **Resumo:** backlog P0/P1/P2, política de minimização/pseudonimização, resumo agregado da POC com supressão de coortes pequenas; ministros de teste substituídos por identificadores fictícios.
- **Validação:** verificação de sintaxe e testes da função de agregação; sem build KofLang, Neon/Auth0, testes PWA reais ou deploy.
- **Branch:** `feature/lgpd-backlog-app`. Nenhum merge automático na `main`.


## 2026-11-06 — Vagas por celebração e impedimentos de escopo variável (BRT; horário exato não registrado)
- **Tipo:** `feat`, `docs`, `fix`.
- **Arquivos:** `index.html`, `docs/SPEC-GESTAO-ESCALAS-MESCE.md`, `README.md`, `CHANGELOG.md`.
- **Resumo:** quantidade de ministros configurável por ocorrência (inclusive missa especial) e editável na escala; impedimentos por missa específica, dia(s) não consecutivos ou período inclusivo. A POC demonstrativa passa a distribuir múltiplas vagas e sinalizar as descobertas; os dados continuam somente em memória.
- **Validação:** sintaxe JavaScript da POC verificada e documentação revisada. Não houve testes funcionais em navegador/dispositivos, build KofLang ou integração com Neon/Auth0.
- **Branch:** `feature/quantitativos-impedimentos`. **Nenhuma alteração aplicada à `main`**; realizar revisão e merge consolidado para produção.
- **Pendências:** algoritmo completo de produção, histórico e casais, auditoria persistente, e validação funcional dos três tipos de impedimento.


## 2026-11-06 — POC mínima web/PWA e exemplo KofLang (BRT; horário exato não registrado)
- **Tipo:** `feat`, `docs`, `chore`.
- **Arquivos:** `index.html`, `manifest.webmanifest`, `sw.js`, `icon.svg`, `poc-kof/main.kf`, `README.md`, `CHANGELOG.md`.
- **Resumo:** demonstração responsiva, com três ministros fictícios, impedimentos na sessão, celebrações avulsas, distribuição mínima por equilíbrio simples, aprovação demonstrativa e impressão para PDF. Adicionados manifesto PWA, cache somente de recursos públicos e fonte Kof mínima para futura prova de compilação.
- **Segurança:** dados somente em memória, sem persistência, sem autenticação ou acesso a Neon/Auth0 e sem push. Não utilizar dados reais.
- **Validação:** verificação de arquivos e deploys Vercel registrados; a compilação KofLang e os testes em dispositivos PWA ainda não foram executados. O algoritmo não implementa regras completas de produção.
- **Pendências:** validar KofLang, conectar backend autorizado com Neon/Auth0, PNGs/instalação PWA, qualidade, regras completas e push.


## 2026-11-06 — Configuração informada de Neon/Auth0 e verificação de vínculo (BRT; horário exato não registrado)
- **Tipo:** `docs`.
- **Arquivos:** `docs/SPEC-GESTAO-ESCALAS-MESCE.md`, `README.md`, `CHANGELOG.md`.
- **Resumo:** responsável informou configuração de Neon e Auth0. Confirmado projeto Vercel renomeado para `mesce-nsrdf` e repositório GitHub correspondente; encontrado Neon recém-provisionado via Marketplace, sem associação ao MESCE confirmada; nenhum conector listado no projeto pela API consultada. Mantidas pendências de prova SQL/OIDC.
- **Validação:** metadados GitHub, Vercel e Neon (sem consultar segredos); não foram feitos teste de conexão, autenticação, build, migração de banco ou deploy.
- **Pendências:** identificar o vínculo de ambas integrações com o projeto e validar banco, Auth0 e KofLang.


## 2026-11-06 — Novo fluxo de aprovação pelo coordenador (BRT; horário exato não registrado)
- **Tipo:** `docs`.
- **Arquivos:** `docs/SPEC-GESTAO-ESCALAS-MESCE.md`, `README.md`, `CHANGELOG.md`.
- **Resumo:** substituído o aceite individual de designações por: coordenador solicita impedimentos para o próximo mês → ministros enviam até dia 25 do mês anterior → coordenador consolida dados e celebrações extras → gera escala preliminar → faz ajustes manuais → aprova → gera PDFs finais → envia aos ministros. Adaptados estados, regras de autorização, notificações push, funcionalidades web/PWA e testes. Fluxos antigos do histórico não são mais vigentes.
- **Validação:** revisão documental e atualização de regras; sem implementação, compilação, testes automatizados ou deploy.
- **Pendências:** data da solicitação inicial, política de ausência de resposta, canal de envio dos PDFs, tratamento de urgências após aprovação.


## 2026-11-06 — Arquitetura candidata Neon/Auth0 e priorização PWA (BRT; horário exato não registrado)
- **Tipo:** `docs`.
- **Arquivos:** `docs/SPEC-GESTAO-ESCALAS-MESCE.md`, `README.md`, `CHANGELOG.md`.
- **Resumo:** priorizadas web responsiva e PWA como aplicativo principal, com piloto Android/iOS; Neon PostgreSQL e Auth0 preferidos pelas integrações no Vercel; definido backend KofLang com APIs e verificação OIDC, regras de privacidade do PWA, matriz de testes de login/push e critérios para eventual app nativo.
- **Validação:** consulta de documentação pública Neon, Vercel, Auth0, Apple e MDN; inspeção sem conectores Vercel no projeto e sem projeto Neon nomeado MESCE. Sem provisionamento, alteração de banco, execução de código, compilação, testes reais ou deploy.
- **Pendências:** prova de execução KofLang, integração SQL/OIDC, consentimento e testes PWA em Android e iOS, configuração e custo das integrações.


## 2026-11-06 — Notificações push relacionadas às escalas (BRT; horário exato não registrado)
- **Tipo:** `docs`.
- **Arquivos:** `docs/SPEC-GESTAO-ESCALAS-MESCE.md`, `README.md`, `CHANGELOG.md`.
- **Resumo:** planejamento de push para convocação, lembrete de resposta, confirmação/recusa, substituição, mudança de compromisso, cancelamento, publicação e lembretes de serviço; destinatários por papel, caixa de notificações, deduplicação, revogação, privacidade e possibilidade de reutilização por clientes Android/iOS.
- **Validação:** conferência documental e regras de negócio; nenhuma integração real de push, compilação, build, teste automatizado ou deploy foi executada.
- **Pendências:** testar plataforma KofLang, Web Push em dispositivos reais e definir horário/frequência de lembretes e canais alternativos.


## 2026-11-06 — Plano web-first e clientes Android/iOS (BRT; horário exato não registrado)
- **Tipo:** `docs`.
- **Arquivos:** `docs/SPEC-GESTAO-ESCALAS-MESCE.md`, `README.md`, `CHANGELOG.md`.
- **Resumo:** interface web responsiva obrigatória para o MVP; PWA como possibilidade intermediária; Android/iOS previstos em fase futura; contratos de API e fonte de dados única para clientes web/móveis; fluxos de coordenador e ministro, autenticação, confirmação individual e privacidade multiplataforma.
- **Validação:** revisão de arquitetura documental; nenhuma implementação, compilação KofLang, build, teste automatizado ou implantação foi executada.
- **Pendências:** validar toolchain KofLang, hospedagem de serviços e requisitos específicos dos aplicativos.


## 2026-11-06 — Agenda dinâmica e confirmação individual (BRT; horário exato não registrado)
- **Tipo:** `docs`.
- **Arquivos:** `docs/SPEC-GESTAO-ESCALAS-MESCE.md`, `README.md`, `CHANGELOG.md`.
- **Resumo:** agenda de celebrações não fixa; eventos avulsos como casamentos, missas de sétimo dia e datas comemorativas; coordenador propõe escala, cada ministro confirma/recusa cada designação e coordenador revisa e finaliza; aprovação exige respostas e validações completas, com reconfirmação dos afetados após alterações relevantes.
- **Validação:** revisão documental. Sem execução de build, testes, alterações de banco ou deploy.
- **Pendências:** prazo e canal de confirmação, retirada de aceite e exceções em emergências.


## 2026-11-06 — Ampliação da SPEC com Projeto MESCE v3.0 (BRT; horário exato não registrado)
- **Tipo:** `docs`.
- **Arquivos:** `docs/SPEC-GESTAO-ESCALAS-MESCE.md`, `README.md`, `CHANGELOG.md`.
- **Resumo:** Incorporadas regras operacionais da referência de outubro/2026: atualização entre dias 25–29; limite mensal por ministro; locais exclusivos/preferenciais/aceitos; casal servindo como unidade; indisponibilidade por intervalo; bloqueios de inativos e afastados; equilíbrio histórico dos últimos 12 meses; validação, revisão e aprovação; PDF somente após aprovação; auditoria, dashboard, relatórios e campos personalizados. Pendências de interpretação documentadas separadamente.
- **Validação:** leitura do documento fornecido e conferência da especificação; sem execução de compilação, testes automatizados, alterações de banco ou deploy.
- **Pendências:** fórmula de pontuação/saldo, aplicação do limite mensal, quantidade/frequência das visitas, permissões, KofLang/KofJS e build Vercel.


## 2026-11-06 — Documentação inicial (BRT; horário exato não registrado)
- **Tipo:** `docs`.
- **Arquivos:** `docs/SPEC-GESTAO-ESCALAS-MESCE.md`, `README.md`, `CHANGELOG.md`.
- **Resumo:** Definição inicial do aplicativo para gestão dos Ministros Extraordinários da Sagrada Comunhão Eucarística (MESCE), com cadastros de ministros e assistidos, calendário de missas/celebrações e visitas aos domingos, regras de indisponibilidade, equilíbrio de escalas, preferências conjugais, proximidade dos assistidos, revisão antes de publicação e cuidados LGPD.
- **Validação:** revisão documental de requisitos e estrutura do repositório. Nenhuma compilação, teste automatizado, migração de dados ou publicação foi executada para esta alteração.
- **Pendências:** esclarecer capacidade das celebrações, frequência e quantidade de visitas, critério de disponibilidade padrão, política para casais, medição de equidade, permissões e geocodificação. Validar ambiente KofLang/KofJS e integração de deploy.
