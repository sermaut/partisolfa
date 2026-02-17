import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Music,
  FileMusic,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Trash2,
  Eye,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Task {
  id: string;
  title: string;
  service_type: string;
  status: string;
  created_at: string;
  credits_used: number;
}

const statusConfig = {
  pending: { label: 'Pendente', class: 'status-pending', icon: Clock },
  in_progress: { label: 'Em Progresso', class: 'status-progress', icon: AlertCircle },
  completed: { label: 'Concluída', class: 'status-completed', icon: CheckCircle },
  cancelled: { label: 'Cancelada', class: 'status-cancelled', icon: XCircle },
};

const serviceLabels = {
  aperfeicoamento: 'Aperfeiçoamento',
  arranjo: 'Arranjo Musical',
};

export default function SolicitacoesRecentes() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
        return;
      }
      fetchTasks();
    }
  }, [user, authLoading, navigate]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as solicitações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setDeletingId(taskId);
    try {
      // First, delete associated task files from storage
      const { data: files } = await supabase
        .from('task_files')
        .select('file_path, is_result')
        .eq('task_id', taskId);

      if (files && files.length > 0) {
        for (const file of files) {
          const bucket = file.is_result ? 'result-files' : 'task-files';
          await supabase.storage.from(bucket).remove([file.file_path]);
        }

        // Delete file records
        await supabase.from('task_files').delete().eq('task_id', taskId);
      }

      // Delete the task
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      toast({
        title: 'Solicitação eliminada',
        description: 'A solicitação foi eliminada com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível eliminar a solicitação.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold">
                Solicitações <span className="text-gradient-gold">Feitas</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                {tasks.length} solicitaç{tasks.length !== 1 ? 'ões' : 'ão'}
              </p>
            </div>

            <Button variant="premium" onClick={() => navigate('/nova-solicitacao')}>
              Nova Solicitação
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Nenhuma solicitação
              </h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não tem solicitações. Crie a sua primeira solicitação agora!
              </p>
              <Button variant="premium" onClick={() => navigate('/nova-solicitacao')}>
                Criar Solicitação
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => {
                const status = statusConfig[task.status as keyof typeof statusConfig];
                const StatusIcon = status?.icon || Clock;

                return (
                  <div
                    key={task.id}
                    className="glass-card rounded-xl p-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                          <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium ${status?.class}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status?.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link to={`/tarefa/${task.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalhes
                          </Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              disabled={deletingId === task.id}
                            >
                              {deletingId === task.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar solicitação?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acção não pode ser revertida. A solicitação "{task.title}" e todos os ficheiros associados serão eliminados permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteTask(task.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}