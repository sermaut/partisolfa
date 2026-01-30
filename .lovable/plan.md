

## Plano de Implementacao - Melhorias de Funcionalidade

### Resumo das Alteracoes

Este plano abrange 6 requisitos principais que serao implementados em varias etapas:

---

### 1. Detalhes Completos das Tarefas para Colaboradores (Reproducao de Audios, Visualizacao de Documentos/Imagens)

**Ficheiro:** `src/pages/colaborador/ColaboradorTarefas.tsx`

**Alteracoes:**
- Adicionar estado `taskFiles` para armazenar os ficheiros da tarefa seleccionada
- Criar funcao `fetchTaskFiles(taskId)` que busca ficheiros da tabela `task_files`
- No dialog de detalhes (`showDetailDialog`), expandir para mostrar:
  - Player de audio integrado para ficheiros `.mp3`, `.wav`, `.aac`
  - Visualizador de imagens com preview para `.jpg`, `.png`
  - Link para abrir/descarregar PDFs
  - Botao de download para cada ficheiro
- Chamar `fetchTaskFiles` quando o colaborador clica em "Ver" ou "Abrir"
- Adicionar estados para `previewUrl` e `previewType` para modal de visualizacao

**Interface Visual do Modal:**
```
[Titulo da Tarefa]
├─ Informacoes basicas (servico, formato, cliente, creditos)
├─ Descricao da tarefa
├─ Ficheiros Anexados
│   ├─ musica.mp3 [▶ Reproduzir] [⬇ Download]
│   ├─ partitura.pdf [👁 Ver] [⬇ Download]
│   └─ referencia.jpg [Preview inline]
└─ Botoes [Fechar] [Aceitar Tarefa]
```

---

### 2. Restricao de Acesso do Colaborador ao Painel de Colaborador

**Ficheiro:** `src/App.tsx`

**Alteracoes:**
- Criar componente `ProtectedRoute` que verifica o papel do utilizador
- Para colaboradores puros (nao admin), bloquear acesso a rotas:
  - `/dashboard` - redireciona para `/colaborador`
  - `/nova-solicitacao`
  - `/deposito`
  - `/historico`
  - `/solicitacoes`
  - Todas as rotas `/admin/*`
- Colaboradores apenas podem aceder:
  - `/colaborador` e sub-rotas
  - `/notificacoes`
  - `/perfil`
  - `/tarefa/:id` (tarefas aceites)
  - Paginas publicas (termos, privacidade, etc.)

**Ficheiro:** `src/contexts/AuthContext.tsx`

**Alteracoes:**
- Adicionar propriedade `isOnlyCollaborator` que retorna `true` se o utilizador e colaborador mas NAO admin
- Logica: `isOnlyCollaborator = isCollaborator && !isAdmin`

---

### 3. Funcionalidades do Administrador

#### 3.1 Download de Ficheiros
**Ficheiro:** `src/pages/admin/AdminTarefas.tsx`

**Estado actual:** Ja implementado - funcao `downloadFile` existente permite download de ficheiros de utilizadores e resultados.

**Verificacao:** Nenhuma alteracao necessaria para download.

#### 3.2 Ver Detalhes Completos dos Usuarios
**Ficheiro:** `src/pages/admin/AdminUsuarios.tsx`

**Alteracoes:**
- Criar novo dialog `UserDetailDialog` com informacoes completas:
  - Avatar, nome, email, telefone
  - Creditos actuais
  - Codigo de convite (referral_code)
  - Data de registo
  - Numero total de tarefas (pendentes, em progresso, concluidas, canceladas)
  - Historico de depositos (total aprovado, pendente)
  - Quem o convidou (referred_by)
  - Quantas pessoas convidou
- Botao "Ver Detalhes" em cada card de usuario

#### 3.3 Optimizar Modais com Design Moderno
**Ficheiros:** 
- `src/pages/admin/AdminUsuarios.tsx`
- `src/pages/admin/AdminTarefas.tsx`
- `src/pages/admin/AdminColaboradores.tsx`

**Alteracoes:**
- Adicionar gradientes subtis nos headers dos modais
- Usar icones mais proeminentes
- Melhorar espacamento e tipografia
- Adicionar animacoes de entrada/saida (framer-motion)
- Usar separadores visuais mais claros
- Adicionar badges coloridos para estados
- Melhorar a apresentacao dos ficheiros com cards mais visuais

#### 3.4 Eliminar Usuarios e Colaboradores
**Estado actual:** Ja implementado em `AdminUsuarios.tsx` - funcao `handleDeleteUser` existe.

**Ficheiro:** `src/pages/admin/AdminColaboradores.tsx`

**Alteracoes:**
- Adicionar opcao para eliminar colaborador completamente (nao apenas remover funcao)
- Dialog de confirmacao com aviso sobre dados que serao eliminados
- Reutilizar logica de `AdminUsuarios.tsx` para eliminar perfil, tarefas, depositos, etc.

---

### 4. Codigo de Convite Opcional para Registo

**Ficheiro:** `src/pages/Register.tsx`

**Estado actual:** O codigo ja e opcional no formulario (campo tem label "(opcional)").

**Alteracoes:**
- Remover validacao que bloqueia submissao se codigo invalido
- Se codigo inserido e invalido, mostrar apenas aviso (nao bloquear)
- Permitir registo mesmo com codigo inexistente (ignorar codigo)
- Actualizar logica no `handleSubmit`:
  - Se `isCodeValid === false` e codigo nao vazio, mostrar toast de aviso mas continuar
  - Usar `validatedReferrerId` apenas se `isCodeValid === true`

---

### 5. Descricao Obrigatoria ao Anexar Resultado

**Ficheiro:** `src/pages/admin/AdminTarefas.tsx`

**Alteracoes:**
- Adicionar estado `resultDescription` para armazenar descricao
- Criar dialog separado `UploadResultDialog` antes do upload:
  - Campo Textarea obrigatorio para descricao do resultado
  - Seleccao de ficheiros
  - Botao desactivado ate descricao preenchida
- Na funcao `handleResultUpload`:
  - Actualizar `result_comment` na tabela `tasks` com a descricao
  - Incluir descricao na notificacao ao utilizador
- Modificar UI:
  - Botao "Carregar Resultado" abre dialog
  - Dialog tem campo de descricao + input de ficheiros
  - Validacao: descricao minima de 10 caracteres

**Interface Visual:**
```
[Dialog: Enviar Resultado]
├─ Descricao do Resultado * (obrigatorio)
│   [Textarea: Descreva o trabalho realizado...]
├─ Ficheiros
│   [Seleccionar ficheiros...] (ate 10)
└─ [Cancelar] [Enviar Resultado] (desactivado se descricao vazia)
```

---

### 6. Motivo Obrigatorio ao Cancelar Solicitacao

**Ficheiro:** `src/pages/admin/AdminTarefas.tsx`

**Estado actual:** Ja implementado - dialog de cancelamento com `cancellationReason` e validacao `!cancellationReason.trim()` que desactiva botao.

**Verificacao:** Nenhuma alteracao necessaria.

---

### Resumo Tecnico das Alteracoes por Ficheiro

| Ficheiro | Alteracoes |
|----------|------------|
| `src/contexts/AuthContext.tsx` | Adicionar `isOnlyCollaborator` |
| `src/App.tsx` | Criar componente `ProtectedRoute` com logica de redirecionamento |
| `src/pages/Register.tsx` | Modificar logica para codigo de convite opcional |
| `src/pages/colaborador/ColaboradorTarefas.tsx` | Expandir modal com visualizacao de ficheiros (audio, imagens, PDF) |
| `src/pages/admin/AdminTarefas.tsx` | Adicionar dialog de upload com descricao obrigatoria |
| `src/pages/admin/AdminUsuarios.tsx` | Adicionar modal de detalhes completos do usuario + design moderno |
| `src/pages/admin/AdminColaboradores.tsx` | Adicionar opcao de eliminar colaborador + design moderno |

---

### Notas Importantes

1. **RLS Policies:** Nao requerem alteracoes - as politicas existentes ja garantem:
   - Colaboradores so veem as suas proprias atribuicoes
   - Admins tem acesso total

2. **Download de Ficheiros:** Para colaboradores verem ficheiros de tarefas atribuidas, sera necessario adicionar uma RLS policy para `task_files`:
   ```sql
   CREATE POLICY "Collaborators can view assigned task files"
   ON task_files FOR SELECT
   TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM task_assignments
       WHERE task_assignments.task_id = task_files.task_id
       AND task_assignments.collaborator_id = auth.uid()
     )
   );
   ```

3. **Storage Access:** Para colaboradores reproduzirem audios/verem imagens, sera necessario adicionar policy no bucket `task-files` para permitir acesso a tarefas atribuidas.

