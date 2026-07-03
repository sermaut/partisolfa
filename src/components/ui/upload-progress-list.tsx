import * as React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type UploadStatus = 'uploading' | 'success' | 'error';

export interface FileProgress {
  name: string;
  status: UploadStatus;
  error?: string;
}

export interface UploadProgressListProps {
  items: FileProgress[];
  className?: string;
}

/**
 * Renders a per-file upload progress list with accessible live announcements.
 * - Successes announced politely.
 * - Errors announced assertively so screen readers interrupt.
 */
export function UploadProgressList({ items, className }: UploadProgressListProps) {
  if (items.length === 0) return null;

  const total = items.length;
  const done = items.filter((i) => i.status === 'success').length;
  const errors = items.filter((i) => i.status === 'error');
  const uploading = items.filter((i) => i.status === 'uploading').length;

  const politeMsg = uploading > 0
    ? `A enviar ${uploading} ficheiro${uploading > 1 ? 's' : ''}. ${done} de ${total} concluídos.`
    : done === total
      ? `Todos os ${total} ficheiros enviados.`
      : `${done} de ${total} ficheiros enviados.`;

  const assertiveMsg = errors.length > 0
    ? errors.map((e) => `Falha ao enviar ${e.name}${e.error ? `: ${e.error}` : ''}.`).join(' ')
    : '';

  return (
    <div className={cn('space-y-2', className)} aria-label="Progresso do envio">
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {politeMsg}
      </p>
      <p role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertiveMsg}
      </p>

      <ul className="space-y-2">
        {items.map((item, idx) => {
          const value = item.status === 'success' ? 100 : item.status === 'error' ? 0 : 66;
          return (
            <li
              key={`${item.name}-${idx}`}
              className="rounded-lg border border-border bg-secondary/40 p-2.5"
            >
              <div className="flex items-center gap-2">
                {item.status === 'uploading' && (
                  <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin text-primary" />
                )}
                {item.status === 'success' && (
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-success" />
                )}
                {item.status === 'error' && (
                  <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-destructive" />
                )}
                <span className="min-w-0 flex-1 truncate text-xs sm:text-sm">{item.name}</span>
                <span className="shrink-0 text-[10px] sm:text-xs text-muted-foreground">
                  {item.status === 'uploading' && 'A enviar…'}
                  {item.status === 'success' && 'Enviado'}
                  {item.status === 'error' && 'Erro'}
                </span>
              </div>
              <Progress
                value={value}
                className={cn(
                  'mt-2 h-1.5',
                  item.status === 'error' && '[&>div]:bg-destructive',
                  item.status === 'success' && '[&>div]:bg-success',
                )}
              />
              {item.status === 'error' && item.error && (
                <p className="mt-1 text-[11px] text-destructive">{item.error}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
