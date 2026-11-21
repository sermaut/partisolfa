import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isActivePath = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}/`));
  const mobileLinkClass = (path: string) => `mobile-menu-item${isActivePath(path) ? ' is-active' : ''}`;

  useEffect(() => {
    if (user) fetchUnreadCount();
  }, [user]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[#17364d] text-white border-b border-[#2a596e] shadow-md">
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
            <span className="font-display text-xl md:text-2xl font-bold text-white">
              PARTISOLFA
            </span>
          </Link>

          {/* Desktop Navigation - Always show "Nossos Serviços" */}
          <nav className="hidden md:flex items-center gap-8">
            {!user && (
              <Link
                to="/"
                className="text-base text-white/85 hover:text-[#62dfbd] transition-colors py-2"
              >
                Início
              </Link>
            )}
            <Link
              to="/servicos"
              className="text-base text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Nossos Serviços
            </Link>
            {!user && (
              <Link
                to="/termos-uso"
                className="text-base text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Termos
              </Link>
            )}
          </nav>


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
                    <Link to="/servicos" className="cursor-pointer py-3 text-base">
                      <FileText className="w-5 h-5 mr-3" />
                      Nossos Serviços
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
            className="md:hidden p-2.5 text-white rounded-xl border-2 border-white/30 bg-white/10 hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#62dfbd] focus-visible:ring-offset-2"
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Global mobile menu overlay and drawer */}
        {isMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Fechar menu e voltar à página"
              onClick={() => setIsMenuOpen(false)}
              className="mobile-menu-backdrop"
            />
            <aside
              className="mobile-menu-drawer"
              aria-label="Menu principal"
              aria-modal="true"
              role="dialog"
            >
              <div className="mobile-menu-heading">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 min-w-0">
                  <span className="mobile-menu-logo"><Music2 className="w-6 h-6" /></span>
                  <span className="font-bold text-xl tracking-tight">PARTISOLFA</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Fechar menu"
                  className="mobile-menu-close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="mobile-menu-nav" aria-label="Navegação principal">
                {!user && (
                  <>
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/')}>
                      <LayoutDashboard className="w-5 h-5" /> <span>Início</span>
                    </Link>
                    <Link to="/servicos" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/servicos')}>
                      <FileText className="w-5 h-5" /> <span>Nossos Serviços</span>
                    </Link>
                    <Link to="/termos-uso" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/termos-uso')}>
                      <FileText className="w-5 h-5" /> <span>Termos</span>
                    </Link>
                  </>
                )}

                {user && (
                  <>
                    <div className="mobile-menu-profile">
                      <Avatar className="w-12 h-12 border-2 border-amber-400/70">
                        <AvatarImage src={avatarUrl} alt={profile?.full_name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold truncate">{profile?.full_name || 'Minha Conta'}</p>
                        <p className="text-sm font-semibold text-amber-300">{profile?.credits?.toFixed(1)} créditos</p>
                      </div>
                    </div>

                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/dashboard')}>
                      <LayoutDashboard className="w-5 h-5" /><span>Painel</span>
                    </Link>
                    <Link to="/servicos" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/servicos')}>
                      <FileText className="w-5 h-5" /><span>Nossos Serviços</span>
                    </Link>
                    <Link to="/nova-solicitacao" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/nova-solicitacao')}>
                      <PlusCircle className="w-5 h-5" /><span>Nova Solicitação</span>
                    </Link>
                    <Link to="/notificacoes" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/notificacoes')}>
                      <Bell className="w-5 h-5" /><span>Notificações</span>
                      {unreadCount > 0 && <Badge variant="destructive" className="ml-auto">{unreadCount > 9 ? '9+' : unreadCount}</Badge>}
                    </Link>
                    <Link to="/solicitacoes" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/solicitacoes')}>
                      <History className="w-5 h-5" /><span>Solicitações Feitas</span>
                    </Link>
                    <Link to="/deposito" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/deposito')}>
                      <CreditCard className="w-5 h-5" /><span>Depositar Créditos</span>
                    </Link>
                    <Link to="/perfil" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/perfil')}>
                      <User className="w-5 h-5" /><span>Meu Perfil</span>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/admin')}>
                        <Settings className="w-5 h-5" /><span>Administração</span>
                      </Link>
                    )}
                    {isCollaborator && (
                      <Link to="/colaborador" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/colaborador')}>
                        <Users className="w-5 h-5" /><span>Painel Colaborador</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { void handleSignOut(); setIsMenuOpen(false); }}
                      className="mobile-menu-item mobile-menu-logout"
                    >
                      <LogOut className="w-5 h-5" /><span>Sair</span>
                    </button>
                  </>
                )}

                {!user && (
                  <div className="grid grid-cols-1 gap-3 pt-4">
                    <Button variant="outline" size="lg" asChild className="w-full border-2">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
                    </Button>
                    <Button variant="premium" size="lg" asChild className="w-full">
                      <Link to="/registar" onClick={() => setIsMenuOpen(false)}>Criar Conta</Link>
                    </Button>
                  </div>
                )}
              </nav>
              <div className="mobile-menu-footer">PARTISOLFA · Serviços Musicais</div>
            </aside>
          </>
        )}
      </div>
    </header>
  );
}