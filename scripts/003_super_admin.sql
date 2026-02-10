-- Create a super admin flag
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- You'll need to create your super admin account:
-- 1. First, sign up at /admin/login with your email
-- 2. Then run this query to make yourself a super admin:
-- UPDATE admins SET is_super_admin = true WHERE user_id = 'YOUR_USER_ID';
