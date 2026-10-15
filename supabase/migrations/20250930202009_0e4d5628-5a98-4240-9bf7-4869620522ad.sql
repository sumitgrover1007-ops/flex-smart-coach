-- Add onboarding fields to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN first_name TEXT,
  ADD COLUMN last_name TEXT,
  ADD COLUMN age INTEGER,
  ADD COLUMN date_of_birth DATE,
  ADD COLUMN gender TEXT,
  ADD COLUMN weight_kg DECIMAL(5,2),
  ADD COLUMN height_cm DECIMAL(5,2),
  ADD COLUMN activity_level TEXT,
  ADD COLUMN fitness_goal TEXT,
  ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN first_login BOOLEAN DEFAULT TRUE;

-- Add check constraints for realistic values
ALTER TABLE public.profiles
  ADD CONSTRAINT age_check CHECK (age >= 10 AND age <= 100),
  ADD CONSTRAINT weight_check CHECK (weight_kg >= 30 AND weight_kg <= 300),
  ADD CONSTRAINT height_check CHECK (height_cm >= 100 AND height_cm <= 250),
  ADD CONSTRAINT gender_check CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  ADD CONSTRAINT activity_level_check CHECK (activity_level IN ('sedentary', 'moderate', 'active')),
  ADD CONSTRAINT fitness_goal_check CHECK (fitness_goal IN ('lose_weight', 'gain_weight', 'build_muscle', 'maintain_weight'));

-- Create function to calculate BMI
CREATE OR REPLACE FUNCTION calculate_bmi(weight DECIMAL, height DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ROUND((weight / ((height / 100) * (height / 100)))::DECIMAL, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update the handle_new_user function to initialize onboarding fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, onboarding_completed, first_login)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    FALSE,
    TRUE
  );
  RETURN new;
END;
$$;