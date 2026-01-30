import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  Music,
  FileMusic,
  Headphones,
  Download,
  FileAudio,
  Image as ImageIcon,
  FileText,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskAssignment {
  id: string;
  task_id: string;
  collaborator_id: string;
  status: string;
  assigned_at: string;
  task?: {
    id: string;
    title: string;
    description: string | null;
    service_type: string;
    status: string;
    result_format: string | null;
    credits_used: number;
    created_at: string;
    recommendations: string | null;
  };
  client?: {
    full_name: string;
    email: string;
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

const serviceConfig = {
  aperfeicoamento: { label: 'Aperfeiçoamento', icon: Music },
  arranjo: { label: 'Arranjo Musical', icon: FileMusic },
  acc: { label: 'Criação de ACCs', icon: Headphones },
};

const statusConfig = {
  pending: { label: 'Pendente', class: 'bg-yellow-500/20 text-yellow-500' },
  accepted: { label: 'Aceite', class: 'bg-green-500/20 text-green-500' },
  rejected: { label: 'Rejeitada', class: 'bg-destructive/20 text-destructive' },
  cancelled: { label: 'Cancelada', class: 'bg-muted text-muted-foreground' },
};

export default function ColaboradorTarefas() {
  const { user, isCollaborator, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<TaskAssignment | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Task files
  const [taskFiles, setTaskFiles] = useState<TaskFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  
  // Audio player
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Image preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isCollaborator) {
        navigate('/dashboard');
        return;
      }
      fetchAssignments();
    }
  }, [user, isCollaborator, authLoading, navigate]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  const fetchAssignments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select('*')
        .eq('collaborator_id', user.id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      // Fetch task details and client info for each assignment
      const assignmentsWithDetails = await Promise.all(
        (data || []).map(async (assignment) => {
          const { data: taskData } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', assignment.task_id)
            .single();

          let clientData = null;
          if (taskData) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('user_id', taskData.user_id)
              .single();
            clientData = profile;
          }

          return { ...assignment, task: taskData, client: clientData };
        })
      );

      setAssignments(assignmentsWithDetails);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTaskFiles = async (taskId: string) => {
    setIsLoadingFiles(true);
    try {
      const { data, error } = await supabase
        .from('task_files')
        .select('*')
        .eq('task_id', taskId)
        .order('is_result', { ascending: true });

      if (error) throw error;
      setTaskFiles(data || []);
    } catch (error) {
      console.error('Error fetching task files:', error);
      setTaskFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleOpenDetail = async (assignment: TaskAssignment) => {
    setSelectedAssignment(assignment);
    if (assignment.task_id) {
      await fetchTaskFiles(assignment.task_id);
    }
    setShowDetailDialog(true);
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

  const playAudio = async (file: TaskFile) => {
    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }

    if (playingAudio === file.id) {
      setPlayingAudio(null);
      setAudioElement(null);
      return;
    }

    try {
      const bucket = file.is_result ? 'result-files' : 'task-files';
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const audio = new Audio(url);
      audio.onended = () => {
        setPlayingAudio(null);
        URL.revokeObjectURL(url);
      };
      audio.play();
      setPlayingAudio(file.id);
      setAudioElement(audio);
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível reproduzir o áudio.',
        variant: 'destructive',
      });
    }
  };

  const showImagePreview = async (file: TaskFile) => {
    try {
      const bucket = file.is_result ? 'result-files' : 'task-files';
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setPreviewImage(url);
    } catch (error) {
      console.error('Error loading image:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a imagem.',
        variant: 'destructive',
      });
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <FileAudio className="w-4 h-4 text-primary" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-amber-500" />;
    }
  };

  const handleAccept = async () => {
    if (!selectedAssignment || !user) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('task_assignments')
        .update({ 
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', selectedAssignment.id);

      if (error) throw error;

      // Get collaborator name for notification
      const { data: collaboratorProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      // Send notification to admin
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminRoles && adminRoles.length > 0) {
        const adminNotifications = adminRoles.map(admin => ({
          user_id: admin.user_id,
          title: 'Tarefa Aceite',
          message: `O colaborador ${collaboratorProfile?.full_name || 'Colaborador'} aceitou a tarefa "${selectedAssignment.task?.title}".`,
        }));

        await supabase.from('notifications').insert(adminNotifications);
      }

      toast({
        title: 'Tarefa aceite',
        description: 'Agora podes trabalhar nesta tarefa.',
      });

      setShowAcceptDialog(false);
      setShowDetailDialog(false);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (error) {
      console.error('Error accepting assignment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aceitar a tarefa.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAssignment || !user) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('task_assignments')
        .update({ 
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', selectedAssignment.id);

      if (error) throw error;

      // Get collaborator name for notification
      const { data: collaboratorProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      // Send notification to admin
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminRoles && adminRoles.length > 0) {
        const adminNotifications = adminRoles.map(admin => ({
          user_id: admin.user_id,
          title: 'Tarefa Rejeitada',
          message: `O colaborador ${collaboratorProfile?.full_name || 'Colaborador'} rejeitou a tarefa "${selectedAssignment.task?.title}".`,
        }));

        await supabase.from('notifications').insert(adminNotifications);
      }

      toast({
        title: 'Tarefa rejeitada',
        description: 'A tarefa foi removida da tua lista.',
      });

      setShowRejectDialog(false);
      setShowDetailDialog(false);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar a tarefa.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const acceptedAssignments = assignments.filter(a => a.status === 'accepted');
  const otherAssignments = assignments.filter(a => !['pending', 'accepted'].includes(a.status));

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const renderAssignmentCard = (assignment: TaskAssignment) => {
    const ServiceIcon = serviceConfig[assignment.task?.service_type as keyof typeof serviceConfig]?.icon || Music;
    const serviceLabel = serviceConfig[assignment.task?.service_type as keyof typeof serviceConfig]?.label || 'Serviço';
    
    return (
      <motion.div
        key={assignment.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card rounded-xl border border-border p-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <ServiceIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{assignment.task?.title}</p>
              <p className="text-sm text-muted-foreground">{serviceLabel}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Atribuída em {format(new Date(assignment.assigned_at), "d 'de' MMMM", { locale: pt })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={statusConfig[assignment.status as keyof typeof statusConfig]?.class}>
              {statusConfig[assignment.status as keyof typeof statusConfig]?.label}
            </Badge>
            
            {assignment.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenDetail(assignment)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowAcceptDialog(true);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Aceitar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowRejectDialog(true);
                  }}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {assignment.status === 'accepted' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenDetail(assignment)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Abrir
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderFileItem = (file: TaskFile) => {
    const isAudio = file.file_type === 'audio';
    const isImage = file.file_type === 'image';
    const isPlaying = playingAudio === file.id;

    return (
      <div
        key={file.id}
        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
      >
        <div className="flex items-center gap-3">
          {getFileIcon(file.file_type)}
          <div>
            <p className="text-sm font-medium truncate max-w-[200px]">{file.file_name}</p>
            <p className="text-xs text-muted-foreground">
              {file.is_result ? 'Resultado' : 'Ficheiro do cliente'}
              {file.file_size && ` • ${(file.file_size / 1024 / 1024).toFixed(2)} MB`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAudio && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => playAudio(file)}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          )}
          {isImage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => showImagePreview(file)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => downloadFile(file)}
            disabled={downloadingFile === file.id}
          >
            {downloadingFile === file.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/colaborador')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <ClipboardList className="w-7 h-7 text-primary" />
                Minhas Tarefas
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerir tarefas atribuídas
              </p>
            </div>
          </div>

          {/* Pending Assignments */}
          {pendingAssignments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Pendentes ({pendingAssignments.length})
              </h2>
              <div className="grid gap-4">
                {pendingAssignments.map(renderAssignmentCard)}
              </div>
            </div>
          )}

          {/* Accepted Assignments */}
          {acceptedAssignments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Em Progresso ({acceptedAssignments.length})
              </h2>
              <div className="grid gap-4">
                {acceptedAssignments.map(renderAssignmentCard)}
              </div>
            </div>
          )}

          {/* Other Assignments */}
          {otherAssignments.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Histórico</h2>
              <div className="grid gap-4">
                {otherAssignments.map(renderAssignmentCard)}
              </div>
            </div>
          )}

          {assignments.length === 0 && (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma tarefa atribuída.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={(open) => {
        if (!open) {
          if (audioElement) {
            audioElement.pause();
            audioElement.src = '';
          }
          setPlayingAudio(null);
          setTaskFiles([]);
        }
        setShowDetailDialog(open);
      }}>
        <DialogContent className="bg-card max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedAssignment?.task?.title}</DialogTitle>
            <DialogDescription>
              Detalhes completos da tarefa atribuída
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Serviço</p>
                  <p className="font-medium">
                    {serviceConfig[selectedAssignment?.task?.service_type as keyof typeof serviceConfig]?.label}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Formato Desejado</p>
                  <p className="font-medium">
                    {selectedAssignment?.task?.result_format === 'audio' ? 'Áudio' : 
                     selectedAssignment?.task?.result_format === 'pdf' ? 'PDF' : 
                     selectedAssignment?.task?.result_format === 'image' ? 'Imagem' : 'Ambos'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedAssignment?.client?.full_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Créditos</p>
                  <p className="font-medium">{selectedAssignment?.task?.credits_used}</p>
                </div>
              </div>
              
              <Separator />
              
              {/* Description */}
              {selectedAssignment?.task?.description && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                  <p className="text-sm bg-secondary/50 p-3 rounded-lg">{selectedAssignment.task.description}</p>
                </div>
              )}
              
              {/* Recommendations */}
              {selectedAssignment?.task?.recommendations && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Recomendações</p>
                  <p className="text-sm bg-secondary/50 p-3 rounded-lg">{selectedAssignment.task.recommendations}</p>
                </div>
              )}
              
              <Separator />
              
              {/* Task Files */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Ficheiros Anexados ({taskFiles.length})
                </p>
                
                {isLoadingFiles ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : taskFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum ficheiro anexado.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {taskFiles.filter(f => !f.is_result).length > 0 && (
                      <>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Ficheiros do Cliente</p>
                        {taskFiles.filter(f => !f.is_result).map(renderFileItem)}
                      </>
                    )}
                    {taskFiles.filter(f => f.is_result).length > 0 && (
                      <>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-4">Resultados</p>
                        {taskFiles.filter(f => f.is_result).map(renderFileItem)}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Fechar
            </Button>
            {selectedAssignment?.status === 'pending' && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setShowDetailDialog(false);
                  setShowAcceptDialog(true);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aceitar Tarefa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => {
        if (!open) {
          if (previewImage) URL.revokeObjectURL(previewImage);
          setPreviewImage(null);
        }
      }}>
        <DialogContent className="bg-card max-w-4xl p-2">
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Accept Confirmation */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Aceitar Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tens a certeza que queres aceitar a tarefa "{selectedAssignment?.task?.title}"?
              Ao aceitar, comprometeste a concluí-la.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Aceitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tens a certeza que queres rejeitar a tarefa "{selectedAssignment?.task?.title}"?
              Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
