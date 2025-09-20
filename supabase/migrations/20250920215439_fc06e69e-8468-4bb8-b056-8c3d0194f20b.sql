-- Create earnings table to track completed appointments earnings
CREATE TABLE public.earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id UUID NOT NULL,
  appointment_id UUID UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  service_name TEXT NOT NULL,
  earned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Barbers can view their own earnings"
ON public.earnings
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM barbers 
  JOIN profiles ON profiles.id = barbers.profile_id 
  WHERE barbers.id = earnings.barber_id 
  AND profiles.user_id = auth.uid()
));

CREATE POLICY "Earnings are automatically created"
ON public.earnings
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM barbers 
  JOIN profiles ON profiles.id = barbers.profile_id 
  WHERE barbers.id = earnings.barber_id 
  AND profiles.user_id = auth.uid()
));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_earnings_updated_at
BEFORE UPDATE ON public.earnings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add price column to appointments table for earnings calculation
ALTER TABLE public.appointments ADD COLUMN price DECIMAL(10, 2) DEFAULT 100.00;

-- Create function to automatically create earnings when appointment is completed
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

-- Create trigger for automatic earning creation
CREATE TRIGGER create_earning_on_appointment_completion
AFTER UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.create_earning_on_completion();

-- Add appointment_duration column to barbers table
ALTER TABLE public.barbers ADD COLUMN appointment_duration INTEGER DEFAULT 30;