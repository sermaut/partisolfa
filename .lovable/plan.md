# Reformular paleta e bordas em todo o site

## Objetivo

Substituir a paleta atual (teal + verde claro sobre off-white) por uma paleta editorial **Creme Quente + Verde Profundo**, com **bordas sólidas e visíveis** em todos os cards, inputs, botões outline e separadores. Aplicar ao site inteiro (público + autenticado + admin).

## Nova paleta

- Fundo base: creme quente `#FBF8F1`
- Superfícies (cards, popovers, modais): branco puro `#FFFFFF`
- Texto principal: quase-preto `#1A1A1A`
- Primária (botões, links, foco): verde profundo `#0F5132`
- Acento (destaques premium, gradientes dourados legados): dourado `#C9A227`
- Bordas: cinza-quente sólido, ~`#D9D2C2` (opaco, sem transparência)
- Muted / secondary: creme mais escuro `#F2ECDD`
- Sucesso: mantém verde profundo; Aviso: dourado; Destrutivo: vermelho terroso `#B23A2E`

## Mudanças

### 1. `src/index.css` (núcleo da mudança)
- Reescrever `:root` com os novos tokens HSL (background, foreground, card, popover, primary, secondary, muted, accent, destructive, success, warning, border, input, ring, sidebar-*).
- Atualizar `.dark` para uma versão escura coerente (verde muito escuro `#0A1F14` como fundo, creme como foreground, mesmos acentos).
- Substituir `--gradient-gold` para `linear-gradient(135deg, #0F5132 0%, #C9A227 100%)` mantendo o nome da variável (compatibilidade com botões `premium`/`hero`).
- `--gradient-hero`, `--gradient-card`, `--gradient-dark`: recalibrar para tons creme.
- `--shadow-gold` e `--shadow-card`: recalcular com base no verde profundo em vez do teal.
- `.text-gradient-gold`: passar a usar verde profundo → dourado.
- Remover opacidades exageradas nas classes `status-*`: trocar `bg-*/20` por `bg-*/10` **e** `border-*` sólido (sem `/30`).
- `.glass-card`: reduzir transparência (`bg-card/95`) para bordas ficarem nítidas em fundo creme.

### 2. `tailwind.config.ts`
- Atualizar `backgroundImage.gradient-gold`, `gradient-dark`, `gradient-card` para refletir a nova paleta (verde profundo + dourado + creme). Manter os nomes das chaves.

### 3. Bordas sólidas — varredura pontual
Procurar e endurecer bordas transparentes nos componentes partilhados:
- `src/components/ui/card.tsx`: já usa `border` (token) — passará a ser sólido pelo novo `--border`. Sem edit.
- `src/components/ui/input.tsx`, `textarea.tsx`, `select.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `popover.tsx`, `sheet.tsx`, `alert.tsx`: trocar quaisquer `border-border/50`, `border-white/10`, `bg-card/50`, `bg-background/80` por versões sólidas (`border-border`, `bg-card`, `bg-background`).
- `src/components/layout/Header.tsx` e `Footer.tsx`: remover transparências em bordas/fundos (`backdrop-blur` mantém-se, mas fundo passa a `bg-background/95` mínimo e borda `border-border`).
- Botão `variant="outline"` em `button.tsx`: já usa `border-border` — herda automaticamente.

### 4. Ajustes específicos de páginas com cores hardcoded
Grep por classes que quebram tokens e substituir por semânticas:
- `text-white`, `bg-black`, `bg-white`, `text-black`, `bg-[#…]`, `border-white/…`, `bg-black/…` em: `Index.tsx`, `Servicos.tsx`, `Login.tsx`, `Register.tsx`, `Dashboard.tsx`, `TarefaDetalhe.tsx`, `NovaSolicitacao.tsx`, `admin/*`, `colaborador/*`.
- Substituir por `text-foreground`, `bg-background`, `bg-card`, `text-primary-foreground`, `border-border`.

### 5. Validação
- Abrir preview em `/` (Home), `/login`, `/dashboard`, `/nova-solicitacao`, `/admin/tarefas` e confirmar visualmente:
  - Bordas visíveis em todos os cards e inputs.
  - Nenhum texto ilegível (contraste AA mínimo).
  - Gradientes dourados agora em verde+dourado, não teal.
  - Modais e dropdowns com fundo opaco.

## Fora de escopo
- Não alterar lógica, dados, RLS, rotas ou funcionalidades.
- Não trocar tipografia (Playfair Display + Inter mantêm-se).
- Não adicionar novos componentes.

## Detalhes técnicos (para referência)

Valores HSL a colocar em `:root`:

```text
--background: 42 45% 96%;      /* #FBF8F1 */
--foreground: 0 0% 10%;        /* #1A1A1A */
--card: 0 0% 100%;
--card-foreground: 0 0% 10%;
--popover: 0 0% 100%;
--popover-foreground: 0 0% 10%;
--primary: 146 71% 19%;        /* #0F5132 */
--primary-foreground: 42 45% 96%;
--secondary: 42 40% 91%;       /* #F2ECDD */
--secondary-foreground: 0 0% 15%;
--muted: 42 35% 93%;
--muted-foreground: 0 0% 35%;
--accent: 43 71% 47%;          /* #C9A227 */
--accent-foreground: 0 0% 10%;
--destructive: 8 60% 44%;      /* #B23A2E */
--destructive-foreground: 42 45% 96%;
--success: 146 71% 19%;
--warning: 43 71% 47%;
--border: 42 25% 80%;          /* #D9D2C2 sólido */
--input: 42 25% 82%;
--ring: 146 71% 19%;
```

Após aprovação, aplico tudo numa única passagem.
