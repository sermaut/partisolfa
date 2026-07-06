## 1. Correção do layout — botão "Descarregar" sempre visível

**Problema:** em `src/pages/TarefaDetalhe.tsx` (linhas 269–297 e o bloco equivalente dos ficheiros enviados em ~370–390), a linha do ficheiro usa `flex items-center justify-between` sem quebra e sem truncagem do `file_name`. Em ecrãs pequenos, um nome de ficheiro longo empurra o botão para fora do cartão. O mesmo padrão existe no cabeçalho (`h1` + badge de estado) em ~229–252.

**Alterações (apenas UI, sem lógica):**

- **Cartão "Resultado Disponível"** (e cartão dos ficheiros enviados, mesmo padrão):
  - Trocar o container por `flex flex-col sm:flex-row sm:items-center gap-3` com `sm:justify-between`, para que em mobile o botão desça para baixo do nome em vez de sair do ecrã.
  - Envolver o bloco de metadados (ícone + nome + tamanho) em `min-w-0 flex-1` e aplicar `truncate` (com `title={file.file_name}`) ao `<p>` do nome, para o nome encolher sem esmagar o botão.
  - Botão "Descarregar" recebe `w-full sm:w-auto shrink-0` e mantém o spinner de estado.

- **Cabeçalho da tarefa** (título + badge de estado):
  - `min-w-0` no wrapper do título e `flex-shrink-0` explícito no badge.
  - Em mobile, o badge alinha à esquerda por baixo do título (`self-start`), evitando corte.

- Nenhuma mudança em Supabase, upload, ou noutras páginas.

## 2. Resposta — notificações externas para o admin no plano gratuito

Isto é uma pergunta, não vou implementar nada. Resposta curta:

- **Dentro da app (grátis):** o admin já recebe notificações em tempo real na campainha (`notifications` do Lovable Cloud) para novas solicitações e depósitos — sem custo.
- **Email (grátis, recomendado):** o Lovable Cloud tem envio de email transacional integrado. Dá para disparar um email ao admin em cada nova tarefa/depósito sem chaves externas nem custos adicionais.
- **WhatsApp / SMS / Facebook:** exigem sempre um fornecedor externo (Twilio, GatewayAPI, Meta Cloud API…). Todos são pagos por mensagem — não há via 100% gratuita e sustentável para produção. WhatsApp Business API exige ainda verificação de número.
- **PWA push (grátis):** como já é PWA, dá para adicionar notificações push no telemóvel do admin (via Service Worker), sem custos.

Se quiser, no próximo passo posso planear "email + push PWA ao admin" como solução gratuita completa.

---

**Ficheiros a alterar (apenas fase 1):** `src/pages/TarefaDetalhe.tsx`
