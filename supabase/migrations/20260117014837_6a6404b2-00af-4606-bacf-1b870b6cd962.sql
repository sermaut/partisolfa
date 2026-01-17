-- Primeiro converter todos os registos 'both' para 'pdf'
UPDATE public.tasks 
SET result_format = 'pdf' 
WHERE result_format = 'both';

-- Remover constraint antiga
ALTER TABLE public.tasks 
DROP CONSTRAINT IF EXISTS tasks_result_format_check;

-- Adicionar nova constraint com 'image'
ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_result_format_check 
CHECK (result_format IN ('pdf', 'audio', 'image'));