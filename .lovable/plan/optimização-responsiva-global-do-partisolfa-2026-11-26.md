# Optimização responsiva global do PARTISOLFA

## O que será alterado
- Corrigir o comportamento do menu lateral e do menu móvel nos diferentes tamanhos de ecrã.
- Melhorar o ajuste de grelhas, áreas de conteúdo, tabelas, diálogos e controlos para evitar cortes, sobreposições e deslocamento horizontal.
- Ajustar apenas dimensões, espaçamentos e alinhamentos; preservar cores azul profissional e ciano, tipografia, botões, cartões, bordas e restantes elementos aprovados.
- Manter todas as funcionalidades, permissões e regras de negócio existentes.

## Verificação
- Validar páginas públicas e principais ecrãs da aplicação entre 320 px e 1920 px, incluindo limites de breakpoint.
- Confirmar que menus, tabelas e diálogos continuam utilizáveis e que não há conteúdo cortado ou overflow horizontal.
- Consultar os registos de compilação e manter a alteração sem publicação.

## Detalhes técnicos
- Reutilizar o CSS global e os componentes partilhados de navegação, tabelas e diálogos; aplicar ajustes locais apenas onde o conteúdo exigir.
- Não alterar dados, autenticação, integrações, nem tokens ou valores visuais aprovados.