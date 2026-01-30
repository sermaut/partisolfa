import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Clock, 
  CheckCircle, 
  AlertCircle,
  Music,
  FileMusic,
  Download,
  Upload,
  Eye,
  X,
  Loader2,
  FileAudio,
  Image,
  File,
  Trash2,
  FileText,
  Headphones,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserPlus,
  Users
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Task {
  id: string;
  title: string;
  service_type: string;
  status: string;
  created_at: string;
  user_id: string;
  description: string | null;
  recommendations: string | null;
  credits_used: number;
  result_format: string | null;
  result_comment: string | null;
  cancellation_reason: string | null;
  profiles?: {
    full_name: string;
    email: string;
    credits: number;
  };
}

interface TaskFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  is_result: boolean;
}

interface Collaborator {
  user_id: string;
  full_name: string;
  email: string;
}

const statusConfig = {
  pending: { label: 'Pendente', class: 'status-pending', icon: Clock },
  in_progress: { label: 'Em Progresso', class: 'status-progress', icon: AlertCircle },
  completed: { label: 'Concluída', class: 'status-completed', icon: CheckCircle },
  cancelled: { label: 'Cancelada', class: 'status-cancelled', icon: AlertCircle },
};

const serviceLabels: Record<string, string> = {
  aperfeicoamento: 'Aperfeiçoamento',
  arranjo: 'Arranjo Musical',
  acc: 'Criação de ACCs',
};

const resultFormatLabels: Record<string, string> = {
  pdf: 'Partitura PDF',
  audio: 'Áudio',
  image: 'Partitura Imagem',
};

const ITEMS_PER_PAGE = 10;

const MAX_RESULT_FILES = 10;

export default function AdminTarefas() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskFiles, setTaskFiles] = useState<TaskFile[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [taskToCancel, setTaskToCancel] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Result upload dialog
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultDescription, setResultDescription] = useState('');
  const [resultFiles, setResultFiles] = useState<File[]>([]);
  
  // Assign task to collaborators
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<Task | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, serviceFilter, statusFilter]);

  // Filtered tasks based on search and service filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Service filter
      if (serviceFilter !== 'all' && task.service_type !== serviceFilter) {
        return false;
      }
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query);
        const matchesUserName = task.profiles?.full_name.toLowerCase().includes(query);
        const matchesEmail = task.profiles?.email.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesDescription && !matchesUserName && !matchesEmail) {
          return false;
        }
      }
      
      return true;
    });
  }, [tasks, serviceFilter, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/dashboard');
        return;
      }
      fetchTasks();
    }
  }, [user, isAdmin, authLoading, navigate, statusFilter]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'pending' | 'in_progress' | 'completed' | 'cancelled');
      }

      const { data, error } = await query;
      if (error) throw error;

      const tasksWithProfiles = await Promise.all(
        (data || []).map(async (task) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email, credits')
            .eq('user_id', task.user_id)
            .single();
          
          return { ...task, profiles: profileData };
        })
      );

      setTasks(tasksWithProfiles);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'collaborator');

      if (roles && roles.length > 0) {
        const userIds = roles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);
        
        setCollaborators(profiles || []);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const openAssignDialog = async (task: Task) => {
    setTaskToAssign(task);
    setSelectedCollaborators([]);
    await fetchCollaborators();
    setShowAssignDialog(true);
  };

  const handleAssignTask = async () => {
    if (!taskToAssign || selectedCollaborators.length === 0 || !user) return;
    
    setIsAssigning(true);
    try {
      // Create task assignments for each selected collaborator
      const assignments = selectedCollaborators.map(collabId => ({
        task_id: taskToAssign.id,
        collaborator_id: collabId,
        assigned_by: user.id,
        status: 'pending',
      }));

      const { error } = await supabase
        .from('task_assignments')
        .insert(assignments);

      if (error) throw error;

      // Notify each collaborator
      const notifications = selectedCollaborators.map(collabId => ({
        user_id: collabId,
        title: 'Nova tarefa disponível',
        message: `Uma nova tarefa "${taskToAssign.title}" foi-te atribuída. Consulta o teu painel para aceitar ou recusar.`,
      }));

      await supabase.from('notifications').insert(notifications);

      toast({
        title: 'Tarefa atribuída',
        description: `A tarefa foi atribuída a ${selectedCollaborators.length} colaborador(es).`,
      });

      setShowAssignDialog(false);
      setTaskToAssign(null);
      setSelectedCollaborators([]);
    } catch (error) {
      console.error('Error assigning task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atribuir a tarefa.',
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const toggleCollaboratorSelection = (userId: string) => {
    setSelectedCollaborators(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const openTaskDetail = async (task: Task) => {
    setSelectedTask(task);
    
    const { data: files, error } = await supabase
      .from('task_files')
      .select('*')
      .eq('task_id', task.id)
      .order('is_result', { ascending: false });

    if (!error) {
      setTaskFiles(files || []);
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    if (newStatus === 'cancelled') {
      setTaskToCancel(taskId);
      setShowCancelDialog(true);
    } else {
      updateTaskStatus(taskId, newStatus as 'pending' | 'in_progress' | 'completed');
    }
  };

  const confirmCancellation = async () => {
    if (!taskToCancel || !cancellationReason.trim()) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Por favor, indique o motivo do cancelamento.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      const task = tasks.find((t) => t.id === taskToCancel);
      if (!task) return;

      // Update task status with cancellation reason
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'cancelled',
          cancellation_reason: cancellationReason.trim()
        })
        .eq('id', taskToCancel);

      if (error) throw error;

      // Refund credits
      if (task.profiles) {
        const newCredits = (task.profiles.credits || 0) + task.credits_used;
        await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('user_id', task.user_id);
      }

      // Send notification
      await supabase.from('notifications').insert({
        user_id: task.user_id,
        title: 'Solicitação cancelada',
        message: `A sua solicitação "${task.title}" foi cancelada. Motivo: ${cancellationReason.trim()}. Os créditos foram devolvidos à sua conta.`,
      });

      toast({
        title: 'Tarefa cancelada',
        description: 'Os créditos foram devolvidos ao usuário.',
      });

      setShowCancelDialog(false);
      setCancellationReason('');
      setTaskToCancel(null);
      fetchTasks();
    } catch (error) {
      console.error('Error cancelling task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a tarefa.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        const statusLabel = statusConfig[newStatus]?.label || newStatus;
        await supabase.from('notifications').insert({
          user_id: task.user_id,
          title: 'Estado da solicitação actualizado',
          message: `A sua solicitação "${task.title}" está agora: ${statusLabel}`,
        });
      }

      toast({
        title: 'Estado actualizado',
        description: 'O estado da tarefa foi alterado com sucesso.',
      });

      fetchTasks();
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível actualizar o estado.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openResultDialog = () => {
    setResultDescription('');
    setResultFiles([]);
    setShowResultDialog(true);
  };

  const handleResultFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const currentResultFiles = taskFiles.filter(f => f.is_result).length;
    if (currentResultFiles + resultFiles.length + selectedFiles.length > MAX_RESULT_FILES) {
      toast({
        title: 'Limite de ficheiros',
        description: `Pode enviar no máximo ${MAX_RESULT_FILES} ficheiros de resultado.`,
        variant: 'destructive',
      });
      return;
    }

    setResultFiles(prev => [...prev, ...Array.from(selectedFiles)]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeResultFile = (index: number) => {
    setResultFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleResultUpload = async () => {
    if (!selectedTask || resultFiles.length === 0 || resultDescription.trim().length < 10) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, adicione uma descrição (mínimo 10 caracteres) e pelo menos um ficheiro.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      for (const file of resultFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${selectedTask.user_id}/${selectedTask.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('result-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        await supabase.from('task_files').insert({
          task_id: selectedTask.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type.includes('audio') ? 'audio' : file.type.includes('image') ? 'image' : 'document',
          file_size: file.size,
          is_result: true,
        });
      }

      // Update task with result comment
      await supabase
        .from('tasks')
        .update({ result_comment: resultDescription.trim() })
        .eq('id', selectedTask.id);

      await updateTaskStatus(selectedTask.id, 'completed');

      await supabase.from('notifications').insert({
        user_id: selectedTask.user_id,
        title: 'Resultado disponível!',
        message: `O resultado da sua solicitação "${selectedTask.title}" está pronto para download. Descrição: ${resultDescription.trim()}`,
      });

      toast({
        title: 'Resultado enviado',
        description: 'Os ficheiros foram enviados e o usuário foi notificado.',
      });

      setShowResultDialog(false);
      setResultDescription('');
      setResultFiles([]);
      openTaskDetail(selectedTask);
    } catch (error) {
      console.error('Error uploading result:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o resultado.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setDeletingId(taskId);
    try {
      const { data: files } = await supabase
        .from('task_files')
        .select('file_path, is_result')
        .eq('task_id', taskId);

      if (files && files.length > 0) {
        for (const file of files) {
          const bucket = file.is_result ? 'result-files' : 'task-files';
          await supabase.storage.from(bucket).remove([file.file_path]);
        }
        await supabase.from('task_files').delete().eq('task_id', taskId);
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }

      toast({
        title: 'Tarefa eliminada',
        description: 'A tarefa foi eliminada com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível eliminar a tarefa.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const downloadFile = async (file: TaskFile) => {
    setDownloadingFile(file.id);
    try {
      const bucket = file.is_result ? 'result-files' : 'task-files';
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Erro no download',
        description: 'Não foi possível descarregar o ficheiro.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingFile(null);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <FileAudio className="w-4 h-4 text-primary" />;
      case 'image':
        return <Image className="w-4 h-4 text-success" />;
      default:
        return <File className="w-4 h-4 text-warning" />;
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
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao painel
          </Button>

          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="font-display text-3xl font-bold">
                Gerir <span className="text-gradient-gold">Tarefas</span>
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] bg-secondary">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Estados</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-[160px] bg-secondary">
                    <SelectValue placeholder="Serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Serviços</SelectItem>
                    <SelectItem value="aperfeicoamento">Aperfeiçoamento</SelectItem>
                    <SelectItem value="arranjo">Arranjo Musical</SelectItem>
                    <SelectItem value="acc">Criação de ACCs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar por título, descrição, nome do usuário ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {filteredTasks.length} tarefa{filteredTasks.length !== 1 ? 's' : ''} encontrada{filteredTasks.length !== 1 ? 's' : ''}
                {(searchQuery || serviceFilter !== 'all') && ' com os filtros aplicados'}
              </div>
              {totalPages > 1 && (
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </div>
              )}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-muted-foreground">
                {searchQuery || serviceFilter !== 'all' 
                  ? 'Tente ajustar os filtros de pesquisa.'
                  : 'Não existem tarefas com o estado selecionado.'}
              </p>
              {(searchQuery || serviceFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setServiceFilter('all');
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedTasks.map((task) => {
                const status = statusConfig[task.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;

                return (
                  <div key={task.id} className="glass-card rounded-xl p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-gold/20 flex items-center justify-center flex-shrink-0">
                          {task.service_type === 'arranjo' ? (
                            <FileMusic className="w-6 h-6 text-primary" />
                          ) : task.service_type === 'acc' ? (
                            <Headphones className="w-6 h-6 text-primary" />
                          ) : (
                            <Music className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {serviceLabels[task.service_type] || task.service_type} • {formatDate(task.created_at)}
                          </p>
                          <p className="text-sm text-primary mt-1">
                            {task.profiles?.full_name} ({task.profiles?.email})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {status.label}
                        </span>

                        <Select
                          value={task.status}
                          onValueChange={(value) => handleStatusChange(task.id, value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="in_progress">Em Progresso</SelectItem>
                            <SelectItem value="completed">Concluída</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openAssignDialog(task)}
                          title="Atribuir a colaboradores"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Atribuir
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => openTaskDetail(task)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Detalhes
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive" disabled={deletingId === task.id}>
                              {deletingId === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar tarefa?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acção não pode ser revertida. A tarefa "{task.title}" será eliminada permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteTask(task.id)} className="bg-destructive hover:bg-destructive/90">
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-9 w-9"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <Button
                      key={index}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setCurrentPage(page)}
                      className="h-9 w-9"
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2 text-muted-foreground">
                      {page}
                    </span>
                  )
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-9 w-9"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Cancellation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Motivo do Cancelamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Por favor, indique o motivo do cancelamento. Os créditos serão devolvidos automaticamente ao usuário.
            </p>
            <Textarea
              placeholder="Descreva o motivo do cancelamento..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="min-h-[100px] bg-secondary"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCancelDialog(false); setCancellationReason(''); setTaskToCancel(null); }}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={confirmCancellation} disabled={isUpdating || !cancellationReason.trim()}>
              {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{selectedTask?.title}</DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Serviço</p><p className="font-medium">{serviceLabels[selectedTask.service_type] || selectedTask.service_type}</p></div>
                <div><p className="text-muted-foreground">Data</p><p className="font-medium">{formatDate(selectedTask.created_at)}</p></div>
                <div><p className="text-muted-foreground">Usuário</p><p className="font-medium">{selectedTask.profiles?.full_name}</p></div>
                <div><p className="text-muted-foreground">E-mail</p><p className="font-medium">{selectedTask.profiles?.email}</p></div>
              </div>

              {selectedTask.result_format && (
                <div className="bg-primary/10 rounded-lg p-4">
                  <Label className="text-primary mb-2 block">Formato Preferido</Label>
                  <div className="flex items-center gap-2">
                    {selectedTask.result_format === 'pdf' && <FileText className="w-5 h-5 text-warning" />}
                    {selectedTask.result_format === 'audio' && <Headphones className="w-5 h-5 text-primary" />}
                    {selectedTask.result_format === 'image' && <Image className="w-5 h-5 text-success" />}
                    <span className="font-medium">{resultFormatLabels[selectedTask.result_format] || selectedTask.result_format}</span>
                  </div>
                  {selectedTask.result_comment && <p className="text-sm mt-2 text-muted-foreground">{selectedTask.result_comment}</p>}
                </div>
              )}

              {selectedTask.description && <div><Label className="text-muted-foreground">Descrição</Label><p className="mt-1 text-sm whitespace-pre-wrap">{selectedTask.description}</p></div>}
              {selectedTask.recommendations && <div><Label className="text-muted-foreground">Recomendações</Label><p className="mt-1 text-sm whitespace-pre-wrap">{selectedTask.recommendations}</p></div>}
              {selectedTask.cancellation_reason && <div className="bg-destructive/10 rounded-lg p-4"><Label className="text-destructive">Motivo do Cancelamento</Label><p className="mt-1 text-sm">{selectedTask.cancellation_reason}</p></div>}

              <div>
                <Label className="text-muted-foreground mb-3 block">Ficheiros Enviados</Label>
                <div className="space-y-2">
                  {taskFiles.filter((f) => !f.is_result).map((file) => (
                    <div key={file.id} className="bg-secondary/50 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">{getFileIcon(file.file_type)}<span className="text-sm">{file.file_name}</span></div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadFile(file)} disabled={downloadingFile === file.id}>
                        {downloadingFile === file.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {taskFiles.filter((f) => f.is_result).length > 0 && (
                <div>
                  <Label className="text-success mb-3 block">Resultados Enviados</Label>
                  <div className="space-y-2">
                    {taskFiles.filter((f) => f.is_result).map((file) => (
                      <div key={file.id} className="bg-success/10 border border-success/30 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /><span className="text-sm">{file.file_name}</span></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadFile(file)} disabled={downloadingFile === file.id}>
                          {downloadingFile === file.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <Label className="mb-3 block">Enviar Resultado (até {MAX_RESULT_FILES} ficheiros)</Label>
                <div className="flex items-center gap-3">
                  <Button variant="premium" onClick={openResultDialog} disabled={isUploading}>
                    <Upload className="w-4 h-4 mr-2" />
                    Carregar Resultado
                  </Button>
                  <p className="text-xs text-muted-foreground">O usuário será notificado automaticamente</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Atribuir Tarefa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Tarefa: <span className="font-medium text-foreground">{taskToAssign?.title}</span>
            </p>
            <div className="space-y-2">
              <Label>Selecionar Colaboradores</Label>
              {collaborators.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum colaborador disponível.
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {collaborators.map((collab) => (
                    <div
                      key={collab.user_id}
                      onClick={() => toggleCollaboratorSelection(collab.user_id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedCollaborators.includes(collab.user_id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selectedCollaborators.includes(collab.user_id)
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground'
                        }`}>
                          {selectedCollaborators.includes(collab.user_id) && (
                            <CheckCircle className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{collab.full_name}</p>
                          <p className="text-xs text-muted-foreground">{collab.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedCollaborators.length > 0 && (
              <p className="text-sm text-primary">
                {selectedCollaborators.length} colaborador(es) selecionado(s)
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignTask} disabled={selectedCollaborators.length === 0 || isAssigning}>
              {isAssigning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Atribuir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Upload Dialog */}
      <Dialog open={showResultDialog} onOpenChange={(open) => {
        if (!open) {
          setResultDescription('');
          setResultFiles([]);
        }
        setShowResultDialog(open);
      }}>
        <DialogContent className="max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Enviar Resultado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resultDescription">Descrição do Resultado *</Label>
              <Textarea
                id="resultDescription"
                placeholder="Descreva o trabalho realizado, notas importantes sobre o resultado..."
                value={resultDescription}
                onChange={(e) => setResultDescription(e.target.value)}
                className="min-h-[100px] bg-secondary"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 10 caracteres ({resultDescription.length}/10)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Ficheiros</Label>
              <input 
                ref={fileInputRef} 
                type="file" 
                multiple 
                onChange={handleResultFileSelect} 
                className="hidden" 
                accept=".mp3,.wav,.aac,.pdf,.jpg,.jpeg,.png"
              />
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Ficheiros
              </Button>
              
              {resultFiles.length > 0 && (
                <div className="space-y-2 mt-3">
                  {resultFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => removeResultFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Formatos aceites: MP3, WAV, AAC, PDF, JPG, PNG (até {MAX_RESULT_FILES} ficheiros)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResultDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="premium" 
              onClick={handleResultUpload} 
              disabled={isUploading || resultDescription.trim().length < 10 || resultFiles.length === 0}
            >
              {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enviar Resultado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}