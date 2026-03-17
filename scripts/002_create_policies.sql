-- Row Level Security Policies for ABCMI Church Website

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Site Settings Policies (Admin only for write, public read for some settings)
CREATE POLICY "Anyone can read site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert site settings" ON site_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update site settings" ON site_settings FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete site settings" ON site_settings FOR DELETE USING (is_admin());

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (is_admin() OR auth.uid() = id);
CREATE POLICY "Admins can delete profiles" ON profiles FOR DELETE USING (is_admin());

-- Events Policies (Public read, Admin write)
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Admins can insert events" ON events FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update events" ON events FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete events" ON events FOR DELETE USING (is_admin());

-- Prayer Requests Policies
CREATE POLICY "Anyone can view public prayer requests" ON prayer_requests FOR SELECT USING (is_public = true OR user_id = auth.uid() OR is_admin());
CREATE POLICY "Authenticated users can create prayer requests" ON prayer_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);
CREATE POLICY "Users can update own prayer requests" ON prayer_requests FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Admins can delete prayer requests" ON prayer_requests FOR DELETE USING (is_admin());

-- Ministries Policies (Public read, Admin write)
CREATE POLICY "Anyone can view active ministries" ON ministries FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins can insert ministries" ON ministries FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update ministries" ON ministries FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete ministries" ON ministries FOR DELETE USING (is_admin());

-- Counseling Requests Policies
CREATE POLICY "Users can view own counseling requests" ON counseling_requests FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Anyone can create counseling requests" ON counseling_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own requests" ON counseling_requests FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Admins can delete counseling requests" ON counseling_requests FOR DELETE USING (is_admin());

-- Donations Policies (Users see own, Admins see all)
CREATE POLICY "Users can view own donations" ON donations FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Authenticated users can create donations" ON donations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);
CREATE POLICY "Admins can update donations" ON donations FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete donations" ON donations FOR DELETE USING (is_admin());

-- Testimonies Policies
CREATE POLICY "Anyone can view approved testimonies" ON testimonies FOR SELECT USING (is_approved = true OR user_id = auth.uid() OR is_admin());
CREATE POLICY "Authenticated users can create testimonies" ON testimonies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own testimonies" ON testimonies FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Admins can delete testimonies" ON testimonies FOR DELETE USING (is_admin());

-- Announcements Policies
CREATE POLICY "Anyone can view published announcements" ON announcements FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY "Admins can insert announcements" ON announcements FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update announcements" ON announcements FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete announcements" ON announcements FOR DELETE USING (is_admin());

-- Daily Verses Policies
CREATE POLICY "Anyone can view daily verses" ON daily_verses FOR SELECT USING (true);
CREATE POLICY "Admins can insert daily verses" ON daily_verses FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update daily verses" ON daily_verses FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete daily verses" ON daily_verses FOR DELETE USING (is_admin());

-- Feedback Policies
CREATE POLICY "Users can view own feedback" ON feedback FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Anyone can create feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update feedback" ON feedback FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete feedback" ON feedback FOR DELETE USING (is_admin());
