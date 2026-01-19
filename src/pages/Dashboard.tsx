import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Music,
  FileMusic,
  Wallet,
  History,
  Bell,
  TrendingUp,
  PieChart,
  BarChart3,
  Gift,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UsageChart } from '@/components/dashboard/UsageChart';
import { ServiceDistributionChart } from '@/components/dashboard/ServiceDistributionChart';
import { StatusDistributionChart } from '@/components/dashboard/StatusDistributionChart';

interface Task {
  id: string;
  title: string;
  service_type: string;
  status: string;
  created_at: string;
  credits_used: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
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

export default function Dashboard() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCreditsUsed, setTotalCreditsUsed] = useState(0);
  const [referralStats, setReferralStats] = useState({ total: 0, awarded: 0, bonusCredits: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      // Fetch recent tasks (limited)
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

      // Fetch all tasks for statistics
      const { data: allTasksData, error: allTasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (allTasksError) throw allTasksError;
      setAllTasks(allTasksData || []);

      // Calculate total credits used
      const total = (allTasksData || []).reduce((sum, task) => sum + (task.credits_used || 0), 0);
      setTotalCreditsUsed(total);

      // Fetch notifications
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notifError) throw notifError;
      setNotifications(notifData || []);

      // Fetch referral stats
      if (user) {
        const { data: referralsData, error: referralsError } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', user.id);

        if (!referralsError && referralsData) {
          const totalReferrals = referralsData.length;
          const awardedReferrals = referralsData.filter(r => r.bonus_awarded).length;
          const bonusCredits = referralsData
            .filter(r => r.bonus_awarded)
            .reduce((sum, r) => sum + (r.bonus_amount_kz / 150), 0);

          setReferralStats({
            total: totalReferrals,
            awarded: awardedReferrals,
            bonusCredits: bonusCredits
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
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

  const pendingTasks = allTasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Olá, <span className="text-gradient-gold">{profile?.full_name?.split(' ')[0]}</span>!
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel de controlo. Gerencie as suas solicitações e créditos aqui.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-4 md:p-6"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Saldo</p>
                <p className="text-lg md:text-2xl font-display font-bold text-primary">
                  {profile?.credits?.toFixed(1)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-xl p-4 md:p-6"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Gasto</p>
                <p className="text-lg md:text-2xl font-display font-bold">{totalCreditsUsed.toFixed(1)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-4 md:p-6"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-warning" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pendentes</p>
                <p className="text-lg md:text-2xl font-display font-bold">{pendingTasks + inProgressTasks}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-xl p-4 md:p-6"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-success" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Concluídas</p>
                <p className="text-lg md:text-2xl font-display font-bold">{completedTasks}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-4 md:p-6 col-span-2 md:col-span-1"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Notificações</p>
                <p className="text-lg md:text-2xl font-display font-bold">{notifications.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Referral Stats Card */}
        {referralStats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mb-8"
          >
            <Link to="/perfil" className="glass-card rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-primary/50 transition-colors block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-gold/20 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">Programa de Convites</h3>
                  <p className="text-sm text-muted-foreground">
                    Convide amigos e ganhe créditos!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Convidados</span>
                  </div>
                  <p className="text-xl font-display font-bold">{referralStats.total}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Com Bónus</span>
                  </div>
                  <p className="text-xl font-display font-bold text-success">{referralStats.awarded}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-primary">
                    <Wallet className="w-4 h-4" />
                    <span className="text-xs">Ganhos</span>
                  </div>
                  <p className="text-xl font-display font-bold text-primary">
                    {referralStats.bonusCredits.toFixed(1)}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Uso de Créditos</h3>
            </div>
            <UsageChart tasks={allTasks} />
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Distribuição de Serviços</h3>
            </div>
            <ServiceDistributionChart tasks={allTasks} />
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Estado das Solicitações</h3>
            </div>
            <StatusDistributionChart tasks={allTasks} />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Button 
            variant="premium" 
            size="lg" 
            asChild 
            className="h-auto py-6 flex-col gap-2"
            disabled={(profile?.credits || 0) < 1}
          >
            <Link to="/nova-solicitacao">
              <Plus className="w-6 h-6" />
              <span>Nova Solicitação</span>
              {(profile?.credits || 0) < 1 && (
                <span className="text-xs opacity-70">Saldo insuficiente</span>
              )}
            </Link>
          </Button>

          <Button variant="outline" size="lg" asChild className="h-auto py-6 flex-col gap-2">
            <Link to="/deposito">
              <CreditCard className="w-6 h-6" />
              <span>Depositar Créditos</span>
            </Link>
          </Button>

          <Button variant="outline" size="lg" asChild className="h-auto py-6 flex-col gap-2">
            <Link to="/historico">
              <History className="w-6 h-6" />
              <span>Ver Histórico</span>
            </Link>
          </Button>
        </motion.div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-8"
          >
            <h2 className="font-display text-xl font-semibold mb-4">Notificações</h2>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="glass-card rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{notif.title}</p>
                      <p className="text-sm text-muted-foreground">{notif.message}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markNotificationAsRead(notif.id)}
                  >
                    Marcar lida
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Solicitações Recentes</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/historico">Ver todas</Link>
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Nenhuma solicitação ainda
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece criando a sua primeira solicitação de serviço musical.
              </p>
              <Button variant="premium" asChild disabled={(profile?.credits || 0) < 1}>
                <Link to="/nova-solicitacao">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Solicitação
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const status = statusConfig[task.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                
                return (
                  <Link
                    key={task.id}
                    to={`/tarefa/${task.id}`}
                    className="glass-card rounded-xl p-4 flex items-center justify-between gap-4 hover:border-primary/50 transition-colors block"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-gold/20 flex items-center justify-center">
                        {task.service_type === 'arranjo' ? (
                          <FileMusic className="w-5 h-5 text-primary" />
                        ) : (
                          <Music className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {serviceLabels[task.service_type as keyof typeof serviceLabels]}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
                        {status.label}
                      </span>
                      {task.status === 'completed' && (
                        <Download className="w-5 h-5 text-success" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
