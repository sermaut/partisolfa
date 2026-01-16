import { useState, useRef } from 'react';
import { 
  Camera,
  Phone,
  Loader2,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileCompletionModalProps {
  open: boolean;
  userId: string;
  userName: string;
  onComplete: () => void;
}

export function ProfileCompletionModal({ 
  open, 
  userId, 
  userName,
  onComplete 
}: ProfileCompletionModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Tipo de ficheiro inválido',
        description: 'Por favor, seleccione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Ficheiro demasiado grande',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!phone.trim()) {
      toast({
        title: 'Telefone obrigatório',
        description: 'Por favor, insira o seu número de telefone.',
        variant: 'destructive',
      });
      return;
    }

    if (!avatarFile) {
      toast({
        title: 'Foto obrigatória',
        description: 'Por favor, seleccione uma foto de perfil.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Upload avatar
      setIsUploading(true);
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setIsUploading(false);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone: phone.trim(),
          avatar_url: publicUrl,
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      toast({
        title: 'Perfil completo!',
        description: 'Os seus dados foram guardados com sucesso.',
      });

      onComplete();
    } catch (error) {
      console.error('Error completing profile:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível completar o perfil. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md bg-card"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Complete o seu Perfil
          </DialogTitle>
          <DialogDescription>
            Para continuar, precisamos de algumas informações adicionais.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="w-24 h-24 border-2 border-primary">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-2xl font-display bg-primary/20 text-primary">
                  {userName?.charAt(0)?.toUpperCase() || <User className="w-8 h-8" />}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </div>
            <Label className="mt-3 text-sm">
              Foto de Perfil <span className="text-destructive">*</span>
            </Label>
            {!avatarFile && (
              <p className="text-xs text-muted-foreground">
                Clique para seleccionar uma foto
              </p>
            )}
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              <Phone className="w-4 h-4 inline mr-2" />
              Número de Telefone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-secondary border-border"
              placeholder="+244 XXX XXX XXX"
            />
          </div>

          {/* Submit Button */}
          <Button
            variant="premium"
            className="w-full"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isUploading ? 'A carregar foto...' : 'A guardar...'}
              </>
            ) : (
              'Continuar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}