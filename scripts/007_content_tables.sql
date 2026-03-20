-- Migration: Convert site_settings JSONB content to relational tables
-- Replaces JSONB blobs with proper rows and columns

-- Hero Section table (singleton row)
CREATE TABLE IF NOT EXISTS hero_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About Section table (singleton row)
CREATE TABLE IF NOT EXISTS about_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission TEXT NOT NULL DEFAULT '',
  vision TEXT NOT NULL DEFAULT '',
  values TEXT NOT NULL DEFAULT '',
  history TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Info table (singleton row)
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  service_times TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Links table — normalized, FK to contact_info
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_info_id UUID NOT NULL REFERENCES contact_info(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'youtube', 'instagram', 'twitter', 'tiktok')),
  url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (contact_info_id, platform)
);

-- Enable Row Level Security
ALTER TABLE hero_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies: public read, admin write
CREATE POLICY "Anyone can read hero section" ON hero_section FOR SELECT USING (true);
CREATE POLICY "Admins can insert hero section" ON hero_section FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update hero section" ON hero_section FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete hero section" ON hero_section FOR DELETE USING (is_admin());

CREATE POLICY "Anyone can read about section" ON about_section FOR SELECT USING (true);
CREATE POLICY "Admins can insert about section" ON about_section FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update about section" ON about_section FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete about section" ON about_section FOR DELETE USING (is_admin());

CREATE POLICY "Anyone can read contact info" ON contact_info FOR SELECT USING (true);
CREATE POLICY "Admins can insert contact info" ON contact_info FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update contact info" ON contact_info FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete contact info" ON contact_info FOR DELETE USING (is_admin());

CREATE POLICY "Anyone can read social links" ON social_links FOR SELECT USING (true);
CREATE POLICY "Admins can insert social links" ON social_links FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update social links" ON social_links FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete social links" ON social_links FOR DELETE USING (is_admin());

-- Migrate existing data from site_settings JSONB to new relational tables
DO $$
DECLARE
  hero_data JSONB;
  about_data JSONB;
  contact_data JSONB;
  new_contact_id UUID;
BEGIN
  SELECT value INTO hero_data FROM site_settings WHERE key = 'hero';
  SELECT value INTO about_data FROM site_settings WHERE key = 'about';
  SELECT value INTO contact_data FROM site_settings WHERE key = 'contact';

  -- Migrate hero section
  IF hero_data IS NOT NULL THEN
    INSERT INTO hero_section (title, subtitle, description)
    VALUES (
      COALESCE(hero_data->>'title', ''),
      COALESCE(hero_data->>'subtitle', ''),
      COALESCE(hero_data->>'description', '')
    );
  END IF;

  -- Migrate about section
  IF about_data IS NOT NULL THEN
    INSERT INTO about_section (mission, vision, values, history)
    VALUES (
      COALESCE(about_data->>'mission', ''),
      COALESCE(about_data->>'vision', ''),
      COALESCE(about_data->>'values', ''),
      COALESCE(about_data->>'history', '')
    );
  END IF;

  -- Migrate contact info and social links
  IF contact_data IS NOT NULL THEN
    INSERT INTO contact_info (address, phone, email, service_times)
    VALUES (
      COALESCE(contact_data->>'address', ''),
      COALESCE(contact_data->>'phone', ''),
      COALESCE(contact_data->>'email', ''),
      COALESCE(contact_data->>'service_times', '')
    )
    RETURNING id INTO new_contact_id;

    -- Migrate social links into separate rows
    IF contact_data->>'facebook_url' IS NOT NULL AND contact_data->>'facebook_url' != '' THEN
      INSERT INTO social_links (contact_info_id, platform, url)
      VALUES (new_contact_id, 'facebook', contact_data->>'facebook_url');
    END IF;

    IF contact_data->>'youtube_url' IS NOT NULL AND contact_data->>'youtube_url' != '' THEN
      INSERT INTO social_links (contact_info_id, platform, url)
      VALUES (new_contact_id, 'youtube', contact_data->>'youtube_url');
    END IF;

    IF contact_data->>'instagram_url' IS NOT NULL AND contact_data->>'instagram_url' != '' THEN
      INSERT INTO social_links (contact_info_id, platform, url)
      VALUES (new_contact_id, 'instagram', contact_data->>'instagram_url');
    END IF;
  END IF;
END $$;
