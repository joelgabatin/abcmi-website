-- Note: Events should be added through admin panel due to type constraint validation

-- Insert sample prayer requests  
INSERT INTO public.prayer_requests (name, email, request, is_anonymous, is_public, status)
VALUES
('Sarah Johnson', 'sarah@example.com', 'Please pray for my family as we navigate a difficult season. My mother is dealing with health issues and we need wisdom and strength.', false, true, 'pending'),
('Anonymous Member', NULL, 'Praying for our nation and leaders. May God''s kingdom come and His will be done.', true, true, 'pending'),
('James Williams', 'james@example.com', 'Healing and strength needed for my colleague who is undergoing cancer treatment.', false, true, 'pending'),
('Maria Rodriguez', 'maria@example.com', 'Thanksgiving prayers for a job offer I received! Grateful for God''s provision.', false, true, 'answered'),
('Anonymous', NULL, 'Peace during anxiety. Please pray for those struggling with mental health issues.', true, true, 'pending'),
('Michael Chen', 'michael@example.com', 'Prayers for my marriage as we work through communication challenges.', false, true, 'pending')
ON CONFLICT DO NOTHING;

-- Insert sample ministries
INSERT INTO public.ministries (name, description, is_active)
VALUES
('Praise & Worship Team', 'Leading worship and praise during our services.', true),
('Youth Ministry', 'Spiritual growth and discipleship for teenagers.', true),
('Women''s Ministry', 'Empowerment and encouragement for women in the church.', true),
('Men''s Ministry', 'Brotherhood and leadership development for men.', true),
('Children''s Ministry', 'Bible education and character development for children.', true),
('Outreach Ministry', 'Community service and evangelism outreach programs.', true),
('Counseling Ministry', 'Pastoral care and spiritual counseling services.', true),
('Prayer Ministry', 'Intercessory prayer for church, community, and world.', true)
ON CONFLICT DO NOTHING;

-- Insert sample testimonies
INSERT INTO public.testimonies (name, content, is_featured, is_approved)
VALUES
('From Darkness to Light - Marcus Green', 'I came to this church broken and lost. Through the love of Jesus and this community, I found healing, purpose, and a new life. God has completely transformed my heart and my family.', true, true),
('Answered Prayers - Jennifer Clark', 'After years of infertility, God blessed us with our daughter. This church prayed with us through every step. God is faithful!', true, true),
('From Addiction to Freedom - James Mitchell', 'I was bound by addiction for 10 years. Christ set me free through this church community''s support, prayer, and God''s grace. I''m 5 years sober!', false, true),
('A New Beginning - Lisa Santos', 'Moving to this city, I felt alone until I found this church. The welcome, love, and spiritual growth I''ve experienced here has been life-changing.', true, true)
ON CONFLICT DO NOTHING;

-- Insert sample announcements
INSERT INTO public.announcements (title, content, excerpt, is_featured, is_published)
VALUES
('Easter Celebration 2026', 'Join us for our Easter celebration with special services, baptisms, and renewal of commitment to Christ. Services at 7 AM sunrise service, 9 AM, and 11 AM.', 'Special Easter services coming this April!', true, true),
('New Small Group Studies Starting', 'We are launching 8 new small group Bible studies starting this month. Sign up on the information board or online at our website.', 'Small groups forming now for deeper spiritual growth', true, true),
('Missions Trip Registration Open', 'This summer we are going on a missions trip. Registration is open now for both youth and adults. All ages welcome!', 'Sign up for summer missions trip', false, true),
('Building Renovation Update', 'Phase 2 of our building renovation is complete! Thank you to all who donated and prayed. Phase 3 begins next month.', 'Building renovation progressing well', true, true)
ON CONFLICT DO NOTHING;

-- Insert sample counseling requests
INSERT INTO public.counseling_requests (name, phone, email, topic, message, preferred_date, preferred_time, status)
VALUES
('Emily Watson', '555-1001', 'emily@example.com', 'Marriage counseling', 'My spouse and I need help navigating communication issues in our marriage.', '2026-03-20', '14:00', 'pending'),
('Robert Taylor', '555-1002', 'robert@example.com', 'Grief counseling', 'I lost my father recently and am struggling to cope with the loss.', '2026-03-18', '10:00', 'pending'),
('Lisa Anderson', '555-1003', 'lisa.a@example.com', 'Career guidance', 'I''m facing a major career decision and would like biblical perspective.', '2026-03-22', '15:00', 'pending'),
('Mark Peterson', '555-1004', 'mark@example.com', 'Life purpose', 'I feel lost about my life direction and purpose. Looking for spiritual guidance.', '2026-03-25', '11:00', 'pending'),
('Jennifer Hall', '555-1005', 'jennifer.h@example.com', 'Family issues', 'Struggling with relationship with adult children. Need help and guidance.', '2026-03-19', '13:00', 'pending'),
('David Nelson', '555-1006', 'david.n@example.com', 'Trauma recovery', 'Working through past trauma with professional biblical counseling.', '2026-03-21', '10:00', 'pending')
ON CONFLICT DO NOTHING;
