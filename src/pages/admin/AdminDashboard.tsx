import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard,
  ClipboardList,
  CreditCard,
  Users,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Stats {
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  pendingDeposits: number;
  totalUsers: number;
  totalReferrals: number;
  awardedReferrals: number;
}

export default function AdminDashboard() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    pendingDeposits: 0,
    totalUsers: 0,
    totalReferrals: 0,
    awardedReferrals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
        return;
      }
      if (!isAdmin) {
        toast({
          title: 'Acesso negado',
          description: 'Você não tem permissão para aceder a esta área.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }
      fetchStats();
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  const fetchStats = async () => {
    try {
      // Fetch pending tasks count
      const { count: pendingTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch in progress tasks count
      const { count: inProgressTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress');

      // Fetch completed tasks count
      const { count: completedTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Fetch pending deposits count
      const { count: pendingDeposits } = await supabase
        .from('deposits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total referrals count
      const { count: totalReferrals } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true });

      // Fetch awarded referrals count
      const { count: awardedReferrals } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('bonus_awarded', true);

      setStats({
        pendingTasks: pendingTasks || 0,
        inProgressTasks: inProgressTasks || 0,
        completedTasks: completedTasks || 0,
        pendingDeposits: pendingDeposits || 0,
        totalUsers: totalUsers || 0,
        totalReferrals: totalReferrals || 0,
        awardedReferrals: awardedReferrals || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
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

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">
                Painel <span className="text-gradient-gold">Administrativo</span>
              </h1>
              <p className="text-muted-foreground">Gerencie solicitações, depósitos e usuários</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <span className="text-3xl font-display font-bold">{stats.pendingTasks}</span>
              </div>
              <p className="text-sm text-muted-foreground">Tarefas Pendentes</p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <span className="text-3xl font-display font-bold">{stats.inProgressTasks}</span>
              </div>
              <p className="text-sm text-muted-foreground">Em Progresso</p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <span className="text-3xl font-display font-bold">{stats.completedTasks}</span>
              </div>
              <p className="text-sm text-muted-foreground">Concluídas</p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-accent" />
                </div>
                <span className="text-3xl font-display font-bold">{stats.pendingDeposits}</span>
              </div>
              <p className="text-sm text-muted-foreground">Depósitos Pendentes</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/tarefas"
              className="glass-card rounded-xl p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <ClipboardList className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gerir Tarefas</h3>
                    <p className="text-sm text-muted-foreground">
                      Ver e processar solicitações
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>

            <Link
              to="/admin/depositos"
              className="glass-card rounded-xl p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <CreditCard className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gerir Depósitos</h3>
                    <p className="text-sm text-muted-foreground">
                      Aprovar pedidos de depósito
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>

            <Link
              to="/admin/usuarios"
              className="glass-card rounded-xl p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center group-hover:bg-success/30 transition-colors">
                    <Users className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Usuários</h3>
                    <p className="text-sm text-muted-foreground">
                      {stats.totalUsers} usuários registados
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>

            <Link
              to="/admin/referrals"
              className="glass-card rounded-xl p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center group-hover:bg-warning/30 transition-colors">
                    <Gift className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Referências</h3>
                    <p className="text-sm text-muted-foreground">
                      {stats.awardedReferrals}/{stats.totalReferrals} com bónus
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
