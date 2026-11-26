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
      <section className="relative isolate overflow-hidden bg-[#061a31] text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_38%,rgba(22,111,190,.38),transparent_34%),linear-gradient(120deg,#061a31_0%,#092b50_58%,#061a31_100%)]" />
        <div className="absolute -right-24 top-10 -z-10 h-80 w-80 rounded-full border border-white/10 md:h-[34rem] md:w-[34rem]" />
        <div className="absolute right-10 top-24 -z-10 h-64 w-64 rounded-full border border-[#f6b91a]/20 md:right-28 md:top-28 md:h-96 md:w-96" />

        <div className="container mx-auto grid min-h-[650px] min-w-0 grid-cols-1 items-center gap-12 px-4 py-16 md:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] md:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }} className="relative z-10 w-full min-w-0 max-w-2xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f6b91a]/35 bg-[#f6b91a]/10 px-4 py-2 text-sm font-semibold tracking-wide text-[#ffd45c]">
              <Sparkles className="h-4 w-4" /> SERVIÇOS MUSICAIS PROFISSIONAIS
            </span>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Damos forma à sua <span className="text-[#ffc629]">música.</span>
            </h1>
            <p className="mb-9 max-w-xl text-base leading-7 text-blue-100/80 sm:text-lg">
              Arranjos e transposições musicais com atenção ao detalhe. Envie a sua partitura ou áudio e acompanhe cada solicitação na sua conta PARTISOLFA.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl" className="h-12 bg-[#ffc629] px-7 font-bold text-[#17243a] shadow-lg shadow-yellow-500/20 hover:bg-[#ffd65b]">
                <Link to={user ? '/dashboard' : '/registar'}>
                  {user ? 'Ir para o painel' : 'Começar agora'} <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="h-12 border-white/35 bg-white/5 px-7 font-semibold text-white hover:border-white hover:bg-white/10 hover:text-white">
                <Link to="/servicos">Explorar serviços</Link>
              </Button>
            </div>
            <div className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
              <div><p className="text-2xl font-extrabold text-[#ffc629]">1,5</p><p className="mt-1 text-xs text-blue-100/70 sm:text-sm">Créditos de bónus</p></div>
              <div><p className="text-2xl font-extrabold text-[#ffc629]">2</p><p className="mt-1 text-xs text-blue-100/70 sm:text-sm">Serviços disponíveis</p></div>
              <div><p className="text-2xl font-extrabold text-[#ffc629]">3 dias</p><p className="mt-1 text-xs text-blue-100/70 sm:text-sm">Prazo previsto</p></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7, delay: .12 }} className="relative mx-auto flex w-full min-w-0 max-w-xl items-center justify-center py-8">
            <div className="absolute h-[min(78vw,390px)] w-[min(78vw,390px)] rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative w-full min-w-0 overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-[#123d69] via-[#0b2c4e] to-[#071c34] p-5 shadow-2xl shadow-black/30 sm:p-7 lg:p-10">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#ffc629]/10 blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3"><Music2 className="h-7 w-7 text-[#ffc629]" /></div>
                <span className="text-xs font-semibold uppercase tracking-[.24em] text-blue-100/60">PARTISOLFA</span>
              </div>
              <div className="relative my-10 space-y-4">
                <div className="flex items-center gap-3 text-5xl font-light text-white/90 sm:text-6xl"><span>♪</span><span className="text-[#ffc629]">♫</span><span>♬</span><span className="text-[#ffc629]">♩</span></div>
                <div className="space-y-3 opacity-80">
                  {[0,1,2,3,4].map((line) => <div key={line} className="h-px w-full bg-gradient-to-r from-white/50 via-white/20 to-transparent" />)}
                </div>
                <div className="flex h-20 items-end justify-center gap-1.5">
                  {[24,42,31,58,76,45,65,34,55,82,48,30,62,43,72,38,54,28,66,45,76,36].map((height, i) => <span key={i} className="w-2 rounded-t-full bg-gradient-to-t from-blue-400 to-[#ffd45c]" style={{ height: height + '%' }} />)}
                </div>
              </div>
              <div className="relative grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/10 p-4"><FileMusic className="mb-2 h-5 w-5 text-[#ffc629]" /><p className="text-sm font-bold">Arranjos</p><p className="mt-1 text-xs text-blue-100/65">Harmonia e vozes</p></div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4"><AudioWaveform className="mb-2 h-5 w-5 text-sky-300" /><p className="text-sm font-bold">Transposição</p><p className="mt-1 text-xs text-blue-100/65">Fidelidade ao original</p></div>
              </div>
            </div>
            <div className="absolute -bottom-1 -left-2 rounded-xl border border-white/15 bg-[#102f50] px-4 py-3 shadow-xl sm:-left-8"><div className="flex items-center gap-2 text-sm font-semibold"><Headphones className="h-4 w-4 text-[#ffc629]" /> Música com precisão</div></div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#f5f8fc] py-16 text-slate-900 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[.22em] text-blue-700">O que fazemos</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Os nossos <span className="text-blue-700">serviços</span></h2>
            <p className="mt-4 text-slate-600">Escolha a solução musical adequada ao seu projecto e conheça as condições antes de solicitar.</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.article key={service.title} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .12 }} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_14px_40px_-28px_rgba(15,35,65,.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-9">
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${service.tone === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}><Icon className="h-7 w-7" /></div>
                  <h3 className="text-2xl font-extrabold">{service.title}</h3>
                  <p className="mt-3 min-h-14 leading-7 text-slate-600">{service.description}</p>
                  <div className="mt-7 flex items-end justify-between border-t border-slate-100 pt-5">
                    <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Preço</p><p className="mt-1 text-2xl font-extrabold text-[#173b68]">{service.price}</p><p className="text-xs text-slate-500">{service.credits}</p></div>
                    <Button asChild className="bg-[#173b68] font-semibold text-white hover:bg-blue-800"><Link to={user ? '/nova-solicitacao' : '/registar'}>Saber mais <ArrowRight className="h-4 w-4" /></Link></Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
          <div className="mt-9 text-center"><Button asChild variant="link" className="font-bold text-blue-800"><Link to="/servicos">Ver detalhes de todos os serviços <ArrowRight className="h-4 w-4" /></Link></Button></div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></div><div><h3 className="font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#071d35] py-16 text-center text-white md:py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-extrabold sm:text-4xl">O próximo passo da sua música começa aqui.</h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100/75">Crie a sua conta e receba 1,5 créditos de bónus para experimentar os nossos serviços.</p>
          {!user && <Button asChild size="lg" className="mt-8 bg-[#ffc629] font-bold text-[#17243a] hover:bg-[#ffd65b]"><Link to="/registar">Criar conta gratuita <ArrowRight className="h-4 w-4" /></Link></Button>}
        </div>
      </section>
    </Layout>
  );
}
