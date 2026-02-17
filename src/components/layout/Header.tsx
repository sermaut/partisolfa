import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Music2, 
  LogOut, 
  User, 
  Settings,
  Bell,
  FileText,
  CreditCard,
  PlusCircle,
  LayoutDashboard,
  History,
  Users
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, profile, isAdmin, isCollaborator, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const avatarUrl = (profile as any)?.avatar_url;

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

          {/* Desktop Navigation - Only show when NOT logged in */}
          {!user && (
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/" 
                className="text-base text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Início
              </Link>
              <Link 
                to="/servicos" 
                className="text-base text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Serviços
              </Link>
              <Link 
                to="/termos-uso" 
                className="text-base text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Termos
              </Link>
            </nav>
          )}

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="glass" className="gap-2 h-11 px-4">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={avatarUrl} alt={profile?.full_name} />
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[120px] truncate font-medium">
                      {profile?.full_name || 'Minha Conta'}
                    </span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-card border-border">
                  <div className="px-4 py-3">
                    <p className="font-semibold text-base">{profile?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <p className="text-base text-primary font-bold mt-2">
                      {profile?.credits?.toFixed(1)} créditos
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-border" />
                  
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer py-3 text-base">
                      <LayoutDashboard className="w-5 h-5 mr-3" />
                      Painel
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/nova-solicitacao" className="cursor-pointer py-3 text-base">
                      <PlusCircle className="w-5 h-5 mr-3" />
                      Nova Solicitação
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/notificacoes" className="cursor-pointer py-3 text-base relative">
                      <Bell className="w-5 h-5 mr-3" />
                      Notificações
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/solicitacoes" className="cursor-pointer py-3 text-base">
                      <History className="w-5 h-5 mr-3" />
                      Solicitações Feitas
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/deposito" className="cursor-pointer py-3 text-base">
                      <CreditCard className="w-5 h-5 mr-3" />
                      Depositar Créditos
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/perfil" className="cursor-pointer py-3 text-base">
                      <User className="w-5 h-5 mr-3" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer py-3 text-base">
                          <Settings className="w-5 h-5 mr-3" />
                          Administração
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {isCollaborator && (
                    <>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem asChild>
                        <Link to="/colaborador" className="cursor-pointer py-3 text-base">
                          <Users className="w-5 h-5 mr-3" />
                          Painel Colaborador
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive py-3 text-base"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="lg" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button variant="premium" size="lg" asChild>
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
            <nav className="flex flex-col gap-1">
              {/* Navigation links - Only show when NOT logged in */}
              {!user && (
                <>
                  <Link 
                    to="/" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-base text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-secondary"
                  >
                    Início
                  </Link>
                  <Link 
                    to="/servicos" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-base text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-secondary"
                  >
                    Serviços
                  </Link>
                  <Link 
                    to="/termos-uso" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-base text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-secondary"
                  >
                    Termos
                  </Link>
                </>
              )}
              
              <div className={`flex flex-col gap-1 ${!user ? 'pt-4 border-t border-border/50 mt-2' : ''}`}>
                {user ? (
                  <>
                    <div className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={avatarUrl} alt={profile?.full_name} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{profile?.full_name}</p>
                          <p className="text-sm text-primary font-medium">{profile?.credits?.toFixed(1)} créditos</p>
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary text-base"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Painel
                    </Link>
                    
                    <Link 
                      to="/nova-solicitacao" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary text-base"
                    >
                      <PlusCircle className="w-5 h-5" />
                      Nova Solicitação
                    </Link>
                    
                    <Link 
                      to="/notificacoes" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary text-base"
                    >
                      <Bell className="w-5 h-5" />
                      Notificações
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </Link>
                    
                    <Link 
                      to="/solicitacoes" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary text-base"
                    >
                      <History className="w-5 h-5" />
                      Solicitações Feitas
                    </Link>
                    
                    <Link 
                      to="/deposito" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary text-base"
                    >
                      <CreditCard className="w-5 h-5" />
                      Depositar Créditos
                    </Link>
                    
                    <Link 
                      to="/perfil" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary text-base"
                    >
                      <User className="w-5 h-5" />
                      Meu Perfil
                    </Link>
                    
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary text-base"
                      >
                        <Settings className="w-5 h-5" />
                        Administração
                      </Link>
                    )}
                    
                    {isCollaborator && (
                      <Link 
                        to="/colaborador" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary text-base"
                      >
                        <Users className="w-5 h-5" />
                        Painel Colaborador
                      </Link>
                    )}
                    
                    <button 
                      onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary text-base text-destructive w-full text-left mt-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="lg" asChild className="w-full">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        Entrar
                      </Link>
                    </Button>
                    <Button variant="premium" size="lg" asChild className="w-full">
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