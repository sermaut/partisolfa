import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Clock, 
  CheckCircle, 
  AlertCircle,
  Music,
  FileMusic,
  Download,
  Upload,
  Eye,
  X,
  Loader2,
  FileAudio,
  Image,
  File
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Task {
  id: string;
  title: string;
  service_type: string;
  status: string;
  created_at: string;
  user_id: string;
  description: string | null;
  recommendations: string | null;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface TaskFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  is_result: boolean;
}

const statusConfig = {
  pending: { label: 'Pendente', class: 'status-pending', icon: Clock },
  in_progress: { label: 'Em Progresso', class: 'status-progress', icon: AlertCircle },
  completed: { label: 'Concluída', class: 'status-completed', icon: CheckCircle },
  cancelled: { label: 'Cancelada', class: 'status-cancelled', icon: AlertCircle },
};

const serviceLabels = {
  aperfeicoamento: 'Aperfeiçoamento',
  arranjo: 'Arranjo Musical',
};

export default function AdminTarefas() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskFiles, setTaskFiles] = useState<TaskFile[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/dashboard');
        return;
      }
      fetchTasks();
    }
  }, [user, isAdmin, authLoading, navigate, statusFilter]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'pending' | 'in_progress' | 'completed' | 'cancelled');
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user profiles for each task
      const tasksWithProfiles = await Promise.all(
        (data || []).map(async (task) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', task.user_id)
            .single();
          
          return { ...task, profiles: profileData };
        })
      );

      setTasks(tasksWithProfiles);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openTaskDetail = async (task: Task) => {
    setSelectedTask(task);
    
    // Fetch task files
    const { data: files, error } = await supabase
      .from('task_files')
      .select('*')
      .eq('task_id', task.id)
      .order('is_result', { ascending: false });

    if (!error) {
      setTaskFiles(files || []);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Send notification to user
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        const statusLabel = statusConfig[newStatus as keyof typeof statusConfig]?.label || newStatus;
        await supabase.from('notifications').insert({
          user_id: task.user_id,
          title: 'Estado da solicitação actualizado',
          message: `A sua solicitação "${task.title}" está agora: ${statusLabel}`,
        });
      }

      toast({
        title: 'Estado actualizado',
        description: 'O estado da tarefa foi alterado com sucesso.',
      });

      fetchTasks();
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível actualizar o estado.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResultUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-result.${fileExt}`;
      const filePath = `${selectedTask.user_id}/${selectedTask.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('result-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save file record
      const { error: dbError } = await supabase.from('task_files').insert({
        task_id: selectedTask.id,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type.includes('audio') ? 'audio' : file.type.includes('image') ? 'image' : 'document',
        file_size: file.size,
        is_result: true,
      });

      if (dbError) throw dbError;

      // Update task status to completed
      await updateTaskStatus(selectedTask.id, 'completed');

      // Send notification
      await supabase.from('notifications').insert({
        user_id: selectedTask.user_id,
        title: 'Resultado disponível!',
        message: `O resultado da sua solicitação "${selectedTask.title}" está pronto para download.`,
      });

      toast({
        title: 'Resultado enviado',
        description: 'O ficheiro foi enviado e o usuário foi notificado.',
      });

      // Refresh files
      openTaskDetail(selectedTask);
    } catch (error) {
      console.error('Error uploading result:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o resultado.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        return <FileAudio className="w-4 h-4 text-primary" />;
      case 'image':
        return <Image className="w-4 h-4 text-success" />;
      default:
        return <File className="w-4 h-4 text-warning" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao painel
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="font-display text-3xl font-bold">
              Gerir <span className="text-gradient-gold">Tarefas</span>
            </h1>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-secondary">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tasks List */}
          {tasks.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Nenhuma tarefa encontrada
              </h3>
              <p className="text-muted-foreground">
                Não existem tarefas com o estado selecionado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => {
                const status = statusConfig[task.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={task.id}
                    className="glass-card rounded-xl p-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-gold/20 flex items-center justify-center flex-shrink-0">
                          {task.service_type === 'arranjo' ? (
                            <FileMusic className="w-6 h-6 text-primary" />
                          ) : (
                            <Music className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {serviceLabels[task.service_type as keyof typeof serviceLabels]} • {formatDate(task.created_at)}
                          </p>
                          <p className="text-sm text-primary mt-1">
                            {task.profiles?.full_name} ({task.profiles?.email})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {status.label}
                        </span>

                        <Select
                          value={task.status}
                          onValueChange={(value) => updateTaskStatus(task.id, value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="in_progress">Em Progresso</SelectItem>
                            <SelectItem value="completed">Concluída</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTaskDetail(task)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selectedTask?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Serviço</p>
                  <p className="font-medium">
                    {serviceLabels[selectedTask.service_type as keyof typeof serviceLabels]}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data</p>
                  <p className="font-medium">{formatDate(selectedTask.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Usuário</p>
                  <p className="font-medium">{selectedTask.profiles?.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">E-mail</p>
                  <p className="font-medium">{selectedTask.profiles?.email}</p>
                </div>
              </div>

              {selectedTask.description && (
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedTask.description}</p>
                </div>
              )}

              {selectedTask.recommendations && (
                <div>
                  <Label className="text-muted-foreground">Recomendações</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedTask.recommendations}</p>
                </div>
              )}

              {/* Files */}
              <div>
                <Label className="text-muted-foreground mb-3 block">Ficheiros</Label>
                <div className="space-y-2">
                  {taskFiles.filter((f) => !f.is_result).map((file) => (
                    <div
                      key={file.id}
                      className="bg-secondary/50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.file_type)}
                        <span className="text-sm">{file.file_name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
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
              </div>

              {/* Result Files */}
              {taskFiles.filter((f) => f.is_result).length > 0 && (
                <div>
                  <Label className="text-success mb-3 block">Resultados Enviados</Label>
                  <div className="space-y-2">
                    {taskFiles.filter((f) => f.is_result).map((file) => (
                      <div
                        key={file.id}
                        className="bg-success/10 border border-success/30 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm">{file.file_name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
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
                </div>
              )}

              {/* Upload Result */}
              <div className="pt-4 border-t border-border">
                <Label className="mb-3 block">Enviar Resultado</Label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleResultUpload}
                    className="hidden"
                  />
                  <Button
                    variant="premium"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {isUploading ? 'A enviar...' : 'Carregar Resultado'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    O usuário será notificado automaticamente
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
