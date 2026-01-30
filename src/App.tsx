import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProfileCompletionModal } from "@/components/ProfileCompletionModal";
import { CollaboratorRestrictedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Dashboard from "./pages/Dashboard";
import NovaSolicitacao from "./pages/NovaSolicitacao";
import Deposito from "./pages/Deposito";
import Historico from "./pages/Historico";
import TarefaDetalhe from "./pages/TarefaDetalhe";
import TermosUso from "./pages/TermosUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import AvisoLegal from "./pages/AvisoLegal";
import Servicos from "./pages/Servicos";
import Notificacoes from "./pages/Notificacoes";
import SolicitacoesRecentes from "./pages/SolicitacoesRecentes";
import Perfil from "./pages/Perfil";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTarefas from "./pages/admin/AdminTarefas";
import AdminDepositos from "./pages/admin/AdminDepositos";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminReferrals from "./pages/admin/AdminReferrals";
import AdminColaboradores from "./pages/admin/AdminColaboradores";
import AdminLevantamentos from "./pages/admin/AdminLevantamentos";
import ColaboradorDashboard from "./pages/colaborador/ColaboradorDashboard";
import ColaboradorTarefas from "./pages/colaborador/ColaboradorTarefas";
import ColaboradorLevantamento from "./pages/colaborador/ColaboradorLevantamento";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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

const AppContent = () => (
  <>
    <ProfileCompletionWrapper />
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