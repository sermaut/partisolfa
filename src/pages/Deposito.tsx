import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Upload, 
  X, 
  Building2, 
  Copy, 
  Check,
  Calculator,
  FileImage
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BANK_DETAILS = {
  bank: 'BAI – Banco Angolano de Investimentos',
  iban: '0040 0000 63929866101 68',
};

const KZ_PER_CREDIT = 150;

export default function Deposito() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);

  const calculatedCredits = amount ? parseFloat(amount) / KZ_PER_CREDIT : 0;

  const copyIban = () => {
    navigator.clipboard.writeText(BANK_DETAILS.iban.replace(/\s/g, ''));
    setCopiedIban(true);
    toast({
      title: 'IBAN copiado!',
      description: 'O IBAN foi copiado para a área de transferência.',
    });
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Tipo de ficheiro inválido',
        description: 'Por favor, envie uma imagem (JPG, PNG) ou PDF.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Ficheiro demasiado grande',
        description: 'O ficheiro não pode exceder 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setProofFile(file);
    if (file.type.startsWith('image/')) {
      setProofPreview(URL.createObjectURL(file));
    } else {
      setProofPreview(null);
    }
  };

  const removeFile = () => {
    if (proofPreview) {
      URL.revokeObjectURL(proofPreview);
    }
    setProofFile(null);
    setProofPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !proofFile) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha o valor e anexe o comprovativo.',
        variant: 'destructive',
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue < KZ_PER_CREDIT) {
      toast({
        title: 'Valor inválido',
        description: `O valor mínimo é ${KZ_PER_CREDIT} Kz (1 crédito).`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload proof file
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user!.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('deposit-proofs')
        .upload(filePath, proofFile);

      if (uploadError) throw uploadError;

      // Create deposit record
      const { error: depositError } = await supabase.from('deposits').insert({
        user_id: user!.id,
        amount_kz: amountValue,
        credits_amount: calculatedCredits,
        proof_file_path: filePath,
        proof_file_name: proofFile.name,
      });

      if (depositError) throw depositError;

      toast({
        title: 'Depósito submetido!',
        description: 'O seu pedido de depósito foi enviado. Será processado em breve.',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting deposit:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o depósito. Por favor, tente novamente.',
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Depositar <span className="text-gradient-gold">Créditos</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Transfira o valor e anexe o comprovativo para adicionar créditos à sua conta.
          </p>

          {/* Current Balance */}
          <div className="glass-card rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo actual</p>
                <p className="text-3xl font-display font-bold text-primary">
                  {profile?.credits?.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">créditos</span>
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-primary" />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="glass-card rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Dados Bancários</p>
                <p className="text-sm text-muted-foreground">Para transferência</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Banco</p>
                <p className="font-medium">{BANK_DETAILS.bank}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">IBAN</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-medium text-lg">{BANK_DETAILS.iban}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyIban}
                    className="h-8 w-8"
                  >
                    {copiedIban ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="glass-card rounded-xl p-4 mb-8 bg-primary/5 border-primary/30">
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5 text-primary" />
              <p className="text-sm">
                <span className="font-semibold text-primary">{KZ_PER_CREDIT} Kz = 1 crédito</span>
                {' '}• Cada serviço consome 1 crédito
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Valor Transferido (Kz) *</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ex: 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-secondary border-border pr-16"
                  min={KZ_PER_CREDIT}
                  step="1"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  Kz
                </span>
              </div>
              {amount && parseFloat(amount) >= KZ_PER_CREDIT && (
                <p className="text-sm text-success">
                  Você receberá <span className="font-semibold">{calculatedCredits.toFixed(1)} créditos</span>
                </p>
              )}
            </div>

            {/* Proof Upload */}
            <div className="space-y-2">
              <Label>Comprovativo de Transferência *</Label>
              <p className="text-sm text-muted-foreground">
                Anexe uma imagem ou PDF do comprovativo bancário.
              </p>

              {!proofFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="glass-card rounded-xl p-8 border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer text-center"
                >
                  <FileImage className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium">Clique para selecionar</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG ou PDF (máximo 10MB)
                  </p>
                </div>
              ) : (
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {proofPreview ? (
                        <img
                          src={proofPreview}
                          alt="Comprovativo"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                          <FileImage className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium truncate max-w-[200px]">
                          {proofFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="premium"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !amount || !proofFile}
            >
              {isSubmitting ? 'A enviar...' : 'Submeter Depósito'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              O seu depósito será processado e os créditos serão adicionados à sua conta após verificação.
            </p>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
