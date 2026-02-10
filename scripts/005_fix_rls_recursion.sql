-- Create a helper function to check if user is super admin
-- This uses SECURITY DEFINER to bypass RLS and avoid recursion
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view businesses" ON businesses;
DROP POLICY IF EXISTS "Admins can update their own business" ON businesses;
DROP POLICY IF EXISTS "Super admins can manage all businesses" ON businesses;
DROP POLICY IF EXISTS "Super admins can insert businesses" ON businesses;
DROP POLICY IF EXISTS "Super admins can delete businesses" ON businesses;

DROP POLICY IF EXISTS "Admins can view themselves" ON admins;
DROP POLICY IF EXISTS "Super admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Super admins can insert admins" ON admins;
DROP POLICY IF EXISTS "Admins can view themselves or super admins see all" ON admins;

DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can view their business reviews" ON reviews;
DROP POLICY IF EXISTS "Super admins can view all reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can view their business reviews or super admins see all" ON reviews;

-- Businesses policies (simple, no recursion possible)
CREATE POLICY "businesses_select" ON businesses FOR SELECT USING (true);
CREATE POLICY "businesses_insert" ON businesses FOR INSERT WITH CHECK (public.is_super_admin());
CREATE POLICY "businesses_update" ON businesses FOR UPDATE USING (
  id IN (SELECT business_id FROM admins WHERE id = auth.uid()) OR public.is_super_admin()
);
CREATE POLICY "businesses_delete" ON businesses FOR DELETE USING (public.is_super_admin());

-- Admins policies (use the function to avoid recursion)
CREATE POLICY "admins_select" ON admins FOR SELECT USING (
  id = auth.uid() OR public.is_super_admin()
);
CREATE POLICY "admins_insert" ON admins FOR INSERT WITH CHECK (public.is_super_admin());
CREATE POLICY "admins_delete" ON admins FOR DELETE USING (public.is_super_admin());

-- Reviews policies
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (
  business_id IN (SELECT business_id FROM admins WHERE id = auth.uid()) OR public.is_super_admin()
);
