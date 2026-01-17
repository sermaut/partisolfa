import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Music, 
  FileMusic, 
  CheckCircle, 
  Clock, 
  Star,
  ArrowRight,
  Sparkles,
  Layers,
  Wand2,
  Users,
  Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';

const services = [
  {
    id: 'aperfeicoamento',
    title: 'Aperfeiçoamento Musical',
    description: 'Refinamos a sua partitura ou música existente, corrigindo erros, melhorando harmonias e aprimorando a qualidade geral da composição.',
    icon: Music,
    features: [
      'Correção de erros harmónicos e melódicos',
      'Melhoria de vozes e contrapontos',
      'Ajuste de dinâmicas e articulações',
      'Revisão de notação musical',
      'Optimização para execução',
    ],
    price: '1.5 créditos',
    delivery: 'Até 3 dias',
    popular: false,
  },
  {
    id: 'arranjo',
    title: 'Arranjo Musical',
    description: 'Criamos arranjos profissionais personalizados para qualquer formação instrumental ou vocal, desde solos até orquestras completas.',
    icon: FileMusic,
    features: [
      'Arranjo para qualquer formação musical',
      'Adaptação de tonalidade e estilo',
      'Harmonização completa',
      'Partes instrumentais/vocais separadas',
      'Ficheiro de áudio demonstrativo',
    ],
    price: '2 créditos',
    delivery: 'Até 3 dias',
    popular: true,
  },
  {
    id: 'acc',
    title: 'Criação de ACCs',
    description: 'Produzimos acompanhamentos em áudio personalizados para prática, ensaios ou apresentações, com 3 versões distintas entregues.',
    icon: Headphones,
    features: [
      'Entrega exclusiva em formato áudio',
      '3 acompanhamentos distintos incluídos',
      'Ideal para flauta, fanfarra, guitarra',
      'Personalizado para a sua finalidade',
      'Perfeito para ensaios e prática',
    ],
    price: '2 créditos',
    delivery: 'Até 3 dias',
    popular: false,
  },
];

const benefits = [
  {
    icon: Sparkles,
    title: 'Qualidade Profissional',
    description: 'Todos os trabalhos são realizados por músicos profissionais com formação académica.',
  },
  {
    icon: Clock,
    title: 'Entrega Rápida',
    description: 'Compromisso com prazos de entrega curtos sem comprometer a qualidade.',
  },
  {
    icon: Layers,
    title: 'Formatos Versáteis',
    description: 'Entregamos em múltiplos formatos: PDF, MusicXML, MIDI e áudio.',
  },
  {
    icon: Users,
    title: 'Suporte Dedicado',
    description: 'Acompanhamento personalizado durante todo o processo.',
  },
];

export default function Servicos() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Os Nossos <span className="text-gradient-gold">Serviços</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Soluções musicais profissionais para compositores, músicos e instituições.
            Transformamos as suas ideias em partituras perfeitas.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative glass-card rounded-2xl p-8 ${
                  service.popular ? 'border-primary/50' : ''
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold mb-2">{service.title}</h2>
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">A partir de</p>
                    <p className="text-2xl font-display font-bold text-primary">{service.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Prazo</p>
                    <p className="font-medium">{service.delivery}</p>
                  </div>
                </div>

                <Button 
                  variant={service.popular ? 'premium' : 'outline'} 
                  className="w-full mt-6"
                  asChild
                >
                  <Link to="/nova-solicitacao">
                    Solicitar Serviço
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            Porque Escolher a <span className="text-gradient-gold">PARTISOLFA</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="glass-card rounded-xl p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Pricing Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-8 text-center animated-border"
        >
          <Wand2 className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="font-display text-2xl font-bold mb-2">
            Sistema de Créditos
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Utilizamos um sistema de créditos simples e transparente. 
            1 crédito equivale a 150 Kz. Ao criar uma conta, recebe automaticamente 
            <span className="text-primary font-medium"> 1.5 créditos de bónus</span> para experimentar os nossos serviços.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="premium" asChild>
              <Link to="/registar">
                Criar Conta Grátis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/deposito">
                Depositar Créditos
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* FAQ Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-20 text-center"
        >
          <h2 className="font-display text-2xl font-bold mb-6">
            Perguntas Frequentes
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="glass-card rounded-xl p-6 text-left">
              <h4 className="font-semibold mb-2">Que ficheiros posso enviar?</h4>
              <p className="text-sm text-muted-foreground">
                Aceitamos ficheiros de áudio (MP3, WAV), imagens de partituras (JPG, PNG) e PDF. 
                Se necessário, pode também enviar ficheiros MusicXML ou MIDI.
              </p>
            </div>
            <div className="glass-card rounded-xl p-6 text-left">
              <h4 className="font-semibold mb-2">Como recebo o trabalho finalizado?</h4>
              <p className="text-sm text-muted-foreground">
                O ficheiro final fica disponível directamente na sua conta, na secção de detalhes da solicitação. 
                Receberá uma notificação assim que o trabalho estiver concluído.
              </p>
            </div>
            <div className="glass-card rounded-xl p-6 text-left">
              <h4 className="font-semibold mb-2">Posso solicitar revisões?</h4>
              <p className="text-sm text-muted-foreground">
                Sim, oferecemos uma revisão gratuita caso o resultado não corresponda às suas expectativas iniciais. 
                Basta adicionar um comentário na sua solicitação.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
