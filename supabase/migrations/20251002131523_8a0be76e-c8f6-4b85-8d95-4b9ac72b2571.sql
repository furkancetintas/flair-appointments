-- Allow everyone to view barber profiles
CREATE POLICY "Barber profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (
  role = 'barber'
);