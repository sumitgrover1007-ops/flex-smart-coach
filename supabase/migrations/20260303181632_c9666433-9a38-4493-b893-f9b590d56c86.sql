
CREATE TABLE public.posture_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  exercise_type TEXT NOT NULL DEFAULT 'general',
  total_reps INTEGER DEFAULT 0,
  avg_posture_score NUMERIC DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  ai_feedback TEXT,
  landmarks_summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.posture_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own sessions" ON public.posture_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own sessions" ON public.posture_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON public.posture_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);
