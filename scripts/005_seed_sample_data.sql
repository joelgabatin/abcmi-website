-- Seed Events and Other Data
-- Note: Daily verses data from previous script

-- Seed Events
INSERT INTO events (title, description, date, time, end_time, location, type, is_recurring, recurring_pattern, image_url, is_featured) VALUES
('Sunday Worship Service', 'Join us for our main worship service featuring praise, worship, and a message from God''s Word.', '2026-03-15', '09:00', '11:00', 'Main Sanctuary', 'service', true, 'weekly', NULL, true),
('Bible Study', 'Deep dive into Scripture with our Bible study group. This week we study the Gospel of John.', '2026-03-17', '18:30', '20:00', 'Fellowship Hall', 'study', true, 'weekly', NULL, false),
('Youth Group Meeting', 'Fun activities, games, and spiritual growth for our young people (ages 13-18).', '2026-03-16', '18:00', '20:00', 'Youth Center', 'meeting', true, 'weekly', NULL, false),
('Prayer Night', 'An evening dedicated to intercessory prayer for our church, community, and the world.', '2026-03-18', '19:00', '21:00', 'Prayer Room', 'prayer', true, 'weekly', NULL, false),
('Women''s Fellowship Breakfast', 'Join our sisters in Christ for fellowship, breakfast, and encouragement.', '2026-03-22', '08:00', '10:00', 'Fellowship Hall', 'fellowship', false, NULL, NULL, true),
('Men''s Breakfast & Devotion', 'A time of spiritual growth and brotherhood with our men in the faith.', '2026-03-23', '07:00', '09:00', 'Dining Area', 'fellowship', false, NULL, NULL, false),
('Children''s Sunday School', 'Bible lessons and activities for children ages 3-12. Fun and interactive learning!', '2026-03-15', '10:00', '11:00', 'Children''s Wing', 'event', true, 'weekly', NULL, false),
('Evening Service', 'Reflective worship and testimonies to end the week spiritually renewed.', '2026-03-21', '18:30', '20:00', 'Main Sanctuary', 'service', true, 'weekly', NULL, false);

-- Seed Prayer Requests
INSERT INTO prayer_requests (name, email, request, is_anonymous, is_public, status, admin_notes) VALUES
('Sarah Johnson', 'sarah@example.com', 'Please pray for my mother who is recovering from surgery. She needs strength and healing.', false, true, 'pending', 'Member contacted - follow up after 1 week'),
('Anonymous', NULL, 'Pray for wisdom in my job situation. I am facing a difficult decision that could affect my family.', true, true, 'pending', 'No contact info provided'),
('Michael Smith', 'michael@example.com', 'Please lift up my son in prayer. He is struggling with his faith and we want him to know God''s love.', false, false, 'pending', 'Assigned to pastoral care team'),
('Anonymous', NULL, 'I am struggling with anxiety and depression. Please pray for God''s peace and healing in my life.', true, false, 'pending', 'Sensitive matter - pray in confidence'),
('Jennifer Lee', 'jennifer@example.com', 'Thanksgiving prayer! My daughter got accepted to her dream university. Thank you for praying!', false, true, 'answered', 'Praise report'),
('David Brown', 'david@example.com', 'Prayers needed for our marriage. My spouse and I have been having conflicts. Please pray for reconciliation.', false, false, 'needs_followup', 'Referred to marriage counseling');

-- Seed Donations
INSERT INTO donations (donor_name, email, amount, currency, type, payment_method, is_anonymous) VALUES
('Anonymous Donor', NULL, 100.00, 'USD', 'general', 'online', true),
('Community Member', 'member@example.com', 250.00, 'USD', 'missions', 'transfer', false),
('Anonymous Donor', NULL, 50.00, 'USD', 'building', 'online', true),
('John Supporter', 'john@example.com', 500.00, 'USD', 'general', 'transfer', false),
('Faithful Giver', NULL, 75.00, 'USD', 'youth', 'online', true),
('Margaret Smith', 'margaret@example.com', 150.00, 'USD', 'community', 'transfer', false),
('Anonymous Donor', NULL, 200.00, 'USD', 'missions', 'online', true),
('Robert Johnson', 'robert@example.com', 300.00, 'USD', 'building', 'transfer', false),
('Anonymous Donor', NULL, 125.00, 'USD', 'general', 'online', true),
('Patricia Williams', 'patricia@example.com', 80.00, 'USD', 'youth', 'transfer', false);

-- Seed Testimonies
INSERT INTO testimonies (title, author, content, is_featured, is_published) VALUES
('God Healed My Heart', 'Emma Davis', 'After years of pain and unforgiveness, I finally gave my burdens to Jesus and experienced true healing and peace.', true, true),
('From Darkness to Light', 'James Wilson', 'I was lost in addiction, but Jesus reached down and saved me. My life has been transformed by His grace.', true, true),
('A Miracle in Our Family', 'Lisa Anderson', 'When we thought all hope was lost, God performed a miracle. Our family now serves Him with grateful hearts.', false, true),
('Faith Overcame Fear', 'Mark Thompson', 'I learned to trust God in the midst of fear. His perfect love casts out all fear, and I have experienced this truth.', true, true);

-- Seed Announcements
INSERT INTO announcements (title, content, excerpt, is_featured, is_published) VALUES
('New Prayer Ministry Launched', 'We are excited to announce the launch of our new 24/7 prayer ministry. Join us as we intercede for our community.', 'Introducing our new prayer initiative', true, true),
('Church Picnic This Summer', 'Mark your calendars! We will be hosting a church family picnic in June. More details coming soon.', 'Fun and fellowship awaits!', true, true),
('Volunteer Opportunities Available', 'We need volunteers for our children''s ministry, hospitality team, and maintenance. If you''re interested in serving, please contact us.', 'Be part of our ministry team', false, true),
('Financial Giving Campaign', 'Help us reach our building expansion goal. Every donation, large or small, brings us closer to our vision.', 'Support our growth and vision', true, true);

-- Seed Ministries
INSERT INTO ministries (name, description, leader, meeting_day, meeting_time, image_url, is_active) VALUES
('Worship Ministry', 'We lead the church in praise and worship, creating an atmosphere for God''s presence.', 'Michael Johnson', 'Sunday', '08:00 AM', NULL, true),
('Children''s Ministry', 'Teaching the next generation about Jesus through fun, engaging, and age-appropriate lessons.', 'Sarah Williams', 'Sunday', '10:00 AM', NULL, true),
('Youth Ministry', 'Empowering young people to grow in faith and develop strong Christian character.', 'David Martinez', 'Friday', '06:00 PM', NULL, true),
('Prayer Ministry', 'Interceding for our church, community, and world 24/7.', 'Lisa Chen', 'Daily', '07:00 AM', NULL, true),
('Missions Ministry', 'Spreading the Gospel locally and globally through mission work and outreach.', 'James Wilson', 'Monthly', '02:00 PM', NULL, true),
('Community Outreach', 'Serving our community and showing God''s love through practical help and support.', 'Patricia Davis', 'As needed', 'Flexible', NULL, true),
('Women''s Fellowship', 'Providing support, encouragement, and spiritual growth for the women in our church.', 'Margaret Smith', 'Monthly', '10:00 AM', NULL, true),
('Men''s Ministry', 'Building strong men of God through fellowship, accountability, and spiritual growth.', 'Robert Johnson', 'Monthly', '07:00 AM', NULL, true);
