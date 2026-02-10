-- Allow super admins to manage all businesses
DROP POLICY IF EXISTS "Super admins can manage all businesses" ON businesses;
CREATE POLICY "Super admins can manage all businesses" ON businesses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid() 
    AND admins.is_super_admin = true
  )
);

-- Allow super admins to view all admins
DROP POLICY IF EXISTS "Super admins can view all admins" ON admins;
CREATE POLICY "Super admins can view all admins" ON admins
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admins a
    WHERE a.id = auth.uid() 
    AND a.is_super_admin = true
  )
);

-- Allow super admins to insert admins
DROP POLICY IF EXISTS "Super admins can insert admins" ON admins;
CREATE POLICY "Super admins can insert admins" ON admins
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins a
    WHERE a.id = auth.uid() 
    AND a.is_super_admin = true
  )
);

-- Allow super admins to view all reviews
DROP POLICY IF EXISTS "Super admins can view all reviews" ON reviews;
CREATE POLICY "Super admins can view all reviews" ON reviews
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid() 
    AND admins.is_super_admin = true
  )
);
