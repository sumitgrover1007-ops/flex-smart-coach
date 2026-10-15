-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create daily_logs table for the "What Did You Do Today?" check-in
CREATE TABLE public.daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Activity
  activity_type TEXT CHECK (activity_type IN ('gym', 'home_workout', 'cardio', 'sports', 'rest', 'other')),
  duration_minutes INTEGER,
  intensity TEXT CHECK (intensity IN ('low', 'medium', 'high')),
  
  -- Nutrition
  food_quality TEXT CHECK (food_quality IN ('very_poor', 'poor', 'okay', 'good', 'excellent')),
  calories_consumed INTEGER,
  protein_level TEXT CHECK (protein_level IN ('low', 'okay', 'high')),
  
  -- Recovery
  sleep_hours NUMERIC(3,1),
  
  -- How do you feel
  energy_level TEXT CHECK (energy_level IN ('low', 'normal', 'high')),
  mood TEXT CHECK (mood IN ('bad', 'neutral', 'good')),
  
  -- Optional notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one log per user per day
  UNIQUE(user_id, log_date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own logs" 
ON public.daily_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs" 
ON public.daily_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs" 
ON public.daily_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs" 
ON public.daily_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_logs_updated_at
BEFORE UPDATE ON public.daily_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);