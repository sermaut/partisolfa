import * as React from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileDropzoneProps {
  /** HTML accept attribute (e.g. ".pdf,.png,image/*") */
  accept?: string;
  /** Allow selecting multiple files */
  multiple?: boolean;
  /** Max size per file in bytes. Files above this are rejected. */
  maxSize?: number;
  /** Fired with the accepted File[] after client-side validation */
  onFiles: (files: File[]) => void;
  /** Disables interaction */
  disabled?: boolean;
  /** Visible label above the drop area (also becomes the accessible name) */
  label: string;
  /** Optional helper text shown below the drop area */
  hint?: string;
  /** Optional id — used to link input + label + description for a11y */
  id?: string;
  className?: string;
}

/** Parse an HTML `accept` attribute into extensions and MIME matchers. */
function parseAccept(accept?: string) {
  if (!accept) return null;
  const tokens = accept
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const extensions: string[] = [];
  const mimes: string[] = [];
  for (const t of tokens) {
    if (t.startsWith('.')) extensions.push(t);
    else mimes.push(t);
  }
  return { extensions, mimes };
}

function fileMatchesAccept(
  file: File,
  parsed: ReturnType<typeof parseAccept>,
): boolean {
  if (!parsed) return true;
  const { extensions, mimes } = parsed;
  if (extensions.length === 0 && mimes.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  if (extensions.some((ext) => name.endsWith(ext))) return true;
  if (
    mimes.some((m) => {
      if (m.endsWith('/*')) return type.startsWith(m.slice(0, -1));
      return type === m;
    })
  )
    return true;
  return false;
}

/**
 * Accessible file upload area with:
 * - Native <input type="file"> as the focusable source of truth (keyboard + AT)
 * - Visible drop area labelled to the input; focus ring driven by focus-within
 * - Drag & drop with aria-live status announcements
 * - Client-side size + type validation with visible inline error and
 *   assertive screen-reader announcement, plus focus returned to the input
 */
export const FileDropzone = React.forwardRef<HTMLInputElement, FileDropzoneProps>(
  (
    {
      accept,
      multiple = false,
      maxSize,
      onFiles,
      disabled = false,
      label,
      hint,
      id,
      className,
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? `file-dropzone-${reactId}`;
    const hintId = `${inputId}-hint`;
    const statusId = `${inputId}-status`;
    const errorId = `${inputId}-error`;

    const innerRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const [isDragging, setIsDragging] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [status, setStatus] = React.useState('');
    const [error, setError] = React.useState('');
    const dragCounter = React.useRef(0);
    const parsedAccept = React.useMemo(() => parseAccept(accept), [accept]);

    const openPicker = React.useCallback(() => {
      if (disabled) return;
      innerRef.current?.click();
    }, [disabled]);

    const processFiles = React.useCallback(
      (list: FileList | File[] | null) => {
        if (!list) return;
        const incoming = Array.from(list);
        if (incoming.length === 0) return;

        setError('');
        setIsProcessing(true);
        setStatus(
          `A processar ${incoming.length} ficheiro${incoming.length > 1 ? 's' : ''}…`,
        );

        const run = () => {
          try {
            const accepted: File[] = [];
            const tooLarge: string[] = [];
            const wrongType: string[] = [];
            for (const f of incoming) {
              if (!fileMatchesAccept(f, parsedAccept)) {
                wrongType.push(f.name);
                continue;
              }
              if (maxSize && f.size > maxSize) {
                tooLarge.push(f.name);
                continue;
              }
              accepted.push(f);
            }
            if (accepted.length > 0) onFiles(accepted);

            const errorParts: string[] = [];
            if (wrongType.length > 0) {
              errorParts.push(
                `${wrongType.length === 1 ? 'Tipo de ficheiro não suportado' : `${wrongType.length} ficheiros com tipo não suportado`}: ${wrongType.join(', ')}.`,
              );
            }
            if (tooLarge.length > 0) {
              const mb = maxSize ? Math.round(maxSize / (1024 * 1024)) : 0;
              errorParts.push(
                `${tooLarge.length === 1 ? 'Ficheiro excede' : `${tooLarge.length} ficheiros excedem`} ${mb}MB: ${tooLarge.join(', ')}.`,
              );
            }

            if (errorParts.length > 0) {
              const msg = errorParts.join(' ');
              setError(msg);
              setStatus('');
              // Return focus to the input so the error is discoverable and the
              // user can immediately retry with the keyboard.
              requestAnimationFrame(() => innerRef.current?.focus());
            } else {
              setStatus(
                `${accepted.length} ficheiro${accepted.length > 1 ? 's' : ''} adicionado${accepted.length > 1 ? 's' : ''}.`,
              );
            }
          } finally {
            setIsProcessing(false);
          }
        };

        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(run);
        } else {
          queueMicrotask(run);
        }
      },
      [maxSize, onFiles, parsedAccept],
    );

    const describedBy = [hint ? hintId : null, error ? errorId : null, statusId]
      .filter(Boolean)
      .join(' ');

    const accessibleName = isProcessing
      ? 'A processar ficheiros'
      : isDragging
        ? 'Solte para adicionar ficheiros'
        : `${label}. Arraste ficheiros ou pressione Enter para procurar.`;

    return (
      <div className={cn('w-full', className)}>
        <input
          ref={innerRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-label={accessibleName}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            const picked = e.target.files ? Array.from(e.target.files) : [];
            e.target.value = '';
            processFiles(picked);
          }}
          className="sr-only"
        />

        <label
          htmlFor={inputId}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (disabled) return;
            dragCounter.current += 1;
            setIsDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) e.dataTransfer.dropEffect = 'copy';
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current -= 1;
            if (dragCounter.current <= 0) {
              dragCounter.current = 0;
              setIsDragging(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current = 0;
            setIsDragging(false);
            if (disabled) return;
            const dropped = e.dataTransfer.files;
            if (!multiple && dropped.length > 1) {
              processFiles([dropped[0]]);
            } else {
              processFiles(dropped);
            }
          }}
          className={cn(
            'group relative flex w-full cursor-pointer flex-col items-center justify-center gap-2',
            'rounded-lg border-2 border-dashed border-border bg-secondary/40 p-6 text-center',
            'transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            'hover:border-primary/60 hover:bg-secondary/60',
            isDragging && 'border-primary bg-primary/5',
            isProcessing && 'border-primary/70 bg-primary/5',
            error && 'border-destructive bg-destructive/5',
            disabled && 'cursor-not-allowed opacity-60 hover:border-border hover:bg-secondary/40',
          )}
          aria-busy={isProcessing || undefined}
        >
          {isProcessing ? (
            <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Upload
              aria-hidden="true"
              className={cn(
                'h-6 w-6 text-muted-foreground transition-colors',
                isDragging && 'text-primary',
                error && 'text-destructive',
              )}
            />
          )}
          <span className="text-sm font-medium text-foreground">
            {isProcessing
              ? 'A processar ficheiros…'
              : isDragging
                ? 'Solte para adicionar'
                : label}
          </span>
          <span className="text-xs text-muted-foreground">
            {isProcessing
              ? 'A preparar para envio'
              : 'Arraste e solte, ou pressione Enter para procurar'}
          </span>
        </label>

        {hint && (
          <p id={hintId} className="mt-2 text-xs text-muted-foreground">
            {hint}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="assertive"
            className="mt-2 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <p id={statusId} role="status" aria-live="polite" className="sr-only">
          {status}
        </p>
      </div>
    );
  },
);
FileDropzone.displayName = 'FileDropzone';
