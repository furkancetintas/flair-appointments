-- Create a secure public view for barber information that excludes sensitive data
CREATE OR REPLACE VIEW public.barbers_public AS
SELECT 
  b.id,
  b.shop_name,
  b.address,
  b.description,
  b.services,
  b.working_hours,
  b.price_range,
  b.shop_status,
  b.profile_id,
  b.appointment_duration,
  b.created_at,
  b.updated_at,
  p.full_name as barber_full_name,
  p.role
FROM public.barbers b
INNER JOIN public.profiles p ON p.id = b.profile_id
WHERE p.role = 'barber';

-- Grant access to the view
GRANT SELECT ON public.barbers_public TO authenticated, anon;

-- Update RLS policy on profiles to be more restrictive
-- Remove the policy that allows anyone to view barber profiles
DROP POLICY IF EXISTS "Anyone can view barber profiles basic info" ON public.profiles;

-- Now only users can see their own profile, forcing use of the public view for barber info
COMMENT ON VIEW public.barbers_public IS 'Public view of barber information without exposing personal contact details like email and phone numbers';