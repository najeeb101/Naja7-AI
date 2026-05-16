-- Tighten the portfolio demo around anonymous Supabase users.
DELETE FROM public.documents
WHERE user_id IS NULL;

ALTER TABLE public.documents
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS analysis_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS analysis_error TEXT;

ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS documents_analysis_status_check;

ALTER TABLE public.documents
  ADD CONSTRAINT documents_analysis_status_check
  CHECK (analysis_status IN ('pending', 'completed', 'failed'));

UPDATE public.documents
SET analysis_status = CASE
  WHEN analysis IS NOT NULL THEN 'completed'
  ELSE analysis_status
END;

DROP POLICY IF EXISTS "Anyone can view documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can create documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can update documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can delete documents" ON public.documents;

CREATE POLICY "Users can view their own documents"
ON public.documents
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own documents"
ON public.documents
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own documents"
ON public.documents
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
