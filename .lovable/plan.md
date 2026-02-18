

## Corrigir Visualizacao de Ficheiros Enviados no Painel Admin

### Problema Identificado

A secao "Ficheiros Enviados" mostra "Nenhum ficheiro enviado" mesmo quando existem ficheiros na base de dados. Apos analise do codigo, identifiquei duas causas:

1. **Sem estado de carregamento**: Quando o modal abre, os ficheiros sao buscados de forma assincrona, mas nao existe indicador visual de loading. O utilizador ve imediatamente "Nenhum ficheiro enviado" antes da consulta terminar.
2. **Sem previsualizacao rapida**: Os ficheiros apenas mostram nome e botao de download, sem previews inline (imagens, audio), tornando a experiencia lenta e pouco informativa.

### Solucao Proposta

#### 1. Adicionar estado de carregamento para ficheiros

No ficheiro `src/pages/admin/AdminTarefas.tsx`:
- Criar um estado `loadingFiles` que mostra um spinner enquanto os ficheiros sao carregados
- Impedir que "Nenhum ficheiro enviado" apareca prematuramente

#### 2. Pre-carregar URLs assinadas para visualizacao rapida

- Ao abrir os detalhes da tarefa, gerar URLs assinadas (signed URLs) em paralelo para todos os ficheiros
- Guardar essas URLs em estado para acesso instantaneo
- Isto permite previews inline sem latencia adicional

#### 3. Melhorar a apresentacao dos ficheiros

Substituir a lista simples por cards mais ricos com:
- **Imagens**: Thumbnail inline com opcao de ver em tela cheia
- **Audio**: Player inline compacto para reproducao directa
- **Documentos/PDF**: Icone diferenciado com tamanho do ficheiro formatado
- Botao de download mantido para todos os tipos

#### 4. Optimizar velocidade

- Usar `Promise.all` para buscar os ficheiros e gerar URLs assinadas em paralelo
- Definir tempo de expiracao longo (1 hora) para URLs assinadas para evitar regeneracoes

### Detalhes Tecnicos

**Ficheiro**: `src/pages/admin/AdminTarefas.tsx`

Alteracoes no estado:
```typescript
const [loadingFiles, setLoadingFiles] = useState(false);
const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
```

Alteracoes na funcao `openTaskDetail`:
```typescript
const openTaskDetail = async (task: Task) => {
  setSelectedTask(task);
  setLoadingFiles(true);
  setTaskFiles([]);
  setFileUrls({});

  const { data: files } = await supabase
    .from('task_files')
    .select('*')
    .eq('task_id', task.id)
    .order('is_result', { ascending: false });

  const loadedFiles = files || [];
  setTaskFiles(loadedFiles);

  // Gerar URLs assinadas em paralelo
  const urlEntries = await Promise.all(
    loadedFiles.map(async (file) => {
      const bucket = file.is_result ? 'result-files' : 'task-files';
      const { data } = await supabase.storage
        .from(bucket)
        .createSignedUrl(file.file_path, 3600);
      return [file.id, data?.signedUrl || ''];
    })
  );
  setFileUrls(Object.fromEntries(urlEntries));
  setLoadingFiles(false);
};
```

Alteracoes na UI (seccao "Ficheiros Enviados"):
- Mostrar `Loader2` com animacao enquanto `loadingFiles === true`
- Para ficheiros de tipo `image`: mostrar thumbnail clicavel usando a URL assinada
- Para ficheiros de tipo `audio`: mostrar mini-player `<audio>` com controlos nativos
- Para outros tipos: manter icone + nome + tamanho + botao download
- Usar download via URL assinada (mais rapido que `supabase.storage.download()`)

