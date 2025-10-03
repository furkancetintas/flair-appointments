-- Add unique constraint to prevent multiple appointments on the same day
CREATE UNIQUE INDEX idx_customer_single_appointment_per_day 
ON public.appointments (customer_id, appointment_date) 
WHERE status != 'cancelled';