-- Seed data for ABCMI Church Website

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
('hero', '{"title": "Arise and Build For Christ Ministries Inc.", "subtitle": "Welcome to Our Church Family", "description": "A faith-centered community dedicated to spreading the Gospel, nurturing believers, and building disciples for Christ. Join us in worship, prayer, and fellowship."}'::jsonb),
('about', '{"mission": "To spread the Gospel of Jesus Christ, make disciples of all nations, and build a community of believers rooted in faith, hope, and love.", "vision": "To see transformed lives, strong families, and thriving communities through the power of the Gospel and the love of Christ.", "values": "Faith in God, love for one another, integrity in all things, and commitment to serving our community with excellence.", "history": "Since 1986, Arise and Build For Christ Ministries has been a beacon of hope, faith, and community in Baguio City and beyond. What began as a house church founded by Rev. Marino S. Coyoy and Elizabeth L. Coyoy has grown into a ministry with multiple outreach locations across the Philippines and even internationally.", "stats": {"years": 40, "outreaches": 15, "ministries": 11, "international": 1}}'::jsonb),
('contact', '{"address": "Quirino Hill, Baguio City, Philippines", "phone": "+63 74 123 4567", "email": "info@abcmi.org", "service_times": "Sunday: 9:00 AM - 12:00 PM"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Insert default ministries
INSERT INTO ministries (name, description, icon, color, display_order, is_active) VALUES
('Music Ministry', 'Leading worship through music and song, bringing glory to God in every service.', 'Music', 'bg-[var(--church-primary)]', 1, true),
('Youth Ministry', 'Empowering young people to live out their faith and become leaders for Christ.', 'Users', 'bg-[var(--church-gold)]', 2, true),
('Women''s Ministry', 'Building strong, faith-filled women through fellowship, study, and service.', 'Heart', 'bg-pink-500', 3, true),
('Discipleship Group', 'Growing deeper in faith through intentional Bible study and mentorship.', 'BookOpen', 'bg-[var(--church-primary-deep)]', 4, true),
('Missions & Evangelism', 'Spreading the Gospel locally and globally through church planting and outreach.', 'Globe', 'bg-emerald-500', 5, true),
('Health Ministry', 'Caring for the physical well-being of our community as an extension of Christ''s love.', 'Stethoscope', 'bg-red-500', 6, true),
('Men''s Ministry', 'Building strong, godly men through fellowship, accountability, and discipleship.', 'Shield', 'bg-slate-600', 7, true),
('Children''s Ministry', 'Nurturing the faith of our youngest members through fun and engaging Bible teaching.', 'Baby', 'bg-orange-500', 8, true)
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, date, time, end_time, location, type, is_featured, is_recurring, recurring_pattern) VALUES
('Sunday Worship Service', 'Join us every Sunday for a time of worship, prayer, and the Word of God. Experience the presence of God with our church family.', CURRENT_DATE + (7 - EXTRACT(DOW FROM CURRENT_DATE)::int), '9:00 AM', '12:00 PM', 'Main Sanctuary, Quirino Hill', 'worship', true, true, 'weekly'),
('Wednesday Prayer Meeting', 'A midweek gathering for prayer and intercession.', CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7), '7:00 PM', '8:30 PM', 'Prayer Room', 'study', false, true, 'weekly'),
('Youth Fellowship Night', 'A time for young people to gather, worship, and grow together.', CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7), '6:00 PM', '9:00 PM', 'Fellowship Hall', 'fellowship', false, true, 'weekly'),
('Men''s Bible Study', 'Early morning Bible study for men.', CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7), '6:00 AM', '7:30 AM', 'Conference Room', 'study', false, true, 'weekly')
ON CONFLICT DO NOTHING;

-- Insert sample daily verse
INSERT INTO daily_verses (verse_text, reference, date) VALUES
('"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."', 'Jeremiah 29:11 (NIV)', CURRENT_DATE)
ON CONFLICT (date) DO UPDATE SET verse_text = EXCLUDED.verse_text, reference = EXCLUDED.reference;

-- Insert sample announcements
INSERT INTO announcements (title, content, excerpt, is_published, is_featured, published_at) VALUES
('New Church Building Project Update', 'We are excited to announce that the construction of our new fellowship hall is progressing well. The foundation has been laid and we expect to complete the structure by the end of the year. Thank you for your continued prayers and financial support for this project.', 'Construction of our new fellowship hall is progressing well.', true, true, NOW()),
('Missions Team Returns from Laos', 'Our missions team has returned from their two-week trip to Vientiane, Laos. They report that the church plant is growing with 30+ regular attendees. Many souls were saved during their evangelistic outreaches. Please continue to pray for our brothers and sisters in Laos.', 'Our missions team reports growth in Laos church plant.', true, false, NOW() - INTERVAL '5 days'),
('New Discipleship Program Launch', 'We are launching a new 12-week discipleship program for new believers and those who want to grow deeper in their faith. The program covers the foundations of Christian faith, spiritual disciplines, and practical Christian living. Sign up through our Bible Study page!', 'New 12-week discipleship program for believers.', true, false, NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;
