import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  Wallet,
  ArrowUpDown,
  Ban,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Music,
  FileMusic,
  Headphones,
  AlertTriangle
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
  AnimatedDialog,
  AnimatedDialogContent,
  AnimatedDialogHeader,
  AnimatedDialogTitle,
  AnimatedDialogFooter,
  AnimatedDialogSection,
} from '@/components/ui/animated-dialog';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface TaskAssignmentInfo {
  id: string;
  task_id: string;
  status: string;
  assigned_at: string;
  task_title: string;
  task_service: string;
}

interface Collaborator {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  credits: number;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  tasks?: TaskAssignmentInfo[];
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
}

const serviceConfig = {
  aperfeicoamento: { label: 'Aperfeiçoamento', icon: Music },
  arranjo: { label: 'Arranjo Musical', icon: FileMusic },
  acc: { label: 'Criação de ACCs', icon: Headphones },
};

const taskStatusConfig = {
  pending: { label: 'Pendente', class: 'bg-yellow-500/20 text-yellow-500' },
  accepted: { label: 'Aceite', class: 'bg-green-500/20 text-green-500' },
  rejected: { label: 'Rejeitada', class: 'bg-red-500/20 text-red-500' },
  cancelled: { label: 'Cancelada', class: 'bg-muted text-muted-foreground' },
};

export default function AdminColaboradores() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCollaborators, setExpandedCollaborators] = useState<Set<string>>(new Set());
  
  // Add collaborator dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Edit credits dialog
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [newCredits, setNewCredits] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Delete dialog (remove role only)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCollaborator, setDeletingCollaborator] = useState<Collaborator | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Delete completely dialog
  const [showDeleteCompletelyDialog, setShowDeleteCompletelyDialog] = useState(false);
  const [deletingCompletelyCollaborator, setDeletingCompletelyCollaborator] = useState<Collaborator | null>(null);
  const [isDeletingCompletely, setIsDeletingCompletely] = useState(false);

  const toggleCollaboratorExpanded = (userId: string) => {
    setExpandedCollaborators(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/dashboard');
        return;
      }
      fetchCollaborators();
      fetchAllUsers();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchCollaborators = async () => {
    setIsLoading(true);
    try {
      // Get all users with collaborator role
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'collaborator');

      if (rolesError) throw rolesError;

      if (roles && roles.length > 0) {
        const userIds = roles.map(r => r.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds)
          .order('full_name');

        if (profilesError) throw profilesError;

        // Fetch task assignments for all collaborators
        const { data: allAssignments, error: assignmentsError } = await supabase
          .from('task_assignments')
          .select('id, task_id, collaborator_id, status, assigned_at')
          .in('collaborator_id', userIds)
          .order('assigned_at', { ascending: false });

        if (assignmentsError) throw assignmentsError;

        // Fetch task details for all assignments
        const taskIds = [...new Set((allAssignments || []).map(a => a.task_id))];
        let tasksMap: Record<string, { title: string; service_type: string }> = {};
        
        if (taskIds.length > 0) {
          const { data: tasks } = await supabase
            .from('tasks')
            .select('id, title, service_type')
            .in('id', taskIds);
          
          if (tasks) {
            tasksMap = tasks.reduce((acc, t) => {
              acc[t.id] = { title: t.title, service_type: t.service_type };
              return acc;
            }, {} as Record<string, { title: string; service_type: string }>);
          }
        }

        // Map assignments to collaborators
        const collaboratorsWithTasks = (profiles || []).map(profile => {
          const collaboratorAssignments = (allAssignments || [])
            .filter(a => a.collaborator_id === profile.user_id)
            .map(a => ({
              id: a.id,
              task_id: a.task_id,
              status: a.status,
              assigned_at: a.assigned_at,
              task_title: tasksMap[a.task_id]?.title || 'Tarefa',
              task_service: tasksMap[a.task_id]?.service_type || 'aperfeicoamento',
            }));
          
          return { ...profile, tasks: collaboratorAssignments };
        });

        setCollaborators(collaboratorsWithTasks);
      } else {
        setCollaborators([]);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os colaboradores.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      // Get users that are NOT already collaborators or admins
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['collaborator', 'admin']);

      const excludeIds = existingRoles?.map(r => r.user_id) || [];

      let query = supabase
        .from('profiles')
        .select('id, user_id, full_name, email')
        .order('full_name');

      if (excludeIds.length > 0) {
        query = query.not('user_id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddCollaborator = async () => {
    if (!selectedUserId) return;
    
    setIsAdding(true);
    try {
      // Add collaborator role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: selectedUserId, role: 'collaborator' });

      if (error) throw error;

      // Send notification
      await supabase.from('notifications').insert({
        user_id: selectedUserId,
        title: 'Bem-vindo à equipa!',
        message: 'Foste adicionado como colaborador. Agora podes receber tarefas e gerir o teu saldo.',
      });

      toast({
        title: 'Colaborador adicionado',
        description: 'O utilizador foi adicionado como colaborador.',
      });

      setShowAddDialog(false);
      setSelectedUserId('');
      fetchCollaborators();
      fetchAllUsers();
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o colaborador.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateCredits = async () => {
    if (!editingCollaborator || newCredits === '') return;
    
    const credits = parseFloat(newCredits);
    if (isNaN(credits) || credits < 0) {
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
        .update({ credits })
        .eq('user_id', editingCollaborator.user_id);

      if (error) throw error;

      // Send notification
      const diff = credits - editingCollaborator.credits;
      const action = diff >= 0 ? 'adicionados' : 'removidos';
      await supabase.from('notifications').insert({
        user_id: editingCollaborator.user_id,
        title: 'Saldo actualizado',
        message: `O teu saldo foi actualizado. Foram ${action} ${Math.abs(diff).toFixed(1)} créditos. Saldo actual: ${credits.toFixed(1)} créditos.`,
      });

      toast({
        title: 'Saldo actualizado',
        description: 'O saldo do colaborador foi actualizado.',
      });

      setShowEditDialog(false);
      setEditingCollaborator(null);
      setNewCredits('');
      fetchCollaborators();
    } catch (error) {
      console.error('Error updating credits:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível actualizar o saldo.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveCollaborator = async () => {
    if (!deletingCollaborator) return;
    
    setIsDeleting(true);
    try {
      // Remove collaborator role (don't delete the user)
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', deletingCollaborator.user_id)
        .eq('role', 'collaborator');

      if (error) throw error;

      // Send notification
      await supabase.from('notifications').insert({
        user_id: deletingCollaborator.user_id,
        title: 'Função de colaborador removida',
        message: 'A tua função de colaborador foi removida. Continuas a ter acesso à plataforma como utilizador regular.',
      });

      toast({
        title: 'Colaborador removido',
        description: 'A função de colaborador foi removida.',
      });

      setShowDeleteDialog(false);
      setDeletingCollaborator(null);
      fetchCollaborators();
      fetchAllUsers();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o colaborador.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCollaboratorCompletely = async () => {
    if (!deletingCompletelyCollaborator) return;
    
    setIsDeletingCompletely(true);
    try {
      // Delete user's tasks and associated files
      const { data: userTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', deletingCompletelyCollaborator.user_id);

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
        await supabase.from('tasks').delete().eq('user_id', deletingCompletelyCollaborator.user_id);
      }

      // Delete task assignments where user is collaborator
      await supabase.from('task_assignments').delete().eq('collaborator_id', deletingCompletelyCollaborator.user_id);

      // Delete user's deposits and associated files
      const { data: userDeposits } = await supabase
        .from('deposits')
        .select('proof_file_path')
        .eq('user_id', deletingCompletelyCollaborator.user_id);

      if (userDeposits) {
        for (const deposit of userDeposits) {
          await supabase.storage.from('deposit-proofs').remove([deposit.proof_file_path]);
        }
      }

      await supabase.from('deposits').delete().eq('user_id', deletingCompletelyCollaborator.user_id);

      // Delete user's notifications
      await supabase.from('notifications').delete().eq('user_id', deletingCompletelyCollaborator.user_id);

      // Delete referrals
      await supabase.from('referrals').delete().eq('referrer_id', deletingCompletelyCollaborator.user_id);
      await supabase.from('referrals').delete().eq('referred_id', deletingCompletelyCollaborator.user_id);

      // Delete collaborator withdrawals
      await supabase.from('collaborator_withdrawals').delete().eq('collaborator_id', deletingCompletelyCollaborator.user_id);

      // Delete user roles
      await supabase.from('user_roles').delete().eq('user_id', deletingCompletelyCollaborator.user_id);

      // Delete avatar if exists
      if (deletingCompletelyCollaborator.avatar_url) {
        const avatarPath = deletingCompletelyCollaborator.avatar_url.split('/avatars/')[1];
        if (avatarPath) {
          await supabase.storage.from('avatars').remove([avatarPath]);
        }
      }

      // Delete profile
      await supabase.from('profiles').delete().eq('id', deletingCompletelyCollaborator.id);

      toast({
        title: 'Colaborador eliminado',
        description: 'O colaborador e todos os seus dados foram eliminados com sucesso.',
      });

      setShowDeleteCompletelyDialog(false);
      setDeletingCompletelyCollaborator(null);
      fetchCollaborators();
      fetchAllUsers();
    } catch (error) {
      console.error('Error deleting collaborator:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível eliminar o colaborador.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingCompletely(false);
    }
  };

  const filteredCollaborators = collaborators.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
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
                  <Users className="w-7 h-7 text-primary" />
                  Colaboradores
                </h1>
                <p className="text-muted-foreground mt-1">
                  {collaborators.length} colaborador{collaborators.length !== 1 ? 'es' : ''} registado{collaborators.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Colaborador
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Collaborators Grid */}
          {filteredCollaborators.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'Nenhum colaborador encontrado.' : 'Nenhum colaborador registado.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCollaborators.map((collaborator) => {
                const isExpanded = expandedCollaborators.has(collaborator.user_id);
                const taskCount = collaborator.tasks?.length || 0;
                
                return (
                  <motion.div
                    key={collaborator.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card rounded-xl border border-border overflow-hidden"
                  >
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={collaborator.avatar_url || ''} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {collaborator.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{collaborator.full_name}</p>
                          <p className="text-sm text-muted-foreground">{collaborator.email}</p>
                          {collaborator.phone && (
                            <p className="text-sm text-muted-foreground">{collaborator.phone}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="text-base px-3 py-1">
                          <Wallet className="w-4 h-4 mr-2" />
                          {collaborator.credits.toFixed(1)} créditos
                        </Badge>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCollaboratorExpanded(collaborator.user_id)}
                            className="gap-1"
                          >
                            <ClipboardList className="w-4 h-4" />
                            {taskCount}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCollaborator(collaborator);
                              setNewCredits(collaborator.credits.toString());
                              setShowEditDialog(true);
                            }}
                          >
                            <ArrowUpDown className="w-4 h-4 mr-1" />
                            Saldo
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeletingCollaborator(collaborator);
                              setShowDeleteDialog(true);
                            }}
                            title="Remover função"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeletingCompletelyCollaborator(collaborator);
                              setShowDeleteCompletelyDialog(true);
                            }}
                            title="Eliminar completamente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expandable Tasks Section */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border pt-4 bg-muted/30">
                        {taskCount === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            Nenhuma tarefa atribuída
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground mb-3">
                              Tarefas Atribuídas ({taskCount})
                            </p>
                            {collaborator.tasks?.slice(0, 5).map((task) => {
                              const ServiceIcon = serviceConfig[task.task_service as keyof typeof serviceConfig]?.icon || Music;
                              const serviceLabel = serviceConfig[task.task_service as keyof typeof serviceConfig]?.label || 'Serviço';
                              const statusInfo = taskStatusConfig[task.status as keyof typeof taskStatusConfig];
                              
                              return (
                                <div
                                  key={task.id}
                                  className="flex items-center justify-between gap-4 p-3 bg-card rounded-lg border border-border"
                                >
                                  <div className="flex items-center gap-3">
                                    <ServiceIcon className="w-4 h-4 text-primary" />
                                    <div>
                                      <p className="text-sm font-medium line-clamp-1">{task.task_title}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {serviceLabel} • {format(new Date(task.assigned_at), "d MMM yyyy", { locale: pt })}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className={statusInfo?.class}>
                                    {statusInfo?.label}
                                  </Badge>
                                </div>
                              );
                            })}
                            {taskCount > 5 && (
                              <p className="text-xs text-muted-foreground text-center pt-2">
                                E mais {taskCount - 5} tarefa(s)...
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Collaborator Dialog */}
      <AnimatedDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <AnimatedDialogContent variant="premium">
          <AnimatedDialogHeader>
            <AnimatedDialogTitle className="flex items-center gap-3">
              <div className="icon-container-premium">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              Adicionar Colaborador
            </AnimatedDialogTitle>
          </AnimatedDialogHeader>
          <AnimatedDialogSection delay={0.1} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Selecionar Utilizador</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Escolha um utilizador..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {allUsers.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {allUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Não há utilizadores disponíveis para adicionar.
                </p>
              )}
            </div>
          </AnimatedDialogSection>
          <AnimatedDialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCollaborator} disabled={!selectedUserId || isAdding}>
              {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Adicionar
            </Button>
          </AnimatedDialogFooter>
        </AnimatedDialogContent>
      </AnimatedDialog>

      {/* Edit Credits Dialog */}
      <AnimatedDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AnimatedDialogContent variant="premium">
          <AnimatedDialogHeader>
            <AnimatedDialogTitle className="flex items-center gap-3">
              <div className="icon-container-premium">
                <ArrowUpDown className="w-5 h-5 text-primary" />
              </div>
              Editar Saldo
            </AnimatedDialogTitle>
          </AnimatedDialogHeader>
          <AnimatedDialogSection delay={0.1} className="space-y-4 py-4">
            <div className="p-4 modal-gradient-premium rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground">
                Colaborador: <span className="font-medium text-foreground">{editingCollaborator?.full_name}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Saldo actual: <span className="font-medium text-primary">{editingCollaborator?.credits.toFixed(1)} créditos</span>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credits">Novo saldo (créditos)</Label>
              <Input
                id="credits"
                type="number"
                step="0.1"
                min="0"
                value={newCredits}
                onChange={(e) => setNewCredits(e.target.value)}
                placeholder="0.0"
                className="bg-secondary h-12 text-lg"
              />
            </div>
          </AnimatedDialogSection>
          <AnimatedDialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateCredits} disabled={newCredits === '' || isUpdating}>
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Actualizar
            </Button>
          </AnimatedDialogFooter>
        </AnimatedDialogContent>
      </AnimatedDialog>

      {/* Remove Collaborator Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Tens a certeza que queres remover <strong>{deletingCollaborator?.full_name}</strong> da função de colaborador?
              O utilizador continuará a ter acesso à plataforma como utilizador regular.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveCollaborator}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Collaborator Completely Dialog */}
      <AlertDialog open={showDeleteCompletelyDialog} onOpenChange={setShowDeleteCompletelyDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Eliminar Colaborador Completamente
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar <strong>{deletingCompletelyCollaborator?.full_name}</strong> completamente?
              <br /><br />
              Esta acção irá eliminar permanentemente:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Perfil do colaborador</li>
                <li>Todas as solicitações</li>
                <li>Todos os depósitos</li>
                <li>Todas as notificações</li>
                <li>Todas as atribuições de tarefas</li>
                <li>Todos os levantamentos</li>
                <li>Todos os ficheiros associados</li>
              </ul>
              <br />
              <strong className="text-destructive">Esta acção não pode ser desfeita.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCompletely}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCollaboratorCompletely}
              disabled={isDeletingCompletely}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingCompletely && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}