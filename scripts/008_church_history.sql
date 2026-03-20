-- Church History table
-- Each row is one timeline event, ordered by display_order

CREATE TABLE IF NOT EXISTS church_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  event TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE church_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read church history" ON church_history FOR SELECT USING (true);
CREATE POLICY "Admins can insert church history" ON church_history FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update church history" ON church_history FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete church history" ON church_history FOR DELETE USING (is_admin());

-- Seed with timeline data (previously hardcoded in app/about/page.tsx)
INSERT INTO church_history (year, event, display_order) VALUES
('1984', 'The revival began at Quirino Hill Barangay/Village.', 1),
('1986', 'Arise and Build For Christ Ministries was founded by Rev. Marino S. Coyoy and Elizabeth L. Coyoy. It started as a house church.', 2),
('1990', 'A new location and a wider worship space were provided.', 3),
('1991', 'A daughter church was started by Ptr. Ernesto Paleyan in Patiacan, Quirino, Ilocos Sur.', 4),
('1992', 'Another wider space was provided to accommodate more people.', 5),
('1994', 'A parcel of land was donated by Col. Hover S. Coyoy, which became a permanent place of worship. Additional pastoral team members were added.', 6),
('1995', 'Church planting started at Camp 8, Baguio City.', 7),
('1997', 'Arise and Build For Christ Ministries Inc. became the registered name under the SEC.', 8),
('2000', 'Church planting began at Nangobongan, San Juan, Abra.', 9),
('2004', 'Church planting started at Manabo, Abra through Ptr. Elmo Salingbay.', 10),
('2007', 'Ptr. Ysrael L. Coyoy became the resident pastor of ABCMI Quirino Hill.', 11),
('2009', 'Church planting started at Maria Aurora, Aurora.', 12),
('2012', 'Church planting began at Lower Decoliat, Alfonso Castañeda, Nueva Vizcaya.', 13),
('2014', 'A house church started through Bible study with the Bayanos family in San Carlos, Baguio City.', 14),
('2015', 'House churches started at Idogan, San Carlos (March) and Kias, Baguio City (September).', 15),
('2016', 'Church planting started at Dalic, Bontoc, Mt. Province.', 16),
('2017', 'Church planting started at Ansagan, Tuba, Benguet.', 17),
('2019', 'VBS, Crusade, and Church Planting were conducted at Abas, Sallapadan, Abra.', 18),
('2023', 'The church adopted church planting works at Tuding, Itogon, Benguet and in Vientiane, Laos (November).', 19),
('2024', 'Church planting started at Palina, Tuba, Benguet (March).', 20)
ON CONFLICT DO NOTHING;
