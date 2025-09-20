-- Fix the function search path issue by dropping the trigger first, then the function, then recreating both
DROP TRIGGER IF EXISTS create_earning_on_appointment_completion ON public.appointments;
DROP FUNCTION IF EXISTS public.create_earning_on_completion();

CREATE OR REPLACE FUNCTION public.create_earning_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create earning if status changed to 'completed' and no earning exists yet
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.earnings (barber_id, appointment_id, amount, service_name, earned_date)
    VALUES (NEW.barber_id, NEW.id, NEW.price, NEW.service, NEW.appointment_date)
    ON CONFLICT (appointment_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER create_earning_on_appointment_completion
AFTER UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.create_earning_on_completion();