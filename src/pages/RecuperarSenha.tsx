import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: 'E-mail enviado!',
        description: 'Verifique a sua caixa de entrada para redefinir a palavra-passe.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar e-mail',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
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

          {emailSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">E-mail Enviado!</h1>
              <p className="text-muted-foreground mb-8">
                Enviámos um link de recuperação para <strong className="text-foreground">{email}</strong>. 
                Verifique a sua caixa de entrada e siga as instruções.
              </p>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  Enviar novamente
                </Button>
                <Link to="/login" className="block">
                  <Button variant="premium" className="w-full">
                    Voltar ao Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </Link>

              <h1 className="font-display text-3xl font-bold mb-2">Recuperar Palavra-passe</h1>
              <p className="text-muted-foreground mb-8">
                Introduza o seu e-mail e enviaremos um link para redefinir a sua palavra-passe.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
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

                <Button
                  type="submit"
                  variant="premium"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'A enviar...' : 'Enviar Link de Recuperação'}
                </Button>
              </form>
            </>
          )}

          <p className="text-center mt-6 text-muted-foreground">
            Lembrou-se da palavra-passe?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
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
            Não se preocupe
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Recuperar o acesso à sua conta é simples e rápido. 
            Basta seguir as instruções enviadas por e-mail.
          </p>
        </motion.div>

        {/* Floating Music Notes */}
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[20%] text-primary/20 text-6xl font-display"
        >
          ♪
        </motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[30%] right-[20%] text-primary/15 text-8xl font-display"
        >
          ♫
        </motion.div>
      </div>
    </div>
  );
}
