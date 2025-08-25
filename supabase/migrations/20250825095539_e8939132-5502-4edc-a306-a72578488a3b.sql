
-- Create an admin user in profiles table
-- You can change this email and use it to sign up, then it will have admin role
INSERT INTO public.profiles (id, email, display_name, role) 
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  'System Admin',
  'admin'
) ON CONFLICT (id) DO NOTHING;

-- Alternative: If you want to make an existing user admin, update their role
-- Replace 'your-email@example.com' with the email you want to make admin
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Create a function to promote user to admin (for testing)
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
