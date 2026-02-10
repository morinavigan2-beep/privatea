-- Make business_id nullable for super admins (they manage all businesses)
ALTER TABLE public.admins ALTER COLUMN business_id DROP NOT NULL;

-- Update the setup function to include email
CREATE OR REPLACE FUNCTION public.setup_first_super_admin(p_user_id UUID, p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Check if any admins exist
  SELECT COUNT(*) INTO admin_count FROM public.admins;
  
  -- Only allow if no admins exist yet
  IF admin_count = 0 THEN
    INSERT INTO public.admins (id, business_id, email, is_super_admin)
    VALUES (p_user_id, NULL, p_email, true);
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
