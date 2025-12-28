-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to delete old appointments (older than 1 month)
CREATE OR REPLACE FUNCTION public.delete_old_appointments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete appointments older than 1 month
  DELETE FROM public.appointments 
  WHERE appointment_date < CURRENT_DATE - INTERVAL '1 month';
  
  -- Also delete related earnings for those appointments (cascading)
  DELETE FROM public.earnings 
  WHERE earned_date < CURRENT_DATE - INTERVAL '1 month';
END;
$function$;

-- Schedule the function to run daily at midnight
SELECT cron.schedule(
  'delete-old-appointments',
  '0 0 * * *',
  $$SELECT public.delete_old_appointments()$$
);