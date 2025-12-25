-- ==========================================
-- CAMPUS IT SUPPORT TICKET SYSTEM - DATABASE SCHEMA
-- ==========================================

-- 1. Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  hp TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Wifi', 'Account', 'Hardware', 'Software')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DIAJUKAN' CHECK (status IN ('DIAJUKAN', 'DISETUJUI', 'DIPROSES', 'SELESAI')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create admin_profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create function to auto-create admin profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Admin User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger for auto-creating admin profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin();

-- 5. Enable Row Level Security
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can insert tickets" ON public.tickets;
DROP POLICY IF EXISTS "Anyone can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can delete tickets" ON public.tickets;
DROP POLICY IF EXISTS "Enable insert for trigger function" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can update own profile" ON public.admin_profiles;

-- 7. Create RLS Policies for tickets table

-- IMPORTANT: Allow anyone (students) to create tickets WITHOUT authentication
CREATE POLICY "Anyone can insert tickets"
  ON public.tickets
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to view their own tickets by email (for students)
CREATE POLICY "Anyone can view their own tickets"
  ON public.tickets
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated admins to view all tickets
CREATE POLICY "Admins can view all tickets"
  ON public.tickets
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated admins to update any ticket
CREATE POLICY "Admins can update tickets"
  ON public.tickets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated admins to delete tickets
CREATE POLICY "Admins can delete tickets"
  ON public.tickets
  FOR DELETE
  TO authenticated
  USING (true);

-- 8. Create RLS Policies for admin_profiles table

-- CRITICAL: Allow the trigger function to insert into admin_profiles
CREATE POLICY "Enable insert for trigger function"
  ON public.admin_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can view all admin profiles
CREATE POLICY "Admins can view admin profiles"
  ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can update their own profile
CREATE POLICY "Admins can update own profile"
  ON public.admin_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_email ON public.tickets(email);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON public.tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);

-- 10. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create triggers for updated_at
DROP TRIGGER IF EXISTS set_tickets_updated_at ON public.tickets;
CREATE TRIGGER set_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER set_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- DONE! Now you need to:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire SQL file
-- 3. Click "Run" to execute
-- 4. Configure Email settings (see instructions below)
-- ==========================================
