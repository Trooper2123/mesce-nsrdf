# Fluxo operacional — Auth0 + KofLang + Neon (desenvolvimento)

**Status:** integração de interface e proxy implementada para testes locais. Nenhuma credencial foi adicionada ao repositório. Não inserir dados pessoais reais até validação 401/403, criptografia e LGPD.

## O que foi implementado
- Página independente `/operacional.html`, **sem** troca simulada de perfil.
- Login **Authorization Code + PKCE S256** no Auth0, com `state` aleatório, prazo de 10 minutos, callback exato e limpeza da URL. O access token permanece apenas **em memória**; não vai para localStorage, sessionStorage, cookies ou service worker.
- A API KofLang valida JWT RS256/JWKS, `iss`, `aud` e consulta o papel do usuário em `mesce_dev.actors`. Se não estiver autorizado, a interface permanece bloqueada.
- Ministro autorizado consulta a agenda; coordenador autorizado consulta e cadastra celebrações. Toda alteração é validada novamente no backend, não pela interface.
- Proxy local no servidor Node para dois endpoints permitidos (`/api/me` e `/api/celebrations`); nunca encaminha cookies, nem armazena tokens ou respostas. Mesma origem evita liberar CORS indiscriminadamente no Kof.
- **Nenhum segredo Auth0/Neon** via navegador: `/dev/auth-config` expõe apenas o *client ID público*, emissor e audience; o banco só é acessado pelo Kof.

## Pré-requisitos
1. Criar **Auth0 SPA de desenvolvimento**, configurando uma API/audience de desenvolvimento (access token RS256); não usar client secret no navegador.
2. Permitir exatamente:
   - Callback: `http://127.0.0.1:4173/operacional.html`
   - Logout URL: `http://127.0.0.1:4173/operacional.html`
   - Web Origin: `http://127.0.0.1:4173`
3. Definir no terminal **apenas valores públicos** para o servidor Node:
   ```bash
   MESCE_AUTH0_ISSUER=https://TENANT-DEV.auth0.com/ \
   MESCE_AUTH0_CLIENT_ID=ID_PUBLICO_DA_SPA \
   MESCE_AUTH0_AUDIENCE=https://api.mesce.local \
   MESCE_ENABLE_API_PROXY=1 npm run dev
   ```
   No Windows PowerShell, definir as mesmas variáveis com `$env:VAR="valor"`, depois `npm run dev`.
4. Executar o backend Kof na porta 8081 com **sua própria configuração de Auth0** e `MESCE_DATABASE_URL` apontando exclusivamente para a branch Neon `mesce-dev-2026-11` com SSL. `MESCE_API_ENV=development` obrigatório.
5. Confirmar manualmente o `sub` do usuário autenticado e vincular a `mesce_dev.actors` **somente na branch dev**, com papel atribuído pela coordenação. Não existe cadastro público ou promoção automática.
6. Abrir `http://127.0.0.1:4173/operacional.html`. Usar o botão Entrar com Auth0; a página não apresenta dados operacionais sem token válido e perfil autorizado.

## Falhas seguras
- Sem configuração Auth0: acesso operacional indisponível.
- Sem proxy habilitado ou Kof indisponível: responde 503 (não utiliza dados de demonstração como substituição).
- Sem Bearer no proxy: 401; token inválido ou expirado deve falhar no Kof.
- Ator não vinculado ou sem papel: 403 do Kof; coordenação não é concedida pelo token nem por seleção visual.
- Sem Auth0 disponível, um token real ou driver PostgreSQL operacional, **não é possível declarar login / persistência end-to-end aprovados**.
- Dados da POC continuam separados em `/`; o modo operacional jamais copia dados de uma sessão fictícia para o banco.

## Testes
```bash
npm run check
npm test
npm run dev
```

A CI testa a validação de configurações, o proxy (401/503, allowlist, corpo grande), a tela e o bloqueio do cache PWA. Testes com Auth0/Neon em funcionamento exigem a configuração real acima; não são simulados como sucesso.

## Segurança e riscos pendentes
- Revisar proteção de HTTP loopback, CORS do Auth0, permissões e rate limiting; validar funcionamento de Kof com PostgreSQL/JDBC e token real.
- A interface não persiste tokens; após recarregar é necessário logar novamente. Logout local remove o token da memória (sem revogação automática de tokens já emitidos pelo provedor).
- Serviço de produção deve implementar BFF/sessão segura, HTTPS, gestão e rotação de segredos, auditoria de acesso e política LGPD final antes de aceitar dados reais.

## Variáveis Auth0 presentes na Vercel
A Function de produção `/api/auth-config` lê `AUTH0_DOMAIN` e `AUTH0_CLIENT_ID` e **não** revela `AUTH0_CLIENT_SECRET` nem `AUTH0_SECRET`.
O identificador da API deve ser configurado como `AUTH0_AUDIENCE` ou `MESCE_AUTH0_AUDIENCE` — atualmente não encontrado. Sem ele, a resposta será `503/auth0_api_audience_missing`.
Verificar o tipo de aplicação Auth0: clientes confidenciais precisam de troca de authorization code no servidor usando o Client Secret. O login PKCE no browser não substitui um BFF nesses casos.
