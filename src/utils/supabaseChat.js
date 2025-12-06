/**
 * Supabase Chat Utilities
 * Replaces Firebase RTDB for chat functionality
 */

import { supabase, isSupabaseAvailable } from '../config/supabase';

/**
 * Get messages for a chat with real-time subscription
 */
export const subscribeToMessages = (chatId, callback) => {
  if (!isSupabaseAvailable() || !chatId) {
    console.warn('Supabase not available or chatId missing');
    return () => {};
  }

  // Initial fetch
  supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('timestamp', { ascending: true })
    .limit(100)
    .then(({ data, error }) => {
      if (error) {
        console.error('Error fetching messages:', error);
        callback([]);
      } else {
        callback(data || []);
      }
    });

  // Real-time subscription
  const channel = supabase
    .channel(`messages:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        // Fetch updated messages
        supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('timestamp', { ascending: true })
          .limit(100)
          .then(({ data, error }) => {
            if (!error && data) {
              callback(data);
            }
          });
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Send a message
 */
export const sendMessage = async (chatId, messageData) => {
  if (!isSupabaseAvailable() || !chatId) {
    throw new Error('Supabase not available');
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: messageData.senderId,
      sender_name: messageData.senderName,
      sender_photo: messageData.senderPhoto,
      content: messageData.content,
      media: messageData.media,
      reply_to: messageData.replyTo,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  // Update conversation
  await updateConversation(chatId, messageData.senderId, {
    lastMessage: messageData.content || (messageData.media ? `Sent ${messageData.media.type}` : 'Message'),
    lastMessageTime: new Date().toISOString(),
    lastSenderId: messageData.senderId,
  });

  return data;
};

/**
 * Update conversation metadata
 */
export const updateConversation = async (chatId, userId, updates) => {
  if (!isSupabaseAvailable()) return;

  const conversationId = `${userId}_${chatId}`;
  
  const { error } = await supabase
    .from('conversations')
    .upsert({
      id: conversationId,
      user_id: userId,
      chat_id: chatId,
      ...updates,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error updating conversation:', error);
  }
};

/**
 * Get conversations for a user with real-time subscription
 */
export const subscribeToConversations = (userId, callback) => {
  if (!isSupabaseAvailable() || !userId) {
    console.warn('Supabase not available or userId missing');
    return () => {};
  }

  // Initial fetch
  supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('last_message_time', { ascending: false, nullsFirst: false })
    .then(({ data, error }) => {
      if (error) {
        console.error('Error fetching conversations:', error);
        callback([]);
      } else {
        callback(data || []);
      }
    });

  // Real-time subscription
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        // Refetch conversations
        supabase
          .from('conversations')
          .select('*')
          .eq('user_id', userId)
          .order('last_message_time', { ascending: false, nullsFirst: false })
          .then(({ data, error }) => {
            if (!error && data) {
              callback(data);
            }
          });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Update presence
 */
export const updatePresence = async (userId, online, lastSeen) => {
  if (!isSupabaseAvailable()) return;

  const { error } = await supabase
    .from('presence')
    .upsert({
      user_id: userId,
      online,
      last_seen: lastSeen || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error updating presence:', error);
  }
};

/**
 * Subscribe to user presence
 */
export const subscribeToPresence = (userId, callback) => {
  if (!isSupabaseAvailable() || !userId) {
    return () => {};
  }

  const channel = supabase
    .channel(`presence:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'presence',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  // Initial fetch
  supabase
    .from('presence')
    .select('*')
    .eq('user_id', userId)
    .single()
    .then(({ data, error }) => {
      if (!error && data) {
        callback(data);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
};

