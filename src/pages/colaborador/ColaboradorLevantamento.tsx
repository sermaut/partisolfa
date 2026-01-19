import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowDownCircle,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Withdrawal {
  id: string;
  amount_kz: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
}

const statusConfig = {
  pending: { label: 'Pendente', class: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
  approved: { label: 'Aprovado', class: 'bg-green-500/20 text-green-500', icon: CheckCircle },
  rejected: { label: 'Rejeitado', class: 'bg-red-500/20 text-red-500', icon: XCircle },
};

const MIN_WITHDRAWAL = 1000;
const MAX_WITHDRAWAL = 15000;

export default function ColaboradorLevantamento() {
  const { user, profile, isCollaborator, isLoading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const balanceKz = (profile?.credits || 0) * 150;
  const maxWithdrawable = Math.min(balanceKz, MAX_WITHDRAWAL);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isCollaborator) {
        navigate('/dashboard');
        return;
      }
      fetchWithdrawals();
    }
  }, [user, isCollaborator, authLoading, navigate]);

  const fetchWithdrawals = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('collaborator_withdrawals')
        .select('*')
        .eq('collaborator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum < MIN_WITHDRAWAL || amountNum > MAX_WITHDRAWAL) {
      toast({
        title: 'Valor inválido',
        description: `O valor deve estar entre ${MIN_WITHDRAWAL.toLocaleString()} e ${MAX_WITHDRAWAL.toLocaleString()} Kz.`,
        variant: 'destructive',
      });
      return;
    }

    if (amountNum > balanceKz) {
      toast({
        title: 'Saldo insuficiente',
        description: `O teu saldo disponível é de ${balanceKz.toLocaleString()} Kz.`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('collaborator_withdrawals')
        .insert({
          collaborator_id: user!.id,
          amount_kz: amountNum,
        });

      if (error) throw error;

      toast({
        title: 'Pedido enviado',
        description: 'O teu pedido de levantamento foi enviado para aprovação.',
      });

      setAmount('');
      fetchWithdrawals();
      refreshProfile();
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o pedido.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPendingWithdrawal = withdrawals.some(w => w.status === 'pending');

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/colaborador')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <ArrowDownCircle className="w-7 h-7 text-primary" />
                Solicitar Levantamento
              </h1>
              <p className="text-muted-foreground mt-1">
                Levantar saldo da tua conta
              </p>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">Saldo Disponível</p>
                <p className="text-3xl font-bold text-primary">
                  {balanceKz.toLocaleString()} Kz
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile?.credits?.toFixed(1)} créditos
                </p>
              </div>
              <Wallet className="w-12 h-12 text-primary/30" />
            </div>
          </div>

          {/* Request Form */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Novo Pedido</h2>
            
            {hasPendingWithdrawal ? (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Já tens um pedido de levantamento pendente. Aguarda a aprovação antes de fazer um novo pedido.
                </AlertDescription>
              </Alert>
            ) : balanceKz < MIN_WITHDRAWAL ? (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Saldo insuficiente. O valor mínimo de levantamento é de {MIN_WITHDRAWAL.toLocaleString()} Kz.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor a levantar (Kz)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={MIN_WITHDRAWAL}
                    max={maxWithdrawable}
                    step="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`${MIN_WITHDRAWAL.toLocaleString()} - ${maxWithdrawable.toLocaleString()}`}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Mínimo: {MIN_WITHDRAWAL.toLocaleString()} Kz • Máximo: {MAX_WITHDRAWAL.toLocaleString()} Kz por levantamento
                  </p>
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Solicitar Levantamento
                </Button>
              </form>
            )}
          </div>

          {/* Withdrawal History */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Histórico de Levantamentos</h2>
            
            {withdrawals.length === 0 ? (
              <div className="text-center py-8 bg-card rounded-xl border border-border">
                <ArrowDownCircle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Nenhum levantamento solicitado.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((withdrawal) => {
                  const StatusIcon = statusConfig[withdrawal.status].icon;
                  return (
                    <div
                      key={withdrawal.id}
                      className="bg-card rounded-xl border border-border p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-lg">
                          {withdrawal.amount_kz.toLocaleString()} Kz
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(withdrawal.created_at), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                        </p>
                        {withdrawal.admin_notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Nota: {withdrawal.admin_notes}
                          </p>
                        )}
                      </div>
                      <Badge className={statusConfig[withdrawal.status].class}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[withdrawal.status].label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}