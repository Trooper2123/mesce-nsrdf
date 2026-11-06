# TASKS — MESCE Web/PWA

Atualizado em **2026-11-06**. Branch de trabalho `feature/lgpd-backlog-app`. `main` permanece sem alterações; preview automático desativado no Vercel.

**Legenda:** `[x]` concluída nesta fase; `[ ]` pendente; `[~]` parcial; `[!]` bloqueada por dependência. Não marcar como concluído sem teste/evidência.

## P0 — Fundação e privacidade
- [x] **T-001** Documentar fluxo mensal: impedimentos até o dia 25, agenda dinâmica, ajuste e aprovação pelo coordenador, PDF final, envio.
- [x] **T-002** Definir privacidade por finalidade e destinatário, distinção entre anonimização/pseudonimização e critérios de acesso para dados de assistidos em `docs/PRIVACIDADE-LGPD.md`.
- [x] **T-003** Disponibilizar na POC um agregado minimizado de alocações, com supressão de grupos pequenos e testes de campos proibidos.
- [~] **T-004** POC de impedimentos por missa, dia(s), período, quantidade de vagas e substituição manual; motor puro e testes de cenários desenvolvidos, sem persistência/autorização real.
- [!] **T-005** Validar toolchain KofLang/KofJS (compilação, runtime HTTP, driver Neon, autenticação OIDC) com comandos e evidência reproduzíveis; sem compilador disponível neste ambiente.
- [!] **T-006** Validar associação de Neon e Auth0 ao projeto Vercel e preparar ambientes isolados sem copiar credenciais ou dados reais.
- [ ] **T-007** Validar PWA em Chrome Android e Safari iOS instalado, incluindo Auth0 e push; não declarar pronto sem teste físico.

- [ ] **T-021** POC segura de HMAC-SHA-256 na camada servidor com chave em secret manager, normalização, testes de colisão/deduplicação e plano de rotação; bloquear uso de dados reais até KofLang/Neon estarem validados.

- [~] **T-024** Montar ambiente local com `npm run dev`, motor de escala isolado, interface simulada de coordenador/ministro, testes e servidor localhost somente com arquivos permitidos. Falta executar `npm test` em CI e validar UX no navegador.
- [~] **T-025** Revisar restrições de algoritmo da POC e portar regras de domínio para KofLang quando toolchain estiver validada; cobertura atual é inicial (impedimentos/vagas/conflitos).

- [~] **T-026** UI acessível: alto contraste, fontes maiores, foco visível, atalhos simples e ausência de efeitos automáticos aplicados na POC; falta validar navegação, contraste de todos os estados e zoom.
- [ ] **T-027** Testar WCAG 2.2 AA, zoom 200%, teclado, VoiceOver/TalkBack, Android e iOS com representantes de ministros e coordenadores.

- [~] **T-028** GitHub Actions para sintaxe, testes Node e validação estrutural da PWA, sem deploy. Primeira execução e proteção de branches ainda precisam de verificação.
- [x] **T-029** Documentar instalação e uso da PWA para Android, iOS e desktop, com guia acessível na interface. Instalação real ainda não testada.

- [~] **T-030** Visitas dominicais com assistidos fictícios, alocação separada e verificação de conflitos na POC; resta persistência, localização, permissões e regras operacionais reais.

- [~] **T-031** Backend KofLang + Auth0 Resource Server: verificação RS256/JWKS, issuer/audience e RBAC com vínculo no banco; endpoints iniciais de ministros, assistidos e celebrações; `kof check` validado na CI. Necessário validar HTTP real, conexão JDBC e token Auth0 em ambiente dev.
- [~] **T-032** Neon: branch de desenvolvimento isolada, migration aplicada e 8 tabelas verificadas; faltam JDBC runtime, migrations automatizadas e testes de permissões.
- [ ] **T-033** Conectar a UI ao Auth0 PKCE e backend Kof, sem expor segredos nem liberar PII antes dos testes de autorização.

## P1 — MVP operacional protegido
- [ ] **T-008** Backend KofLang: API versionada de ministros, locais, assistidos, eventos, indisponibilidades e escalas; validação de entrada.
- [ ] **T-009** Auth0: login/logout, renovação, papéis `COORDINATOR`/`MINISTER`, vínculo com ministro, testes `401/403` e IDOR.
- [ ] **T-010** Neon: schema versionado de usuários, ministros, assistidos, eventos, impedimentos, visitas, alocações, revisões e auditoria; UUIDs, campos cifrados e índices HMAC quando necessários, com testes em branch isolada.
- [ ] **T-011** Portal do ministro: declarar impedimentos do próximo mês (missa/dias/período), visualizar próprios registros e consultar escala publicada.
- [ ] **T-012** Portal do coordenador: gerenciar cadastros, agenda e quantidade variável de ministros por celebração; importar nenhum dado real sem consentimento/base definida.
- [ ] **T-013** Algoritmo: regras obrigatórias de indisponibilidades, casais, limites, visitas dominicais e equilíbrio histórico; testes determinísticos.
- [ ] **T-014** Revisão manual, validação, aprovação exclusiva da coordenação, versionamento imutável e envio/disponibilização.
- [ ] **T-015** Emissão de PDF baseada no modelo Novembro/2026: escala geral minimizada e guia de visitas restrito, com autorização por download, logs e paginação A4.
- [ ] **T-016** Testes integrados de autenticação/autorização, dados pessoais, PDF, migrações, não duplicação de eventos e auditoria.

## P2 — Experiência mobile e operação
- [ ] **T-017** Central de notificações e push: pedido de impedimentos, lembretes antes do dia 25, escala aprovada, remarcações e cancelamentos.
- [ ] **T-018** Testes PWA: instalação, abertura standalone, fluxo Auth0, push em Android/iOS; sem cache de dados sensíveis.
- [ ] **T-019** Dashboards com agregação, supressão e avaliação de risco de reidentificação; não divulgar registros individuais.
- [ ] **T-020** Retenção, correção/eliminação, backup/recuperação, observabilidade sem PII e documentação operacional.

## Gates de entrega
1. Compilação KofLang e testes de domínio executados.
2. Backend identifica coordenador/ministro e verifica autorização em todos os endpoints protegidos.
3. Testes demonstram isolamento de informações dos assistidos e emissão segura dos PDFs.
4. Nenhum dado real em fixtures, GitHub, console, push ou cache PWA.
5. Validação PWA/Android/iOS registrada separadamente; promoção à `main` só após revisão e aceite.
