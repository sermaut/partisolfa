## Corrigir upload de resultados no admin + adicionar indicador de progresso acessível

### Problema 1 — Admin não consegue selecionar ficheiros ao enviar resultado

Em `src/pages/admin/AdminTarefas.tsx` (diálogo "Enviar Resultado", ~linha 1363-1380), o upload usa um padrão frágil: um `<input type="file" className="hidden">` disparado programaticamente por `fileInputRef.current?.click()` a partir de um `Button` **dentro de um Radix Dialog**. Este padrão falha silenciosamente em vários browsers (especialmente mobile/Safari e quando o Dialog gere focus trap), o que explica o "nada acontece" ao clicar.

O padrão correcto — já usado com sucesso em `NovaSolicitacao` — é o componente `FileDropzone` (`src/components/ui/file-dropzone.tsx`), que usa `<label htmlFor>` a envolver um `<input class="sr-only">`. O clique/tap/Enter/Espaço vai directamente pelo `<label>` nativo, sem passar por JS, e funciona sempre.

### Problema 2 — Sem feedback de progresso durante o upload

Tanto em `NovaSolicitacao.handleSubmit` como em `AdminTarefas.handleResultUpload`, os ficheiros são enviados em paralelo com `Promise.all` mas o utilizador só vê um spinner global. Se um ficheiro falhar (`console.error` + `return`), não há aviso visível nem anúncio para leitores de ecrã.

---

### Alterações

**1. `src/pages/admin/AdminTarefas.tsx` — substituir input escondido por `FileDropzone`**
- Remover o `<input ref={fileInputRef} type="file" hidden>` e o `<Button onClick={fileInputRef.current?.click()}>`.
- Renderizar `<FileDropzone label="Selecionar ficheiros de resultado" accept=".mp3,.wav,.aac,.pdf,.jpg,.jpeg,.png" multiple maxSize={20*1024*1024} onFiles={handleResultFilesSelected} hint="MP3, WAV, AAC, PDF, JPG, PNG · até 20MB cada" />`.
- Refactor `handleResultFileSelect(e)` → `handleResultFilesSelected(files: File[])` a receber o array já validado.

**2. Estado de upload por ficheiro (ambos os fluxos)**

Introduzir um tipo partilhado local:
```ts
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type FileProgress = { name: string; status: UploadStatus; error?: string };
```
- Adicionar `const [fileProgress, setFileProgress] = useState<FileProgress[]>([])` em ambos os componentes.
- No início de `handleSubmit` / `handleResultUpload`, semear com `{name, status:'uploading'}` para cada ficheiro.
- Envolver cada upload individual num `try/catch` que actualiza esse item para `'success'` ou `'error'` (com mensagem).
- Substituir os `return` silenciosos por erros propagados de forma controlada (sem abortar os restantes) — usar `Promise.allSettled` em vez de `Promise.all`.
- Se algum ficheiro terminar em erro, mostrar toast destrutivo com contagem e manter o modal aberto para o admin re-tentar apenas os falhados; se todos falharem, não avançar o estado da tarefa.

**3. UI do progresso (dentro dos modais, abaixo da lista de ficheiros)**

Para cada ficheiro em `fileProgress`, renderizar uma linha com:
- Nome do ficheiro + ícone de estado (`Loader2` a girar, `CheckCircle2`, `AlertCircle`).
- Barra `<Progress>` (indeterminada durante `uploading`, 100% em `success`, vazia em `error`).
- Texto de erro em `text-destructive` quando aplicável.

**4. Acessibilidade — anúncio a leitores de ecrã**

Adicionar em cada modal uma região viva única:
```tsx
<p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {liveMessage}
</p>
```
`liveMessage` é derivada de `fileProgress`:
- Ao começar: `"A enviar N ficheiros…"`.
- A cada conclusão: `"<nome> enviado (X de N)"`.
- A cada erro: `"Falha ao enviar <nome>: <motivo>"` (usar `aria-live="assertive"` numa segunda região só para erros, para garantir interrupção).

**5. Não alterar RLS, storage, nem lógica de negócio.** Apenas UI + tratamento de erro + acessibilidade.

---

### Ficheiros tocados
- `src/pages/admin/AdminTarefas.tsx` — troca input→FileDropzone, estado de progresso, `Promise.allSettled`, UI de progresso, regiões live.
- `src/pages/NovaSolicitacao.tsx` — estado de progresso, `Promise.allSettled`, UI de progresso, regiões live.

### Verificação
- Build limpo (typecheck automático).
- Playwright: abrir admin → tarefa → "Enviar Resultado", confirmar que `FileDropzone` responde ao clique dentro do Dialog e que as linhas de progresso aparecem.
