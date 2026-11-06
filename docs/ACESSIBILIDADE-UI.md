# Diretrizes de acessibilidade e legibilidade — MESCE

## Regras do projeto
- **Alto contraste por padrão**: textos escuros em fundos claros, texto branco em cabeçalhos/botões escuros e foco evidente. Cor não pode ser o único significado de mensagens.
- **Tipografia grande**: corpo 18 px ou maior; rótulos e tabelas com pelo menos 16 px; entrelinha de leitura 1,5 ou superior; respeitar zoom do navegador e configurações de acessibilidade.
- **Navegação simples**: poucas opções permanentes, títulos claros e atalhos para Impedimentos, Celebrações, Coordenação e Escala; link para ir direto ao conteúdo.
- **Controles fáceis de acionar**: meta de altura mínima 48 px para botões, campos e links de navegação, incluindo telas móveis.
- **Sem estímulos excessivos**: evitar animações automáticas, efeitos piscantes, carrosséis, rolagem animada, alertas constantes e decoração visual supérflua.
- **Estados entendidos por texto**: conflitos, confirmações e indisponibilidades têm mensagens legíveis, sem depender de cor ou ícones.
- **Layouts adaptáveis**: celulares com campos em coluna, ações principais em sequência e tabela de escala em região rolável identificada.
- Respeitar `prefers-reduced-motion` e manter interface utilizável com teclado e leitor de tela.

## Código
- Tokens, tamanho de texto e estilos acessíveis da POC centralizados em `app/accessibility.css`.
- A página `index.html` inclui navegação por âncoras, link para pular ao conteúdo, cabeçalhos de tabela com `scope=col` e foco visível.
- A navegação não representa autorização; Auth0/backend deverá impor papéis antes de expor informações reais.

## Metas de validação
- WCAG 2.2 AA: contraste de texto normal mínimo 4,5:1, texto grande 3:1 e elementos de interface relevantes 3:1 conforme aplicável.
- Teclado: navegar por todos os controles com Tab/Shift+Tab, foco visível, sem armadilhas.
- Zoom a 200%, largura de 320 CSS px, uso com fontes ampliadas.
- VoiceOver (iOS), TalkBack (Android) e leitores de tela no computador.
- Revisão com ministros e coordenação para confirmar facilidade de leitura, quantidade de passos e ausência de estímulos cansativos.

**Status:** estilos e estrutura estática aplicados na POC. Validação funcional em navegadores/dispositivos e auditoria WCAG permanecem pendentes.