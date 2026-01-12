import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Music,
  FileMusic,
  Download,
  Calendar,
  Filter
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

interface Task {
  id: string;
  title: string;
  service_type: string;
  status: string;
  created_at: string;
  credits_used: number;
  description: string | null;
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

export default function Historico() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchTasks();
    }
  }, [user, authLoading, navigate]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (serviceFilter !== 'all' && task.service_type !== serviceFilter) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                <span className="text-gradient-gold">Histórico</span> de Solicitações
              </h1>
              <p className="text-muted-foreground">
                Acompanhe todas as suas solicitações e descarregue os resultados.
              </p>
            </div>

            <Button variant="premium" asChild>
              <Link to="/nova-solicitacao">Nova Solicitação</Link>
            </Button>
          </div>

          {/* Filters */}
          <div className="glass-card rounded-xl p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filtros:</span>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-secondary">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-[180px] bg-secondary">
                  <SelectValue placeholder="Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  <SelectItem value="aperfeicoamento">Aperfeiçoamento</SelectItem>
                  <SelectItem value="arranjo">Arranjo Musical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tasks List */}
          {filteredTasks.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Nenhuma solicitação encontrada
              </h3>
              <p className="text-muted-foreground mb-4">
                {tasks.length === 0
                  ? 'Comece criando a sua primeira solicitação.'
                  : 'Tente ajustar os filtros.'}
              </p>
              {tasks.length === 0 && (
                <Button variant="premium" asChild>
                  <Link to="/nova-solicitacao">Nova Solicitação</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task, index) => {
                const status = statusConfig[task.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/tarefa/${task.id}`}
                      className="glass-card rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/50 transition-colors block"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-gold/20 flex items-center justify-center flex-shrink-0">
                          {task.service_type === 'arranjo' ? (
                            <FileMusic className="w-6 h-6 text-primary" />
                          ) : (
                            <Music className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{task.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {serviceLabels[task.service_type as keyof typeof serviceLabels]}
                          </p>
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 md:flex-shrink-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(task.created_at)}
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${status.class}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {status.label}
                        </span>
                        {task.status === 'completed' && (
                          <Download className="w-5 h-5 text-success" />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
