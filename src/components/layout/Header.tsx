import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Music2, LogOut, User, Settings } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center"
            >
              <Music2 className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <span className="font-display text-xl md:text-2xl font-bold text-gradient-gold">
              PARTISOLFA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Início
            </Link>
            <Link 
              to="/servicos" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Serviços
            </Link>
            <Link 
              to="/termos" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Termos
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="glass" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">
                      {profile?.full_name || 'Minha Conta'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    <p className="text-sm text-primary font-semibold mt-1">
                      {profile?.credits?.toFixed(1)} créditos
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Painel
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Administração
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button variant="premium" asChild>
                  <Link to="/registar">Criar Conta</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-border/50"
          >
            <nav className="flex flex-col gap-4">
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Início
              </Link>
              <Link 
                to="/servicos" 
                onClick={() => setIsMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Serviços
              </Link>
              <Link 
                to="/termos" 
                onClick={() => setIsMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Termos
              </Link>
              
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                {user ? (
                  <>
                    <div className="py-2">
                      <p className="text-sm font-medium">{profile?.full_name}</p>
                      <p className="text-sm text-primary">{profile?.credits?.toFixed(1)} créditos</p>
                    </div>
                    <Button variant="glass" asChild className="w-full justify-start">
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <User className="w-4 h-4 mr-2" />
                        Painel
                      </Link>
                    </Button>
                    {isAdmin && (
                      <Button variant="glass" asChild className="w-full justify-start">
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Administração
                        </Link>
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                      className="w-full justify-start text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="w-full">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        Entrar
                      </Link>
                    </Button>
                    <Button variant="premium" asChild className="w-full">
                      <Link to="/registar" onClick={() => setIsMenuOpen(false)}>
                        Criar Conta
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
}
