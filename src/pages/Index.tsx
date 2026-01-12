import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Music, FileMusic, Sparkles, ArrowRight, Shield, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Index() {
  const { user } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        
        {/* Music Notes Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[10%] text-primary/20 text-6xl font-display"
          >
            ♪
          </motion.div>
          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[40%] right-[15%] text-primary/15 text-8xl font-display"
          >
            ♫
          </motion.div>
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[30%] left-[20%] text-accent/20 text-5xl font-display"
          >
            ♩
          </motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Plataforma de Serviços Musicais
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Transforme a sua{' '}
              <span className="text-gradient-gold">música</span>
              <br />
              em obra-prima
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              A PARTISOLFA oferece serviços profissionais de aperfeiçoamento de músicas, 
              partituras e criação de arranjos musicais. Envie os seus ficheiros e receba 
              resultados de qualidade directamente na sua conta.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {user ? (
                <Button variant="hero" asChild size="xl">
                  <Link to="/dashboard">
                    Ir para o Painel
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="hero" asChild size="xl">
                    <Link to="/registar">
                      Começar Agora
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="xl">
                    <Link to="/servicos">
                      Ver Serviços
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={fadeInUp}
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-display font-bold text-gradient-gold">1.5</p>
                <p className="text-sm text-muted-foreground">Créditos de bónus</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-display font-bold text-gradient-gold">2</p>
                <p className="text-sm text-muted-foreground">Serviços</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-display font-bold text-gradient-gold">150</p>
                <p className="text-sm text-muted-foreground">Kz por crédito</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-32 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Os Nossos <span className="text-gradient-gold">Serviços</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Oferecemos soluções profissionais para as suas necessidades musicais. 
              Cada serviço custa apenas 1 crédito.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Service 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Music className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-4">
                Aperfeiçoamento Musical
              </h3>
              <p className="text-muted-foreground mb-6">
                Melhoria de músicas e partituras existentes. Envie o seu ficheiro 
                de áudio, imagem ou PDF e receba uma versão aperfeiçoada com 
                qualidade profissional.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <span>1 Crédito</span>
                <span className="text-muted-foreground font-normal">• 150 Kz</span>
              </div>
            </motion.div>

            {/* Service 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileMusic className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-4">
                Criação de Arranjos
              </h3>
              <p className="text-muted-foreground mb-6">
                Criação de arranjos musicais personalizados. Envie a sua ideia, 
                referências e recomendações para receber um arranjo único e 
                profissional.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <span>1 Crédito</span>
                <span className="text-muted-foreground font-normal">• 150 Kz</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Porquê Escolher a <span className="text-gradient-gold">PARTISOLFA</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Uma plataforma moderna construída para músicos que valorizam qualidade e simplicidade.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Segurança Total</h3>
              <p className="text-muted-foreground">
                Os seus ficheiros são protegidos e acessíveis apenas por si. 
                Privacidade garantida em todas as solicitações.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Processo Simples</h3>
              <p className="text-muted-foreground">
                Envie os seus ficheiros, adicione recomendações e aguarde o resultado. 
                Tudo directamente na sua conta.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Qualidade Profissional</h3>
              <p className="text-muted-foreground">
                Resultados de alta qualidade entregues directamente na sua conta. 
                Satisfação garantida em cada serviço.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              Pronto para começar?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Crie a sua conta gratuita hoje e receba 1.5 créditos de bónus para 
              experimentar os nossos serviços. Sem compromisso.
            </p>
            
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" asChild size="xl">
                  <Link to="/registar">
                    Criar Conta Gratuita
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                1.5 créditos grátis
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                100% Seguro
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
