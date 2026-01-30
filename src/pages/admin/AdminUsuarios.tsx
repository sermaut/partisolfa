import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Users,
  Search,
  CreditCard,
  Calendar,
  Edit,
  Loader2,
  Trash2,
  Phone,
  AlertTriangle,
  Eye,
  Mail,
  Gift,
  ClipboardList,
  Wallet,
  UserPlus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  credits: number;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  referral_code: string | null;
  referred_by: string | null;
}

interface UserStats {
  tasksTotal: number;
  tasksPending: number;
  tasksInProgress: number;
  tasksCompleted: number;
  tasksCancelled: number;
  depositsApproved: number;
  depositsPending: number;
  totalDepositedKz: number;
  referredBy: string | null;
  referredCount: number;
}

export default function AdminUsuarios() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [editCredits, setEditCredits] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteProfile, setDeleteProfile] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // User details dialog
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [detailsProfile, setDetailsProfile] = useState<Profile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/dashboard');
        return;
      }
      fetchProfiles();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async (profile: Profile) => {
    setIsLoadingStats(true);
    try {
      // Fetch tasks stats
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status')
        .eq('user_id', profile.user_id);

      // Fetch deposits stats
      const { data: deposits } = await supabase
        .from('deposits')
        .select('status, amount_kz')
        .eq('user_id', profile.user_id);

      // Fetch referrer info
      let referredByName = null;
      if (profile.referred_by) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', profile.referred_by)
          .single();
        referredByName = referrer?.full_name || null;
      }

      // Fetch referred count
      const { count: referredCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', profile.user_id);

      const taskStats = {
        tasksTotal: tasks?.length || 0,
        tasksPending: tasks?.filter(t => t.status === 'pending').length || 0,
        tasksInProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
        tasksCompleted: tasks?.filter(t => t.status === 'completed').length || 0,
        tasksCancelled: tasks?.filter(t => t.status === 'cancelled').length || 0,
      };

      const depositStats = {
        depositsApproved: deposits?.filter(d => d.status === 'approved').length || 0,
        depositsPending: deposits?.filter(d => d.status === 'pending').length || 0,
        totalDepositedKz: deposits?.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.amount_kz, 0) || 0,
      };

      setUserStats({
        ...taskStats,
        ...depositStats,
        referredBy: referredByName,
        referredCount: referredCount || 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const openDetailsDialog = async (profile: Profile) => {
    setDetailsProfile(profile);
    setShowDetailsDialog(true);
    await fetchUserStats(profile);
  };

  const openEditDialog = (profile: Profile) => {
    setSelectedProfile(profile);
    setEditCredits(profile.credits.toString());
  };

  const closeDialog = () => {
    setSelectedProfile(null);
    setEditCredits('');
  };

  const updateCredits = async () => {
    if (!selectedProfile) return;

    const newCredits = parseFloat(editCredits);
    if (isNaN(newCredits) || newCredits < 0) {
      toast({
        title: 'Valor inválido',
        description: 'Por favor, insira um valor válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', selectedProfile.id);

      if (error) throw error;

      // Send notification
      const creditDiff = newCredits - selectedProfile.credits;
      if (creditDiff !== 0) {
        await supabase.from('notifications').insert({
          user_id: selectedProfile.user_id,
          title: creditDiff > 0 ? 'Créditos adicionados' : 'Ajuste de créditos',
          message: creditDiff > 0 
            ? `Foram adicionados ${creditDiff.toFixed(1)} créditos à sua conta.`
            : `O seu saldo de créditos foi ajustado.`,
        });
      }

      toast({
        title: 'Créditos actualizados',
        description: 'O saldo do usuário foi alterado com sucesso.',
      });

      closeDialog();
      fetchProfiles();
    } catch (error) {
      console.error('Error updating credits:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível actualizar os créditos.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteProfile) return;

    setIsDeleting(true);
    try {
      // Delete user's tasks and associated files
      const { data: userTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', deleteProfile.user_id);

      if (userTasks && userTasks.length > 0) {
        const taskIds = userTasks.map(t => t.id);
        
        // Get task files to delete from storage
        const { data: taskFiles } = await supabase
          .from('task_files')
          .select('file_path, is_result')
          .in('task_id', taskIds);

        if (taskFiles) {
          for (const file of taskFiles) {
            const bucket = file.is_result ? 'result-files' : 'task-files';
            await supabase.storage.from(bucket).remove([file.file_path]);
          }
        }

        // Delete task files records
        await supabase.from('task_files').delete().in('task_id', taskIds);
        
        // Delete task assignments
        await supabase.from('task_assignments').delete().in('task_id', taskIds);
        
        // Delete tasks
        await supabase.from('tasks').delete().eq('user_id', deleteProfile.user_id);
      }

      // Delete user's deposits and associated files
      const { data: userDeposits } = await supabase
        .from('deposits')
        .select('proof_file_path')
        .eq('user_id', deleteProfile.user_id);

      if (userDeposits) {
        for (const deposit of userDeposits) {
          await supabase.storage.from('deposit-proofs').remove([deposit.proof_file_path]);
        }
      }

      await supabase.from('deposits').delete().eq('user_id', deleteProfile.user_id);

      // Delete user's notifications
      await supabase.from('notifications').delete().eq('user_id', deleteProfile.user_id);

      // Delete referrals
      await supabase.from('referrals').delete().eq('referrer_id', deleteProfile.user_id);
      await supabase.from('referrals').delete().eq('referred_id', deleteProfile.user_id);

      // Delete collaborator withdrawals
      await supabase.from('collaborator_withdrawals').delete().eq('collaborator_id', deleteProfile.user_id);

      // Delete user roles
      await supabase.from('user_roles').delete().eq('user_id', deleteProfile.user_id);

      // Delete avatar if exists
      if (deleteProfile.avatar_url) {
        const avatarPath = deleteProfile.avatar_url.split('/avatars/')[1];
        if (avatarPath) {
          await supabase.storage.from('avatars').remove([avatarPath]);
        }
      }

      // Delete profile
      await supabase.from('profiles').delete().eq('id', deleteProfile.id);

      toast({
        title: 'Usuário eliminado',
        description: 'O usuário e todos os seus dados foram eliminados com sucesso.',
      });

      setDeleteProfile(null);
      fetchProfiles();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível eliminar o usuário.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      profile.full_name.toLowerCase().includes(query) ||
      profile.email.toLowerCase().includes(query)
    );
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
              <span className="text-gradient-gold">Usuários</span>
            </h1>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary"
              />
            </div>
          </div>

          {/* Users List */}
          {filteredProfiles.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Tente ajustar a pesquisa.' : 'Não existem usuários registados.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="glass-card rounded-xl p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-display font-bold">
                          {profile.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{profile.full_name}</h3>
                        <p className="text-sm text-muted-foreground truncate max-w-[160px]">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openDetailsDialog(profile)}
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(profile)}
                        title="Editar créditos"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteProfile(profile)}
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-medium text-primary">{profile.credits.toFixed(1)} créditos</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(profile.created_at)}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                        <Phone className="w-4 h-4" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={(open) => {
        if (!open) {
          setDetailsProfile(null);
          setUserStats(null);
        }
        setShowDetailsDialog(open);
      }}>
        <DialogContent className="max-w-lg bg-card max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Detalhes do Usuário
            </DialogTitle>
          </DialogHeader>

          {detailsProfile && (
            <ScrollArea className="max-h-[65vh] pr-4">
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-xl">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={detailsProfile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary font-display font-bold text-xl">
                      {detailsProfile.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{detailsProfile.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{detailsProfile.email}</p>
                    {detailsProfile.phone && (
                      <p className="text-sm text-muted-foreground">{detailsProfile.phone}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Wallet className="w-4 h-4" />
                      Créditos
                    </div>
                    <p className="font-semibold text-lg text-primary">{detailsProfile.credits.toFixed(1)}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4" />
                      Data de Registo
                    </div>
                    <p className="font-medium">{formatDate(detailsProfile.created_at)}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Gift className="w-4 h-4" />
                      Código de Convite
                    </div>
                    <p className="font-mono font-medium text-primary">{detailsProfile.referral_code || 'N/A'}</p>
                  </div>
                </div>

                <Separator />

                {/* Stats */}
                {isLoadingStats ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : userStats && (
                  <>
                    {/* Tasks Stats */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-primary" />
                        Solicitações
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-semibold">{userStats.tasksTotal}</p>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Pendentes</p>
                          <p className="font-semibold text-yellow-500">{userStats.tasksPending}</p>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Em Progresso</p>
                          <p className="font-semibold text-blue-500">{userStats.tasksInProgress}</p>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Concluídas</p>
                          <p className="font-semibold text-green-500">{userStats.tasksCompleted}</p>
                        </div>
                      </div>
                    </div>

                    {/* Deposits Stats */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        Depósitos
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Aprovados</p>
                          <p className="font-semibold text-green-500">{userStats.depositsApproved}</p>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Pendentes</p>
                          <p className="font-semibold text-yellow-500">{userStats.depositsPending}</p>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg col-span-2">
                          <p className="text-xs text-muted-foreground">Total Depositado</p>
                          <p className="font-semibold text-primary">{userStats.totalDepositedKz.toLocaleString()} Kz</p>
                        </div>
                      </div>
                    </div>

                    {/* Referrals */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-primary" />
                        Convites
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Convidado por</p>
                          <p className="font-medium">{userStats.referredBy || 'Ninguém'}</p>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Pessoas Convidadas</p>
                          <p className="font-semibold">{userStats.referredCount}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Credits Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Editar Créditos
            </DialogTitle>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedProfile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary font-display font-bold">
                    {selectedProfile.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedProfile.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedProfile.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Saldo de Créditos</Label>
                <Input
                  id="credits"
                  type="number"
                  step="0.1"
                  min="0"
                  value={editCredits}
                  onChange={(e) => setEditCredits(e.target.value)}
                  className="bg-secondary"
                />
                <p className="text-xs text-muted-foreground">
                  Saldo actual: {selectedProfile.credits.toFixed(1)} créditos
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button
                  variant="premium"
                  onClick={updateCredits}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Guardar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProfile} onOpenChange={(open) => !open && setDeleteProfile(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Eliminar Usuário
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar o usuário <strong>{deleteProfile?.full_name}</strong>?
              <br /><br />
              Esta acção irá eliminar permanentemente:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Perfil do usuário</li>
                <li>Todas as solicitações</li>
                <li>Todos os depósitos</li>
                <li>Todas as notificações</li>
                <li>Todos os ficheiros associados</li>
              </ul>
              <br />
              <strong className="text-destructive">Esta acção não pode ser desfeita.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
