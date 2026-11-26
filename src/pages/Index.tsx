import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Music, FileMusic, Sparkles, ArrowRight, Shield, Clock, Award, Headphones, AudioWaveform, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';

const services = [
  {
    title: 'Arranjo Musical',
    description: 'Arranjos profissionais personalizados, com correcção harmónica e melhoria de vozes.',
    price: '450 Kz',
    credits: '3 créditos',
    icon: FileMusic,
    tone: 'blue',
  },
  {
    title: 'Transposição Musical',
    description: 'Transposição fiel do arranjo original, sem alterações harmónicas ou criativas.',
    price: '250 Kz',
    credits: '~1,67 créditos',
    icon: Music,
    tone: 'gold',
  },
];

const benefits = [
  { icon: Shield, title: 'Ficheiros protegidos', text: 'As suas solicitações e ficheiros ficam associados à sua conta.' },
  { icon: Clock, title: 'Prazos claros', text: 'Prazo de entrega previsto até 3 dias.' },
  { icon: Award, title: 'Trabalho especializado', text: 'Serviços orientados para partituras, arranjos e música.' },
];

export default function Index() {
  const { user } = useAuth();

  return (
    <Layout>
      <section className="relative isolate overflow-hidden bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto grid min-h-[650px] items-center gap-12 px-4 py-16 md:grid-cols-[1.05fr_.95fr] md:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }} className="relative z-10 max-w-2xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-sidebar-primary/35 bg-sidebar-primary/10 px-4 py-2 text-sm font-semibold tracking-wide text-sidebar-primary">
              <Sparkles className="h-4 w-4" /> SERVIÇOS MUSICAIS PROFISSIONAIS
            </span>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Transforma a sua <span className="text-sidebar-primary">música.</span>
            </h1>
            <p className="mb-9 max-w-xl text-base leading-7 text-sidebar-foreground/80 sm:text-lg">
              Arranjos e transposições musicais com atenção ao detalhe. Envie a sua partitura ou áudio e acompanhe cada solicitação na sua conta PARTISOLFA.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl" variant="premium" className="h-12 px-7 font-bold">
                <Link to={user ? '/dashboard' : '/login'}>
                  {user ? 'Ir para o painel' : 'Entrar'} <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="h-12 border-sidebar-foreground/35 bg-sidebar-accent px-7 font-semibold text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground">
                <Link to="/servicos">Explorar serviços</Link>
              </Button>
            </div>
            <div className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-sidebar-border pt-6">
              <div><p className="text-2xl font-extrabold text-sidebar-primary">1,5</p><p className="mt-1 text-xs text-sidebar-foreground/70 sm:text-sm">Créditos de bónus</p></div>
              <div><p className="text-2xl font-extrabold text-sidebar-primary">2</p><p className="mt-1 text-xs text-sidebar-foreground/70 sm:text-sm">Serviços disponíveis</p></div>
              <div><p className="text-2xl font-extrabold text-sidebar-primary">3 dias</p><p className="mt-1 text-xs text-sidebar-foreground/70 sm:text-sm">Prazo previsto</p></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7, delay: .12 }} className="relative mx-auto flex w-full max-w-xl items-center justify-center py-8">
            <div className="relative w-full overflow-hidden rounded-lg border border-sidebar-border bg-sidebar-accent p-7 shadow-elevated sm:p-10">
              <div className="relative flex items-center justify-between">
                <div className="rounded-md border border-sidebar-foreground/15 bg-sidebar-foreground/10 p-3"><Music2 className="h-7 w-7 text-sidebar-primary" /></div>
                <span className="text-xs font-semibold uppercase text-sidebar-foreground/60">PARTISOLFA</span>
              </div>
              <div className="relative my-10 space-y-4">
                <div className="flex items-center gap-3 text-5xl font-light text-sidebar-foreground/90 sm:text-6xl"><span>♪</span><span className="text-sidebar-primary">♫</span><span>♬</span><span className="text-sidebar-primary">♩</span></div>
                <div className="space-y-3 opacity-80">
                  {[0,1,2,3,4].map((line) => <div key={line} className="h-px w-full bg-gradient-to-r from-sidebar-foreground/40 via-sidebar-foreground/15 to-transparent" />)}
                </div>
                <div className="flex h-20 items-end justify-center gap-1.5">
                  {[24,42,31,58,76,45,65,34,55,82,48,30,62,43,72,38,54,28,66,45,76,36].map((height, i) => <span key={i} className="w-2 rounded-t-full bg-gradient-to-t from-info to-sidebar-primary" style={{ height: height + '%' }} />)}
                </div>
              </div>
              <div className="relative grid grid-cols-2 gap-3">
                <div className="rounded-md border border-sidebar-foreground/10 bg-sidebar-foreground/10 p-4"><FileMusic className="mb-2 h-5 w-5 text-sidebar-primary" /><p className="text-sm font-bold">Arranjos</p><p className="mt-1 text-xs text-sidebar-foreground/70">Harmonia e vozes</p></div>
                <div className="rounded-md border border-sidebar-foreground/10 bg-sidebar-foreground/10 p-4"><AudioWaveform className="mb-2 h-5 w-5 text-info" /><p className="text-sm font-bold">Transposição</p><p className="mt-1 text-xs text-sidebar-foreground/70">Fidelidade ao original</p></div>
              </div>
            </div>
            <div className="absolute -bottom-1 -left-2 rounded-md border border-sidebar-border bg-sidebar px-4 py-3 shadow-elevated sm:-left-8"><div className="flex items-center gap-2 text-sm font-semibold"><Headphones className="h-4 w-4 text-sidebar-primary" /> Música com precisão</div></div>
          </motion.div>
        </div>
      </section>

      <section className="bg-background py-16 text-foreground md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase text-primary">O que fazemos</span>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Os nossos <span className="text-primary">serviços</span></h2>
            <p className="mt-4 text-muted-foreground">Escolha a solução musical adequada ao seu projecto e conheça as condições antes de solicitar.</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.article key={service.title} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .12 }} className="glass-card group relative overflow-hidden p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated sm:p-9">
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-md ${service.tone === 'blue' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'}`}><Icon className="h-7 w-7" /></div>
                  <h3 className="text-2xl font-extrabold">{service.title}</h3>
                  <p className="mt-3 min-h-14 leading-7 text-muted-foreground">{service.description}</p>
                  <div className="mt-7 flex items-end justify-between border-t border-slate-100 pt-5">
                    <div><p className="text-xs font-semibold uppercase text-muted-foreground">Preço</p><p className="mt-1 text-2xl font-extrabold text-primary">{service.price}</p><p className="text-xs text-muted-foreground">{service.credits}</p></div>
                    <Button asChild variant="premium"><Link to={user ? '/nova-solicitacao' : '/registar'}>Saber mais <ArrowRight className="h-4 w-4" /></Link></Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
          <div className="mt-9 text-center"><Button asChild variant="link" className="font-bold text-primary"><Link to="/servicos">Ver detalhes de todos os serviços <ArrowRight className="h-4 w-4" /></Link></Button></div>
        </div>
      </section>

      <section className="bg-card py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => <div key={title} className="glass-card flex gap-4 p-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><div><h3 className="font-bold text-foreground">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="bg-sidebar py-16 text-center text-sidebar-foreground md:py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-extrabold sm:text-4xl">O próximo passo da sua música começa aqui.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sidebar-foreground/75">Crie a sua conta e receba 1,5 créditos de bónus para experimentar os nossos serviços.</p>
          {!user && <Button asChild size="lg" variant="premium" className="mt-8"><Link to="/registar">Criar conta gratuita <ArrowRight className="h-4 w-4" /></Link></Button>}
        </div>
      </section>
    </Layout>
  );
}
