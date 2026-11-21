-- Customer reviews for completed tasks.
CREATE TABLE IF NOT EXISTS public.task_reviews (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
 user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
 comment TEXT NOT NULL CHECK (char_length(trim(comment)) BETWEEN 3 AND 2000),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(task_id,user_id)
);
ALTER TABLE public.task_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own reviews" ON public.task_reviews FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "Admins read all reviews" ON public.task_reviews FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users review own completed tasks" ON public.task_reviews FOR INSERT WITH CHECK (auth.uid()=user_id AND EXISTS(SELECT 1 FROM public.tasks WHERE tasks.id=task_id AND tasks.user_id=auth.uid() AND tasks.status='completed'));
CREATE POLICY "Users edit own reviews" ON public.task_reviews FOR UPDATE USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id AND EXISTS(SELECT 1 FROM public.tasks WHERE tasks.id=task_id AND tasks.user_id=auth.uid() AND tasks.status='completed'));
CREATE POLICY "Only admins delete reviews" ON public.task_reviews FOR DELETE USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER update_task_reviews_updated_at BEFORE UPDATE ON public.task_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX task_reviews_task_id_idx ON public.task_reviews(task_id);
