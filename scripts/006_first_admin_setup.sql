-- Create a function to setup the first super admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.setup_first_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Check if any admins exist
  SELECT COUNT(*) INTO admin_count FROM public.admins;
  
  -- Only allow if no admins exist yet
  IF admin_count = 0 THEN
    INSERT INTO public.admins (id, business_id, is_super_admin)
    VALUES (user_id, NULL, true);
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
