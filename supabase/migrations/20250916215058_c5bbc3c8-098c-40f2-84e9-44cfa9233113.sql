-- Add shop status field to barbers table for daily open/closed status
ALTER TABLE public.barbers 
ADD COLUMN shop_status text DEFAULT 'closed' CHECK (shop_status IN ('open', 'closed'));