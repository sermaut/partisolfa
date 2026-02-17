-- Allow admins to download/view files from task-files bucket
CREATE POLICY "Admins can access all task files in storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to download/view files from result-files bucket
CREATE POLICY "Admins can access all result files in storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'result-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to upload to result-files bucket
CREATE POLICY "Admins can upload result files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'result-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to delete from task-files bucket
CREATE POLICY "Admins can delete task files in storage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'task-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to delete from result-files bucket
CREATE POLICY "Admins can delete result files in storage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'result-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to access deposit proofs
CREATE POLICY "Admins can access deposit proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deposit-proofs' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Ensure users can access their own files in task-files bucket
CREATE POLICY "Users can access own task files in storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Ensure users can upload to task-files bucket
CREATE POLICY "Users can upload own task files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can access their own result files
CREATE POLICY "Users can access own result files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'result-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload their own deposit proofs
CREATE POLICY "Users can upload own deposit proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deposit-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own deposit proofs
CREATE POLICY "Users can view own deposit proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deposit-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Collaborators can access files of tasks assigned to them
CREATE POLICY "Collaborators can access assigned task files in storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-files' 
  AND EXISTS (
    SELECT 1 FROM public.task_files tf
    JOIN public.task_assignments ta ON ta.task_id = tf.task_id
    WHERE tf.file_path = name
    AND ta.collaborator_id = auth.uid()
  )
);