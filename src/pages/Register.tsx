import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music2, Mail, Lock, Eye, EyeOff, User, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de campos
    if (!fullName.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, insira o seu nome completo.',
        variant: 'destructive',
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, insira o seu e-mail.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As palavras-passe não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Erro',
        description: 'A palavra-passe deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // If referral code provided, validate it exists
      let referrerUserId: string | null = null;
      if (referralCode.trim()) {
        const { data: referrerProfile, error: refError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('referral_code', referralCode.trim().toUpperCase())
          .maybeSingle();

        if (refError) {
          console.error('Erro ao validar código de convite:', refError);
          toast({
            title: 'Erro de validação',
            description: 'Não foi possível validar o código de convite. Tente novamente.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        if (!referrerProfile) {
          toast({
            title: 'Código de convite inválido',
            description: 'O código de convite inserido não existe.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        referrerUserId = referrerProfile.user_id;
      }

      // Criar conta
      const { error } = await signUp(email, password, fullName);

      if (error) {
        let errorMessage = 'Ocorreu um erro. Por favor, tente novamente.';
        
        if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
          errorMessage = 'Este e-mail já está registado. Tente fazer login ou use outro e-mail.';
        } else if (error.message?.includes('Invalid email')) {
          errorMessage = 'O formato do e-mail é inválido.';
        } else if (error.message?.includes('Password')) {
          errorMessage = 'A palavra-passe não cumpre os requisitos de segurança.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast({
          title: 'Erro ao criar conta',
          description: errorMessage,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Aguardar um momento para garantir que o utilizador foi criado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // If referral code was valid, update the new user's profile and create referral record
      if (referrerUserId) {
        const { data: { user: newUser } } = await supabase.auth.getUser();
        
        if (newUser) {
          // Update profile with referred_by
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ referred_by: referrerUserId })
            .eq('user_id', newUser.id);

          if (updateError) {
            console.error('Erro ao atualizar perfil com referral:', updateError);
          }

          // Create referral record
          const { error: referralError } = await supabase.from('referrals').insert({
            referrer_id: referrerUserId,
            referred_id: newUser.id,
          });

          if (referralError) {
            console.error('Erro ao criar registo de referral:', referralError);
          }
        }
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Bem-vindo à PARTISOLFA. Recebeu 1.5 créditos de bónus!',
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro inesperado no registo:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-card items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center z-10 p-8"
        >
          <div className="music-wave mx-auto mb-8">
            <span style={{ height: '12px' }}></span>
            <span style={{ height: '18px' }}></span>
            <span style={{ height: '8px' }}></span>
            <span style={{ height: '15px' }}></span>
            <span style={{ height: '10px' }}></span>
          </div>
          
          <h2 className="font-display text-4xl font-bold mb-4">
            Junte-se à <span className="text-gradient-gold">PARTISOLFA</span>
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Crie a sua conta e comece a transformar as suas ideias musicais 
            em obras-primas profissionais.
          </p>

          <div className="glass-card rounded-xl p-6 max-w-xs mx-auto">
            <h3 className="font-semibold text-primary mb-2">🎁 Bónus de Boas-vindas</h3>
            <p className="text-sm text-muted-foreground">
              Ao criar a sua conta, recebe automaticamente <span className="text-primary font-semibold">1.5 créditos</span> para 
              experimentar os nossos serviços!
            </p>
          </div>
        </motion.div>

        {/* Floating Music Notes */}
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[20%] text-primary/20 text-6xl font-display"
        >
          ♪
        </motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[30%] left-[20%] text-primary/15 text-8xl font-display"
        >
          ♫
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center">
              <Music2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-gradient-gold">
              PARTISOLFA
            </span>
          </Link>

          <h1 className="font-display text-3xl font-bold mb-2">Criar Conta</h1>
          <p className="text-muted-foreground mb-8">
            Preencha os dados abaixo para começar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="O seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-secondary border-border"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Palavra-passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repetir palavra-passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralCode">
                Código de Convite <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="Ex: ABC12345"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="pl-10 bg-secondary border-border uppercase"
                  maxLength={8}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Se foi convidado por alguém, insira o código de convite.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Ao criar conta, concorda com os nossos{' '}
              <Link to="/termos" className="text-primary hover:underline">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link to="/privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </Link>.
            </p>

            <Button
              type="submit"
              variant="premium"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'A criar conta...' : 'Criar Conta'}
            </Button>
          </form>

          <p className="text-center mt-6 text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
