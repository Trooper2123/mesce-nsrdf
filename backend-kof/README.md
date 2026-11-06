# Backend KofLang + Neon + Auth0 — integração de desenvolvimento

**Status:** migração aplicada SOMENTE na branch de desenvolvimento do Neon; API KofLang 0.7.2 passou em `kof check --target jvm`. Integração de login/CRUD de ponta a ponta **não testada**. Não disponibilizar dados pessoais reais ainda.

## Recursos criados e verificados
- GitHub: `feature/kof-neon-auth0-backend` (depende de `feature/mesce-app-dev`).
- Neon PostgreSQL 18, projeto criado pelo Marketplace do Vercel, **branch independente** `mesce-dev-2026-11`; esquema `mesce_dev` com atores, ministros, assistidos, celebrações, impedimentos, visitas, alocações e auditoria. A branch `main` do banco **não** foi modificada.
- Vercel: estão presentes nomes de variáveis `NEON_MESCE_DATABASE_URL`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID` e outros segredos (valores não foram consultados). Variáveis do Auth0 localizadas apenas em `production`; não usar segredos de produção em desenvolvimento.
- KofLang: binário oficial v0.7.2 baixado e hash SHA-256 verificado no GitHub Actions; compilação sem dependências reais em `.github/workflows/kof-check.yml`.
- Documentação da API Kof: [documentação oficial](https://koflang.github.io/web/) e [teste oficial de OAuth2/JWKS](https://github.com/KofLang/Kof4j/blob/main/kof-compiler/src/test/java/dev/kof/compiler/KofOAuthResourceServerTest.java).

## Endpoints implementados (somente desenvolvimento)
- `GET /api/me`: requires Bearer **access token** Auth0 assinado RS256, validado contra JWKS, issuer e audience. Exige `auth0_sub` cadastrado, ativo, em `mesce_dev.actors`. Sem vínculo: `403`.
- `GET /api/ministers`: somente `COORDINATOR`. Consulta SQL parametrizada, decripta nomes/telefones no servidor e não devolve dados cifrados.
- `POST /api/ministers`: somente `COORDINATOR`; cifra nome e telefone com AES-GCM antes de persistir; retorna `201` sem retornar PII.
- Não existe cadastro público de coordenador nem endpoint para promoção de papéis. Não permitir que usuários escolham o próprio papel.
- Não há rotas públicas; um token Auth0 válido, mas **sem registro de autorização no banco**, permanece bloqueado.
- Não confundir ID token com access token de API. Sem token, token inválido, errado issuer/audience/assinatura/expiração: rejeição obrigatória.

## Pré-requisitos para executar localmente
1. Instalar a distribuição oficial **KofLang 0.7.2** e ativar `kof` no PATH.
2. Criar uma API de desenvolvimento no **Auth0** com identificador (audience) próprio. Verificar Application Authorization Code + PKCE para futura UI. Não copiar segredos do ambiente de produção.
3. Usar apenas o endpoint SSL da branch Neon **`mesce-dev-2026-11`**, nunca o `main` do Neon. Obter sua connection string no Neon, não gravar no repositório.
4. Preencher um ambiente local seguro a partir dos nomes de `backend-kof/.env.example`, sem commitar valores. O runtime Kof espera variáveis de ambiente do processo; o arquivo `.env.example` **não é carregado automaticamente**.
5. Definir `MESCE_API_ENV=development` e chave AES de 32 bytes aleatórios, em hexadecimal (64 caracteres). Guardar em gerenciador de segredos, separado do banco.
6. Garantir disponibilidade do **driver JDBC PostgreSQL** para JVM. A CLI Kof oferece `kof deps`, mas a compatibilidade do carregamento do driver na distribuição ainda precisa de teste de execução. Um `kof check` bem-sucedido não prova conexão JDBC.
7. Restringir a execução à máquina/rede local: `app.listen(8081)` pode escutar interfaces externas. Não publicar porta ou configurar reverse proxy público sem TLS, CORS, CSRF, rate limiting e revisão de segurança.

```bash
kof version
kof check backend-kof/src/Main.kf --target jvm
# Com variáveis seguras já carregadas no ambiente:
kof serve backend-kof/src/Main.kf --port 8081
```

## Provisionamento do coordenador (operação manual controlada)
Apenas após autenticar e **confirmar** o `sub` Auth0 do coordenador de desenvolvimento, inserir manualmente na **branch de desenvolvimento**:

```sql
INSERT INTO mesce_dev.actors (auth0_sub, role, active)
VALUES ($1, 'COORDINATOR', true);
```

`$1` representa parâmetro vinculado pela ferramenta operacional; **não** fazer concatenação SQL com entradas de usuários e não colocar um `sub` real em arquivo ou migration.

## Próximos gates antes de cadastro real
- [x] Schema isolado no Neon de desenvolvimento, sem PII, confirmado via `information_schema`.
- [x] Código Kof compilável no `kof check` (GitHub Actions, Kof 0.7.2).
- [ ] Executar `kof build` e inicializar o backend com driver JDBC, variáveis de desenvolvimento e SSL.
- [ ] Testar `GET /api/me` com tokens válidos/ausentes/inválidos/expirados e `aud`/`iss` incorretos.
- [ ] Testar `403` para ministro sem papel de coordenador e `401` para não autenticado.
- [ ] Testar operações de cadastro, consulta, erros de payload, transações, rotação da chave AES e auditoria; impedir campos cifrados em logs.
- [ ] Implementar API de assistidos/visitas com verificação de vínculo ao serviço, não apenas papéis.
- [ ] Integrar a interface com Auth0 via PKCE e backend Kof em ambiente HTTPS de testes.
- [ ] Completar o aviso LGPD definitivo com controlador, contatos, finalidades, bases legais e retenção.

**Importante:** o app `index.html` atual continua POC fictícia. Ter schema e endpoints protegidos no código não equivale a ter um app operacional e seguro.
