import { Link } from 'react-router-dom';
import { Music2, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center">
                <Music2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-gradient-gold">
                PARTISOLFA
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md">
              A sua plataforma de confiança para serviços musicais profissionais. 
              Aperfeiçoamento de músicas, partituras e criação de arranjos com 
              qualidade garantida.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Links Rápidos</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Início
              </Link>
              <Link to="/servicos" className="text-muted-foreground hover:text-primary transition-colors">
                Serviços
              </Link>
              <Link to="/registar" className="text-muted-foreground hover:text-primary transition-colors">
                Criar Conta
              </Link>
              <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                Entrar
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Informações</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/aviso-legal" className="text-muted-foreground hover:text-primary transition-colors">
                Aviso Legal
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} PARTISOLFA. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Feito com ♪ em Angola
          </p>
        </div>
      </div>
    </footer>
  );
}
