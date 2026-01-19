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
  Headphones
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
  };
  client?: {
    full_name: string;
    email: string;
  };
}

const serviceConfig = {
  aperfeicoamento: { label: 'Aperfeiçoamento', icon: Music },
  arranjo: { label: 'Arranjo Musical', icon: FileMusic },
  acc: { label: 'Criação de ACCs', icon: Headphones },
};

const statusConfig = {
  pending: { label: 'Pendente', class: 'bg-yellow-500/20 text-yellow-500' },
  accepted: { label: 'Aceite', class: 'bg-green-500/20 text-green-500' },
  rejected: { label: 'Rejeitada', class: 'bg-red-500/20 text-red-500' },
  cancelled: { label: 'Cancelada', class: 'bg-gray-500/20 text-gray-500' },
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

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isCollaborator) {
        navigate('/dashboard');
        return;
      }
      fetchAssignments();
    }
  }, [user, isCollaborator, authLoading, navigate]);

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

  const handleAccept = async () => {
    if (!selectedAssignment) return;
    
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

      toast({
        title: 'Tarefa aceite',
        description: 'Agora podes trabalhar nesta tarefa.',
      });

      setShowAcceptDialog(false);
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
    if (!selectedAssignment) return;
    
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

      toast({
        title: 'Tarefa rejeitada',
        description: 'A tarefa foi removida da tua lista.',
      });

      setShowRejectDialog(false);
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
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowDetailDialog(true);
                  }}
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
                onClick={() => navigate(`/tarefa/${assignment.task_id}`)}
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
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-card max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.task?.title}</DialogTitle>
            <DialogDescription>
              Detalhes da tarefa atribuída
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Serviço</p>
                <p className="font-medium">
                  {serviceConfig[selectedAssignment?.task?.service_type as keyof typeof serviceConfig]?.label}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Formato</p>
                <p className="font-medium">
                  {selectedAssignment?.task?.result_format === 'audio' ? 'Áudio' : 
                   selectedAssignment?.task?.result_format === 'pdf' ? 'PDF' : 
                   selectedAssignment?.task?.result_format === 'image' ? 'Imagem' : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{selectedAssignment?.client?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Créditos</p>
                <p className="font-medium">{selectedAssignment?.task?.credits_used}</p>
              </div>
            </div>
            
            {selectedAssignment?.task?.description && (
              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="mt-1">{selectedAssignment.task.description}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Fechar
            </Button>
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
          </DialogFooter>
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
