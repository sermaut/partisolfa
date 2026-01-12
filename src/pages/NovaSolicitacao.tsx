import { useState, useRef } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ACCEPTED_FILE_TYPES = {
  audio: ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav'],
  image: ['image/jpeg', 'image/jpg', 'image/png'],
  document: ['application/pdf'],
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

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

  const [serviceType, setServiceType] = useState<'aperfeicoamento' | 'arranjo' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasEnoughCredits = (profile?.credits || 0) >= 1;

  const getFileType = (mimeType: string): 'audio' | 'image' | 'document' | null => {
    if (ACCEPTED_FILE_TYPES.audio.includes(mimeType)) return 'audio';
    if (ACCEPTED_FILE_TYPES.image.includes(mimeType)) return 'image';
    if (ACCEPTED_FILE_TYPES.document.includes(mimeType)) return 'document';
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'Ficheiro demasiado grande',
          description: `${file.name} excede o limite de 20MB.`,
          variant: 'destructive',
        });
        return;
      }

      const fileType = getFileType(file.type);
      if (!fileType) {
        toast({
          title: 'Tipo de ficheiro não suportado',
          description: `${file.name} não é um tipo de ficheiro permitido.`,
          variant: 'destructive',
        });
        return;
      }

      const uploadedFile: UploadedFile = { file, type: fileType };
      
      if (fileType === 'image') {
        uploadedFile.preview = URL.createObjectURL(file);
      }

      newFiles.push(uploadedFile);
    });

    setFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const getFileIcon = (type: 'audio' | 'image' | 'document') => {
    switch (type) {
      case 'audio':
        return <FileAudio className="w-5 h-5 text-primary" />;
      case 'image':
        return <Image className="w-5 h-5 text-success" />;
      case 'document':
        return <File className="w-5 h-5 text-warning" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceType || !title || files.length === 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos e anexe pelo menos um ficheiro.',
        variant: 'destructive',
      });
      return;
    }

    if (!hasEnoughCredits) {
      toast({
        title: 'Saldo insuficiente',
        description: 'Você não tem créditos suficientes para esta solicitação.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          user_id: user!.id,
          title,
          description,
          recommendations,
          service_type: serviceType,
          credits_used: 1,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Upload files
      for (const uploadedFile of files) {
        const fileExt = uploadedFile.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user!.id}/${task.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('task-files')
          .upload(filePath, uploadedFile.file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        // Save file record
        await supabase.from('task_files').insert({
          task_id: task.id,
          file_name: uploadedFile.file.name,
          file_path: filePath,
          file_type: uploadedFile.type,
          file_size: uploadedFile.file.size,
          is_result: false,
        });
      }

      // Deduct credit
      await supabase
        .from('profiles')
        .update({ credits: (profile?.credits || 0) - 1 })
        .eq('user_id', user!.id);

      await refreshProfile();

      toast({
        title: 'Solicitação enviada!',
        description: 'A sua solicitação foi submetida com sucesso. Receberá o resultado em breve.',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a solicitação. Por favor, tente novamente.',
        variant: 'destructive',
      });
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Nova <span className="text-gradient-gold">Solicitação</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Envie os ficheiros e informações para o seu serviço musical.
          </p>

          {!hasEnoughCredits && (
            <div className="glass-card rounded-xl p-4 mb-6 border-warning/50 bg-warning/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">Saldo insuficiente</p>
                  <p className="text-sm text-muted-foreground">
                    Você precisa de pelo menos 1 crédito para criar uma solicitação.{' '}
                    <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/deposito')}>
                      Depositar créditos
                    </Button>
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Service Type Selection */}
            <div className="space-y-4">
              <Label className="text-base">Tipo de Serviço *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setServiceType('aperfeicoamento')}
                  className={`glass-card rounded-xl p-6 text-left transition-all ${
                    serviceType === 'aperfeicoamento'
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      serviceType === 'aperfeicoamento' ? 'bg-primary' : 'bg-primary/20'
                    }`}>
                      <Music className={`w-6 h-6 ${
                        serviceType === 'aperfeicoamento' ? 'text-primary-foreground' : 'text-primary'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold">Aperfeiçoamento</p>
                      <p className="text-sm text-muted-foreground">
                        Melhoria de partituras e músicas
                      </p>
                    </div>
                  </div>
                  {serviceType === 'aperfeicoamento' && (
                    <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-primary" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setServiceType('arranjo')}
                  className={`glass-card rounded-xl p-6 text-left transition-all relative ${
                    serviceType === 'arranjo'
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      serviceType === 'arranjo' ? 'bg-primary' : 'bg-primary/20'
                    }`}>
                      <FileMusic className={`w-6 h-6 ${
                        serviceType === 'arranjo' ? 'text-primary-foreground' : 'text-primary'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold">Arranjo Musical</p>
                      <p className="text-sm text-muted-foreground">
                        Criação de arranjos personalizados
                      </p>
                    </div>
                  </div>
                  {serviceType === 'arranjo' && (
                    <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-primary" />
                  )}
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título da Solicitação *</Label>
              <Input
                id="title"
                placeholder="Ex: Arranjo para coro - Música Tradicional"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva detalhadamente o que pretende..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-secondary border-border min-h-[100px]"
              />
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <Label htmlFor="recommendations">Recomendações Específicas</Label>
              <Textarea
                id="recommendations"
                placeholder="Indique instrumentos desejados, estilo, andamento, tonalidade..."
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                className="bg-secondary border-border min-h-[100px]"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <Label>Ficheiros *</Label>
              <p className="text-sm text-muted-foreground">
                Formatos aceites: MP3, WAV (áudio), JPG, PNG (imagem), PDF (documento). Máximo 20MB por ficheiro.
              </p>
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="glass-card rounded-xl p-8 border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer text-center"
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium">Clique para selecionar ficheiros</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ou arraste e solte aqui
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".mp3,.wav,.jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="glass-card rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {file.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cost Info */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Custo do serviço</p>
                  <p className="text-sm text-muted-foreground">
                    Será debitado do seu saldo
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-display font-bold text-primary">1 crédito</p>
                  <p className="text-sm text-muted-foreground">
                    Saldo atual: {profile?.credits?.toFixed(1)} créditos
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="premium"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !hasEnoughCredits || !serviceType || !title || files.length === 0}
            >
              {isSubmitting ? 'A enviar...' : 'Enviar Solicitação'}
            </Button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
