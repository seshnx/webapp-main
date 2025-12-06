-- Supabase Database Schema for Chat System
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)

-- 1. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_photo TEXT,
  content TEXT,
  media JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_for_all BOOLEAN DEFAULT FALSE,
  reply_to JSONB,
  reactions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- 2. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  last_sender_id TEXT,
  chat_name TEXT,
  chat_photo TEXT,
  chat_type TEXT DEFAULT 'direct', -- 'direct' or 'group'
  other_user_id TEXT, -- For direct chats
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chat_id)
);

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_time ON conversations(last_message_time DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_conversations_chat_id ON conversations(chat_id);

-- 3. Presence Table
CREATE TABLE IF NOT EXISTS presence (
  user_id TEXT PRIMARY KEY,
  online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Read Receipts Table
CREATE TABLE IF NOT EXISTS read_receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id TEXT NOT NULL,
  message_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chat_id, message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_read_receipts_chat_user ON read_receipts(chat_id, user_id);
CREATE INDEX IF NOT EXISTS idx_read_receipts_message ON read_receipts(message_id);

-- 5. Chat Members (for group chats)
CREATE TABLE IF NOT EXISTS chat_members (
  chat_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member', -- 'member', 'admin'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);

-- Enable Row Level Security (RLS)
-- NOTE: Since we're using Firebase Auth (not Supabase Auth), RLS policies
-- that use auth.uid() won't work. We'll handle auth in application code instead.
-- For now, we'll use a simpler approach with service role or disable RLS for testing.

-- Option 1: Disable RLS for now (handle auth in app code)
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE presence ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE read_receipts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS but use service role key (not recommended for production)
-- You'll need to create a server-side API to handle authenticated requests

-- For development/testing: RLS is disabled, auth handled in application code
-- Firebase Auth validates users, then app code checks user_id matches Firebase UID

-- RLS Policies
-- NOTE: Since we're using Firebase Auth (not Supabase Auth), RLS policies
-- that use auth.uid() won't work. We'll handle auth in application code instead.

-- RLS is DISABLED - Auth handled in application code
-- Firebase Auth validates users, then app code ensures:
-- - All queries filter by user_id (Firebase UID)
-- - Insert operations require matching sender_id/user_id  
-- - Update/delete operations verify ownership

-- If you want to enable RLS later, you'll need to:
-- 1. Create a Supabase Edge Function that validates Firebase tokens
-- 2. Use that function to set a custom claim in Supabase
-- 3. Then uncomment and use the policies below

-- Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE presence;
ALTER PUBLICATION supabase_realtime ADD TABLE read_receipts;

