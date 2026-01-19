import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowDownCircle, 
  ClipboardList,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Stats {
  balance: number;
  pendingAssignments: number;
  acceptedAssignments: number;
  completedAssignments: number;
  pendingWithdrawals: number;
}

export default function ColaboradorDashboard() {
  const { user, profile, isCollaborator, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<Stats>({
    balance: 0,
    pendingAssignments: 0,
    acceptedAssignments: 0,
    completedAssignments: 0,
    pendingWithdrawals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isCollaborator) {
        navigate('/dashboard');
        return;
      }
      fetchStats();
    }
  }, [user, isCollaborator, authLoading, navigate]);

  const fetchStats = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get pending assignments
      const { count: pendingCount } = await supabase
        .from('task_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('collaborator_id', user.id)
        .eq('status', 'pending');

      // Get accepted assignments (tasks still in progress)
      const { count: acceptedCount } = await supabase
        .from('task_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('collaborator_id', user.id)
        .eq('status', 'accepted');

      // Get pending withdrawals
      const { count: withdrawalsCount } = await supabase
        .from('collaborator_withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('collaborator_id', user.id)
        .eq('status', 'pending');

      setStats({
        balance: profile?.credits || 0,
        pendingAssignments: pendingCount || 0,
        acceptedAssignments: acceptedCount || 0,
        completedAssignments: 0,
        pendingWithdrawals: withdrawalsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const quickLinks = [
    {
      title: 'Tarefas Atribuídas',
      description: `${stats.pendingAssignments} pendentes`,
      icon: ClipboardList,
      href: '/colaborador/tarefas',
      badge: stats.pendingAssignments > 0 ? stats.pendingAssignments : null,
    },
    {
      title: 'Solicitar Levantamento',
      description: 'Levantar saldo',
      icon: ArrowDownCircle,
      href: '/colaborador/levantamento',
    },
    {
      title: 'Depositar Créditos',
      description: 'Adicionar saldo',
      icon: Wallet,
      href: '/deposito',
    },
    {
      title: 'Notificações',
      description: 'Ver mensagens',
      icon: Bell,
      href: '/notificacoes',
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">
              Olá, {profile?.full_name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Painel de Colaborador
            </p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">Teu Saldo</p>
                <p className="text-4xl font-bold text-primary">
                  {stats.balance.toFixed(1)} <span className="text-xl">créditos</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ≈ {(stats.balance * 150).toLocaleString()} Kz
                </p>
              </div>
              <Wallet className="w-16 h-16 text-primary/30" />
            </div>
            
            {stats.pendingWithdrawals > 0 && (
              <div className="mt-4 pt-4 border-t border-primary/20">
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {stats.pendingWithdrawals} levantamento{stats.pendingWithdrawals > 1 ? 's' : ''} pendente{stats.pendingWithdrawals > 1 ? 's' : ''}
                </Badge>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingAssignments}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <ClipboardList className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.acceptedAssignments}</p>
                  <p className="text-sm text-muted-foreground">Em Progresso</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border border-border p-4 col-span-2 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completedAssignments}</p>
                  <p className="text-sm text-muted-foreground">Concluídas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <h2 className="text-xl font-semibold mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                to={link.href}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors group relative"
              >
                <link.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-medium">{link.title}</p>
                <p className="text-sm text-muted-foreground">{link.description}</p>
                {link.badge && (
                  <Badge className="absolute top-2 right-2" variant="destructive">
                    {link.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}