-- Additional Supabase Tables Migration
-- Run this after the main schema to add tables for equipment, marketplace, config, etc.

-- =========================================================
-- SUB_PROFILES (role-specific profile data)
-- =========================================================
create table if not exists public.sub_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null, -- 'Talent', 'Studio', 'Producer', 'Technician', etc.
  data jsonb not null default '{}'::jsonb, -- Flexible role-specific data
  skills text,
  rate numeric,
  service_radius numeric,
  sub_roles text[],
  updated_at timestamptz not null default now(),
  unique(user_id, role)
);

create index if not exists sub_profiles_user_idx on public.sub_profiles (user_id);
create index if not exists sub_profiles_role_idx on public.sub_profiles (role);
create index if not exists sub_profiles_user_role_idx on public.sub_profiles (user_id, role);

drop trigger if exists sub_profiles_set_updated_at on public.sub_profiles;
create trigger sub_profiles_set_updated_at
before update on public.sub_profiles
for each row execute function public.set_updated_at();

alter table public.sub_profiles enable row level security;
create policy "Users can view their own sub-profiles"
  on public.sub_profiles for select
  using (auth.uid() = user_id);
create policy "Users can manage their own sub-profiles"
  on public.sub_profiles for all
  using (auth.uid() = user_id);

-- =========================================================
-- REVIEWS (user reviews/ratings)
-- Note: Created after bookings table to allow foreign key reference
-- =========================================================
-- This table will be created after bookings table (see below)

-- =========================================================
-- EQUIPMENT DATABASE
-- =========================================================
create table if not exists public.equipment_items (
  id uuid primary key default gen_random_uuid(),
  category_id text not null,
  subcategory_id text,
  name text not null,
  manufacturer text,
  model text,
  description text,
  search_tokens text[] default '{}'::text[],
  data jsonb default '{}'::jsonb, -- Store flexible equipment data
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists equipment_items_category_idx on public.equipment_items (category_id);
create index if not exists equipment_items_search_tokens_gin on public.equipment_items using gin (search_tokens);
create index if not exists equipment_items_name_idx on public.equipment_items (name);

-- =========================================================
-- MARKETPLACE ITEMS
-- =========================================================
create table if not exists public.marketplace_items (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  type text not null, -- 'sample', 'preset', 'beat', etc.
  price integer not null, -- Price in tokens
  download_url text,
  preview_url text,
  cover_image_url text,
  tags text[] default '{}'::text[],
  genre text,
  bpm integer,
  key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_items_seller_idx on public.marketplace_items (seller_id);
create index if not exists marketplace_items_type_idx on public.marketplace_items (type);
create index if not exists marketplace_items_created_idx on public.marketplace_items (created_at desc);

-- =========================================================
-- USER LIBRARY (Owned Marketplace Items)
-- =========================================================
create table if not exists public.user_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  item_id uuid references public.marketplace_items(id) on delete cascade,
  title text not null,
  type text,
  price_paid integer,
  download_url text,
  purchased_at timestamptz not null default now()
);

create index if not exists user_library_user_idx on public.user_library (user_id);
create index if not exists user_library_item_idx on public.user_library (item_id);

-- =========================================================
-- CONFIGURATION (Tier Data & Token Packages)
-- =========================================================
create table if not exists public.app_config (
  id uuid primary key default gen_random_uuid(),
  config_key text unique not null,
  config_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Insert default tier config
insert into public.app_config (config_key, config_value) values
  ('tier_config', '{
    "FREE": {
      "name": "Free",
      "price": 0,
      "feeMultiplier": 1.20,
      "features": ["1 Broadcast Request / month", "Cannot list on SeshFx Market"],
      "limits": {"broadcastsPerMonth": 1, "sessionsPerWeek": 2, "canListMarket": false, "monthlyTokens": 0}
    },
    "BASIC": {
      "name": "Basic",
      "price": 4.99,
      "feeMultiplier": 1.10,
      "features": ["3 Broadcast Requests / month", "10 Booked Sessions / week", "Can list on SeshFx Market (5 items)"],
      "limits": {"broadcastsPerMonth": 3, "sessionsPerWeek": 10, "canListMarket": true, "monthlyTokens": 25}
    },
    "PRO": {
      "name": "Pro Creative",
      "price": 14.99,
      "feeMultiplier": 1.02,
      "features": ["15 Broadcast Requests / month", "Unlimited Booked Sessions", "Profile Search Boost"],
      "limits": {"broadcastsPerMonth": 15, "sessionsPerWeek": 999, "canListMarket": true, "monthlyTokens": 100}
    },
    "STUDIO": {
      "name": "Studio Business",
      "price": 29.99,
      "feeMultiplier": 1.00,
      "features": ["Studio Manager Component Access", "Unlimited Broadcast Requests", "0% Session Fees"],
      "limits": {"broadcastsPerMonth": 999, "sessionsPerWeek": 999, "canListMarket": true, "monthlyTokens": 100}
    }
  }'::jsonb)
on conflict (config_key) do nothing;

-- Insert default token packages
insert into public.app_config (config_key, config_value) values
  ('token_packages', '[
    {"id": "pack_small", "tokens": 100, "price": 4.99, "label": "Starter Stash"},
    {"id": "pack_medium", "tokens": 550, "price": 19.99, "label": "Producer Pack", "highlight": true},
    {"id": "pack_large", "tokens": 1200, "price": 39.99, "label": "Studio Vault"}
  ]'::jsonb)
on conflict (config_key) do nothing;

-- =========================================================
-- LABEL ROSTER
-- =========================================================
create table if not exists public.label_roster (
  id uuid primary key default gen_random_uuid(),
  label_id uuid references auth.users(id) on delete cascade not null,
  artist_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  photo_url text,
  status text default 'Active',
  signed_at timestamptz not null default now(),
  released_at timestamptz,
  unique(label_id, artist_id)
);

create index if not exists label_roster_label_idx on public.label_roster (label_id);
create index if not exists label_roster_artist_idx on public.label_roster (artist_id);
create index if not exists label_roster_status_idx on public.label_roster (status);

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- Equipment items: public read
alter table public.equipment_items enable row level security;
create policy "Equipment items are publicly readable"
  on public.equipment_items for select
  using (true);

-- Marketplace items: public read, sellers can manage their own
alter table public.marketplace_items enable row level security;
create policy "Marketplace items are publicly readable"
  on public.marketplace_items for select
  using (true);
create policy "Users can insert their own marketplace items"
  on public.marketplace_items for insert
  with check (auth.uid() = seller_id);
create policy "Users can update their own marketplace items"
  on public.marketplace_items for update
  using (auth.uid() = seller_id);

-- User library: users can only see their own
alter table public.user_library enable row level security;
create policy "Users can view their own library"
  on public.user_library for select
  using (auth.uid() = user_id);
create policy "Users can insert into their own library"
  on public.user_library for insert
  with check (auth.uid() = user_id);

-- App config: public read (admin write via service role)
alter table public.app_config enable row level security;
create policy "App config is publicly readable"
  on public.app_config for select
  using (true);

-- Label roster: labels can manage their roster
alter table public.label_roster enable row level security;
create policy "Labels can view their roster"
  on public.label_roster for select
  using (auth.uid() = label_id);
create policy "Labels can manage their roster"
  on public.label_roster for all
  using (auth.uid() = label_id);

-- =========================================================
-- TRIGGERS
-- =========================================================
drop trigger if exists equipment_items_set_updated_at on public.equipment_items;
create trigger equipment_items_set_updated_at
before update on public.equipment_items
for each row execute function public.set_updated_at();

drop trigger if exists marketplace_items_set_updated_at on public.marketplace_items;
create trigger marketplace_items_set_updated_at
before update on public.marketplace_items
for each row execute function public.set_updated_at();

drop trigger if exists app_config_set_updated_at on public.app_config;
create trigger app_config_set_updated_at
before update on public.app_config
for each row execute function public.set_updated_at();

-- =========================================================
-- SERVICE REQUESTS (Tech Services)
-- =========================================================
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  user_name text not null,
  topic text not null,
  category text not null,
  equipment text,
  urgency text default 'Normal',
  budget integer,
  description text,
  status text default 'Open',
  attachment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_requests_user_idx on public.service_requests (user_id);
create index if not exists service_requests_category_idx on public.service_requests (category);
create index if not exists service_requests_status_idx on public.service_requests (status);
create index if not exists service_requests_created_idx on public.service_requests (created_at desc);

-- =========================================================
-- SAFE ZONES
-- =========================================================
create table if not exists public.safe_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  lat numeric not null,
  lng numeric not null,
  type text,
  type_label text,
  priority integer default 10,
  verified boolean default false,
  created_at timestamptz not null default now()
);

create index if not exists safe_zones_location_idx on public.safe_zones (lat, lng);

-- =========================================================
-- DISTRIBUTION STATS
-- =========================================================
create table if not exists public.distribution_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  lifetime_streams bigint default 0,
  lifetime_earnings numeric(10,2) default 0,
  monthly_listeners integer default 0,
  last_updated timestamptz not null default now()
);

create index if not exists distribution_stats_user_idx on public.distribution_stats (user_id);

-- =========================================================
-- ROYALTY REPORTS
-- =========================================================
create table if not exists public.royalty_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  filename text not null,
  summary jsonb default '{}'::jsonb,
  status text default 'Processed',
  processed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists royalty_reports_user_idx on public.royalty_reports (user_id);
create index if not exists royalty_reports_created_idx on public.royalty_reports (created_at desc);

-- =========================================================
-- ADDITIONAL RLS POLICIES
-- =========================================================

-- Service requests: public read, users can manage their own
alter table public.service_requests enable row level security;
create policy "Service requests are publicly readable"
  on public.service_requests for select
  using (true);
create policy "Users can insert their own service requests"
  on public.service_requests for insert
  with check (auth.uid() = user_id);
create policy "Users can update their own service requests"
  on public.service_requests for update
  using (auth.uid() = user_id);

-- Safe zones: public read, admin write (via service role)
alter table public.safe_zones enable row level security;
create policy "Safe zones are publicly readable"
  on public.safe_zones for select
  using (true);

-- Distribution stats: users can view their own
alter table public.distribution_stats enable row level security;
create policy "Users can view their own distribution stats"
  on public.distribution_stats for select
  using (auth.uid() = user_id);
create policy "Users can update their own distribution stats"
  on public.distribution_stats for update
  using (auth.uid() = user_id);

-- Royalty reports: users can view their own
alter table public.royalty_reports enable row level security;
create policy "Users can view their own royalty reports"
  on public.royalty_reports for select
  using (auth.uid() = user_id);
create policy "Users can insert their own royalty reports"
  on public.royalty_reports for insert
  with check (auth.uid() = user_id);

-- =========================================================
-- ADDITIONAL TRIGGERS
-- =========================================================
drop trigger if exists service_requests_set_updated_at on public.service_requests;
create trigger service_requests_set_updated_at
before update on public.service_requests
for each row execute function public.set_updated_at();

-- =========================================================
-- BOOKINGS (booking requests, broadcasts, sessions)
-- =========================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  
  -- Sender/Requester Info
  sender_id uuid references auth.users(id) on delete cascade not null,
  sender_name text not null,
  on_behalf_of jsonb, -- For proxy bookings (agents/labels)
  
  -- Target/Recipient Info
  target_id uuid references auth.users(id) on delete set null,
  target_name text,
  studio_owner_id uuid references auth.users(id) on delete set null, -- For studio bookings
  
  -- Booking Details
  type text not null, -- 'Direct', 'Broadcast', 'Bid', 'GroupSession', 'TechRequest'
  status text not null default 'Pending', -- 'Pending', 'Confirmed', 'Cancelled', 'Completed', 'Broadcasting'
  service_type text,
  role text, -- For broadcasts
  action text, -- For broadcasts
  
  -- Date/Time
  date text, -- ISO date string or 'Flexible'
  time text, -- Time string or 'Flexible'
  duration numeric, -- Hours
  booking_start timestamptz, -- Calculated booking start time
  
  -- Financial
  offer_amount numeric,
  rate_per_hour numeric,
  payment_intent_id text,
  
  -- Broadcast-specific fields
  broadcast_id uuid, -- Reference to original broadcast
  instrument text,
  genre text,
  experience_level text,
  payment_type text,
  requirements jsonb, -- Array of requirement objects
  reference_links jsonb, -- Reference links (YouTube, Spotify, etc.)
  range numeric, -- Miles for broadcasts
  location jsonb, -- { lat, lng } for broadcasts
  
  -- Session-specific fields
  group_id text, -- For group sessions
  session_name text,
  
  -- Tech-specific fields
  equipment text,
  description text,
  logistics text,
  budget_cap numeric,
  attachments jsonb, -- Array of attachment URLs
  
  -- Project Details
  project_details jsonb, -- { genre, project_type, reference_links }
  message text,
  
  -- Repair/Tech fields
  repair_logs jsonb default '[]'::jsonb,
  repair_status text,
  pre_inspection jsonb,
  post_inspection jsonb,
  
  -- Metadata
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_sender_idx on public.bookings (sender_id);
create index if not exists bookings_target_idx on public.bookings (target_id);
create index if not exists bookings_studio_owner_idx on public.bookings (studio_owner_id);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_type_idx on public.bookings (type);
create index if not exists bookings_date_idx on public.bookings (date);
create index if not exists bookings_created_idx on public.bookings (created_at desc);
create index if not exists bookings_broadcast_idx on public.bookings (broadcast_id) where broadcast_id is not null;
create index if not exists bookings_group_idx on public.bookings (group_id) where group_id is not null;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

-- RLS Policies for bookings
alter table public.bookings enable row level security;

create policy "Users can view bookings they sent or received"
  on public.bookings for select
  using (
    auth.uid() = sender_id 
    or auth.uid() = target_id 
    or auth.uid() = studio_owner_id
    or (type = 'Broadcast' and status = 'Broadcasting') -- Broadcasts are public
  );

create policy "Users can insert their own bookings"
  on public.bookings for insert
  with check (auth.uid() = sender_id);

create policy "Users can update bookings they received"
  on public.bookings for update
  using (
    auth.uid() = target_id 
    or auth.uid() = studio_owner_id
    or (auth.uid() = sender_id and status = 'Pending') -- Sender can cancel pending
  )
  with check (
    auth.uid() = target_id 
    or auth.uid() = studio_owner_id
    or (auth.uid() = sender_id and status = 'Pending')
  );

create policy "Users can delete their own bookings"
  on public.bookings for delete
  using (auth.uid() = sender_id);

-- =========================================================
-- REVIEWS (user reviews/ratings)
-- =========================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid references auth.users(id) on delete cascade not null,
  reviewed_id uuid references auth.users(id) on delete cascade not null,
  booking_id uuid references public.bookings(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(reviewer_id, reviewed_id, booking_id)
);

create index if not exists reviews_reviewed_idx on public.reviews (reviewed_id);
create index if not exists reviews_reviewer_idx on public.reviews (reviewer_id);
create index if not exists reviews_booking_idx on public.reviews (booking_id) where booking_id is not null;

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;
create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);
create policy "Users can insert reviews they wrote"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

-- =========================================================
-- BLOG TABLES RLS POLICIES
-- =========================================================
-- Enable RLS on blog tables if they exist
do $$
begin
  -- blog_users table
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'blog_users') then
    alter table public.blog_users enable row level security;
    
    drop policy if exists "Blog users are publicly readable" on public.blog_users;
    create policy "Blog users are publicly readable"
      on public.blog_users for select
      using (true);
    
    drop policy if exists "Users can update their own blog profile" on public.blog_users;
    create policy "Users can update their own blog profile"
      on public.blog_users for update
      using (auth.uid()::text = user_id or auth.uid()::text = id::text)
      with check (auth.uid()::text = user_id or auth.uid()::text = id::text);
  end if;

  -- blog_posts table
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'blog_posts') then
    alter table public.blog_posts enable row level security;
    
    drop policy if exists "Blog posts are publicly readable" on public.blog_posts;
    create policy "Blog posts are publicly readable"
      on public.blog_posts for select
      using (true);
    
    drop policy if exists "Users can insert their own blog posts" on public.blog_posts;
    create policy "Users can insert their own blog posts"
      on public.blog_posts for insert
      with check (auth.uid()::text = author_id);
    
    drop policy if exists "Users can update their own blog posts" on public.blog_posts;
    create policy "Users can update their own blog posts"
      on public.blog_posts for update
      using (auth.uid()::text = author_id)
      with check (auth.uid()::text = author_id);
    
    drop policy if exists "Users can delete their own blog posts" on public.blog_posts;
    create policy "Users can delete their own blog posts"
      on public.blog_posts for delete
      using (auth.uid()::text = author_id);
  end if;

  -- blog_comments table
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'blog_comments') then
    alter table public.blog_comments enable row level security;
    
    drop policy if exists "Blog comments are publicly readable" on public.blog_comments;
    create policy "Blog comments are publicly readable"
      on public.blog_comments for select
      using (true);
    
    drop policy if exists "Users can insert their own blog comments" on public.blog_comments;
    create policy "Users can insert their own blog comments"
      on public.blog_comments for insert
      with check (auth.uid()::text = author_id);
    
    drop policy if exists "Users can update their own blog comments" on public.blog_comments;
    create policy "Users can update their own blog comments"
      on public.blog_comments for update
      using (auth.uid()::text = author_id)
      with check (auth.uid()::text = author_id);
    
    drop policy if exists "Users can delete their own blog comments" on public.blog_comments;
    create policy "Users can delete their own blog comments"
      on public.blog_comments for delete
      using (auth.uid()::text = author_id);
  end if;
end $$;

