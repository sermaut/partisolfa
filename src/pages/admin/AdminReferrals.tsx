import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Gift, 
  Users, 
  CheckCircle, 
  Clock,
  Search,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ReferralWithProfiles {
  id: string;
  referrer_id: string;
  referred_id: string;
  bonus_awarded: boolean;
  bonus_amount_kz: number;
  created_at: string;
  bonus_awarded_at: string | null;
  referrer_name: string;
  referrer_email: string;
  referred_name: string;
  referred_email: string;
}

interface Stats {
  totalReferrals: number;
  bonusesAwarded: number;
  pendingBonuses: number;
  totalBonusKz: number;
}

export default function AdminReferrals() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<ReferralWithProfiles[]>([]);
  const [filteredReferrals, setFilteredReferrals] = useState<ReferralWithProfiles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<Stats>({
    totalReferrals: 0,
    bonusesAwarded: 0,
    pendingBonuses: 0,
    totalBonusKz: 0
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/dashboard');
        return;
      }
      fetchReferrals();
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = referrals.filter(r => 
        r.referrer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referrer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referred_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referred_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReferrals(filtered);
    } else {
      setFilteredReferrals(referrals);
    }
  }, [searchTerm, referrals]);

  const fetchReferrals = async () => {
    try {
      // Fetch all referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');

      if (profilesError) throw profilesError;

      // Map profiles by user_id
      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, { name: p.full_name, email: p.email }])
      );

      // Merge referrals with profile data
      const enrichedReferrals: ReferralWithProfiles[] = (referralsData || []).map(r => ({
        ...r,
        referrer_name: profilesMap.get(r.referrer_id)?.name || 'Desconhecido',
        referrer_email: profilesMap.get(r.referrer_id)?.email || '',
        referred_name: profilesMap.get(r.referred_id)?.name || 'Desconhecido',
        referred_email: profilesMap.get(r.referred_id)?.email || ''
      }));

      setReferrals(enrichedReferrals);
      setFilteredReferrals(enrichedReferrals);

      // Calculate stats
      const totalReferrals = enrichedReferrals.length;
      const bonusesAwarded = enrichedReferrals.filter(r => r.bonus_awarded).length;
      const pendingBonuses = totalReferrals - bonusesAwarded;
      const totalBonusKz = enrichedReferrals
        .filter(r => r.bonus_awarded)
        .reduce((sum, r) => sum + r.bonus_amount_kz, 0);

      setStats({
        totalReferrals,
        bonusesAwarded,
        pendingBonuses,
        totalBonusKz
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de referências.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Gestão de <span className="text-gradient-gold">Referências</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Visualize todos os convites e bónus atribuídos no sistema.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Convites</p>
                  <p className="text-lg md:text-2xl font-display font-bold">{stats.totalReferrals}</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Bónus Pagos</p>
                  <p className="text-lg md:text-2xl font-display font-bold">{stats.bonusesAwarded}</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-lg md:text-2xl font-display font-bold">{stats.pendingBonuses}</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Pago</p>
                  <p className="text-lg md:text-2xl font-display font-bold">{stats.totalBonusKz} Kz</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="glass-card rounded-xl p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
          </div>

          {/* Referrals List */}
          {filteredReferrals.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Nenhuma referência encontrada
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum resultado corresponde à sua pesquisa.' : 'Ainda não há referências no sistema.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReferrals.map((referral) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-xl p-4 md:p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Gift className="w-5 h-5 text-primary" />
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          referral.bonus_awarded 
                            ? 'bg-success/20 text-success' 
                            : 'bg-warning/20 text-warning'
                        }`}>
                          {referral.bonus_awarded ? 'Bónus Pago' : 'Aguardando Depósito'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Referrer Info */}
                        <div className="bg-secondary/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Convidante</p>
                          <p className="font-medium">{referral.referrer_name}</p>
                          <p className="text-sm text-muted-foreground">{referral.referrer_email}</p>
                        </div>

                        {/* Referred Info */}
                        <div className="bg-secondary/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Convidado</p>
                          <p className="font-medium">{referral.referred_name}</p>
                          <p className="text-sm text-muted-foreground">{referral.referred_email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right md:text-left md:min-w-[180px]">
                      <div className="bg-primary/10 rounded-lg p-3 inline-block">
                        <p className="text-xs text-muted-foreground">Bónus</p>
                        <p className="text-xl font-display font-bold text-primary">
                          {referral.bonus_amount_kz} Kz
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ({(referral.bonus_amount_kz / 150).toFixed(1)} créditos)
                        </p>
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>
                          Criado: {format(new Date(referral.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}
                        </p>
                        {referral.bonus_awarded_at && (
                          <p className="text-success">
                            Pago: {format(new Date(referral.bonus_awarded_at), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
