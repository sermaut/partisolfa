import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NovaSolicitacao from "./pages/NovaSolicitacao";
import Deposito from "./pages/Deposito";
import Historico from "./pages/Historico";
import TarefaDetalhe from "./pages/TarefaDetalhe";
import TermosUso from "./pages/TermosUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import AvisoLegal from "./pages/AvisoLegal";
import Servicos from "./pages/Servicos";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTarefas from "./pages/admin/AdminTarefas";
import AdminDepositos from "./pages/admin/AdminDepositos";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registar" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/nova-solicitacao" element={<NovaSolicitacao />} />
            <Route path="/deposito" element={<Deposito />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/tarefa/:id" element={<TarefaDetalhe />} />
            <Route path="/termos-uso" element={<TermosUso />} />
            <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/aviso-legal" element={<AvisoLegal />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tarefas" element={<AdminTarefas />} />
            <Route path="/admin/depositos" element={<AdminDepositos />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
