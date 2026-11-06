# Política de dados e anonimização — MESCE (proposta para implementação)

**Status:** desenho de segurança, não é certificação jurídica nem integração já ativa.
**Referência primária:** LGPD, arts. 5º, 12 e 13; orientações oficiais em https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/guias/guia_lgpd.pdf e https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/nota-tecnica-no-12-2023-cgf-anpd-inep.pdf

## Classificação e minimização

| Informação | Tratamento adequado | Destinatários |
|---|---|---|
| Nome e contato do ministro | Identificável, protegido | Próprio ministro e coordenação; nome em escala interna conforme necessidade |
| Impedimentos | Data/escopo visível à coordenação; motivo privado e opcional | Próprio ministro e coordenação |
| Nome/endereço/telefones do assistido, familiar e observações | **Identificável indispensável para a visita**, sob proteção e acesso limitado | Coordenador e ministro efetivamente designado para aquela visita |
| PDF de celebrações e visitas | Escopo mínimo, sem dados domiciliares e telefones | Ministros autorizados via autenticação |
| Guia operacional de visitas | Identificável restrito, nunca arquivo público | Somente participantes autorizados; download auditado e com prazo |
| Indicadores gerenciais compartilhados | Agregação e supressão de grupos pequenos; avaliação de risco antes de alegar anonimização | Destinatários autorizados |
| Fixtures, prints e desenvolvimento | Dados **inteiramente sintéticos**, sem derivar dados da escala real enviada | Desenvolvedores/QA |
| Push de escala | Texto genérico sem dados domiciliares, motivos privados, contato ou nome de assistido | Destinatário autenticado |

## Ponto crítico: pseudonimizar não significa anonimizar
Trocar nomes por códigos reversíveis, hashes estáveis, iniciais ou mascarar apenas o telefone **não remove** automaticamente a possibilidade de reidentificação. Se o controlador consegue reverter ou associar registros com esforço razoável, o conjunto segue como dado pessoal e exige a LGPD. Datas raras, endereço e pequenas comunidades podem tornar identificável um conjunto aparentemente anônimo. Não declarar que uma tabela individual com IDs está anonimizadа.

## Controles obrigatórios para fase com dados reais
1. Auth0/OIDC autenticando usuários e verificação de **autorização no backend** (papéis coordenador/ministro e vínculo à visita); negar acesso por URL direta e IDOR/BOLA.
2. Neon com dados operacionais em tabelas privadas e separação entre cadastros e vistas/consultas agregadas. Segredos apenas no backend; não disponibilizar variáveis de banco no navegador, no PWA ou em downloads públicos.
3. Criptografia em trânsito; proteção de segredos em repouso; trilha de auditoria dos acessos a dados de assistidos, alterações de escala e emissões/downloads de PDF.
4. Política explícita de finalidade, base legal adequada, transparência aos titulares, retenção e procedimento de correção/exclusão; não presumir consentimento como base única.
5. Evitar cache offline de dados identificáveis, inclusive PDF de visitas. Revisar permissões dos downloads e expiração dos arquivos.
6. Projeções agregadas sem identificadores, com supressão de células pequenas e avaliação de combinações externas; reduzir detalhamento por data, local, indivíduo e evento.
7. Testar conteúdo de relatórios/PDFs, logs, push e APIs para impedir exposição de dados de assistidos fora do escopo.

## O que foi efetivamente feito na POC
- O relatório agregado em `app/privacy.js` só publica contagem total de **celebrações e alocações**, sem campos de identificação, quando há pelo menos **5 ministros distintos e 3 celebrações distintas** nas linhas informadas. Caso contrário, retorna só `small_cohort` e nenhuma contagem.
- Não armazena dados: a demonstração roda em memória, usa ministros fictícios (A–H) e **não consulta Neon/Auth0**.
- Esse limite é um controle demonstrativo; **não constitui anonimização garantida** para uma base real e não substitui análise de reidentificação.
- O PDF demonstrativo gerado pelo navegador pode trazer identificadores **fictícios**. Em produção, diferentes PDFs exigirão regras de autorização e minimização no backend.

## Critérios de aceite da privacidade
- Nenhum nome, número, endereço, motivo de ausência ou data individual aparece no JSON agregado.
- Grupo pequeno retorna supressão sem contagens.
- Acesso por ministro não designado a endereço/contato de assistido retorna `403`.
- PDF geral não inclui contatos/endereços e guia de visitas exige autenticação e escopo.
- Downloads, mudanças de autorização e exclusões são auditados; nenhuma API de dados reais é publicada antes dos testes de autorização.

## Uso de hash e criptografia no Neon — decisão técnica proposta (2026-11-06)

**Objetivo:** empregar a técnica correta para cada campo, evitando a falsa alegação de que um hash individual torna a pessoa anônima.

| Caso | Solução | Justificativa |
|---|---|---|
| Chave primária de ministros/assistidos | UUID v4 aleatório | Identificador interno não derivado de nome, CPF, telefone ou endereço |
| Pesquisa exata/deduplicação de telefone ou e-mail | HMAC-SHA-256 do valor normalizado, gerado no **backend** com chave secreta | Reduz ataques triviais por dicionário em comparação a SHA-256 simples; continua sendo dado pessoal/pseudonimizado |
| Nome, endereço, telefone e contato que precisam ser apresentados a usuários autorizados | Criptografia autenticada (ex.: AES-256-GCM) na camada servidor + autorização forte | Permite recuperação controlada; hash não permite recuperar o endereço |
| Senhas | Gerenciadas pelo Auth0; não criar tabela própria de senhas | Evita duplicar credenciais e responsabilidades de autenticação |
| Dashboards de participação | Agregação, minimização, supressão e avaliação de risco de reidentificação | Hashes estáveis de pessoas não garantem anonimização |

**Regras de implementação:**
1. HMAC é calculado com chave versionada mantida **fora do Neon e fora do código-fonte**, em gerenciador de segredos do runtime; a chave não deve ser transmitida ao SQL, ao navegador ou ao PWA. Considerar rotação/reindexação e separação de chaves por ambiente e finalidade.
2. Normalização de telefone/e-mail deve ser determinística, documentada e testada; manter versão do algoritmo. Não usar hash direto de dado de baixa entropia (telefone/CPF), pois pode ser descoberto por força bruta/dicionário.
3. Não armazenar em claro campos sensíveis por conveniência; campos operacionais cifrados só podem ser decifrados após autorização por finalidade e vínculo com o serviço designado.
4. Proteger logs, backups, consultas, PDFs, APIs e relatórios. Criptografia e HMAC não substituem controles de autorização, auditoria, retenção e base legal.
5. O PostgreSQL oferece funções `digest()` e `hmac()` pela extensão `pgcrypto`, mas **a preferência para dados pessoais é calcular o HMAC na aplicação**, evitando fornecer a chave ao banco. Fonte: https://www.postgresql.org/docs/current/pgcrypto.html.
6. **Não aplicar schema nem gerar chaves no banco de produção** antes de prova KofLang/Neon, revisão de segurança e validação de autorização. Os testes usarão exclusivamente entradas fictícias.

**Critérios de aceite:** chaves jamais aparecem no banco ou logs; buscas exatas são determinísticas; rotação planejada; controle de acesso impede recuperação não autorizada; hash não é apresentado como anonimização.
