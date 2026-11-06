# SPEC — Gestão e escalas dos Ministros Extraordinários da Sagrada Comunhão Eucarística (MESCE)

Status: **draft v0.10** — requisitos iniciais e referência adicional *Projeto MESCE v3.0* (outubro/2026).  
Repositório: `Trooper2123/mesce-nsrdf` · branch principal: `main`.

## 1. Objetivo
Desenvolver aplicação web para cadastrar ministros e assistidos, organizar celebrações/missas e visitas dominicais e gerar escalas mensais justas, respeitando disponibilidade, vínculo conjugal e localização. A especificação não significa que as funcionalidades já estão implementadas.

## 2. Cadastros e entidades

### 2.1 Ministros (`ministers`)
Campos informados:
- Identificador interno.
- Nome completo.
- Data de nascimento.
- Endereço (texto; permitir detalhamento em logradouro, número, complemento, bairro, cidade, UF e CEP).
- Telefone de contato.
- Data de início no ministério.
- Se possui cônjuge que também é ministro.
- Identificador do cônjuge dentro do cadastro de ministros.
- Preferência: servir juntos / não servir juntos / sem preferência; é uma preferência, não regra obrigatória, salvo posterior decisão.
- Observações.

Campos técnicos recomendados: ativo/inativo; data de criação/atualização. Vínculo conjugal deve ser recíproco, não pode apontar para a própria pessoa; remoção ou desativação não deve apagar histórico de escalas.

### 2.2 Celebrações e missas (`celebrations`, `celebration_patterns`)
- Data e hora de início (e término/duração, para verificar conflito).
- Tipo: missa, celebração ou evento extraordinário.
- Recorrência opcional para eventos habituais; inclusão avulsa e a qualquer tempo de casamentos, missa de sétimo dia, datas comemorativas e outros eventos; exceções, remarcações e cancelamentos por data. Nenhum evento extraordinário depende de um padrão mensal fixo.
- **Quantidade de ministros necessária por celebração:** valor inteiro positivo configurável por ocorrência e visível na criação, calendário e escala. As missas habituais podem usar uma quantidade padrão, mas **missas especiais e celebrações avulsas podem exigir quantidade diferente**.
- **O coordenador pode alterar o quantitativo diretamente durante a revisão da escala**, sem precisar alterar permanentemente o padrão de missas recorrentes. Registrar quantidade originalmente prevista e efetiva, autor e justificativa.
- Local da celebração, se necessário para distância/logística (**a confirmar**).
- Observações.
- Exibição em calendário mensal.
- Padrões recorrentes não devem gerar duplicações de ocorrências do mesmo evento.

### 2.3 Disponibilidade dos ministros (`minister_availability`)
- Ministro e impedimento do tipo **`CELEBRATION` (celebração/missa específica)**, **`DAY` (dia inteiro ou dias avulsos)** ou **`PERIOD` (intervalo de datas inclusivo)**, com estado indisponível; disponibilidade explícita futura pode ser modelada separadamente.
- Para `CELEBRATION`, guardar identificador da ocorrência concreta e bloquear **somente aquela celebração**, não outras missas do mesmo dia.
- Para `DAY`, guardar data de impedimento e bloquear todas as atividades nesse dia (permitir registrar vários dias, inclusive não consecutivos).
- Para `PERIOD`, guardar data inicial e final, ambas inclusivas; impedir todas as atividades no intervalo.
- Justificativa/observação opcional.
- Indisponibilidade explícita bloqueia designação para atividades no escopo indicado. Caso haja impedimento por celebração, não generalizá-lo automaticamente para o dia todo.
- Validar que a ocorrência referenciada exista e que o intervalo inicial não seja posterior ao final; impedir duplicidade equivalente, mantendo a autoria e alterações auditadas.
- Ausência de registro **não é automaticamente disponibilidade confirmada**; adotar regra operacional configurável após decisão.
- Para celebrações e visitas, verificar conflito de intervalos, inclusive deslocamento quando aplicável.

### 2.4 Assistidos (`assisted_people`)
- Identificador interno, nome completo, endereço.
- Telefone fixo e telefone móvel.
- Nome do familiar de referência e telefone.
- Observações.
- Campos técnicos recomendados: ativo/inativo e datas de atualização.
- Dados pessoais e observações são restritos a pessoas autorizadas; não devem constar de páginas públicas.

### 2.5 Visitas e escala dominical (`assisted_visits`)
- Calendário de **domingos** apenas.
- Domingo, assistido(s), ministro(s) escalado(s), situação e observações.
- Quantos ministros visitam cada assistido por domingo (**a confirmar**).
- Se todos os assistidos recebem visita a cada domingo ou possuem frequência individual (**a confirmar**).
- Regra de não designar um mesmo ministro simultaneamente para missa e visita.

### 2.6 Escalas e alocações (`schedules`, `assignments`)
- Mês/ano, modalidade `CELEBRATION` ou `ASSISTED_VISIT`; estados operacionais: `DRAFT`, `IN_REVIEW`, `APPROVED`, `PUBLISHED` ou `CANCELLED`. **Não há etapa obrigatória de aceite individual da designação.**
- Alocações identificam ministro, compromisso, data/hora e origem (automática/manual), com autor e justificativa de alterações. Os ministros registram **impedimentos/ausências antes da geração**, não respostas individuais de aceite/recusa a cada alocação.
- Manter histórico de alterações e de escalas publicadas; editar uma publicação exige registrar revisão.
- A interface deverá mostrar visualização mensal, filtros e exportação/impressão (formato a confirmar).

## 3. Regras de geração automática

### 3.1 Restrições obrigatórias
1. Não alocar ministro explicitamente indisponível no dia/horário.
2. Não gerar sobreposição de atividades de um mesmo ministro.
3. Não designar ministros inativos.
4. Respeitar a **quantidade efetiva de vagas por ocorrência**, incluindo alterações manuais na escala; não duplicar um ministro na mesma celebração.
5. Visitas são escaladas apenas aos domingos.
6. Endereços só podem ser usados para cálculo geográfico por serviço confiável e autorizado; não expor informação residencial a público ou serviço externo sem avaliação de privacidade.

### 3.2 Objetivos de otimização, nesta ordem inicial
1. Cobrir o maior número possível de vagas com ministros elegíveis.
2. Equilibrar a **quantidade de celebrações** por ministro ao longo do período escolhido.
3. Equilibrar a **quantidade de atendimentos/visitas** por ministro em sua própria contagem.
4. Respeitar preferências conjugais de servir juntos ou separados, desde que viáveis.
5. Nas visitas, minimizar deslocamento aproximado entre endereço do ministro e do assistido.

**Importante:** igualdade exata pode ser matematicamente impossível. Reportar mínimo, máximo, média e diferença de escalas por ministro, além de justificativas para vagas não cobertas. Não compensar automaticamente uma missa por uma visita: são modalidades com contagens próprias. O horizonte de justiça (mês corrente ou histórico acumulado) deverá ser definido.

### 3.3 Casais
- `JUNTOS`: tentar atribuir os dois ministros à mesma celebração ou serviço, se ambos disponíveis, elegíveis e houver vagas.
- `SEPARADOS`: evitar a mesma celebração/visita, salvo autorização explícita para exceções.
- `SEM_PREFERENCIA`: sem restrição adicional.
- Caso a preferência conflite com capacidade, disponibilidade ou equidade, reportar o conflito para ajuste humano; não gerar atribuição inválida silenciosamente.
- A referência MESCE v3.0 estabelece que `Servir Juntos = SIM` implica tratar o casal como unidade, sujeita à elegibilidade de ambos e ao limite de vagas. A força da preferência `SEPARADOS` continua pendente de confirmação.

### 3.4 Proximidade nas visitas
- Começar por bairro/CEP ou coordenadas geocodificadas conforme qualidade e disponibilidade dos dados.
- Não presumir que CEP representa distância real de percurso; quando disponível, usar distância/tempo de deslocamento.
- Somente comparar ministros elegíveis para aquele domingo.
- A proximidade é critério de desempate/otimização após cobertura e equilíbrio, não motivo para violar disponibilidade.
- Se endereço incompleto ou geocodificação falhar, permitir atribuição manual e registrar distância como indisponível, nunca inventar valor.
- Não transmitir dados pessoais de assistidos a terceiros sem base legal, controles e ciência dos responsáveis.

### 3.5 Fluxo vigente de elaboração e aprovação (substitui confirmação individual)
1. **Coordenador solicita impedimentos e ausências para o próximo mês.**
2. **Ministros informam impedimentos e ausências até o dia 25 do mês anterior.** A informação alimenta o cadastro de indisponibilidades. A ausência de envio de resposta não é aceite de designação nem garante disponibilidade; política de omissão ainda requer definição.
3. **Coordenador consolida e complementa** as informações recebidas, corrigindo cadastros e atualizando a agenda com missas habituais e celebrações extras (casamentos, sétimo dia, datas comemorativas etc.).
4. **Coordenador gera escalas preliminares** de celebrações e visitas, com validação de regras obrigatórias e equilíbrio.
5. **Coordenador faz ajustes manuais pontuais**, incluindo **aumentar ou diminuir o número de ministros por celebração diretamente na escala**, com registro de autoria/justificativa e revalidação das vagas e alocações afetadas.
6. **Coordenador aprova** a versão final após verificar impedimentos, conflitos, limites, casais, preferências locais e vagas.
7. **Sistema gera planilhas finais em PDF somente da versão aprovada** e o coordenador **envia/disponibiliza aos ministros**; o canal de entrega é configurável e ainda não está decidido.
8. Eventos avulsos inseridos após o fechamento passam por **revisão pontual e nova versão aprovada**, com comunicação das alterações aos afetados. Não alterar retroativamente a versão oficial sem auditoria.

A geração precisa ser determinística para os mesmos dados e parâmetros, ou registrar semente/versão do algoritmo quando utilizar aleatoriedade; impedir duplicações por repetição de solicitações. **Não existe bloqueio de aprovação por falta de confirmação individual da escala.**

## 4. Páginas da aplicação (MVP)
1. Painel mensal: resumo de eventos, visitas previstas, vagas preenchidas e pendências.
2. Ministros: cadastro, consulta, cônjuge e disponibilidade.
3. Celebrações/Missas: calendário, recorrências e eventos extraordinários.
4. Assistidos: cadastro protegido e dados de contato.
5. Visitas dominicais: calendário com os domingos e assistidos previstos.
6. Escalas: coordenador solicita e consolida impedimentos, gera proposta, ajusta, valida, aprova, emite PDF e distribui aos ministros.
7. **Minhas escalas e impedimentos**: ministro informa ausências para o mês seguinte até o dia 25 do mês anterior e consulta as escalas finais publicadas; **não confirma nem recusa cada designação antes da aprovação**.

Interface PT-BR, responsiva, acessível e com estados de erro/vazio.

## 5. Acesso e privacidade
- Definir perfis e autorizações com responsáveis pela pastoral antes da implantação. Proposta mínima: administrador/coordenador com edição e geração de escala; ministro com acesso restrito às próprias atividades e contatos estritamente necessários. **Papéis ainda não confirmados.**
- Nome, data de nascimento, endereço, telefone, vínculos familiares e observações exigem controles compatíveis com LGPD.
- Autenticação para acesso a cadastros; checagem de autorização no servidor (inclusive IDOR/BOLA). Não publicar contatos ou endereços em escala pública.
- Logs de auditoria para alteração de dados e escalas; backups, política de retenção, correção/exclusão e controle de exportação.
- Consentimento/base legal e finalidade de geocodificação devem ser avaliados antes de transmitir endereços a serviço externo.
- Nunca usar dados reais como seeds ou fixtures.

## 6. Arquitetura (decisão de projeto já registrada)
- Linguagem principal: **KofLang**.
- Interface web publicada no **Vercel**.
- Antes de implementar aplicação operacional: validar compilador KofLang/KofJS com exemplo mínimo, mecanismo de hospedagem de backend, persistência e autenticação. Não assumir suporte nativo.
- **Decisão arquitetural em avaliação (2026-11-06):** priorizar **Neon PostgreSQL** via integração Vercel. Banco ainda não provisionado; confirmar conectividade ao backend KofLang antes de criar tabelas.
- Fonte oficial: `Trooper2123/mesce-nsrdf`, branch `main`.
- Não alterar o protótipo atual ou implantar banco de dados como efeito desta SPEC.

## 7. Critérios iniciais de aceitação
- Cadastro válido de ministro com cônjuge existente e preferência; rejeitar vínculo consigo mesmo.
- Cadastro de assistido com contatos, endereço e acesso restrito.
- Configuração de celebrações recorrentes e extraordinárias sem duplicar ocorrências.
- Um ministro indisponível nunca aparece em escala gerada para aquele intervalo.
- Visitas aparecem apenas em domingos.
- Mesmo ministro não ocupa compromissos sobrepostos.
- Se vagas permitem, totais por ministro devem apresentar baixa diferença; se não permitem, exibir métricas e justificativas, sem prometer igualdade exata.
- Preferências conjugais são consideradas e conflitos explicitados.
- Entre ministros comparavelmente elegíveis, menor deslocamento influencia a escala de assistidos sem violar prioridade de equidade.
- Rascunho não é publicado automaticamente; edições manuais registram autoria.
- Testes automatizados cobrem indisponibilidade, falta de vagas, casal, domingo, equidade, distância ausente, autorização e idempotência.

## 8. Decisões pendentes
1. Quantos ministros em cada missa/celebração, e essa quantidade muda por horário/local?
2. Um ou mais ministros por assistido? Todos os assistidos são visitados em todo domingo?
3. Qual é a regra para dias sem disponibilidade declarada?
4. Servir junto/separado é preferência flexível ou exigência obrigatória?
5. Como tratar feriados, missas excepcionais, substituições e ausência de última hora?
6. A referência define equilíbrio histórico anual com análise dos últimos 12 meses e compensação de quem serviu menos. Confirmar pontuação e peso relativo de celebrações versus visitas.
7. Quais perfis usarão o sistema e quais dados podem aparecer em escalas compartilhadas?
8. Como calcular proximidade (bairro/CEP, coordenada, distância real) e quais permissões de dados?
9. Definir canal de solicitação de impedimentos, lembrete antes do dia 25, política para ministro que não informou impedimentos e canal de envio de PDF final (web, e-mail, WhatsApp, outros).
10. Qual banco de dados e qual hospedagem de backend são aceitáveis para o compilador KofLang disponível?

As questões acima **não bloqueiam a documentação**; bloqueiam decisões de implementação que dependam das respostas.


## 9. Complemento de referência — Projeto MESCE v3.0 (outubro/2026)

**Fonte:** documento fornecido `Projeto MESCE.docx`, intitulado *Relatório do Projeto MESCE — Sistema de Gestão dos Ministros Extraordinários da Sagrada Comunhão Eucarística, Versão 3.0 (Especificação Funcional)*. Os itens abaixo representam exigências dessa referência; não representam recursos já implementados. A referência previa inicialmente Excel Online/Copilot, enquanto este repositório mantém o objetivo de aplicativo web em KofLang.

### 9.1 Fluxo operacional e período de atualização
- **Registro histórico da referência de outubro/2026:** janela sugerida entre **dias 25 e 29**. **Regra substituída:** agora os ministros enviam impedimentos e ausências **até o dia 25 do mês anterior**; a coordenação consolida e elabora as escalas em seguida.
- Fluxo: atualização dos dados → geração preliminar → validação → ajustes manuais → aprovação → geração de PDF final → publicação.
- Tela inicial com ações de gerar escala preliminar, validar escala, aprovar escala, gerar PDF final, relatórios e dashboard.
- Configurações de referência: ano, mês, data inicial/final de atualização, limite mensal padrão e número de meses do histórico.
- O sistema deve diferenciar **prazo de atualização** e **data efetiva de celebração**; o comportamento fora da janela deverá ser definido por coordenação.

### 9.2 Ampliação do cadastro e preferências dos ministros
Além dos campos já descritos:
- **E-mail**, indicador **ativo/inativo** e **limite mensal individual**.
- Registro de **afastamento** independente de indisponibilidade por datas.
- Preferências por local, com valores inicialmente cadastrados na referência:
  - **Matriz**;
  - **Carmelo Nossa Senhora do Carmo**;
  - **Capela Nossa Senhora Aparecida**;
  - **Eventos Externos**.
- Classificação de preferência por local: **EXCLUSIVA** (só poderá servir no local indicado), **PREFERENCIAL** (prioridade para o local) ou **ACEITA** (pode servir em qualquer local). A escolha de vários locais exclusivos precisa de validação clara.
- Preferências e limites devem ser editáveis sem alterar historicamente escalas já publicadas; guardar evidência do valor aplicado à geração da escala.

### 9.3 Indisponibilidades e celebrações
- Indisponibilidades têm **data inicial, data final e motivo** e podem cobrir intervalos de vários dias.
- Tipos de celebração de referência: **Missa, Adoração, Casamento, Evento Especial**.
- Celebração exige **data, hora, local, tipo, quantidade de ministros e observações**.
- A quantidade necessária é **por celebração**, não uma constante global. Campos de `Ministro 1/2/3` do documento são representação visual exemplificativa; o modelo relacional deve suportar quantidade variável.
- Evitar escala em **dois dias seguidos** e **mais de uma celebração no mesmo dia**. São critérios de preferência e aviso, enquanto indisponibilidade, afastamento, inatividade e limite mensal são bloqueios explícitos da referência.

### 9.4 Equidade histórica e limite mensal
- O documento exige **analisar os últimos 12 meses**, com objetivo de equilibrar participação ao longo do ano, não só no mês corrente.
- Cada registro histórico deverá permitir recuperar **ministro, ano, mês, total de celebrações, total de assistidos, pontuação e saldo**.
- **Compensação:** ministros com menor participação histórica recebem prioridade nas próximas escalas, respeitando todas as restrições obrigatórias.
- Ninguém pode ultrapassar seu **limite mensal** (individual ou padrão). É preciso definir se o limite conta participações em celebrações e visitas em conjunto ou separadamente.
- Os campos `pontuação` e `saldo` existem na referência, mas **não há fórmula definida**. Não inventar pesos ou tratar número de missas como automaticamente equivalente a número de assistidos.
- Regra de equilíbrio sugerida para implementação após definição da fórmula: minimizar diferença de participação no histórico (janela móvel de 12 meses), depois distribuir vagas do mês; quando empatar, considerar preferências locais, casais, escala consecutiva e proximidade nas visitas. A precedência exata entre preferências é decisão pendente.

### 9.5 Casais como unidade
- Regra explícita do documento: quando `Servir Juntos = SIM`, o **casal deverá ser tratado como unidade**.
- Antes de alocar a unidade, verificar **disponibilidade dos dois, vínculo válido, local permitido para ambos, capacidade para duas pessoas e limites mensais individuais**.
- Não fazer alocação parcial silenciosa em nome do casal. Se impossível, registrar vaga em aberto ou conflito para revisão.
- Regras de `Servir Juntos = NÃO`, caso haja separação obrigatória, precisam ser acordadas; o documento não determina proibição de coincidência.

### 9.6 Estados, aprovação, PDF e auditoria
- Estados documentados: **Pendente → Em Revisão → Aprovada**; `Publicada` pode ser estado separado de distribuição, a decidir.
- **Regra vigente:** somente o **coordenador** aprova após validações completas e ausência de conflitos bloqueantes, indisponibilidades violadas e limites excedidos. **Não depende de aceite individual prévio dos ministros**. A versão aprovada é a fonte do PDF oficial.
- **PDF final só pode ser gerado de escala aprovada**. Uma prévia para revisão, se existir, deve ser claramente identificada e não confundida com o PDF oficial.
- Ajustes manuais devem registrar **data, alteração e responsável** (por exemplo, troca de um ministro por outro), com revalidação obrigatória antes de aprovação.
- Auditoria deve registrar **criação, alteração, exclusão, aprovação e emissão de PDF**, com **data/hora, usuário, ação e descrição**.
- Manter histórico/auditoria imutável para fins de rastreabilidade; exclusão de cadastro não deve apagar trilha de escala.

### 9.7 Dashboard, relatórios e campos personalizados
- Dashboard: **ministros ativos, assistidos ativos, celebrações do mês, escalas pendentes e aprovadas**.
- Gráficos: **participação por ministro, por casal, mensal e distribuição das celebrações**.
- Relatório de escalas: celebrações e ministros escalados.
- Relatório de assistidos: assistidos, responsáveis e telefones — **acesso restrito** por conter dados pessoais.
- Relatório de participação: missas servidas, assistidos atendidos e saldo histórico.
- Campos personalizados por entidade, sem alteração estrutural de schema. Exemplos da referência: profissão e comunidade (ministros), necessita transporte (assistidos), celebrante (celebrações).
- Campo personalizado exige catálogo de definições com entidade, nome, tipo, obrigatoriedade e permissões; não permitir execução de código ou SQL como valor.
- Priorizar formulários de cadastro e geração de escala no MVP; personalização e gráficos são escopo posterior, salvo decisão de prioridade diferente.

### 9.8 Perfis e manual operacional de referência
- **Coordenador:** atualizar cadastros, indisponibilidades e celebrações; gerar escala preliminar; revisar; registrar ajustes; aprovar; emitir PDF.
- **Ministro:** informar indisponibilidades; manter dados próprios atualizados; consultar escalas publicadas.
- Implementar autorização em backend por papel e por titularidade dos dados. A publicação de escala não implica divulgação irrestrita de endereços e telefones.

### 9.9 Critérios de aceitação adicionais
1. Ministro inativo, afastado ou indisponível nunca é escalado.
2. Preferência **EXCLUSIVA** impede escala em local não autorizado.
3. Casal com `Servir Juntos = SIM` entra na mesma ocorrência ou a alocação fica pendente; nenhum integrante é designado isoladamente pela rotina de casal.
4. Um ministro nunca ultrapassa o limite mensal definido.
5. A geração considera participação histórica de 12 meses e explicita o saldo, sem simular fórmula de pontuação ainda não aprovada.
6. O sistema sinaliza dois dias consecutivos e duas celebrações no mesmo dia.
7. Edição manual registra responsável e exige nova validação.
8. Escalas com conflito não podem ser aprovadas; PDF oficial só é emitido após aprovação.
9. Relatórios e campos pessoais só são visíveis a perfis autorizados.

### 9.10 Questões ainda abertas após a referência
- Definição da **pontuação**, do **saldo** e do peso de missas versus assistidos.
- Se **limite mensal** se aplica a todas as modalidades somadas ou por modalidade.
- Como interpretar período de atualização de **25 a 29** nos meses com exceções, e quem pode editar fora da janela.
- Forma exata de lidar com eventos de vários horários e com exigência de dupla para casal.
- Quantos ministros por visita dominical e frequência de visitas por assistido.
- Como aplicar `SEPARADOS` e como conciliar preferências conflitantes.
- Se os locais de celebração listados são exclusivos dessa paróquia ou exemplos editáveis.
- Escopo e prioridade de campos personalizados, dashboards avançados e exportação de dados.
- Política de mudanças após envio do PDF, substituições extraordinárias e divulgação segura de informações dos assistidos.

## 10. Fluxo operacional vigente — solicitação de impedimentos → escala final (revisão de 2026-11-06)

**Decisão vigente do projeto, com prioridade sobre descrições anteriores deste documento e sobre o fluxo preliminar da referência MESCE v3.0.**

### 10.1 Agenda dinâmica
- Celebrações podem ser habituais ou incluídas a qualquer momento pelo coordenador: casamento, missa de sétimo dia, datas comemorativas, eventos especiais e outras ocorrências.
- Alterações de calendário antes da geração ou durante a revisão entram na proposta de escala; alterações posteriores à publicação exigem revisão versionada e nova comunicação.
- Cancelamentos, remarcações e substituições preservam histórico de auditoria e não são contados como serviço realizado quando não ocorrerem.

### 10.2 Ciclo mensal obrigatório
1. **Solicitação:** coordenador solicita impedimentos/ausências para o **mês seguinte**.
2. **Prazo:** ministros informam impedimentos e ausências **até o dia 25 do mês anterior ao mês escalado**.
3. **Consolidação:** coordenador alimenta/corrige informações recebidas, atualiza cadastro de impedimentos e ajusta calendário, incluindo eventos extraordinários.
4. **Proposta:** coordenador executa geração das escalas preliminares para celebrações e assistidos, respeitando indisponibilidades, limites, casais, locais e equilíbrio histórico.
5. **Revisão manual:** coordenador faz ajustes pontuais, com justificativas, e revalida conflitos.
6. **Aprovação:** coordenador aprova a escala; não há coleta de aceite/recusa individual dos ministros sobre cada designação.
7. **PDF final:** sistema gera as planilhas definitivas **somente após aprovação**, com identificação de mês, modalidade, versão e data de emissão.
8. **Envio:** coordenador encaminha as planilhas finais aos ministros; disponibilizar também a versão publicada na área autenticada do aplicativo. O canal externo de envio está pendente de escolha.

### 10.3 Estados e responsabilidade
- **Escala:** `DRAFT` (geração inicial) → `IN_REVIEW` (ajustes e validação) → `APPROVED` (coordenador aprovou) → `PUBLISHED` (disponibilizada/enviada); `CANCELLED` para versão cancelada.
- **Impedimento:** identificador do ministro, intervalo de data, motivo opcional, quem registrou e quando; pode ser enviado pelo ministro e atualizado pelo coordenador com rastreabilidade.
- **Alocação:** ministro designado, evento, origem, dados da versão e eventual alteração; **não** terá estados obrigatórios `PENDING`/`CONFIRMED`/`DECLINED` de convocação.
- **Aprovação:** somente perfil coordenador, com validação de restrições e auditoria. Nenhum simples recebimento ou leitura de aviso aprova a escala.

### 10.4 Notificações e exceções
- Lembretes para o ministro **informar impedimentos antes do dia 25** e aviso de prazo encerrado, se aplicável.
- Aviso ao coordenador de impedimentos recebidos, respostas ausentes e mudanças relevantes.
- Aviso de publicação, emissão/disponibilização do PDF e alteração/cancelamento após envio.
- Se surgir um impedimento extraordinário após o dia 25, o ministro poderá comunicar à coordenação pelo canal definido; ajuste posterior não modifica a escala aprovada silenciosamente. O sistema registra alteração e permite uma nova versão.
- O prazo de 25 é fixo como **limite de envio**; ainda é necessário definir o **dia em que a solicitação será enviada** e o tratamento de não resposta.
- Para assistidos, mantêm-se o calendário dominical e a necessidade de proteger endereços/contatos.

### 10.5 Critérios de aceitação
1. O sistema identifica o mês alvo e informa prazo de impedimentos no **dia 25 do mês anterior**.
2. O ministro envia ausência/impedimento para o próximo mês e o coordenador pode consolidá-lo com trilha de auditoria.
3. Eventos extraordinários podem ser adicionados antes da proposta ou após ela, com revalidação da escala.
4. A geração não escala ministros indisponíveis e respeita as demais restrições obrigatórias.
5. O coordenador pode alterar manualmente a proposta e deve ver conflitos antes da aprovação.
6. A aprovação é exclusiva do coordenador e **não exige confirmação individual das designações**.
7. O PDF final é gerado somente para uma versão aprovada; a versão distribuída corresponde à aprovada.
8. Todos os ministros abrangidos podem consultar a escala publicada, com dados pessoais de assistidos restritos aos autorizados.
9. Alterações após publicação geram revisão auditada, novo PDF e comunicação aos afetados.
10. Falha de entrega push não impede o fluxo; o PDF permanece acessível no aplicativo.

### 10.6 Decisões pendentes
- Data inicial da solicitação e lembretes (o prazo final é dia 25).
- Regra para ausência de resposta do ministro até o dia 25: presumir ausência de impedimentos ou exigir revisão manual? **Não assumir nenhuma das duas automaticamente.**
- Canal do envio final: link autenticado, download do PDF, e-mail, WhatsApp ou combinação; nada externo deve ser enviado sem decisão.
- Política para impedimento emergencial ou indisponibilidade informada após aprovação.
- Quais dados pessoais podem aparecer nos PDFs de assistidos e quem pode acessá-los.

## 11. Plataforma web e evolução para Android/iOS (decisão de 2026-11-06)

### 11.1 Objetivo e fases
A **interface web é parte obrigatória da primeira entrega funcional**. A arquitetura deverá preservar a possibilidade de criar aplicativos Android e iOS em etapas posteriores, sem reimplementar regras de distribuição nem criar bases de dados independentes.

- **Fase 1 — Web responsiva (prioridade):** oferecer autenticação/autorização, agenda dinâmica, cadastros, envio de impedimentos até o dia 25, proposta, revisão pelo coordenador, aprovação, publicação e PDF oficial.
- **Fase 2 — PWA (opção a validar):** manifesto, instalação na tela inicial, ícones, navegação móvel e cache seguro dos recursos estáticos; capacidades offline e notificações push exigem análise específica de compatibilidade e privacidade. PWA não equivale automaticamente a aplicativo nativo distribuído nas lojas.
- **Fase 3 — Android e iOS (planejamento):** avaliar aplicativos nativos ou multiplataforma que consumam a mesma API autenticada, conforme necessidades concretas de notificações, dispositivos, distribuição e manutenção. Não escolher framework móvel antes de validar requisitos e integração com KofLang.

Não há prazo nem compromisso de publicação nas lojas nesta etapa.

### 11.2 Interfaces e jornadas
**Coordenador — web e futura experiência móvel:**
- Autenticação e painel com escala do período, pendências, confirmações, recusas e eventos extraordinários.
- Criação/edição de compromissos recorrentes e avulsos, inclusive casamento, missa de sétimo dia e datas comemorativas.
- Cadastro protegido de ministros, assistidos, locais e regras; ajuste de vagas e consulta de histórico.
- Solicitação de impedimentos para o próximo mês, consolidação das respostas e geração/edição de propostas de escala.
- Ajustes e substituições pontuais com revalidação; aprovação pelo coordenador, PDF final e distribuição.

**Ministro — web e futura experiência móvel:**
- Autenticação, tela **Minhas escalas**, com data, hora, local e tipo de celebração.
- **Informar impedimentos e ausências do mês seguinte até o dia 25 do mês anterior**, com feedback de recebimento; consultar a escala final quando publicada.
- Informar indisponibilidades e manter seus dados, dentro dos limites de permissão definidos.
- Consultar apenas informações de assistidos estritamente necessárias às visitas atribuídas e autorizadas.
- Receber avisos de prazo de impedimentos, publicação e alterações de escala; o prazo de envio de impedimentos é o dia 25.

### 11.3 Contratos e compartilhamento entre plataformas
- Uma única fonte de verdade para ministros, celebrações, assistidos, alocações, respostas, permissões e histórico.
- Colocar cálculo de elegibilidade, equilíbrio, unidade de casais, limites, registro de impedimentos, aprovação e auditoria no **serviço de domínio/backend**, nunca exclusivamente na interface web ou móvel.
- Expor APIs versionadas e autorizadas (contrato a definir), reutilizáveis por web, Android e iOS.
- Validar autenticação/autorização em cada chamada e impedir acesso cruzado por troca de identificadores.
- Tratar horário com fuso da celebração, guardar instantes adequadamente e apresentar datas no padrão local.
- Registro de impedimentos e aprovação devem ser idempotentes para evitar duplicações em conexões instáveis.
- Compartilhar design tokens, regras de acessibilidade e terminologia; não exigir compartilhamento do mesmo código de interface entre tecnologias diferentes.

### 11.4 KofLang e publicação
- **KofLang permanece a linguagem principal planejada**; comprovar com um protótipo mínimo compilável qual runtime, saída web/JS, toolchain, testes e hospedagem são realmente suportados.
- Vercel segue como alvo para a interface web. Não pressupor execução de backend KofLang diretamente no Vercel sem teste validado.
- Selecionar hospedagem do backend, persistência e autenticação depois da prova técnica; registrar decisões arquiteturais antes de implementar.
- Se KofLang não disponibilizar uma integração móvel estável, os futuros clientes Android/iOS poderão usar tecnologia própria, consumindo os mesmos contratos e regras do backend KofLang, mediante decisão documentada.
- O protótipo HTML anteriormente publicado não é prova da compilação KofLang nem representa aplicação operacional.

### 11.5 Qualidade e segurança multiplataforma
- Layout responsivo para celulares, tablets e desktops; navegação por toque e teclado; foco, contraste, mensagens de erro, estados vazios/carregamento.
- Não armazenar listas completas de endereços, telefones, informações de assistidos ou tokens de longa duração em caches públicos ou armazenamento offline inseguro.
- Exigir sessão autenticada nas telas com dados pessoais; tratamento seguro de logout, expiração e perda de dispositivo.
- Proteger APIs contra acesso não autorizado e operações duplicadas, inclusive no registro de impedimentos e aprovação.
- Projetar notificações com conteúdo mínimo e sem dados sensíveis em prévias na tela bloqueada.
- Medir usabilidade do envio de impedimentos e consulta às escalas em viewport móvel, com alvos de toque adequados.

### 11.6 Critérios de aceitação e marcos
1. A versão web permite o ciclo completo: solicitar impedimentos do próximo mês → recebê-los até dia 25 → consolidar e ajustar agenda → gerar escala preliminar → fazer ajustes pontuais → aprovar → emitir PDF final → enviar/disponibilizar.
2. Cada ministro consegue entrar pelo navegador móvel e registrar **seus próprios impedimentos**, com persistência e autoria, além de consultar a escala final publicada.
3. A mesma informação aparece atualizada em sessões diferentes; impedimentos e aprovação não podem depender apenas do frontend.
4. O layout funciona em celular e desktop; ações principais são acessíveis por toque e teclado.
5. A interface web é publicada em ambiente controlado com autenticação e controles LGPD antes de receber dados reais.
6. A prova de compilação KofLang/KofJS e a execução de backend estão documentadas com comandos reais e resultados.
7. Há um contrato de serviços preparado para futuros consumidores móveis, sem necessidade de implementar aplicativos ainda.
8. Os aplicativos Android e iOS terão definição própria de escopo, testes, distribuição e tecnologias, após a conclusão do MVP web.

### 11.7 Planejamento para app móvel
- **Descoberta:** notificações push relacionadas às escalas são requisito confirmado; validar resposta rápida, acesso offline, agenda pessoal e integração com calendário do telefone.
- **Decisão:** avaliar PWA versus app próprio Android/iOS considerando compatibilidade, requisitos das lojas, permissões e custos de manutenção.
- **Construção:** adicionar clientes mobile sobre contratos de API existentes, reaproveitando regras de domínio e segurança, sem duplicar banco.
- **Publicação:** configurar contas de distribuição, políticas de privacidade e conformidade de lojas na fase correspondente.

**Em aberto:** prazo de entrega dos apps, notificação preferida, disponibilidade offline, necessidade de login biométrico, plataforma de distribuição e eventual acesso exclusivo a membros da pastoral.

## 12. Notificações push de eventos de escala — fluxo vigente (revisão de 2026-11-06)

**Requisito:** notificações apoiam o pedido de impedimentos, a coordenação e a distribuição de escalas. **Não há solicitação de aceite/recusa individual de cada designação**. Push é complementar à caixa de notificações autenticada; falha de entrega não bloqueia o planejamento.

### 12.1 Eventos e destinatários

| Evento | Destinatário | Ação |
| --- | --- | --- |
| Solicitação de impedimentos para o mês seguinte | Todos os ministros ativos elegíveis | Abrir formulário de indisponibilidades do próximo mês |
| Lembrete de prazo antes do dia 25 | Ministros que não concluíram o envio, conforme política a confirmar | Abrir formulário; respeitar horários silenciosos |
| Impedimento enviado ou atualizado | Coordenador e ministro autor (aviso de recebimento) | Consultar alterações e pendências |
| Encerramento do prazo (dia 25) | Coordenador | Revisar recebimentos, ausentes de resposta e iniciar consolidação |
| Calendário ou celebração extraordinária adicionada/alterada | Coordenador; ministros impactados apenas se escala já publicada | Consultar evento atualizado |
| Escala preliminar gerada / revisão pendente | Coordenador | Abrir escala para ajustes manuais e validação |
| Escala aprovada e PDF final disponível | Ministros abrangidos e coordenador | Abrir versão oficial autenticada |
| Escala enviada/publicada | Ministros abrangidos | Consultar/download do PDF, sem dados pessoais desnecessários |
| Alteração, substituição ou cancelamento de escala publicada | Somente ministros afetados e coordenador | Consultar versão atualizada; indicar claramente que a anterior mudou |
| Lembrete de compromisso próximo | Ministros designados na versão vigente | Consultar data/hora/local, sem exigir aceite |

Não enviar notificações para confirmar ou recusar a designação. Eventos extraordinários (casamento, missa de sétimo dia, datas comemorativas) são tratados como outros compromissos. Dados e endereços de assistidos nunca entram no texto de push.

### 12.2 Entrega e preferências
1. Registrar evento de domínio após transação persistida, destinatários autorizados, versão e identificador.
2. Persistir notificação interna com estado `UNREAD`/`READ`, independentemente de permissão Web Push.
3. Respeitar permissão do dispositivo, inscrição ativa e preferência do ministro; push não é requisito para acesso ao sistema.
4. Ao clicar, abrir rota HTTPS autenticada de impedimentos, escala ou aviso; autenticar e autorizar novamente.
5. Lembretes de prazo não devem afirmar que falta envio quando o usuário já registrou dados; reconciliar pelo estado mais recente.
6. Restringir payload aos dados mínimos: tipo de alerta, mês ou referência genérica, sem telefones, endereços ou observações.
7. Horários, quantidade de lembretes e canal externo de envio das planilhas ainda dependem de decisão.

### 12.3 Arquitetura e resiliência
- Modelo lógico sugerido: `notification_events`, `notifications`, `push_subscriptions` e `notification_delivery_attempts`; schema concreto será decidido após validação do Neon e do backend.
- Um serviço central em KofLang, se validado, identifica destinatários e publica eventos; adapters Web Push e futuros clientes móveis usam a mesma fonte de eventos.
- Preferir outbox/fila para desacoplar gravação de escala de envio de push. Entrega best effort, retries e remoção de inscrições inválidas.
- Deduplicação por evento + destinatário + canal + versão; não disparar publicação de versão antiga após nova revisão.
- Não exigir conexão ou validação de push para que o coordenador possa aprovar uma escala com restrições verificadas.

### 12.4 Segurança e testes
- Push é opcional e solicitado com consentimento do dispositivo; não usar prévia da tela bloqueada para dados de assistidos ou justificativas privadas.
- Não expor tokens/endpoints de inscrição; controlar revogação, logout, troca de conta, retenção e links antigos.
- Testes: pedido enviado ao público correto, lembrete somente quando aplicável, recebimento pelo coordenador, publicação do PDF, alterações de versão, deduplicação, falha temporária, expiração de permissão, acesso não autorizado e dispositivos Android/iOS.
- Confirmação de leitura da notificação **não** é confirmação de disponibilidade e não altera a escala.

### 12.5 Pendências
- Quando enviar o pedido inicial de impedimentos e quantos lembretes antes do dia 25.
- Como tratar ministros que não enviaram impedimentos até o prazo.
- Se escala final será distribuída por download autenticado, e-mail, WhatsApp ou combinação.
- Política para aviso urgente de remarcação de celebração após distribuição.

## 13. Infraestrutura candidata: Neon, Auth0, web e PWA primeiro (decisão de 2026-11-06)

### 13.1 Prioridades
- **Prioridade 1:** aplicativo web responsivo operacional, publicado no Vercel.
- **Prioridade 2:** **PWA instalável** em Android/iOS, buscando oferecer uso equivalente a um aplicativo para os fluxos essenciais da pastoral, com notificações push após permissões e compatibilidade confirmadas.
- **Prioridade futura e condicional:** aplicativos nativos Android/iOS somente se a validação da PWA identificar lacunas importantes. Não iniciar dois clientes nativos automaticamente.
- **Persistência selecionada:** **Neon PostgreSQL**, pela integração com Vercel, branches para testes/previews e gestão centralizada. A responsável informou configuração concluída; foi encontrado um projeto Neon criado pelo Vercel Marketplace em 2026-11-06, porém **o vínculo específico com o projeto MESCE e a conectividade não foram verificados**.
- **Identidade selecionada:** **Auth0**, via Vercel Marketplace. A responsável informou configuração concluída, mas **o vínculo com o projeto MESCE e o login OIDC em execução ainda não foram verificados**.
- **Domínio/backend:** manter **KofLang como linguagem principal planejada**; requer prova técnica de runtime e comunicação com Neon e Auth0.

### 13.2 Organização lógica (não é deploy já existente)
```text
Navegador web / PWA (Android, iOS, desktop)
    |  HTTPS + sessão/autenticação
    v
Interface no Vercel
    |  API autenticada (contrato compartilhado)
    v
Backend de domínio em KofLang (hospedagem a validar)
    |-- OIDC/OAuth 2.0: Auth0 (identidade e emissão de tokens)
    |-- SQL parametrizado: Neon PostgreSQL
    |-- Eventos de escala -> notificações internas e serviço Web Push
    '-- Autorização, confirmação, revisão, aprovação e auditoria
```
O login pode envolver redirecionamento direto do cliente para o Auth0, mas decisões de permissão são verificadas no backend; a ilustração não representa um proxy obrigatório da interface.

### 13.3 Neon PostgreSQL — regras
- Usar PostgreSQL gerenciado via integração Vercel quando a integração e o modelo de execução estiverem confirmados.
- O backend KofLang deverá conseguir abrir conexões PostgreSQL de modo seguro (JDBC se o target JVM suportar, ou outro driver testado); não assumir que bibliotecas JavaScript específicas de Next.js funcionam em KofLang.
- Configurar credenciais apenas no runtime servidor, nunca no bundle web, service worker, manifest ou no dispositivo do ministro.
- Separar ambientes **desenvolvimento/testes, preview e produção** usando bancos ou branches isolados; nunca clonar dados pessoais reais para previews.
- Usar conexões com TLS, pool/limites compatíveis com o driver e o ambiente, migrations versionadas, backups/recovery e segregação de permissões.
- Os cadastros, escalas, confirmações, auditoria e notificações compartilham uma fonte persistente de verdade.
- Avaliar residência de dados e termos de tratamento/privacidade antes de armazenar dados pessoais.

### 13.4 Auth0 — regras
- Usar **OpenID Connect/OAuth 2.0** com Authorization Code + PKCE onde aplicável, e fluxos adequados para uma aplicação web/PWA.
- Autenticação central no Auth0; manter no Neon o perfil interno (`auth0_sub` ou identificador externo equivalente, vínculo com ministro, papéis, permissões e status). Não copiar senhas para o banco.
- Papéis mínimos: **COORDINATOR** e **MINISTER**; poderes e escopo de acesso validados pelo backend (não apenas por claims ou interface).
- O ministro só registra/consulta impedimentos de sua própria identidade e consulta suas escalas publicadas; coordenador administra, revisa e aprova; impedir IDOR/BOLA.
- O backend deve validar **access token de API** (assinatura/JWKS, emissor, audiência, validade, permissões) e não usar ID token para autorizar operações de API.
- A integração Auth0 do Vercel oferece configuração automatizada e SDK pronto sobretudo para **Next.js**; não pressupor SDK compatível com KofLang. Implementar padrões OIDC com bibliotecas realmente suportadas após prova técnica.
- Documentar callback URLs para produção, previews e PWA instalada. Testar login, refresh/expiração, logout e deep links sem expor tokens em armazenamento inseguro.
- Não provisionar tenant, credenciais ou usuários de produção sem uma etapa específica de configuração.

### 13.5 PWA como possível aplicativo principal
- Interface **mobile-first** com controles de toque, navegação clara, estados de conexão e foco/acessibilidade.
- HTTPS, `manifest.webmanifest` com nome/ícones/display e `service worker` com estratégia de cache **apenas de assets públicos seguros**.
- Instalação na tela inicial de Android e iOS e lançamento em modo standalone quando suportado.
- Android: testar Chrome e pelo menos outro navegador relevante no piloto. iOS: testar Safari e execução da PWA adicionada à tela de início; **Web Push em iOS exige web app adicionado à tela inicial em iOS 16.4+**, além de permissão e requisitos de plataforma.
- Notificações push são requisito do MESCE, mas não devem ser a única forma de convocação: manter centro de notificações interno e status persistido no servidor.
- Não prometer **uso offline completo**: leitura/edição de dados pessoais offline e confirmação de escala sem internet exigiriam desenho de sincronização, segurança e resolução de conflitos; escopo não aprovado.
- Para o MVP, registro de impedimentos, revisão, aprovação e publicação devem exigir conexão e resposta confirmada da API. Nunca exibir 'impedimento enviado' ou 'escala aprovada' sem persistência.
- Em iOS, validar **Auth0 redirecionando de volta para PWA standalone**, cookies/sessão isolados, links de notificação, ícone e permissão Web Push; avaliar workaround apenas após testes.
- PWA **não exige publicação nas lojas** para ser instalada pela tela inicial; publicar em Play Store/App Store é iniciativa futura e não garantida.
- Não cachear endereços, contatos, observações, tokens ou respostas sensíveis no service worker, armazenamento compartilhado ou cache público.

### 13.6 Matriz obrigatória de validação de PWA no piloto

| Cenário | Android | iOS |
| --- | --- | --- |
| Abrir em navegador, login/logout Auth0 e retorno à rota certa | Testar | Testar |
| Instalar e abrir como app standalone | Testar | Testar |
| Informar impedimentos e consultar PDF/escala (com servidor) | Testar | Testar |
| Receber push em segundo plano após consentimento | Testar | Testar PWA instalada no iOS 16.4+ |
| Abrir designação correta por toque na notificação | Testar | Testar |
| Sessão expirada e reconexão sem perda de autorização | Testar | Testar |
| Alteração/cancelamento e publicação de nova versão | Testar | Testar |
| App sem conexão e retorno à conexão | Não confirmar ações offline; indicar erro recuperável | Igual |
| Dados sensíveis ausentes de caches e push | Testar | Testar |
| Acessibilidade, contraste, navegação e toque | Testar | Testar |

**Critério para optar por app nativo:** após pilotar a PWA com ministros reais/dispositivos representativos, listar lacunas mensuráveis (ex.: push não confiável, login interrompido, recursos essenciais indisponíveis). Se as jornadas essenciais funcionarem, **manter PWA como app principal**.

### 13.7 Prova técnica antes da implementação do banco/autenticação
1. Identificar versão/distribuição do KofLang e executar programa mínimo com logs e teste.
2. Confirmar geração de saída web compatível com Vercel e chamadas HTTPS seguras.
3. Confirmar API KofLang utilizável pela interface web/PWA e driver SQL compatível com Neon, sem integrar dados reais.
4. Confirmar validação OIDC/Auth0 de access token no backend com testes de permissões.
5. Executar POC de instalação PWA e push em Android/iOS, com dados fictícios.
6. Registrar arquitetura final, custos/cotas, configuração de ambientes e procedimento de migração/rollback.
7. Só então provisionar recursos e criar schema operacional mediante etapa autorizada.

### 13.8 Fontes técnicas de referência
- Neon/Vercel Marketplace: https://vercel.com/marketplace/neon
- Auth0/Vercel Marketplace: https://vercel.com/marketplace/auth0
- Apple Web Push para web apps: https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
- MDN: PWA instalável: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- KofLang: https://koflang.github.io/

### 13.9 Status e riscos
- **Atualização de 2026-11-06:** o projeto Vercel está renomeado para `mesce-nsrdf` e ligado ao GitHub `Trooper2123/mesce-nsrdf` (`main`). A responsável informou configuração de Neon e Auth0. A conta Neon contém projeto recém-criado por `vercel_marketplace` (`neon-aqua-ladder`, região `aws-sa-east-1`, PostgreSQL 18), **sem confirmação de associação ao MESCE**. A listagem de conectores do projeto Vercel retornou vazia. Não foi feito teste de conexão SQL, autenticação OIDC ou leitura de segredos.
- **Auth0:** a integração nativa do Vercel é especialmente direcionada a Next.js; a solução KofLang depende de implementação interoperável OIDC/OAuth.
- **Neon:** a integração Vercel não assegura por si só conectividade com runtime KofLang; realizar prova de driver/protocolo.
- **PWA:** suporte prático de push e sessão precisa ser testado em Android e iOS instalados, antes de declarar que substitui o app nativo.

## 14. Verificação de provisionamento informado (2026-11-06)

- **Informação da responsável:** integrações Neon e Auth0 foram configuradas.
- **GitHub/Vercel:** vínculo atual confirmado com `Trooper2123/mesce-nsrdf`, projeto `mesce-nsrdf`. A `main` é a branch principal no GitHub.
- **Neon:** encontrado recurso criado por `vercel_marketplace` em 2026-11-06, mas seu vínculo com o MESCE não foi demonstrado; não executar migrações ou criar schema em projeto de destino incerto.
- **Auth0:** nenhum vínculo foi confirmado pela listagem atual de conectores Vercel. Isso não exclui integração por outra superfície/configuração.
- **Validação pendente:** (1) confirmar associação exata dos serviços ao projeto Vercel; (2) verificar **nomes** de variáveis de ambiente exigidas sem expor seus valores; (3) estabelecer conectividade com banco isolado de testes; (4) provar login/logout OIDC e validação de access token; (5) registrar procedimento de build KofLang.
- **Segurança:** jamais copiar conexão, senha, client secret ou token para documentação, cliente web, logs ou arquivos versionados.

## 15. Quantitativo por celebração e impedimentos de diferentes abrangências (decisão de 2026-11-06)

### 15.1 Quantidade de ministros na escala
- Cada **ocorrência individual** da celebração tem `required_ministers` (inteiro positivo), com opção de herdar inicialmente o valor do padrão recorrente.
- O coordenador visualiza na escala `necessários`, `alocados` e `vagas em aberto`. Exemplo: missa habitual com 3 vagas; casamento com 2; missa especial com 5.
- O coordenador pode **alterar o quantitativo na própria escala preliminar ou em revisão**. A mudança vale para aquela ocorrência e não muda o padrão de outras missas.
- Ao **aumentar** o quantitativo, adicionar vagas pendentes e sugerir elegíveis sem mexer desnecessariamente em ministros já alocados; revalidar limites, casais, indisponibilidades, equilíbrio e conflitos.
- Ao **diminuir** o quantitativo, não remover pessoas arbitrariamente sem visibilidade: destacar designações excedentes e pedir ajuste explícito do coordenador, registrando quem foi retirado.
- Escala aprovada/publicada não é editada em silêncio: abrir revisão versionada, efetuar correções, reaprovar, regenerar PDF e avisar afetados.
- Não aprovar escala com vagas não preenchidas ou alocações excedentes sem política formal de exceção ainda não definida.
- Dados recomendados: `celebrations.default_required_ministers` (para padrão), `celebration_occurrences.required_ministers` (efetivo), `schedule_assignments` (uma linha por ministro), `schedule_adjustments` (quantidade anterior, nova, usuário, horário e justificativa).

### 15.2 Tipos de impedimento
| Tipo | Como registrar | O que bloqueia | Exemplo |
|---|---|---|---|
| `CELEBRATION` | Identificador de **uma missa/celebração específica** | Somente a ocorrência indicada | Indisponível na missa das 7h, mas disponível na das 18h |
| `DAY` | Um dia inteiro, com possibilidade de selecionar **vários dias avulsos** | Todas as celebrações e visitas nos dias selecionados | Sem disponibilidade nos dias 8 e 22 |
| `PERIOD` | Data inicial e data final **inclusivas** | Todas as celebrações e visitas no intervalo | Ausente de 10 a 17 |

- Esses impedimentos são informados pelos ministros para o mês seguinte até o dia 25 do mês anterior e podem ser complementados pelo coordenador. Eventos avulsos inseridos depois também devem respeitar impedimentos de dia/período existentes.
- Impedimento vinculado a uma ocorrência **não se estende automaticamente** a outros eventos da data. Se o evento for cancelado, manter o registro histórico e não bloquear eventos distintos.
- Se uma ocorrência for **remarcada**, sinalizar o impedimento específico para revisão, pois a pessoa pode estar disponível em outra data/horário. Não mover indisponibilidade de dia/período para outra data por inferência.
- Regras de precedência: impedimento explícito por qualquer abrangência aplicável = **bloqueio obrigatório**, mesmo com preferência de local ou equidade favorável.
- No formulário, apresentar opções **"Celebração específica"**, **"Dia(s)"**, **"Período"** e campos condicionais, com explicação visível do que será bloqueado.
- Na escala, mostrar o **motivo de inelegibilidade por tipo** ao coordenador sem divulgar detalhes íntimos do motivo a quem não tem permissão.
- Armazenar escopo explícito (discriminador) e relação com ocorrência ou intervalo, validando campos obrigatórios para cada tipo.

### 15.3 Critérios de aceitação
1. Duas missas no mesmo domingo, às 7h e às 18h: ministro impedido só para a primeira permanece elegível para a segunda.
2. Impedimento do dia bloqueia ambas as missas e visitas no dia; vários dias não consecutivos podem ser enviados de uma vez.
3. Impedimento de período de 10 a 17 bloqueia também as datas 10 e 17.
4. Coordenador altera na escala a missa especial de 3 para 5 ministros; mostra 2 novas vagas e reavalia candidatos.
5. Reduzir de 5 para 3 não exclui designações automaticamente; sinaliza 2 excedentes para revisão.
6. A alteração de quantidade da ocorrência não modifica missas habituais de outras datas.
7. Alterações após aprovação geram nova versão, nova validação, novo PDF e notificação aos afetados.
8. O backend rejeita tipo de impedimento inválido, referência de celebração inexistente, datas invertidas e quantitativo não positivo.
9. Testar impedimentos sobrepostos, dias avulsos, casais como unidade e concorrência de edições pela coordenação.

**Pendências:** quantitativo padrão para cada tipo/local ainda será configurado pelos coordenadores; política excepcional de vagas não preenchidas; tratamento de impedimentos depois do dia 25.

## 16. Layout de referência para o PDF final — escala novembro/2026 (documento recebido)

**Referência visual:** `EscalaMesceNovembro0.1.pdf`, fornecido pelo solicitante, **página 1 de 1**. Este documento é um **exemplo de apresentação** da escala oficial, não um conjunto de dados a importar e **não deve ser enviado ao repositório**, pois contém dados pessoais de terceiros (nomes, endereços e telefones). Os exemplos e testes devem empregar dados fictícios.

### 16.1 Estrutura visual observada
- Folha **A4 em orientação retrato**, uma página no exemplo; composição densa, com tabelas compactas, fonte pequena, linhas visíveis e conteúdo alinhado.
- **Cabeçalho** com identificação/logotipo da paróquia à esquerda, título centralizado `Escala dos Ministros Extraordinários da Sagrada Comunhão Eucarística (MESCE)` e **mês/ano**.
- **Metade superior esquerda:** tabela de missas e celebrações com colunas `Dia` (data e dia da semana), `Hora`, `Ministro(s)` e `Observações`. Múltiplas celebrações no mesmo dia ocupam linhas próprias e a data pode ficar agrupada visualmente.
- **Metade superior direita:** tabela de visitas aos assistidos com `Dia`, `Ministro(s)` e `Assistido(s)`; no exemplo, visitas nos domingos 1, 8, 15, 22 e 29.
- **Abaixo da tabela de visitas:** seção `Observações:` com avisos textuais operacionais para os ministros.
- **Rodapé inferior:** duas tabelas lado a lado com **assistido + endereço + contatos/referências**, em formato de guia de visita.
- **Rodapé de versão:** no exemplo, identificação `Versão: 0.1` no canto inferior direito.
- **Destaques de linha:** documento usa fundos de células amarelos, alaranjados e esverdeados em algumas celebrações e cinza em áreas alternadas. Pela referência visual, amarelo aparece em linhas do Carmelo; laranja em certas celebrações especiais e verde em algumas atividades de adoração. **Não tratar cores como regra exaustiva sem uma legenda formal**; assegurar entendimento por texto.

### 16.2 Especificação de geração
1. Gerar o PDF **somente após aprovação do coordenador**, com versão única e registro de data/hora de emissão, mês/ano e responsável pela aprovação.
2. Reproduzir prioritariamente a **hierarquia do modelo**: título + duas tabelas principais + observações + informações adicionais dos assistidos, com tipografia e espaçamento legíveis.
3. A tabela de celebrações deve suportar **uma linha por ocorrência**: data, dia da semana, horário, ministros nomeados e observações (incluindo local/tipo quando relevantes), refletindo o **quantitativo efetivo** definido na escala aprovada. Não assumir sempre três ministros.
4. A tabela de visitas deve listar apenas os **domingos** do mês e os ministros vinculados aos respectivos assistidos, com múltiplas linhas por domingo.
5. Campos `Observações` devem aceitar descrição de evento extraordinário (casamento, missa de sétimo dia, primeira eucaristia, adoração etc.), local, horário diferenciado e instruções operacionais. Textos longos quebram linha sem sobreposição.
6. **Dados de contato de assistidos são confidenciais**: gerar a seção inferior apenas em **PDF interno restrito** a destinatários autorizados para visitas. Preferir duas variantes geradas da mesma escala aprovada:
   - **Escala geral:** celebrações e visitas com dados mínimos necessários, **sem endereços/telefones** de assistidos.
   - **Guia interno de visitas:** seção de endereço/contatos limitada aos ministros autorizados e coordenadores, com acesso autenticado e registro de downloads/compartilhamentos.
   A distinção é uma **proposta de segurança** por LGPD; escopo exato de destinatários e dados no PDF deve ser confirmado com a coordenação antes da implementação.
7. O arquivo pode crescer para **mais de uma página**: nunca reduzir indefinidamente a fonte para forçar tudo em uma única folha. Repetir cabeçalhos de tabela após quebra de página e impedir divisão de uma mesma atribuição ou endereço entre páginas sempre que possível.
8. Manter cores de apoio opcionais com **legenda**, símbolos/texto inequívocos e contraste apropriado para impressão preto e branco; prever cabeçalho com nome da paróquia e logomarca autorizada.
9. Gerar arquivo com nome estável e informativo, por exemplo `mesce-escala-2026-11-v1.pdf`; incluir identificação de versão em todas as páginas, se houver várias.
10. A exportação deve receber **snapshot imutável da versão aprovada** e nunca montar o PDF a partir do estado mutável do navegador. Uma mudança após aprovação exige revisão, nova aprovação, novo número de versão e nova emissão.
11. PDFs devem ser disponibilizados por links autenticados, com checagem de autorização a cada download, e não colocados em pasta pública do Vercel. Push e notificações devem encaminhar para a área protegida, sem anexar dados pessoais ao payload.

### 16.3 Mapeamento dos dados para as seções
| Área do PDF | Fonte conceitual no sistema |
|---|---|
| Cabeçalho e competência | Configuração da paróquia + mês/ano da escala |
| Celebrações | Ocorrências aprovadas + alocações + observações/local/tipo |
| Visitas aos assistidos | Visitas dominicais aprovadas + alocações |
| Observações gerais | Campo de instruções da escala/competência, editável pelo coordenador |
| Referência de visitas | Cadastro protegido de assistidos + contatos autorizados |
| Versão | Revisão aprovada, data/hora e responsável pela emissão |

### 16.4 Critérios de aceitação
- A partir de um mês demonstrativo com celebrações e visitas, o PDF exibe **ambas as tabelas e observações** de modo consistente com o modelo visual de novembro/2026.
- Três celebrações no mesmo dia, com horários e locais diferentes, permanecem distinguíveis.
- Missa especial com cinco ministros exibe os cinco sem truncamento de nomes ou sobreposição de células.
- Visitas aparecem apenas aos domingos.
- Uma observação longa quebra linhas e desloca corretamente as linhas subsequentes.
- O PDF gerado contém somente dados da **versão aprovada**.
- Ministro não autorizado não consegue obter PDF com endereço/telefone de assistidos, mesmo por URL direta.
- Testar mês com volume maior que uma página, impressão A4, legibilidade, preto e branco e disposição em telas pequenas via download.
- Nenhum endereço/telefone/nome real presente no PDF recebido deve ser incluído em fixtures, documentação ou repositório público.

### 16.5 Decisões pendentes sobre fidelidade visual
- Se a escala interna com endereços será distribuída **para todos os ministros** ou somente para os que realizam visitas (recomendado restringir).
- Se a versão pública/interna deve seguir **A4 retrato exatamente** ou ser permitida orientação paisagem em meses muito cheios.
- Legenda oficial das cores e uso da logomarca institucional; eventualmente fornecer arquivo de logo autorizado.
- Se será necessário gerar **arquivos distintos** para celebrações e visitas, além da folha combinada de referência.
