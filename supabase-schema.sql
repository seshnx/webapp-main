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
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth system)
-- For now, allow authenticated users to read/write their own data
-- You'll need to adjust these based on your Firebase Auth integration

-- Messages: Users can read messages from chats they're in
CREATE POLICY "Users can read messages from their chats"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.chat_id = messages.chat_id 
      AND conversations.user_id = auth.uid()::text
    )
  );

-- Messages: Users can insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid()::text);

-- Messages: Users can update their own messages
CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid()::text);

-- Conversations: Users can read their own conversations
CREATE POLICY "Users can read their own conversations"
  ON conversations FOR SELECT
  USING (user_id = auth.uid()::text);

-- Conversations: Users can insert/update their own conversations
CREATE POLICY "Users can manage their own conversations"
  ON conversations FOR ALL
  USING (user_id = auth.uid()::text);

-- Presence: Users can read all presence, update their own
CREATE POLICY "Users can read all presence"
  ON presence FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own presence"
  ON presence FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own presence"
  ON presence FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Read Receipts: Users can read receipts for their chats, insert their own
CREATE POLICY "Users can read receipts for their chats"
  ON read_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.chat_id = read_receipts.chat_id 
      AND conversations.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their own read receipts"
  ON read_receipts FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Chat Members: Users can read members of their chats
CREATE POLICY "Users can read members of their chats"
  ON chat_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.chat_id = chat_members.chat_id 
      AND conversations.user_id = auth.uid()::text
    )
  );

-- Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE presence;
ALTER PUBLICATION supabase_realtime ADD TABLE read_receipts;

