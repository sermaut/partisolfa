-- Create storage buckets for files
INSERT INTO storage.buckets (id, name, public) VALUES ('task-files', 'task-files', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('deposit-proofs', 'deposit-proofs', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('result-files', 'result-files', false);

-- Storage policies for task-files
CREATE POLICY "Users can upload their own task files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'task-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own task files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'task-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can manage all task files"
ON storage.objects FOR ALL
USING (
    bucket_id = 'task-files' 
    AND public.has_role(auth.uid(), 'admin')
);

-- Storage policies for deposit-proofs
CREATE POLICY "Users can upload deposit proofs"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'deposit-proofs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own deposit proofs"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'deposit-proofs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can manage all deposit proofs"
ON storage.objects FOR ALL
USING (
    bucket_id = 'deposit-proofs' 
    AND public.has_role(auth.uid(), 'admin')
);

-- Storage policies for result-files
CREATE POLICY "Users can view their own result files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'result-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can manage all result files"
ON storage.objects FOR ALL
USING (
    bucket_id = 'result-files' 
    AND public.has_role(auth.uid(), 'admin')
);