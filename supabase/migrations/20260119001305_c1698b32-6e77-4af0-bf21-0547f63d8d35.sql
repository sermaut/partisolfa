-- 1. Adicionar constraint UNIQUE no email da tabela profiles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- 2. Adicionar role 'collaborator' ao enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'collaborator';

-- 3. Criar tabela de atribuições de tarefas a colaboradores
CREATE TABLE public.task_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL,
  assigned_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para task_assignments
CREATE INDEX idx_task_assignments_task_id ON public.task_assignments(task_id);
CREATE INDEX idx_task_assignments_collaborator_id ON public.task_assignments(collaborator_id);
CREATE INDEX idx_task_assignments_status ON public.task_assignments(status);

-- Habilitar RLS
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para task_assignments
CREATE POLICY "Admins can manage all task_assignments" 
ON public.task_assignments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Collaborators can view their own assignments" 
ON public.task_assignments 
FOR SELECT 
USING (auth.uid() = collaborator_id);

CREATE POLICY "Collaborators can update their own assignments" 
ON public.task_assignments 
FOR UPDATE 
USING (auth.uid() = collaborator_id);

-- 4. Criar enum para status de levantamento
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'rejected');

-- 5. Criar tabela de levantamentos de colaboradores
CREATE TABLE public.collaborator_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collaborator_id UUID NOT NULL,
  amount_kz NUMERIC NOT NULL CHECK (amount_kz >= 1000 AND amount_kz <= 15000),
  status public.withdrawal_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para collaborator_withdrawals
CREATE INDEX idx_collaborator_withdrawals_collaborator_id ON public.collaborator_withdrawals(collaborator_id);
CREATE INDEX idx_collaborator_withdrawals_status ON public.collaborator_withdrawals(status);

-- Habilitar RLS
ALTER TABLE public.collaborator_withdrawals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para collaborator_withdrawals
CREATE POLICY "Admins can manage all withdrawals" 
ON public.collaborator_withdrawals 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Collaborators can view their own withdrawals" 
ON public.collaborator_withdrawals 
FOR SELECT 
USING (auth.uid() = collaborator_id);

CREATE POLICY "Collaborators can create their own withdrawals" 
ON public.collaborator_withdrawals 
FOR INSERT 
WITH CHECK (auth.uid() = collaborator_id);

-- 6. Função para cancelar outras atribuições quando um colaborador aceita uma tarefa
CREATE OR REPLACE FUNCTION public.cancel_other_task_assignments()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Cancelar todas as outras atribuições pendentes para a mesma tarefa
    UPDATE public.task_assignments
    SET status = 'cancelled', responded_at = now()
    WHERE task_id = NEW.task_id 
      AND id != NEW.id 
      AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para cancelar outras atribuições
CREATE TRIGGER trigger_cancel_other_assignments
AFTER UPDATE ON public.task_assignments
FOR EACH ROW
EXECUTE FUNCTION public.cancel_other_task_assignments();

-- 7. Função para atualizar updated_at em collaborator_withdrawals
CREATE TRIGGER update_collaborator_withdrawals_updated_at
BEFORE UPDATE ON public.collaborator_withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Função para verificar se é colaborador
CREATE OR REPLACE FUNCTION public.is_collaborator(_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'collaborator'::app_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;