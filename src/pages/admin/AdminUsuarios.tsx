import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Users,
  Search,
  CreditCard,
  Mail,
  Calendar,
  Edit,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  credits: number;
  created_at: string;
}

export default function AdminUsuarios() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [editCredits, setEditCredits] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/dashboard');
        return;
      }
      fetchProfiles();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (profile: Profile) => {
    setSelectedProfile(profile);
    setEditCredits(profile.credits.toString());
  };

  const closeDialog = () => {
    setSelectedProfile(null);
    setEditCredits('');
  };

  const updateCredits = async () => {
    if (!selectedProfile) return;

    const newCredits = parseFloat(editCredits);
    if (isNaN(newCredits) || newCredits < 0) {
      toast({
        title: 'Valor inválido',
        description: 'Por favor, insira um valor válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', selectedProfile.id);

      if (error) throw error;

      // Send notification
      const creditDiff = newCredits - selectedProfile.credits;
      if (creditDiff !== 0) {
        await supabase.from('notifications').insert({
          user_id: selectedProfile.user_id,
          title: creditDiff > 0 ? 'Créditos adicionados' : 'Ajuste de créditos',
          message: creditDiff > 0 
            ? `Foram adicionados ${creditDiff.toFixed(1)} créditos à sua conta.`
            : `O seu saldo de créditos foi ajustado.`,
        });
      }

      toast({
        title: 'Créditos actualizados',
        description: 'O saldo do usuário foi alterado com sucesso.',
      });

      closeDialog();
      fetchProfiles();
    } catch (error) {
      console.error('Error updating credits:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível actualizar os créditos.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      profile.full_name.toLowerCase().includes(query) ||
      profile.email.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (authLoading || isLoading) {
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
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao painel
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="font-display text-3xl font-bold">
              <span className="text-gradient-gold">Usuários</span>
            </h1>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary"
              />
            </div>
          </div>

          {/* Users List */}
          {filteredProfiles.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Tente ajustar a pesquisa.' : 'Não existem usuários registados.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="glass-card rounded-xl p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-lg">
                        {profile.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{profile.full_name}</h3>
                        <p className="text-sm text-muted-foreground truncate max-w-[160px]">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(profile)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-medium text-primary">{profile.credits.toFixed(1)} créditos</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(profile.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Credits Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Editar Créditos
            </DialogTitle>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-lg">
                  {selectedProfile.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{selectedProfile.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedProfile.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Saldo de Créditos</Label>
                <Input
                  id="credits"
                  type="number"
                  step="0.1"
                  min="0"
                  value={editCredits}
                  onChange={(e) => setEditCredits(e.target.value)}
                  className="bg-secondary"
                />
                <p className="text-xs text-muted-foreground">
                  Saldo actual: {selectedProfile.credits.toFixed(1)} créditos
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button
                  variant="premium"
                  onClick={updateCredits}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Guardar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
