# Ambiente local de desenvolvimento — MESCE

## Estado desta entrega
- A interface web/PWA contém um **modo demonstrativo com dados fictícios, mantidos em memória**.
- Há um módulo puro de regras de alocação e impedimentos em `app/scheduling.js` com testes; é um **adaptador transitório de demonstração**, não backend final de produção. A visualização de coordenador/ministro é **simulação visual**, não controle de acesso.
- Os domínios definitivos do MESCE permanecem planejados para **KofLang**. O compilador não está instalado no ambiente desta entrega e a prova de compatibilidade com Neon/Auth0 ainda é pendente.
- **Nenhum usuário real deve ser cadastrado**, nenhuma informação real sobre assistidos deve ser inserida e nenhum segredo deve ser usado neste servidor.
- Nenhum deploy Vercel é necessário para desenvolver localmente.

## Rodar
Requer Node.js >= 20; não há dependências externas.

```bash
npm run dev
# Acesse http://127.0.0.1:4173
```

## Verificar
```bash
npm run check
npm test
```

## Segurança e isolamento
- Servidor HTTP aceita apenas GET em arquivos públicos previamente listados, só escuta `127.0.0.1`, desativa cache e não faz chamadas a Neon/Auth0.
- Não serve `.env`, `docs/`, fixtures locais, arquivos do Git, PDF com dados reais ou dados persistentes.
- Os controles de papéis nesta POC são **apenas de navegação visual**; não substituem autenticação/autorização de servidor. A versão com pessoas reais deve implementar verificação no backend.
- A PWA pode ser instalada em loopback compatível, mas experiência de push e instalação em celulares ainda requer validação própria.
- O documento `privacidade.html` é preliminar e precisa da identificação do controlador e contatos oficiais antes da coleta de dados reais.

## Próximas integrações
1. Validar compilação da CLI KofLang de `poc-kof/main.kf` e um servidor mínimo Kof com testes.
2. Definir backend de domínio KofLang, contratos versionados e verificação de access token Auth0.
3. Configurar Neon em ambiente de desenvolvimento **isolado** e com dados somente sintéticos; implementar migrations.
4. Migrar o motor demonstrativo do JS para lógica protegida do backend e manter UI como cliente.
5. Só habilitar dados reais após autorização, auditoria, testes de isolamentos e documento LGPD definitivo.
