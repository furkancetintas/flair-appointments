-- Create a secure RPC function that returns only booked times for a given date
-- This uses SECURITY DEFINER to bypass RLS and only returns time data (no sensitive info)
CREATE OR REPLACE FUNCTION public.get_booked_times_for_date(target_date date)
RETURNS TABLE(appointment_time time) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT a.appointment_time
  FROM appointments a
  WHERE a.appointment_date = target_date
  AND a.status != 'cancelled';
END;
$$;