-- 1. Add DELETE policy for customers to delete their own appointments
CREATE POLICY "Customers can delete their own appointments" 
ON public.appointments 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = appointments.customer_id 
  AND profiles.user_id = auth.uid()
));

-- 2. Enable pg_cron and pg_net extensions for scheduled cleanup
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 3. Create function to delete old appointments (older than 1 month)
CREATE OR REPLACE FUNCTION public.delete_old_appointments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete appointments older than 1 month
  DELETE FROM public.appointments 
  WHERE appointment_date < CURRENT_DATE - INTERVAL '1 month';
  
  -- Also delete related earnings for those appointments (cascading)
  DELETE FROM public.earnings 
  WHERE earned_date < CURRENT_DATE - INTERVAL '1 month';
END;
$$;

-- 4. Schedule the cleanup to run daily at midnight
SELECT cron.schedule(
  'delete-old-appointments',
  '0 0 * * *', -- Every day at midnight
  $$SELECT public.delete_old_appointments()$$
);