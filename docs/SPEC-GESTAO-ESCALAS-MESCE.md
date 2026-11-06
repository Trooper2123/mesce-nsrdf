# SPEC — Gestão e escalas dos Ministros Extraordinários da Sagrada Comunhão Eucarística (MESCE)

Status: **draft** — requisitos iniciais fornecidos pela responsável pelo projeto.  
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
- A natureza obrigatória ou facultativa de `JUNTOS`/`SEPARADOS` deve ser confirmada.

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
6. Equidade é aferida por mês ou considera meses anteriores?
7. Quais perfis usarão o sistema e quais dados podem aparecer em escalas compartilhadas?
8. Como calcular proximidade (bairro/CEP, coordenada, distância real) e quais permissões de dados?
9. É necessário confirmação da escala pelo ministro e avisos por WhatsApp/email?
10. Qual banco de dados e qual hospedagem de backend são aceitáveis para o compilador KofLang disponível?

As questões acima **não bloqueiam a documentação**; bloqueiam decisões de implementação que dependam das respostas.
