import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Music, 
  FileMusic, 
  Upload, 
  X, 
  File, 
  Image, 
  FileAudio,
  AlertCircle,
  CheckCircle,
  FileText,
  Headphones,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogSection,
} from '@/components/ui/responsive-dialog';
import { Loader2 } from 'lucide-react';
import { FileDropzone } from '@/components/ui/file-dropzone';

const ACCEPTED_FILE_TYPES = {
  audio: ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/x-aac'],
  image: ['image/jpeg', 'image/jpg', 'image/png'],
  document: ['application/pdf'],
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_FILES = 10;

interface UploadedFile {
  file: File;
  type: 'audio' | 'image' | 'document';
  preview?: string;
}

export default function NovaSolicitacao() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [serviceType, setServiceType] = useState<'arranjo' | 'transposicao' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [resultFormat, setResultFormat] = useState<'pdf' | 'audio' | 'image'>('pdf');
  const [resultComment, setResultComment] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const getServiceCost = () => {
    if (serviceType === 'arranjo') return { credits: 3, kz: 450 };
    if (serviceType === 'transposicao') return { credits: 250 / 150, kz: 250 };
    return { credits: 0, kz: 0 };
  };

  const { credits: serviceCost, kz: serviceKz } = getServiceCost();
  const hasEnoughCredits = (profile?.credits || 0) >= serviceCost && serviceCost > 0;

  // Allowed file types per service
  const allowedTypesForService = (st: typeof serviceType): Array<'audio' | 'image' | 'document'> => {
    if (st === 'arranjo') return ['audio', 'image', 'document'];
    if (st === 'transposicao') return ['audio', 'image'];
    return ['audio', 'image', 'document'];
  };
  const allowedAccept = serviceType === 'transposicao'
    ? '.mp3,.wav,.aac,.jpg,.jpeg,.png'
    : '.mp3,.wav,.aac,.pdf,.jpg,.jpeg,.png';


  const getFileType = (mimeType: string): 'audio' | 'image' | 'document' | null => {
    if (ACCEPTED_FILE_TYPES.audio.includes(mimeType)) return 'audio';
    if (ACCEPTED_FILE_TYPES.image.includes(mimeType)) return 'image';
    if (ACCEPTED_FILE_TYPES.document.includes(mimeType)) return 'document';
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const remainingSlots = MAX_FILES - files.length;
    if (selectedFiles.length > remainingSlots) {
      toast({
        title: 'Limite de ficheiros',
        description: `Pode adicionar no máximo mais ${remainingSlots} ficheiro(s).`,
        variant: 'destructive',
      });
      return;
    }

    const newFiles: UploadedFile[] = [];
    Array.from(selectedFiles).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: 'Ficheiro demasiado grande', description: `${file.name} excede 20MB.`, variant: 'destructive' });
        return;
      }
      const fileType = getFileType(file.type);
      if (!fileType) {
        toast({ title: 'Tipo não suportado', description: `${file.name} não é permitido.`, variant: 'destructive' });
        return;
      }
      if (!allowedTypesForService(serviceType).includes(fileType)) {
        toast({
          title: 'Tipo não permitido para este serviço',
          description: serviceType === 'transposicao'
            ? 'Transposição Musical aceita apenas imagens e áudios.'
            : `${file.name} não é permitido.`,
          variant: 'destructive',
        });
        return;
      }
      const uploadedFile: UploadedFile = { file, type: fileType };
      if (fileType === 'image') uploadedFile.preview = URL.createObjectURL(file);
      newFiles.push(uploadedFile);

    });

    setFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const file = prev[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getFileIcon = (type: 'audio' | 'image' | 'document') => {
    switch (type) {
      case 'audio': return <FileAudio className="w-5 h-5 text-primary" />;
      case 'image': return <Image className="w-5 h-5 text-success" />;
      case 'document': return <File className="w-5 h-5 text-warning" />;
    }
  };

  const openFormModal = () => {
    if (!serviceType) {
      toast({ title: 'Selecione um serviço', description: 'Escolha o tipo de serviço primeiro.', variant: 'destructive' });
      return;
    }
    if (!hasEnoughCredits) {
      toast({ title: 'Saldo insuficiente', description: 'Deposite créditos para continuar.', variant: 'destructive' });
      return;
    }
    setShowFormModal(true);
  };

  const handleSubmit = async () => {
    if (!serviceType || !title || files.length === 0) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha todos os campos e anexe ficheiros.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          user_id: user!.id,
          title,
          description,
          recommendations,
          service_type: serviceType,
          credits_used: serviceCost,
          result_format: resultFormat,
          result_comment: resultComment || null,
        })
        .select()
        .single();

      if (taskError) throw taskError;


      // Upload files in parallel
      await Promise.all(files.map(async (uploadedFile) => {
        const fileExt = uploadedFile.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user!.id}/${task.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('task-files')
          .upload(filePath, uploadedFile.file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return;
        }

        await supabase.from('task_files').insert({
          task_id: task.id,
          file_name: uploadedFile.file.name,
          file_path: filePath,
          file_type: uploadedFile.type,
          file_size: uploadedFile.file.size,
          is_result: false,
        });
      }));

      // Notify all admins about the new task
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminRoles && adminRoles.length > 0) {
        const adminNotifications = adminRoles.map((r) => ({
          user_id: r.user_id,
          title: 'Nova solicitação recebida!',
          message: `${profile?.full_name || 'Um utilizador'} enviou uma nova solicitação: "${title}" (${files.length} ficheiro${files.length > 1 ? 's' : ''}).`,
        }));
        await supabase.from('notifications').insert(adminNotifications);
      }

      await supabase
        .from('profiles')
        .update({ credits: (profile?.credits || 0) - serviceCost })
        .eq('user_id', user!.id);

      await refreshProfile();

      toast({ title: 'Solicitação enviada!', description: 'Receberá o resultado em breve.' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({ title: 'Erro', description: 'Não foi possível enviar a solicitação.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Nova <span className="text-gradient-gold">Solicitação</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Envie os ficheiros e informações para o seu serviço musical. 
            <span className="text-primary font-medium"> Prazo máximo de entrega: 3 dias.</span>
          </p>

          {/* Service Type Selection */}
          <div className="space-y-4 mb-8">
            <Label className="text-base">Tipo de Serviço *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                { key: 'arranjo' as const, label: 'Arranjo Musical', desc: 'Arranjo profissional com correcção harmónica', cost: '450 Kz (3 créditos)', icon: FileMusic },
                { key: 'transposicao' as const, label: 'Transposição Musical', desc: 'Cópia fiel sem intervenção no arranjo', cost: '250 Kz (1.67 créditos)', icon: Music },
              ]).map((service) => (
                <button
                  key={service.key}
                  type="button"
                  onClick={() => setServiceType(service.key)}
                  className={`glass-card rounded-xl p-6 text-left transition-all relative ${
                    serviceType === service.key ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      serviceType === service.key ? 'bg-primary' : 'bg-primary/20'
                    }`}>
                      <service.icon className={`w-6 h-6 ${serviceType === service.key ? 'text-primary-foreground' : 'text-primary'}`} />
                    </div>
                    <div>
                      <p className="font-semibold">{service.label}</p>
                      <p className="text-sm text-muted-foreground">{service.desc}</p>
                      <p className="text-sm font-medium text-primary mt-2">{service.cost}</p>
                      <p className="text-xs text-muted-foreground mt-1">Prazo máximo: 3 dias</p>
                    </div>
                  </div>
                  {serviceType === service.key && <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>

          </div>

          {!hasEnoughCredits && serviceType && (
            <div className="glass-card rounded-xl p-4 mb-6 border-warning/50 bg-warning/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">Saldo insuficiente</p>
                  <p className="text-sm text-muted-foreground">
                    Precisa de {serviceCost} créditos.{' '}
                    <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/deposito')}>
                      Depositar créditos
                    </Button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {serviceType && hasEnoughCredits && (
            <Button variant="premium" size="lg" className="w-full" onClick={openFormModal}>
              <Send className="w-5 h-5 mr-2" />
              Preencher Formulário
            </Button>
          )}
        </motion.div>
      </div>

      {/* Form Modal */}
      <ResponsiveDialog open={showFormModal} onOpenChange={setShowFormModal}>
        <ResponsiveDialogContent variant="premium" size="xl">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="flex items-center gap-3">
              <div className="icon-container-premium">
                {serviceType === 'arranjo' ? <FileMusic className="w-5 h-5 text-primary" /> :
                 <Music className="w-5 h-5 text-primary" />}
              </div>
              Nova Solicitação
            </ResponsiveDialogTitle>

          </ResponsiveDialogHeader>
          <ResponsiveDialogBody>
            <div className="space-y-5">
              <ResponsiveDialogSection delay={0.1}>
                <div className="space-y-2">
                  <Label htmlFor="modal-title">Título *</Label>
                  <Input
                    id="modal-title"
                    placeholder="Ex: Arranjo para coro - Música Tradicional"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
              </ResponsiveDialogSection>

              <ResponsiveDialogSection delay={0.15}>
                <div className="space-y-2">
                  <Label htmlFor="modal-desc">Descrição</Label>
                  <Textarea
                    id="modal-desc"
                    placeholder="Descreva detalhadamente o que pretende..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-secondary border-border min-h-[80px]"
                  />
                </div>
              </ResponsiveDialogSection>

              <ResponsiveDialogSection delay={0.2}>
                <div className="space-y-2">
                  <Label htmlFor="modal-rec">Recomendações Específicas</Label>
                  <Textarea
                    id="modal-rec"
                    placeholder="Instrumentos, estilo, andamento, tonalidade..."
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    className="bg-secondary border-border min-h-[80px]"
                  />
                </div>
              </ResponsiveDialogSection>

              <ResponsiveDialogSection delay={0.3}>
                <div className="space-y-3">
                  <Label>Formato do Resultado *</Label>
                  <RadioGroup value={resultFormat} onValueChange={(v) => setResultFormat(v as any)} className="space-y-2">
                    {[
                      { value: 'pdf', label: 'Partitura PDF', icon: FileText },
                      { value: 'audio', label: 'Áudio', icon: Headphones },
                      { value: 'image', label: 'Partitura Imagem', icon: Image },
                    ].map((fmt) => (
                      <div key={fmt.value} className={`flex items-center space-x-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                        resultFormat === fmt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                      }`}>
                        <RadioGroupItem value={fmt.value} id={`modal-${fmt.value}`} />
                        <Label htmlFor={`modal-${fmt.value}`} className="flex items-center gap-2 cursor-pointer flex-1">
                          <fmt.icon className="w-4 h-4 text-muted-foreground" />
                          {fmt.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </ResponsiveDialogSection>


              <ResponsiveDialogSection delay={0.35}>
                <div className="space-y-2">
                  <Label htmlFor="modal-comment">Comentário sobre o resultado</Label>
                  <Textarea
                    id="modal-comment"
                    placeholder="Observações adicionais..."
                    value={resultComment}
                    onChange={(e) => setResultComment(e.target.value)}
                    className="bg-secondary border-border min-h-[60px]"
                  />
                </div>
              </ResponsiveDialogSection>

              <ResponsiveDialogSection delay={0.4}>
                <div className="space-y-3">
                  <Label>Ficheiros * (máx. {MAX_FILES})</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept={allowedAccept}
                  />
                  <Button
                    variant="outline"
                    className="w-full h-12 border-dashed border-2 hover:border-primary/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Ficheiros
                  </Button>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2.5 bg-secondary/50 rounded-lg border border-border">
                          <div className="flex items-center gap-2 min-w-0">
                            {getFileIcon(file.type)}
                            <span className="text-sm truncate">{file.file.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              ({(file.file.size / (1024 * 1024)).toFixed(1)} MB)
                            </span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeFile(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {serviceType === 'transposicao'
                      ? 'Apenas imagens e áudios (MP3, WAV, AAC, JPG, PNG) — máx. 20MB cada'
                      : 'PDFs, imagens e áudios (MP3, WAV, AAC, PDF, JPG, PNG) — máx. 20MB cada'}
                  </p>

                </div>
              </ResponsiveDialogSection>
            </div>
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <Button variant="outline" onClick={() => setShowFormModal(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button
              variant="premium"
              onClick={handleSubmit}
              disabled={isSubmitting || !title || files.length === 0}
              className="w-full sm:w-auto"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enviar ({serviceCost} créditos)
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </Layout>
  );
}