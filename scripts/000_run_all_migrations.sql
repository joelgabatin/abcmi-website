-- ============================================================
-- ABCMI Church Website - Full Database Migration
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- ==================== SCHEMA ====================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT,
  end_time TEXT,
  location TEXT,
  type TEXT DEFAULT 'general' CHECK (type IN ('worship', 'study', 'fellowship', 'outreach', 'general')),
  is_featured BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern TEXT,
  image_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  email TEXT,
  request TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'praying', 'answered')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT 'bg-[var(--church-primary)]',
  leader_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS counseling_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  preferred_date DATE,
  preferred_time TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  admin_notes TEXT,
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  donor_name TEXT NOT NULL,
  email TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'PHP',
  type TEXT DEFAULT 'tithe' CHECK (type IN ('tithe', 'offering', 'missions', 'building', 'other')),
  payment_method TEXT,
  transaction_id TEXT,
  notes TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_text TEXT NOT NULL,
  reference TEXT NOT NULL,
  date DATE UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  email TEXT,
  type TEXT DEFAULT 'feedback' CHECK (type IN ('feedback', 'suggestion', 'complaint', 'testimony')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE counseling_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;


-- ==================== PROFILE AUTO-CREATE TRIGGER ====================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'member')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ==================== RLS POLICIES ====================

-- Helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Site Settings
CREATE POLICY "Anyone can read site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert site settings" ON site_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update site settings" ON site_settings FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete site settings" ON site_settings FOR DELETE USING (is_admin());

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (is_admin() OR auth.uid() = id);
CREATE POLICY "Admins can delete profiles" ON profiles FOR DELETE USING (is_admin());

-- Events
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Admins can insert events" ON events FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update events" ON events FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete events" ON events FOR DELETE USING (is_admin());

-- Prayer Requests
CREATE POLICY "Anyone can view public prayer requests" ON prayer_requests FOR SELECT USING (is_public = true OR user_id = auth.uid() OR is_admin());
CREATE POLICY "Authenticated users can create prayer requests" ON prayer_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);
CREATE POLICY "Users can update own prayer requests" ON prayer_requests FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Admins can delete prayer requests" ON prayer_requests FOR DELETE USING (is_admin());

-- Ministries
CREATE POLICY "Anyone can view active ministries" ON ministries FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins can insert ministries" ON ministries FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update ministries" ON ministries FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete ministries" ON ministries FOR DELETE USING (is_admin());

-- Counseling Requests
CREATE POLICY "Users can view own counseling requests" ON counseling_requests FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Anyone can create counseling requests" ON counseling_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own requests" ON counseling_requests FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Admins can delete counseling requests" ON counseling_requests FOR DELETE USING (is_admin());

-- Donations
CREATE POLICY "Users can view own donations" ON donations FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Authenticated users can create donations" ON donations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);
CREATE POLICY "Admins can update donations" ON donations FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete donations" ON donations FOR DELETE USING (is_admin());

-- Testimonies
CREATE POLICY "Anyone can view approved testimonies" ON testimonies FOR SELECT USING (is_approved = true OR user_id = auth.uid() OR is_admin());
CREATE POLICY "Authenticated users can create testimonies" ON testimonies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own testimonies" ON testimonies FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Admins can delete testimonies" ON testimonies FOR DELETE USING (is_admin());

-- Announcements
CREATE POLICY "Anyone can view published announcements" ON announcements FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY "Admins can insert announcements" ON announcements FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update announcements" ON announcements FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete announcements" ON announcements FOR DELETE USING (is_admin());

-- Daily Verses
CREATE POLICY "Anyone can view daily verses" ON daily_verses FOR SELECT USING (true);
CREATE POLICY "Admins can insert daily verses" ON daily_verses FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update daily verses" ON daily_verses FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete daily verses" ON daily_verses FOR DELETE USING (is_admin());

-- Feedback
CREATE POLICY "Users can view own feedback" ON feedback FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Anyone can create feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update feedback" ON feedback FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete feedback" ON feedback FOR DELETE USING (is_admin());
