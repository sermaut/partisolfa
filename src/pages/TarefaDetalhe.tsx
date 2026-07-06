import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Clock, 
  CheckCircle, 
  AlertCircle,
  Music,
  FileMusic,
  Download,
  Calendar,
  FileAudio,
  Image,
  File,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  service_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  credits_used: number;
  description: string | null;
  recommendations: string | null;
}

interface TaskFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  is_result: boolean;
  created_at: string;
}

const statusConfig = {
  pending: { label: 'Pendente', class: 'status-pending', icon: Clock, description: 'A sua solicitação está na fila para processamento.' },
  in_progress: { label: 'Em Progresso', class: 'status-progress', icon: AlertCircle, description: 'A sua solicitação está a ser processada.' },
  completed: { label: 'Concluída', class: 'status-completed', icon: CheckCircle, description: 'O resultado está disponível para download.' },
  cancelled: { label: 'Cancelada', class: 'status-cancelled', icon: AlertCircle, description: 'Esta solicitação foi cancelada.' },
};

const serviceLabels: Record<string, string> = {
  aperfeicoamento: 'Aperfeiçoamento (legado)',
  arranjo: 'Arranjo Musical',
  transposicao: 'Transposição Musical',
  acc: 'Criação de ACCs (legado)',
};


export default function TarefaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [task, setTask] = useState<Task | null>(null);
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user && id) {
      fetchTaskDetails();
    }
  }, [user, authLoading, id, navigate]);

  const fetchTaskDetails = async () => {
    try {
      // Fetch task
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (taskError) throw taskError;
      setTask(taskData);

      // Fetch files
      const { data: filesData, error: filesError } = await supabase
        .from('task_files')
        .select('*')
        .eq('task_id', id)
        .order('is_result', { ascending: false })
        .order('created_at', { ascending: true });

      if (filesError) throw filesError;
      setFiles(filesData || []);
    } catch (error) {
      console.error('Error fetching task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da tarefa.',
        variant: 'destructive',
      });
      navigate('/historico');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (file: TaskFile) => {
    setDownloadingFile(file.id);
    try {
      const bucket = file.is_result ? 'result-files' : 'task-files';
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download concluído',
        description: `${file.file_name} foi descarregado.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Erro no download',
        description: 'Não foi possível descarregar o ficheiro.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingFile(null);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <FileAudio className="w-5 h-5 text-primary" />;
      case 'image':
        return <Image className="w-5 h-5 text-success" />;
      default:
        return <File className="w-5 h-5 text-warning" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (size: number | null) => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  };

  const limitTitleWords = (title: string, maxWords = 12) => {
    const words = title.trim().split(/\s+/);
    if (words.length <= maxWords) return title;
    return words.slice(0, maxWords).join(' ') + '…';
  };

  if (authLoading || isLoading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="music-wave">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!task) return null;

  const status = statusConfig[task.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;
  const uploadedFiles = files.filter((f) => !f.is_result);
  const resultFiles = files.filter((f) => f.is_result);

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/historico')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao histórico
            </Button>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-gold/20 flex items-center justify-center flex-shrink-0">
                  {task.service_type === 'arranjo' ? (
                    <FileMusic className="w-7 h-7 text-primary" />
                  ) : (
                    <Music className="w-7 h-7 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-2xl md:text-3xl font-bold mb-1 line-clamp-2 break-words" title={task.title}>
                    {limitTitleWords(task.title)}
                  </h1>
                  <p className="text-muted-foreground">
                    {serviceLabels[task.service_type as keyof typeof serviceLabels]}
                  </p>
                </div>
              </div>

              <span className={`self-start md:self-auto flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${status.class} flex items-center gap-2`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>

          </div>

          {/* Status Message */}
          <div className="glass-card rounded-xl p-4 mb-6">
            <p className="text-muted-foreground">{status.description}</p>
          </div>

          {/* Result Files (Expanded by default, prominent) */}
          {resultFiles.length > 0 && (
            <div className="glass-card rounded-xl p-5 mb-6 border-success/50 bg-success/5">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2 text-success">
                <Download className="w-5 h-5" />
                Resultado Disponível
              </h2>
              <div className="space-y-3">
                {resultFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-secondary rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.file_type)}
                      <div>
                        <p className="font-medium">{file.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.file_size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="premium"
                      size="sm"
                      onClick={() => downloadFile(file)}
                      disabled={downloadingFile === file.id}
                    >
                      {downloadingFile === file.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Descarregar
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible sections - other details */}
          <details className="glass-card rounded-xl mb-4 group" open={resultFiles.length === 0}>
            <summary className="cursor-pointer p-5 font-display text-lg font-semibold flex items-center justify-between">
              Detalhes da Solicitação
              <span className="text-sm text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" /> Data de Criação
                </div>
                <p className="text-sm">{formatDate(task.created_at)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" /> Última Actualização
                </div>
                <p className="text-sm">{formatDate(task.updated_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Prazo máximo</p>
                <p className="text-sm font-medium">Até 3 dias após a criação</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Créditos utilizados</p>
                <p className="text-sm font-medium">{task.credits_used}</p>
              </div>
            </div>
          </details>

          {task.description && (
            <details className="glass-card rounded-xl mb-4 group">
              <summary className="cursor-pointer p-5 font-display text-lg font-semibold flex items-center justify-between">
                Descrição
                <span className="text-sm text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-5 pb-5 text-muted-foreground whitespace-pre-wrap">{task.description}</p>
            </details>
          )}

          {task.recommendations && (
            <details className="glass-card rounded-xl mb-4 group">
              <summary className="cursor-pointer p-5 font-display text-lg font-semibold flex items-center justify-between">
                Recomendações
                <span className="text-sm text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-5 pb-5 text-muted-foreground whitespace-pre-wrap">{task.recommendations}</p>
            </details>
          )}

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <details className="glass-card rounded-xl mb-4 group">
              <summary className="cursor-pointer p-5 font-display text-lg font-semibold flex items-center justify-between">
                Ficheiros Enviados ({uploadedFiles.length})
                <span className="text-sm text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-5 pb-5 space-y-3">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.file_type)}
                      <div>
                        <p className="font-medium">{file.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.file_size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(file)}
                      disabled={downloadingFile === file.id}
                    >
                      {downloadingFile === file.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </details>
          )}

        </motion.div>
      </div>
    </Layout>
  );
}
