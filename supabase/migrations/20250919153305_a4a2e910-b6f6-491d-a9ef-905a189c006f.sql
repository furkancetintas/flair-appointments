-- First, let's see what duplicate appointments exist
-- Delete duplicate appointments, keeping only the earliest created one
WITH duplicate_appointments AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY barber_id, appointment_date, appointment_time 
    ORDER BY created_at ASC
  ) as rn
  FROM appointments
  WHERE status != 'cancelled'
)
DELETE FROM appointments 
WHERE id IN (
  SELECT id 
  FROM duplicate_appointments 
  WHERE rn > 1
);

-- Now create the unique constraint to prevent future duplicates
CREATE UNIQUE INDEX unique_barber_datetime ON appointments(barber_id, appointment_date, appointment_time) 
WHERE status != 'cancelled';

-- Create a function to check appointment availability
CREATE OR REPLACE FUNCTION check_appointment_availability(
  barber_id_param UUID,
  appointment_date_param DATE,
  appointment_time_param TIME
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the time slot is already booked (excluding cancelled appointments)
  RETURN NOT EXISTS (
    SELECT 1 FROM appointments 
    WHERE barber_id = barber_id_param 
    AND appointment_date = appointment_date_param 
    AND appointment_time = appointment_time_param
    AND status != 'cancelled'
  );
END;
$$ LANGUAGE plpgsql;