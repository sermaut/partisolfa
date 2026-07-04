import * as React from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileDropzoneProps {
  /** HTML accept attribute (e.g. ".pdf,.png,image/*") */
  accept?: string;
  /** Allow selecting multiple files */
  multiple?: boolean;
  /** Max size per file in bytes. Files above this are rejected. */
  maxSize?: number;
  /** Fired with the accepted File[] after client-side size validation */
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

/**
 * Accessible file upload area with:
 * - Native <input type="file"> as the source of truth (keyboard + AT support)
 * - A visible drop area that is also a keyboard-activatable trigger
 *   (Enter/Space open the file picker)
 * - Drag & drop with clear visual + aria-live feedback
 * - Client-side size validation with screen-reader announcements
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

    const innerRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const [isDragging, setIsDragging] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [status, setStatus] = React.useState('');
    const dragCounter = React.useRef(0);

    const openPicker = React.useCallback(() => {
      if (disabled) return;
      innerRef.current?.click();
    }, [disabled]);

    const processFiles = React.useCallback(
      (list: FileList | File[] | null) => {
        if (!list) return;
        const incoming = Array.from(list);
        if (incoming.length === 0) return;

        // Immediate feedback — flip to "processing" so the UI reflects the
        // selection in the same frame, before any validation/preview work.
        setIsProcessing(true);
        setStatus(
          `A processar ${incoming.length} ficheiro${incoming.length > 1 ? 's' : ''}…`,
        );

        // Defer heavy work (size checks, MIME sniffing, preview URL creation
        // done by the parent) to the next frame so the browser can paint the
        // loading state first. Falls back to microtask when rAF is missing.
        const run = () => {
          try {
            const accepted: File[] = [];
            const rejected: string[] = [];
            for (const f of incoming) {
              if (maxSize && f.size > maxSize) {
                rejected.push(f.name);
                continue;
              }
              accepted.push(f);
            }
            if (accepted.length > 0) {
              onFiles(accepted);
            }
            let msg = '';
            if (accepted.length > 0) {
              msg = `${accepted.length} ficheiro${accepted.length > 1 ? 's' : ''} adicionado${
                accepted.length > 1 ? 's' : ''
              }.`;
            }
            if (rejected.length > 0) {
              const mb = maxSize ? Math.round(maxSize / (1024 * 1024)) : 0;
              msg = `${msg ? msg + ' ' : ''}${rejected.length} recusado${
                rejected.length > 1 ? 's' : ''
              } por exceder ${mb}MB.`;
            }
            setStatus(msg);
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
      [maxSize, onFiles],
    );

    return (
      <div className={cn('w-full', className)}>
        {/* Native input — visible only to assistive tech / keyboard focus */}
        <input
          ref={innerRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            // Snapshot the File[] before resetting the input so the reference
            // survives the value clear (which empties the FileList).
            const picked = e.target.files ? Array.from(e.target.files) : [];
            e.target.value = '';
            processFiles(picked);
          }}
          className="sr-only"
          aria-describedby={hint ? hintId : undefined}
        />

        {/* Drop area — labels the input and doubles as an activatable trigger */}
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
          }}
          className={cn(
            'group relative flex w-full cursor-pointer flex-col items-center justify-center gap-2',
            'rounded-lg border-2 border-dashed border-border bg-secondary/40 p-6 text-center',
            'transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            'hover:border-primary/60 hover:bg-secondary/60',
            isDragging && 'border-primary bg-primary/5',
            isProcessing && 'border-primary/70 bg-primary/5',
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

        {/* Screen-reader announcements for add / reject events */}
        <p id={statusId} role="status" aria-live="polite" className="sr-only">
          {status}
        </p>
      </div>
    );
  },
);
FileDropzone.displayName = 'FileDropzone';
