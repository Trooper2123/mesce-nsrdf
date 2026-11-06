# AGENTS.md — Messe NSR (KofLang)

## Objetivo e escopo
- Repositório oficial: `Trooper2123/mesce-nsrdf`; branch principal: `main`.
- Linguagem principal do projeto: **KofLang**. Não substituir por Java, Go, TypeScript ou outro stack sem decisão explícita e documentada.
- A interface web será publicada no Vercel; validar previamente a cadeia real de compilação KofLang/KofJS e o formato dos artefatos gerados. Não presumir suporte nativo do Vercel a KofLang.
- Não confundir este projeto com `meus-vampiros`. Reaproveitar práticas de engenharia, nunca regras de domínio.
- O escopo funcional do Messe NSR ainda deverá ser especificado. Não inventar regras de negócio, modelos de dados ou papéis de usuário.

## Antes de implementar
1. Ler `AGENTS.md`, `README.md`, documentação e código existente relacionado à alteração.
2. Consultar documentação da **versão real** do compilador e das bibliotecas KofLang utilizadas; registrar limitações e comandos reprodutíveis.
3. Identificar arquivos, consumidores, testes, configurações e possível impacto sobre usuários e dados.
4. Preferir a menor implementação completa; não introduzir camadas, abstrações, serviços ou dependências sem necessidade demonstrada.
5. Identificar o ambiente e o destino de qualquer operação que altere dados ou publique código.

## Planejamento por SPEC
- Para funcionalidades relevantes, criar `.codex/specs/<feature>/requirements.md`, `design.md` e `tasks.md`, ou seguir o padrão de documentação equivalente que venha a ser definido no repositório.
- Em `requirements.md`, descrever objetivo, escopo, critérios de aceitação, regras de negócio confirmadas e casos de erro.
- Em `design.md`, documentar arquitetura, fluxos, limites de confiança, testes, riscos e dependências.
- Em `tasks.md`, registrar implementação e validações, usando status `pending`, `in_progress`, `blocked` e `completed`.
- Definir testes e análise de segurança antes do código. Somente marcar `completed` após executar as validações pertinentes; na ausência delas, registrar `blocked`.
- Documentação em `.codex/` é de planejamento local; mantê-la fora dos commits, exceto se uma decisão explícita alterar esta política.

## Interface, UX e acessibilidade
- Todo texto de interface deverá estar em **português do Brasil**.
- Antes de criar páginas ou componentes, consultar `UI-GUIDE.md` e `design-system.md` **quando esses documentos existirem**.
- Centralizar cores, espaçamentos, tipografia e estados visuais em tokens; não criar hexadecimais avulsos em cada componente.
- Priorizar visualização mobile, navegação por teclado, foco visível, contraste adequado, estados de carregamento/erro/vazio e HTML semântico.
- HTML e CSS podem ser usados como recursos da web, mas lógica de domínio deverá permanecer em KofLang sempre que tecnicamente viável.

## Arquitetura e deploy
- Separar código-fonte KofLang, artefatos compilados, arquivos estáticos e configurações de publicação.
- Não editar manualmente artefatos gerados como substituição permanente do código-fonte.
- Antes de estabelecer pipeline, validar com um exemplo mínimo que o compilador KofLang/KofJS funciona no ambiente de build e que o Vercel serve a saída resultante.
- Manter a configuração de produção vinculada ao repositório `Trooper2123/mesce-nsrdf` e à branch `main`.
- Commits em branches de trabalho devem gerar previews quando a integração estiver operacional; mudanças na `main` podem seguir para produção somente após validação.
- Nunca afirmar que uma build, teste, integração Git ou deploy passou sem consultar seu resultado real.
- Não inventar comandos KofLang: incluir no README os comandos exatos apenas quando confirmados por execução ou documentação compatível.

## Persistência
- Não assumir banco de dados antes da decisão arquitetural. Caso PostgreSQL seja adotado, documentar schema, acesso, migrações e estratégias de rollback.
- Nunca limpar ou migrar dados de produção ou de ambientes compartilhados sem autorização e identificação do destino.
- Manter credenciais fora do repositório, usar consultas parametrizadas e testar integridade e isolamento de dados.
- Documentar mudanças de schema, migrações e seeds no `CHANGELOG.md`.

## Segurança obrigatória
- Aplicar OWASP Top 10, OWASP ASVS e práticas aplicáveis às tecnologias efetivamente usadas.
- Verificar autorização **no servidor** para operações protegidas; controles visuais não equivalem a autorização.
- Para APIs e entradas: validar formato, tamanho e tipo; prevenir injeção, XSS, CSRF, SSRF e acesso indevido por identificadores (IDOR/BOLA).
- Proteger segredos, tokens, dados pessoais e logs. Nunca enviar credenciais de backend ao JavaScript do cliente.
- Revisar autenticação, sessões, CORS, headers e rate limiting de acordo com a funcionalidade implementada.
- Incluir testes relevantes para `401`, `403`, isolamento entre usuários, entrada inválida e exposição indevida de dados quando houver contas ou APIs.
- Problemas críticos ou altos conhecidos relacionados à mudança impedem considerá-la concluída. Registrar bloqueios e riscos residuais.

## Testes e revisão pré-commit
1. Executar os testes pertinentes, verificações de tipos/compilação e lint disponibilizados pelo stack.
2. Validar build KofLang/KofJS com os **comandos documentados e efetivamente disponíveis**.
3. Validar saída estática e fluxo Vercel quando houver alteração de publicação.
4. Verificar dependências, segredos expostos e mudanças de segurança ou persistência.
5. Revisar impacto da alteração nos consumidores, configurações, fixtures e testes.
6. Executar a skill `pre-commit-review` quando estiver disponível; caso contrário, fazer revisão equivalente e registrar a limitação.
7. Manter `CHANGELOG.md` consistente com o diff, usando data/hora de Brasília, tipo (`feat`, `fix`, `refactor`, `style`, `chore` ou `docs`), principais arquivos e resultado.
8. Não realizar push com verificações obrigatórias falhando ou não realizadas; registrar o bloqueio em `tasks.md`.

## Ponytail — lazy senior dev mode
- O melhor código é o que não precisa ser escrito. Entregar a **menor mudança completa**.
- Reaproveitar padrões locais e bibliotecas existentes; evitar dependências para soluções de poucas linhas.
- Não criar abstrações, conversões, wrappers, opções ou arquivos “para o futuro” sem necessidade.
- Investigar a causa-raiz de defeitos e todos os chamadores antes da correção.
- Não sacrificar validação de entrada, segurança, tratamento de erro, acessibilidade ou requisitos explícitos.
- Toda nova lógica não trivial deve ter ao menos um teste pequeno ou uma autoverificação executável.
- Em respostas de implementação, indicar em uma ou duas linhas o que não foi verificado e os riscos restantes.

## Critérios para concluir
- Requisitos e critérios de aceitação verificados.
- Código, documentação e CHANGELOG alinhados.
- Testes, compilação e build pertinentes aprovados, com evidências registradas.
- Ausência de segredos e vulnerabilidades críticas ou altas conhecidas relacionadas à entrega.
- Implantação confirmada quando fizer parte do escopo.
- Limitações, riscos e tarefas pendentes documentados.
