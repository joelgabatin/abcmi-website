-- Create statement_of_belief table
create table if not exists statement_of_belief (
  id uuid primary key default gen_random_uuid(),
  item_number integer not null,
  statement text not null,
  display_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table statement_of_belief enable row level security;

-- Public read access
create policy "Public can read statement_of_belief"
  on statement_of_belief for select
  to anon, authenticated
  using (true);

-- Only admins can insert/update/delete
create policy "Admins can manage statement_of_belief"
  on statement_of_belief for all
  to authenticated
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Seed the 14 fundamental beliefs
insert into statement_of_belief (item_number, statement, display_order) values
  (1,  'We believe in the One True God', 1),
  (2,  'We believe in the Deity of Christ', 2),
  (3,  'We believe in the Scripture as Inspired by God', 3),
  (4,  'We believe in the Fall of Man and a hope for Salvation', 4),
  (5,  'We believe in the Sanctification of Man', 5),
  (6,  'We believe in the Two Ordinances of the Church', 6),
  (7,  'We believe in the Baptism of the Holy Spirit', 7),
  (8,  'We believe in the Divine Healing', 8),
  (9,  'We believe in the Coming back of Christ', 9),
  (10, 'We believe in God''s Ordained Institutions and Authority', 10),
  (11, 'We believe in the Church and Its Mission', 11),
  (12, 'We believe in the Final Judgement', 12),
  (13, 'We believe in the Millennial Reign of Christ', 13),
  (14, 'We believe in the New Heavens and the New Earth', 14);
