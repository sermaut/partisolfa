import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1 pt-16 md:pt-20">
        {user && <AppSidebar />}
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-w-0 flex-1 bg-background">
            {children}
          </main>
          {showFooter && <Footer />}
        </div>
      </div>
    </div>
  );
}
