import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Music, FileMusic, CheckCircle, Clock, Star, ArrowRight, Sparkles, Layers, Wand2, Users, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';

const services = [
  {
    id: 'arranjo',
    title: 'Arranjo Musical',
    description: 'Criamos arranjos profissionais personalizados para qualquer hino, com correcção harmónica e harmonização completa.',
    icon: FileMusic,
    features: ['Correcção de erros harmónicos e melódicos','Harmonização profissional de hinos','Melhoria de vozes musicais e contrapontos','Partes instrumentais/vocais separadas por partições','Aceita PDFs, imagens e áudios'],
    price: '450 Kz',
    credits: '3 créditos',
    delivery: 'Até 3 dias',
    popular: true,
    accent: 'blue',
  },
  {
    id: 'transposicao',
    title: 'Transposição Musical',
    description: 'Recriamos arranjos de forma fiel ao original, sem intervenção no conteúdo anexado.',
    icon: Music,
    features: ['Sem ajuste de erros harmónicos','Sem melhoria de vozes musicais e contrapontos','Sem intervenção no arranjo anexado','Transposição fiel ao original','Aceita apenas imagens e áudios'],
    price: '250 Kz',
    credits: '1,67 créditos',
    delivery: 'Até 3 dias',
    popular: false,
    accent: 'amber',
  },
];

const benefits = [
  { icon: Sparkles, title: 'Qualidade profissional', description: 'Trabalhos realizados por músicos com formação académica.' },
  { icon: Clock, title: 'Entrega rápida', description: 'Prazos de entrega claros, até 3 dias.' },
  { icon: Layers, title: 'Formatos versáteis', description: 'Entrega em formatos adequados ao seu trabalho musical.' },
  { icon: Users, title: 'Suporte dedicado', description: 'Acompanhamento durante o processo da sua solicitação.' },
];

export default function Servicos() {
  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <section className="relative overflow-hidden bg-sidebar px-4 py-16 text-sidebar-foreground md:py-20">
          <div className="container relative mx-auto max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <span className="text-xs font-bold uppercase text-sidebar-primary">PARTISOLFA · Soluções musicais</span>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">Serviços que dão vida à sua <span className="text-sidebar-primary">música.</span></h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-sidebar-foreground/75">Compare as opções, consulte os preços e escolha o serviço adequado ao seu projecto musical.</p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-14 md:py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase text-primary">Escolha o serviço</span>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Soluções <span className="text-primary">à sua medida</span></h2>
          </div>
          <div className="mx-auto grid max-w-5xl gap-7 md:grid-cols-2">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.article key={service.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .12 }} className={`glass-card relative p-7 shadow-card sm:p-8 ${service.popular ? 'surface-blue' : ''}`}>
                  {service.popular && <div className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-md bg-warning px-4 py-1.5 text-xs font-extrabold text-warning-foreground"><Star className="h-3.5 w-3.5" /> Mais solicitado</div>}
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-md ${service.accent === 'blue' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'}`}><Icon className="h-7 w-7" /></div>
                  <h2 className="text-2xl font-extrabold">{service.title}</h2>
                  <p className="mt-3 min-h-16 leading-7 text-muted-foreground">{service.description}</p>
                  <ul className="my-7 space-y-3 border-t border-border pt-6">
                    {service.features.map((feature) => <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-foreground"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />{feature}</li>)}
                  </ul>
                  <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
                    <div><p className="text-xs font-semibold uppercase text-muted-foreground">Preço</p><p className="mt-1 text-2xl font-extrabold text-primary">{service.price}</p><p className="text-xs text-muted-foreground">{service.credits}</p></div>
                    <div className="text-right"><p className="text-xs font-semibold uppercase text-muted-foreground">Prazo previsto</p><p className="mt-1 font-bold text-foreground">{service.delivery}</p></div>
                  </div>
                  <Button asChild variant="premium" className="mt-7 w-full"><Link to="/nova-solicitacao">Solicitar serviço <ArrowRight className="h-4 w-4" /></Link></Button>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="bg-card px-4 py-14 md:py-20">
          <div className="container mx-auto max-w-5xl">
            <div className="mb-10 text-center"><h2 className="text-3xl font-extrabold">Porque escolher a <span className="text-primary">PARTISOLFA</span>?</h2><p className="mt-3 text-muted-foreground">Um processo simples, acompanhado e transparente.</p></div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ icon: Icon, title, description }) => <div key={title} className="glass-card p-6"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div>)}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-14 md:py-20">
          <div className="mx-auto max-w-3xl rounded-lg bg-sidebar p-8 text-center text-sidebar-foreground sm:p-12">
            <Wand2 className="mx-auto h-10 w-10 text-sidebar-primary" />
            <h2 className="mt-4 text-3xl font-extrabold">Sistema de créditos</h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-sidebar-foreground/75">1 crédito equivale a 150 Kz. Ao criar uma conta, recebe automaticamente 1,5 créditos de bónus para experimentar os nossos serviços.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="premium" className="font-bold"><Link to="/registar">Criar conta grátis <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild variant="outline" className="border-sidebar-foreground/35 bg-sidebar-accent font-semibold text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"><Link to="/deposito">Depositar créditos</Link></Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
