import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Wallet, 
  CheckCircle, 
  XCircle,
  Clock,
  Loader2,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Withdrawal {
  id: string;
  collaborator_id: string;
  amount_kz: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
  profile?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
    credits: number;
  };
}

const statusConfig = {
  pending: { label: 'Pendente', class: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
  approved: { label: 'Aprovado', class: 'bg-green-500/20 text-green-500', icon: CheckCircle },
  rejected: { label: 'Rejeitado', class: 'bg-red-500/20 text-red-500', icon: XCircle },
};

export default function AdminLevantamentos() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  
  // Process dialog
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processingWithdrawal, setProcessingWithdrawal] = useState<Withdrawal | null>(null);
  const [processAction, setProcessAction] = useState<'approved' | 'rejected'>('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/dashboard');
        return;
      }
      fetchWithdrawals();
    }
  }, [user, isAdmin, authLoading, navigate, statusFilter]);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('collaborator_withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles for each withdrawal
      const withdrawalsWithProfiles = await Promise.all(
        (data || []).map(async (withdrawal) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email, avatar_url, credits')
            .eq('user_id', withdrawal.collaborator_id)
            .single();
          
          return { ...withdrawal, profile: profileData };
        })
      );

      setWithdrawals(withdrawalsWithProfiles);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os levantamentos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!processingWithdrawal || !user) return;
    
    setIsProcessing(true);
    try {
      // Update withdrawal status
      const { error } = await supabase
        .from('collaborator_withdrawals')
        .update({ 
          status: processAction as 'approved' | 'rejected',
          admin_notes: adminNotes || null,
          processed_at: new Date().toISOString(),
          processed_by: user.id
        })
        .eq('id', processingWithdrawal.id);

      if (error) throw error;

      // If approved, deduct from collaborator's balance
      if (processAction === 'approved' && processingWithdrawal.profile) {
        const creditsToDeduct = processingWithdrawal.amount_kz / 150;
        const newCredits = Math.max(0, processingWithdrawal.profile.credits - creditsToDeduct);
        
        await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('user_id', processingWithdrawal.collaborator_id);
      }

      // Send notification
      const message = processAction === 'approved'
        ? `O teu pedido de levantamento de ${processingWithdrawal.amount_kz.toLocaleString()} Kz foi aprovado.${adminNotes ? ` Nota: ${adminNotes}` : ''}`
        : `O teu pedido de levantamento de ${processingWithdrawal.amount_kz.toLocaleString()} Kz foi rejeitado.${adminNotes ? ` Motivo: ${adminNotes}` : ''}`;

      await supabase.from('notifications').insert({
        user_id: processingWithdrawal.collaborator_id,
        title: processAction === 'approved' ? 'Levantamento Aprovado' : 'Levantamento Rejeitado',
        message,
      });

      toast({
        title: processAction === 'approved' ? 'Levantamento aprovado' : 'Levantamento rejeitado',
        description: 'O colaborador foi notificado.',
      });

      setShowProcessDialog(false);
      setProcessingWithdrawal(null);
      setAdminNotes('');
      fetchWithdrawals();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar o levantamento.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter(w =>
    w.profile?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.profile?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <Wallet className="w-7 h-7 text-primary" />
                  Levantamentos
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gerir pedidos de levantamento dos colaboradores
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Withdrawals List */}
          {filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'Nenhum levantamento encontrado.' : 'Nenhum pedido de levantamento.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredWithdrawals.map((withdrawal) => {
                const StatusIcon = statusConfig[withdrawal.status].icon;
                return (
                  <motion.div
                    key={withdrawal.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={withdrawal.profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {withdrawal.profile?.full_name?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{withdrawal.profile?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{withdrawal.profile?.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(withdrawal.created_at), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {withdrawal.amount_kz.toLocaleString()} Kz
                        </p>
                        <Badge className={statusConfig[withdrawal.status].class}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[withdrawal.status].label}
                        </Badge>
                      </div>
                      
                      {withdrawal.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-500 hover:text-green-500"
                            onClick={() => {
                              setProcessingWithdrawal(withdrawal);
                              setProcessAction('approved');
                              setShowProcessDialog(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setProcessingWithdrawal(withdrawal);
                              setProcessAction('rejected');
                              setShowProcessDialog(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Process Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>
              {processAction === 'approved' ? 'Aprovar Levantamento' : 'Rejeitar Levantamento'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Colaborador: <span className="font-medium text-foreground">{processingWithdrawal?.profile?.full_name}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Valor: <span className="font-medium text-foreground">{processingWithdrawal?.amount_kz.toLocaleString()} Kz</span>
            </p>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas {processAction === 'rejected' && '(motivo)'}</Label>
              <Textarea
                id="notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={processAction === 'approved' ? 'Notas opcionais...' : 'Motivo da rejeição...'}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleProcess} 
              disabled={isProcessing}
              variant={processAction === 'approved' ? 'default' : 'destructive'}
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {processAction === 'approved' ? 'Aprovar' : 'Rejeitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}