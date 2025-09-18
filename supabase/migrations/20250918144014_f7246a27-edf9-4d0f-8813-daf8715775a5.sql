-- Enable real-time for appointments table
ALTER TABLE appointments REPLICA IDENTITY FULL;

-- Add appointments table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Create a unique constraint to prevent double bookings for the same time slot
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