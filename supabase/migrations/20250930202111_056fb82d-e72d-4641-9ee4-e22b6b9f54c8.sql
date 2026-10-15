-- Fix search_path for calculate_bmi function
CREATE OR REPLACE FUNCTION calculate_bmi(weight DECIMAL, height DECIMAL)
RETURNS DECIMAL 
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN ROUND((weight / ((height / 100) * (height / 100)))::DECIMAL, 2);
END;
$$;