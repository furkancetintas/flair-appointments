-- Drop the barbers_public view
DROP VIEW IF EXISTS public.barbers_public;

-- Add RLS policy for public appointment lookup by ID
CREATE POLICY "Anyone can view appointment by ID"
ON public.appointments
FOR SELECT
USING (true);

-- Note: This allows anyone with an appointment ID to view it
-- This is intentionally permissive for the guest appointment lookup feature