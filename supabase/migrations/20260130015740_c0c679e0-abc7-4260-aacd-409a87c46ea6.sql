-- Allow collaborators to view files of tasks assigned to them
CREATE POLICY "Collaborators can view assigned task files"
ON public.task_files FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.task_assignments
    WHERE task_assignments.task_id = task_files.task_id
    AND task_assignments.collaborator_id = auth.uid()
  )
);

-- Allow collaborators to view tasks that are assigned to them
CREATE POLICY "Collaborators can view assigned tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.task_assignments
    WHERE task_assignments.task_id = tasks.id
    AND task_assignments.collaborator_id = auth.uid()
  )
);

-- Storage policy for collaborators to download task files
CREATE POLICY "Collaborators can download assigned task files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-files' 
  AND EXISTS (
    SELECT 1 FROM public.task_files tf
    JOIN public.task_assignments ta ON ta.task_id = tf.task_id
    WHERE ta.collaborator_id = auth.uid()
    AND tf.file_path = name
  )
);