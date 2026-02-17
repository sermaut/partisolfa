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
  Mail,
  Gift,
  ClipboardList,
  Wallet,
  UserPlus,
  Sparkles,
  Save,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogSection,
  FullscreenImage,
} from '@/components/ui/responsive-dialog';
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

interface EditFormData {
  full_name: string;
  email: string;
  phone: string;
  credits: string;
}

export default function AdminUsuarios() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteProfile, setDeleteProfile] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // User details dialog
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [detailsProfile, setDetailsProfile] = useState<Profile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    full_name: '',
    email: '',
    phone: '',
    credits: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Fullscreen image
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);

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
        .order('full_name', { ascending: true });

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
      // Fetch all data in parallel for speed
      const [tasksRes, depositsRes, referrerRes, referredCountRes] = await Promise.all([
        supabase.from('tasks').select('status').eq('user_id', profile.user_id),
        supabase.from('deposits').select('status, amount_kz').eq('user_id', profile.user_id),
        profile.referred_by 
          ? supabase.from('profiles').select('full_name').eq('user_id', profile.referred_by).single()
          : Promise.resolve({ data: null }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('referred_by', profile.user_id),
      ]);

      const tasks = tasksRes.data || [];
      const deposits = depositsRes.data || [];

      setUserStats({
        tasksTotal: tasks.length,
        tasksPending: tasks.filter(t => t.status === 'pending').length,
        tasksInProgress: tasks.filter(t => t.status === 'in_progress').length,
        tasksCompleted: tasks.filter(t => t.status === 'completed').length,
        tasksCancelled: tasks.filter(t => t.status === 'cancelled').length,
        depositsApproved: deposits.filter(d => d.status === 'approved').length,
        depositsPending: deposits.filter(d => d.status === 'pending').length,
        totalDepositedKz: deposits.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.amount_kz, 0),
        referredBy: referrerRes.data?.full_name || null,
        referredCount: referredCountRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const openDetailsDialog = async (profile: Profile) => {
    setDetailsProfile(profile);
    setEditForm({
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone || '',
      credits: profile.credits.toString(),
    });
    setIsEditing(false);
    setShowDetailsDialog(true);
    await fetchUserStats(profile);
  };

  const closeDetailsDialog = () => {
    setShowDetailsDialog(false);
    setDetailsProfile(null);
    setUserStats(null);
    setIsEditing(false);
    setShowFullscreenImage(false);
  };

  const handleSaveChanges = async () => {
    if (!detailsProfile) return;

    const newCredits = parseFloat(editForm.credits);
    if (isNaN(newCredits) || newCredits < 0) {
      toast({
        title: 'Valor inválido',
        description: 'Por favor, insira um valor válido para os créditos.',
        variant: 'destructive',
      });
      return;
    }

    if (!editForm.full_name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, insira um nome válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim() || null,
          credits: newCredits,
        })
        .eq('id', detailsProfile.id);

      if (error) throw error;

      // Send notification if credits changed
      const creditDiff = newCredits - detailsProfile.credits;
      if (creditDiff !== 0) {
        await supabase.from('notifications').insert({
          user_id: detailsProfile.user_id,
          title: creditDiff > 0 ? 'Créditos adicionados' : 'Ajuste de créditos',
          message: creditDiff > 0 
            ? `Foram adicionados ${creditDiff.toFixed(1)} créditos à sua conta.`
            : `O seu saldo de créditos foi ajustado.`,
        });
      }

      toast({
        title: 'Dados actualizados',
        description: 'As informações do usuário foram alteradas com sucesso.',
      });

      // Update local state
      const updatedProfile = {
        ...detailsProfile,
        full_name: editForm.full_name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || null,
        credits: newCredits,
      };
      setDetailsProfile(updatedProfile);
      setProfiles(prev => prev.map(p => p.id === detailsProfile.id ? updatedProfile : p));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível actualizar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteProfile) return;

    setIsDeleting(true);
    try {
      // Delete all user data in parallel where possible
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
          // Delete files in parallel
          await Promise.all(taskFiles.map(file => {
            const bucket = file.is_result ? 'result-files' : 'task-files';
            return supabase.storage.from(bucket).remove([file.file_path]);
          }));
        }

        // Delete records in parallel
        await Promise.all([
          supabase.from('task_files').delete().in('task_id', taskIds),
          supabase.from('task_assignments').delete().in('task_id', taskIds),
          supabase.from('tasks').delete().eq('user_id', deleteProfile.user_id),
        ]);
      }

      // Delete deposits and files
      const { data: userDeposits } = await supabase
        .from('deposits')
        .select('proof_file_path')
        .eq('user_id', deleteProfile.user_id);

      if (userDeposits) {
        await Promise.all(userDeposits.map(deposit => 
          supabase.storage.from('deposit-proofs').remove([deposit.proof_file_path])
        ));
      }

      // Delete remaining user data in parallel
      await Promise.all([
        supabase.from('deposits').delete().eq('user_id', deleteProfile.user_id),
        supabase.from('notifications').delete().eq('user_id', deleteProfile.user_id),
        supabase.from('referrals').delete().eq('referrer_id', deleteProfile.user_id),
        supabase.from('referrals').delete().eq('referred_id', deleteProfile.user_id),
        supabase.from('collaborator_withdrawals').delete().eq('collaborator_id', deleteProfile.user_id),
        supabase.from('user_roles').delete().eq('user_id', deleteProfile.user_id),
      ]);

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
      profile.email.toLowerCase().includes(query) ||
      (profile.phone && profile.phone.includes(query))
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
      <div className="container mx-auto px-4 py-6 sm:py-8">
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              <span className="text-gradient-gold">Usuários</span>
            </h1>

            <div className="relative w-full sm:w-80">
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
            <div className="glass-card rounded-xl p-8 sm:p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Tente ajustar a pesquisa.' : 'Não existem usuários registados.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredProfiles.map((profile) => (
                <motion.div
                  key={profile.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="glass-card rounded-xl p-4 sm:p-5 cursor-pointer transition-all hover:border-primary/30"
                  onClick={() => openDetailsDialog(profile)}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-display font-bold text-sm sm:text-base">
                          {profile.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{profile.full_name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteProfile(profile);
                      }}
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span className="font-medium text-primary">{profile.credits.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">{formatDate(profile.created_at)}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        <span className="truncate">{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* User Details Dialog */}
      <ResponsiveDialog open={showDetailsDialog} onOpenChange={(open) => {
        if (!open) closeDetailsDialog();
      }}>
        <ResponsiveDialogContent variant="premium" size="lg">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="flex items-center gap-3">
              <div className="icon-container-premium">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              {isEditing ? 'Editar Usuário' : 'Detalhes do Usuário'}
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>

          <ResponsiveDialogBody>
            {detailsProfile && (
              <div className="space-y-4 sm:space-y-6">
                {/* Profile Header */}
                <ResponsiveDialogSection delay={0.1}>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5 modal-gradient-premium rounded-xl border border-primary/20">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => detailsProfile.avatar_url && setShowFullscreenImage(true)}
                    >
                      <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                        <AvatarImage src={detailsProfile.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/20 text-primary font-display font-bold text-2xl sm:text-3xl">
                          {detailsProfile.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {detailsProfile.avatar_url && (
                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs text-white">Ver</span>
                        </div>
                      )}
                    </div>
                    <div className="text-center sm:text-left flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Nome</Label>
                            <Input
                              value={editForm.full_name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                              className="bg-secondary mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Email</Label>
                            <Input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                              className="bg-secondary mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Telefone</Label>
                            <Input
                              value={editForm.phone}
                              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="Opcional"
                              className="bg-secondary mt-1"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-lg sm:text-xl truncate">{detailsProfile.full_name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{detailsProfile.email}</span>
                          </p>
                          {detailsProfile.phone && (
                            <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{detailsProfile.phone}</span>
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </ResponsiveDialogSection>

                <div className="divider-gradient" />

                {/* Basic Info */}
                <ResponsiveDialogSection delay={0.15}>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="stat-card">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Wallet className="w-3.5 h-3.5" />
                        Créditos
                      </div>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={editForm.credits}
                          onChange={(e) => setEditForm(prev => ({ ...prev, credits: e.target.value }))}
                          className="bg-background/50 h-8 text-sm"
                        />
                      ) : (
                        <p className="font-semibold text-base sm:text-lg text-primary">{detailsProfile.credits.toFixed(1)}</p>
                      )}
                    </div>
                    <div className="stat-card">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Data de Registo
                      </div>
                      <p className="font-medium text-sm sm:text-base">{formatDate(detailsProfile.created_at)}</p>
                    </div>
                    <div className="stat-card col-span-2">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Gift className="w-3.5 h-3.5" />
                        Código de Convite
                      </div>
                      <p className="font-mono font-medium text-primary text-sm sm:text-base">{detailsProfile.referral_code || 'N/A'}</p>
                    </div>
                  </div>
                </ResponsiveDialogSection>

                <div className="divider-gradient" />

                {/* Stats */}
                {isLoadingStats ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : userStats && (
                  <>
                    {/* Tasks Stats */}
                    <ResponsiveDialogSection delay={0.2}>
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2 text-sm">
                          <ClipboardList className="w-4 h-4 text-primary" />
                          Solicitações
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="stat-card">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-semibold text-base sm:text-lg">{userStats.tasksTotal}</p>
                          </div>
                          <div className="stat-card border-l-2 border-warning/50">
                            <p className="text-xs text-muted-foreground">Pendentes</p>
                            <p className="font-semibold text-base sm:text-lg text-warning">{userStats.tasksPending}</p>
                          </div>
                          <div className="stat-card border-l-2 border-primary/50">
                            <p className="text-xs text-muted-foreground">Em Progresso</p>
                            <p className="font-semibold text-base sm:text-lg text-primary">{userStats.tasksInProgress}</p>
                          </div>
                          <div className="stat-card border-l-2 border-success/50">
                            <p className="text-xs text-muted-foreground">Concluídas</p>
                            <p className="font-semibold text-base sm:text-lg text-success">{userStats.tasksCompleted}</p>
                          </div>
                        </div>
                      </div>
                    </ResponsiveDialogSection>

                    {/* Deposits Stats */}
                    <ResponsiveDialogSection delay={0.25}>
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2 text-sm">
                          <CreditCard className="w-4 h-4 text-primary" />
                          Depósitos
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="stat-card border-l-2 border-success/50">
                            <p className="text-xs text-muted-foreground">Aprovados</p>
                            <p className="font-semibold text-base sm:text-lg text-success">{userStats.depositsApproved}</p>
                          </div>
                          <div className="stat-card border-l-2 border-warning/50">
                            <p className="text-xs text-muted-foreground">Pendentes</p>
                            <p className="font-semibold text-base sm:text-lg text-warning">{userStats.depositsPending}</p>
                          </div>
                          <div className="stat-card col-span-2 modal-gradient-premium border border-primary/20">
                            <p className="text-xs text-muted-foreground">Total Depositado</p>
                            <p className="font-semibold text-lg sm:text-xl text-primary flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              {userStats.totalDepositedKz.toLocaleString()} Kz
                            </p>
                          </div>
                        </div>
                      </div>
                    </ResponsiveDialogSection>

                    {/* Referrals */}
                    <ResponsiveDialogSection delay={0.3}>
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2 text-sm">
                          <UserPlus className="w-4 h-4 text-primary" />
                          Convites
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="stat-card">
                            <p className="text-xs text-muted-foreground">Convidado por</p>
                            <p className="font-medium text-sm truncate">{userStats.referredBy || 'Ninguém'}</p>
                          </div>
                          <div className="stat-card">
                            <p className="text-xs text-muted-foreground">Pessoas Convidadas</p>
                            <p className="font-semibold text-base sm:text-lg">{userStats.referredCount}</p>
                          </div>
                        </div>
                      </div>
                    </ResponsiveDialogSection>
                  </>
                )}
              </div>
            )}
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter>
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    if (detailsProfile) {
                      setEditForm({
                        full_name: detailsProfile.full_name,
                        email: detailsProfile.email,
                        phone: detailsProfile.phone || '',
                        credits: detailsProfile.credits.toString(),
                      });
                    }
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  variant="premium"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Guardar
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={closeDetailsDialog} className="w-full sm:w-auto">
                  Fechar
                </Button>
                <Button
                  variant="premium"
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </>
            )}
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* Fullscreen Image */}
      <FullscreenImage
        src={detailsProfile?.avatar_url || ''}
        alt={detailsProfile?.full_name || 'Avatar'}
        isOpen={showFullscreenImage}
        onClose={() => setShowFullscreenImage(false)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProfile} onOpenChange={(open) => !open && setDeleteProfile(null)}>
        <AlertDialogContent className="bg-card max-w-[95vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Eliminar Usuário
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              Tem a certeza que deseja eliminar o usuário <strong>{deleteProfile?.full_name}</strong>?
              <br /><br />
              Esta acção irá eliminar permanentemente:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
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
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
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
