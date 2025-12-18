-- First create the app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop existing tables that will be recreated
DROP TABLE IF EXISTS public.earnings CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.barbers CASCADE;

-- Create shop_settings table for the single barber shop
CREATE TABLE public.shop_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name text NOT NULL DEFAULT 'Ömrüm Kuaför',
  address text,
  description text,
  phone text,
  services text[] DEFAULT '{"Saç Kesimi", "Sakal Tıraşı", "Saç + Sakal", "Çocuk Tıraşı"}'::text[],
  working_hours jsonb DEFAULT '{
    "monday": {"start": "09:00", "end": "19:00"},
    "tuesday": {"start": "09:00", "end": "19:00"},
    "wednesday": {"start": "09:00", "end": "19:00"},
    "thursday": {"start": "09:00", "end": "19:00"},
    "friday": {"start": "09:00", "end": "19:00"},
    "saturday": {"start": "09:00", "end": "18:00"},
    "sunday": {"closed": true}
  }'::jsonb,
  price_range text DEFAULT '100-300',
  shop_status text NOT NULL DEFAULT 'open' CHECK (shop_status IN ('open', 'closed')),
  appointment_duration integer DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on shop_settings
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view shop settings
CREATE POLICY "Everyone can view shop settings"
ON public.shop_settings FOR SELECT
USING (true);

-- Only admins can update shop settings
CREATE POLICY "Admins can update shop settings"
ON public.shop_settings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default shop settings
INSERT INTO public.shop_settings (shop_name, address, description, phone)
VALUES ('Ömrüm Kuaför', 'Adres bilgisi eklenecek', 'Profesyonel berber hizmetleri', NULL);

-- Create new appointments table without barber_id
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  service text NOT NULL,
  price numeric DEFAULT 100.00,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(appointment_date, appointment_time)
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Customers can view their own appointments
CREATE POLICY "Customers can view their own appointments"
ON public.appointments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = appointments.customer_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Admins can view all appointments
CREATE POLICY "Admins can view all appointments"
ON public.appointments FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Customers can create appointments
CREATE POLICY "Customers can create appointments"
ON public.appointments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = appointments.customer_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Customers can update their own appointments
CREATE POLICY "Customers can update their own appointments"
ON public.appointments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = appointments.customer_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Admins can update all appointments
CREATE POLICY "Admins can update all appointments"
ON public.appointments FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create earnings table without barber_id
CREATE TABLE public.earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid UNIQUE REFERENCES public.appointments(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  service_name text NOT NULL,
  earned_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on earnings
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

-- Only admins can view earnings
CREATE POLICY "Admins can view earnings"
ON public.earnings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert earnings
CREATE POLICY "Admins can insert earnings"
ON public.earnings FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create function to check appointment availability
CREATE OR REPLACE FUNCTION public.check_appointment_availability(
  appointment_date_param date,
  appointment_time_param time
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM appointments 
    WHERE appointment_date = appointment_date_param 
    AND appointment_time = appointment_time_param
    AND status != 'cancelled'
  );
END;
$$;

-- Create trigger for creating earnings on appointment completion
CREATE OR REPLACE FUNCTION public.create_earning_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.earnings (appointment_id, amount, service_name, earned_date)
    VALUES (NEW.id, NEW.price, NEW.service, NEW.appointment_date)
    ON CONFLICT (appointment_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_appointment_completed
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_earning_on_completion();

-- Update trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shop_settings_updated_at
  BEFORE UPDATE ON public.shop_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_earnings_updated_at
  BEFORE UPDATE ON public.earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();