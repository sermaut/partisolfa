import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  CreditCard,
  Clock, 
  CheckCircle, 
  XCircle,
  Download,
  Eye,
  Loader2,
  FileImage
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Deposit {
  id: string;
  user_id: string;
  amount_kz: number;
  credits_amount: number;
  status: string;
  proof_file_path: string;
  proof_file_name: string;
  admin_notes: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
    credits: number;
  };
}

const statusConfig = {
  pending: { label: 'Pendente', class: 'status-pending', icon: Clock },
  approved: { label: 'Aprovado', class: 'status-completed', icon: CheckCircle },
  rejected: { label: 'Rejeitado', class: 'status-cancelled', icon: XCircle },
};

export default function AdminDepositos() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/dashboard');
        return;
      }
      fetchDeposits();
    }
  }, [user, isAdmin, authLoading, navigate, statusFilter]);

  const fetchDeposits = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'pending' | 'approved' | 'rejected');
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user profiles for each deposit
      const depositsWithProfiles = await Promise.all(
        (data || []).map(async (deposit) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email, credits')
            .eq('user_id', deposit.user_id)
            .single();
          
          return { ...deposit, profiles: profileData };
        })
      );

      setDeposits(depositsWithProfiles);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os depósitos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDepositDetail = async (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setAdminNotes(deposit.admin_notes || '');
    
    // Get proof URL
    const { data } = await supabase.storage
      .from('deposit-proofs')
      .createSignedUrl(deposit.proof_file_path, 3600);
    
    if (data) {
      setProofUrl(data.signedUrl);
    }
  };

  const closeDialog = () => {
    setSelectedDeposit(null);
    setProofUrl(null);
    setAdminNotes('');
  };

  const processDeposit = async (action: 'approve' | 'reject') => {
    if (!selectedDeposit) return;

    setIsProcessing(true);
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      // Update deposit status
      const { error: depositError } = await supabase
        .from('deposits')
        .update({ 
          status: newStatus,
          admin_notes: adminNotes || null
        })
        .eq('id', selectedDeposit.id);

      if (depositError) throw depositError;

      // If approved, add credits to user
      if (action === 'approve') {
        const newCredits = (selectedDeposit.profiles?.credits || 0) + selectedDeposit.credits_amount;
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('user_id', selectedDeposit.user_id);

        if (profileError) throw profileError;

        // Send success notification
        await supabase.from('notifications').insert({
          user_id: selectedDeposit.user_id,
          title: 'Depósito aprovado!',
          message: `O seu depósito de ${selectedDeposit.amount_kz} Kz foi aprovado. ${selectedDeposit.credits_amount} créditos foram adicionados à sua conta.`,
        });
      } else {
        // Send rejection notification
        await supabase.from('notifications').insert({
          user_id: selectedDeposit.user_id,
          title: 'Depósito não aprovado',
          message: `O seu pedido de depósito de ${selectedDeposit.amount_kz} Kz não foi aprovado. ${adminNotes ? `Motivo: ${adminNotes}` : 'Entre em contacto para mais informações.'}`,
        });
      }

      toast({
        title: action === 'approve' ? 'Depósito aprovado' : 'Depósito rejeitado',
        description: action === 'approve' 
          ? `${selectedDeposit.credits_amount} créditos foram adicionados à conta do usuário.`
          : 'O usuário foi notificado.',
      });

      closeDialog();
      fetchDeposits();
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar o depósito.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
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
              Gerir <span className="text-gradient-gold">Depósitos</span>
            </h1>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-secondary">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deposits List */}
          {deposits.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Nenhum depósito encontrado
              </h3>
              <p className="text-muted-foreground">
                Não existem depósitos com o estado selecionado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {deposits.map((deposit) => {
                const status = statusConfig[deposit.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={deposit.id}
                    className="glass-card rounded-xl p-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {deposit.amount_kz.toLocaleString()} Kz → {deposit.credits_amount} créditos
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(deposit.created_at)}
                          </p>
                          <p className="text-sm text-primary mt-1">
                            {deposit.profiles?.full_name} ({deposit.profiles?.email})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {status.label}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDepositDetail(deposit)}
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

      {/* Deposit Detail Dialog */}
      <Dialog open={!!selectedDeposit} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Detalhes do Depósito
            </DialogTitle>
          </DialogHeader>

          {selectedDeposit && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Valor</p>
                  <p className="font-medium text-lg">{selectedDeposit.amount_kz.toLocaleString()} Kz</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Créditos</p>
                  <p className="font-medium text-lg text-primary">{selectedDeposit.credits_amount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Usuário</p>
                  <p className="font-medium">{selectedDeposit.profiles?.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">E-mail</p>
                  <p className="font-medium">{selectedDeposit.profiles?.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data</p>
                  <p className="font-medium">{formatDate(selectedDeposit.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Saldo Actual</p>
                  <p className="font-medium">{selectedDeposit.profiles?.credits?.toFixed(1)} créditos</p>
                </div>
              </div>

              {/* Proof Image */}
              <div>
                <Label className="text-muted-foreground mb-3 block">Comprovativo</Label>
                {proofUrl ? (
                  <div className="relative">
                    {selectedDeposit.proof_file_name.toLowerCase().endsWith('.pdf') ? (
                      <div className="bg-secondary rounded-lg p-4 flex items-center gap-3">
                        <FileImage className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">{selectedDeposit.proof_file_name}</p>
                          <a
                            href={proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Abrir PDF
                          </a>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={proofUrl}
                        alt="Comprovativo"
                        className="w-full rounded-lg border border-border"
                      />
                    )}
                  </div>
                ) : (
                  <div className="bg-secondary rounded-lg p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              {selectedDeposit.status === 'pending' && (
                <div>
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Adicionar notas sobre este depósito..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="bg-secondary border-border mt-2"
                  />
                </div>
              )}

              {selectedDeposit.admin_notes && selectedDeposit.status !== 'pending' && (
                <div>
                  <Label className="text-muted-foreground">Notas do Administrador</Label>
                  <p className="mt-1 text-sm bg-secondary/50 rounded-lg p-3">
                    {selectedDeposit.admin_notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedDeposit.status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => processDeposit('reject')}
                    disabled={isProcessing}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Rejeitar
                  </Button>
                  <Button
                    variant="premium"
                    onClick={() => processDeposit('approve')}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Aprovar
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
