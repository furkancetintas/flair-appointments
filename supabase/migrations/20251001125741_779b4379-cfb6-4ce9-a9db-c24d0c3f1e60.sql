-- Fix remaining functions without proper search_path

-- Fix check_appointment_availability function
CREATE OR REPLACE FUNCTION public.check_appointment_availability(
  barber_id_param uuid, 
  appointment_date_param date, 
  appointment_time_param time without time zone
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the time slot is already booked (excluding cancelled appointments)
  RETURN NOT EXISTS (
    SELECT 1 FROM appointments 
    WHERE barber_id = barber_id_param 
    AND appointment_date = appointment_date_param 
    AND appointment_time = appointment_time_param
    AND status != 'cancelled'
  );
END;
$$;