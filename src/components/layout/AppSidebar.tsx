import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  ClipboardList,
  CreditCard,
  Gift,
  History,
  LayoutDashboard,
  MessageSquare,
  Settings,
  User,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const customerItems: NavigationItem[] = [
  { label: 'Painel', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Nova Solicitação', href: '/nova-solicitacao', icon: ClipboardList },
  { label: 'Solicitações', href: '/solicitacoes', icon: History },
  { label: 'Depositar Créditos', href: '/deposito', icon: CreditCard },
  { label: 'Notificações', href: '/notificacoes', icon: Bell },
  { label: 'Meu Perfil', href: '/perfil', icon: User },
];

const administratorItems: NavigationItem[] = [
  { label: 'Painel', href: '/admin', icon: LayoutDashboard },
  { label: 'Tarefas', href: '/admin/tarefas', icon: ClipboardList },
  { label: 'Depósitos', href: '/admin/depositos', icon: CreditCard },
  { label: 'Utilizadores', href: '/admin/usuarios', icon: Users },
  { label: 'Avaliações', href: '/admin/avaliacoes', icon: MessageSquare },
  { label: 'Indicações', href: '/admin/referrals', icon: Gift },
  { label: 'Colaboradores', href: '/admin/colaboradores', icon: UserCog },
  { label: 'Levantamentos', href: '/admin/levantamentos', icon: Wallet },
];

const collaboratorItems: NavigationItem[] = [
  { label: 'Painel', href: '/colaborador', icon: LayoutDashboard },
  { label: 'Tarefas Atribuídas', href: '/colaborador/tarefas', icon: ClipboardList },
  { label: 'Levantamentos', href: '/colaborador/levantamento', icon: Wallet },
  { label: 'Notificações', href: '/notificacoes', icon: Bell },
  { label: 'Meu Perfil', href: '/perfil', icon: User },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { isAdmin, isCollaborator } = useAuth();
  const items = isAdmin ? administratorItems : isCollaborator ? collaboratorItems : customerItems;
  const sectionLabel = isAdmin ? 'ADMINISTRAÇÃO' : isCollaborator ? 'COLABORAÇÃO' : 'A MINHA CONTA';

  return (
    <aside className="app-sidebar" aria-label="Navegação principal">
      <p className="app-sidebar-label">{sectionLabel}</p>
      <nav className="app-sidebar-nav">
        {items.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (!['/admin', '/colaborador'].includes(href) && pathname.startsWith(`${href}/`));

          return (
            <Link
              key={href}
              to={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn('app-sidebar-link', isActive && 'is-active')}
            >
              <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="app-sidebar-footer">
        <Settings aria-hidden="true" className="h-4 w-4" />
        <span>PARTISOLFA</span>
      </div>
    </aside>
  );
}