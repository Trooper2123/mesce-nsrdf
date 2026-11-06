# SPEC — Gestão e escalas dos Ministros Extraordinários da Sagrada Comunhão Eucarística (MESCE)

Status: **draft v0.2** — requisitos iniciais e referência adicional *Projeto MESCE v3.0* (outubro/2026).  
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
- Recorrência para eventos fixos; exceções e cancelamentos por data.
- Número de ministros necessários por ocorrência (**configurável; não foi informado**).
- Local da celebração, se necessário para distância/logística (**a confirmar**).
- Observações.
- Exibição em calendário mensal.
- Padrões recorrentes não devem gerar duplicações de ocorrências do mesmo evento.

### 2.3 Disponibilidade dos ministros (`minister_availability`)
- Ministro, data (ou padrão semanal, se adotado), faixa de horário opcional e estado: disponível/indisponível.
- Justificativa/observação opcional.
- Indisponibilidade explícita bloqueia designação para atividades coincidentes.
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
- Mês/ano, modalidade `CELEBRATION` ou `ASSISTED_VISIT`, status `DRAFT`, `PUBLISHED` ou `CANCELLED`.
- Alocações identificam ministro, compromisso, data/hora e origem (automática/manual), com autor e justificativa de alterações.
- Manter histórico de alterações e de escalas publicadas; editar uma publicação exige registrar revisão.
- A interface deverá mostrar visualização mensal, filtros e exportação/impressão (formato a confirmar).

## 3. Regras de geração automática

### 3.1 Restrições obrigatórias
1. Não alocar ministro explicitamente indisponível no dia/horário.
2. Não gerar sobreposição de atividades de um mesmo ministro.
3. Não designar ministros inativos.
4. Respeitar vagas necessárias e não duplicar o mesmo ministro no mesmo compromisso.
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

### 3.5 Fluxo de geração
1. Selecionar mês e modalidade.
2. Materializar eventos fixos e extraordinários do período e os domingos com visitas previstas.
3. Recuperar ministros ativos, indisponibilidades, preferências e histórico definido.
4. Aplicar filtros obrigatórios e detectar conflitos.
5. Calcular distribuição tentando cumprir cobertura, equidade, casais e proximidade.
6. Salvar como rascunho com relatório de conflitos, exceções e métricas.
7. Permitir revisão manual e aprovação por usuário autorizado.
8. Publicar e disponibilizar visualização/impressão/exportação conforme permissões.

A geração precisa ser determinística para os mesmos dados e parâmetros, ou registrar a semente/versão do algoritmo quando utilizar aleatoriedade; impedir duplicações por repetição de solicitações.

## 4. Páginas da aplicação (MVP)
1. Painel mensal: resumo de eventos, visitas previstas, vagas preenchidas e pendências.
2. Ministros: cadastro, consulta, cônjuge e disponibilidade.
3. Celebrações/Missas: calendário, recorrências e eventos extraordinários.
4. Assistidos: cadastro protegido e dados de contato.
5. Visitas dominicais: calendário com os domingos e assistidos previstos.
6. Escalas: gerar rascunho, visualizar conflitos/equidade, ajustar, aprovar e publicar.

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
- Banco relacional é uma **proposta**, não infraestrutura já provisionada; PostgreSQL pode ser adotado após validação.
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
9. É necessário confirmação da escala pelo ministro e avisos por WhatsApp/email?
10. Qual banco de dados e qual hospedagem de backend são aceitáveis para o compilador KofLang disponível?

As questões acima **não bloqueiam a documentação**; bloqueiam decisões de implementação que dependam das respostas.


## 9. Complemento de referência — Projeto MESCE v3.0 (outubro/2026)

**Fonte:** documento fornecido `Projeto MESCE.docx`, intitulado *Relatório do Projeto MESCE — Sistema de Gestão dos Ministros Extraordinários da Sagrada Comunhão Eucarística, Versão 3.0 (Especificação Funcional)*. Os itens abaixo representam exigências dessa referência; não representam recursos já implementados. A referência previa inicialmente Excel Online/Copilot, enquanto este repositório mantém o objetivo de aplicativo web em KofLang.

### 9.1 Fluxo operacional e período de atualização
- Janela mensal sugerida no documento: **dias 25 a 29**, para atualização dos dados, antes da geração da escala preliminar.
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
- O sistema só poderá **aprovar** quando todas as validações forem executadas e **não houver conflitos, violações de indisponibilidade nem limites excedidos**.
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
- Política de confirmação, substituição e divulgação segura de informações dos assistidos.
