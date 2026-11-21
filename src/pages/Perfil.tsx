import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User,
  Phone,
  Mail,
  Camera,
  Loader2,
  CreditCard,
  Gift,
  Copy,
  Check,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Perfil() {
  const { user, profile, refreshProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (profile) {
      setFullName(profile.full_name || '');
      setPhone((profile as any).phone || '');
      setAvatarUrl((profile as any).avatar_url || null);
      fetchReferralData();
    }
  }, [profile, user, authLoading, navigate]);

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      // Fetch referral code
      const { data: profileData } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('user_id', user.id)
        .single();

      if (profileData?.referral_code) {
        setReferralCode(profileData.referral_code);
      }

      // Fetch referral count
      const { count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id);

      setReferralCount(count || 0);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const getReferralLink = () => {
    if (!referralCode) return '';
    return `${window.location.origin}/registar?ref=${referralCode}`;
  };

  const copyReferralLink = () => {
    const link = getReferralLink();
    if (link) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      toast({
        title: 'Link copiado!',
        description: 'O link de convite foi copiado para a área de transferência.',
      });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

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

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();

      toast({
        title: 'Foto actualizada',
        description: 'A sua foto de perfil foi actualizada com sucesso.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a foto.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!fullName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, preencha o seu nome.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: 'Perfil actualizado',
        description: 'Os seus dados foram guardados com sucesso.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível guardar o perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
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
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold mb-2">
            Meu <span className="text-gradient-gold">Perfil</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Gerencie as suas informações pessoais.
          </p>

          <div className="glass-card rounded-xl p-6 space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-primary">
                  <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                  <AvatarFallback className="text-2xl font-display bg-primary/20 text-primary">
                    {fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Clique para alterar a foto
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  <User className="w-4 h-4 inline mr-2" />
                  Nome Completo
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-secondary border-border"
                  placeholder="O seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-2" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-secondary/50 border-border text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  O e-mail não pode ser alterado.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Número de Telefone
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-secondary border-border"
                  placeholder="+244 XXX XXX XXX"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Saldo de Créditos
                </Label>
                <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-muted-foreground">Saldo disponível</span>
                  <span className="text-xl font-display font-bold text-primary">
                    {profile?.credits?.toFixed(1)} créditos
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              variant="premium"
              className="w-full"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A guardar...
                </>
              ) : (
                'Guardar Alterações'
              )}
            </Button>
          </div>

          {/* Referral Section */}
          <div className="glass-card rounded-xl p-6 mt-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Convide Amigos</p>
                <p className="text-sm text-muted-foreground">Ganhe 300 Kz (2 créditos) por cada convite</p>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">O seu link de convite:</p>
              <div className="flex items-center gap-2">
                <Input
                  value={getReferralLink()}
                  readOnly
                  className="bg-background border-border text-sm font-mono"
                />
                <Button
                  variant="glass"
                  size="icon"
                  onClick={copyReferralLink}
                  className="shrink-0"
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Pessoas convidadas</p>
                  <p className="text-2xl font-display font-bold text-primary">{referralCount}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Quando alguém se regista com o seu link e completa o primeiro depósito, 
              você recebe automaticamente <span className="text-primary font-semibold">300 Kz (2 créditos)</span> de bónus!
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
