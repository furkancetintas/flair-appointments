-- Recreate the view with explicit SECURITY INVOKER to satisfy linter
DROP VIEW IF EXISTS public.barbers_public;

CREATE VIEW public.barbers_public 
WITH (security_invoker = true) AS
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

COMMENT ON VIEW public.barbers_public IS 'Public view of barber information without exposing personal contact details like email and phone numbers. Uses security_invoker to run with querying user permissions.';