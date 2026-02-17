import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProfileCompletionModal } from "@/components/ProfileCompletionModal";
import { CollaboratorRestrictedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";

// Eager load critical routes
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Lazy load non-critical routes
const RecuperarSenha = lazy(() => import("./pages/RecuperarSenha"));
const RedefinirSenha = lazy(() => import("./pages/RedefinirSenha"));
const NovaSolicitacao = lazy(() => import("./pages/NovaSolicitacao"));
const Deposito = lazy(() => import("./pages/Deposito"));
const Historico = lazy(() => import("./pages/Historico"));
const TarefaDetalhe = lazy(() => import("./pages/TarefaDetalhe"));
const TermosUso = lazy(() => import("./pages/TermosUso"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const AvisoLegal = lazy(() => import("./pages/AvisoLegal"));
const Servicos = lazy(() => import("./pages/Servicos"));
const Notificacoes = lazy(() => import("./pages/Notificacoes"));
const SolicitacoesRecentes = lazy(() => import("./pages/SolicitacoesRecentes"));
const Perfil = lazy(() => import("./pages/Perfil"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminTarefas = lazy(() => import("./pages/admin/AdminTarefas"));
const AdminDepositos = lazy(() => import("./pages/admin/AdminDepositos"));
const AdminUsuarios = lazy(() => import("./pages/admin/AdminUsuarios"));
const AdminReferrals = lazy(() => import("./pages/admin/AdminReferrals"));
const AdminColaboradores = lazy(() => import("./pages/admin/AdminColaboradores"));
const AdminLevantamentos = lazy(() => import("./pages/admin/AdminLevantamentos"));
const ColaboradorDashboard = lazy(() => import("./pages/colaborador/ColaboradorDashboard"));
const ColaboradorTarefas = lazy(() => import("./pages/colaborador/ColaboradorTarefas"));
const ColaboradorLevantamento = lazy(() => import("./pages/colaborador/ColaboradorLevantamento"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProfileCompletionWrapper() {
  const { user, profile, isLoading, isProfileComplete, refreshProfile } = useAuth();
  const showModal = !isLoading && user && profile && !isProfileComplete;
  if (!showModal) return null;
  return (
    <ProfileCompletionModal
      open={true}
      userId={user.id}
      userName={profile.full_name}
      onComplete={refreshProfile}
    />
  );
}

const LazyFallback = () => (
  <div className="min-h-[80vh] flex items-center justify-center">
    <div className="music-wave">
      <span></span><span></span><span></span><span></span><span></span>
    </div>
  </div>
);

const AppContent = () => (
  <>
    <ProfileCompletionWrapper />
    <Suspense fallback={<LazyFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registar" element={<Register />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/dashboard" element={<CollaboratorRestrictedRoute><Dashboard /></CollaboratorRestrictedRoute>} />
        <Route path="/nova-solicitacao" element={<CollaboratorRestrictedRoute><NovaSolicitacao /></CollaboratorRestrictedRoute>} />
        <Route path="/deposito" element={<CollaboratorRestrictedRoute><Deposito /></CollaboratorRestrictedRoute>} />
        <Route path="/historico" element={<CollaboratorRestrictedRoute><Historico /></CollaboratorRestrictedRoute>} />
        <Route path="/tarefa/:id" element={<TarefaDetalhe />} />
        <Route path="/termos-uso" element={<TermosUso />} />
        <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/notificacoes" element={<Notificacoes />} />
        <Route path="/solicitacoes" element={<CollaboratorRestrictedRoute><SolicitacoesRecentes /></CollaboratorRestrictedRoute>} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tarefas" element={<AdminTarefas />} />
        <Route path="/admin/depositos" element={<AdminDepositos />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/referrals" element={<AdminReferrals />} />
        <Route path="/admin/colaboradores" element={<AdminColaboradores />} />
        <Route path="/admin/levantamentos" element={<AdminLevantamentos />} />
        <Route path="/colaborador" element={<ColaboradorDashboard />} />
        <Route path="/colaborador/tarefas" element={<ColaboradorTarefas />} />
        <Route path="/colaborador/levantamento" element={<ColaboradorLevantamento />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;