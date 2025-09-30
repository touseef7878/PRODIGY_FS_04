
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { showError } from '@/utils/toast';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  chat_room_id?: string;
  private_chat_id?: string;
  profiles: Array<{
    username: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
  }> | null;
}

export const useChatMessages = (chatId: string | undefined, chatType: 'public' | 'private' | undefined) => {
  const { supabase, session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const currentUserId = session?.user?.id;

  const fetchMessages = useCallback(async (id: string, type: 'public' | 'private') => {
    setLoadingMessages(true);
    let query = supabase
      .from(type === 'public' ? 'messages' : 'private_messages')
      .select(`
        id,
        created_at,
        sender_id,
        content,
        ${type === 'public' ? 'chat_room_id' : 'private_chat_id'},
        profiles (
          username,
          avatar_url,
          first_name,
          last_name
        )
      `)
      .eq(type === 'public' ? 'chat_room_id' : 'private_chat_id', id)
      .order('created_at', { ascending: true });

    const { data, error } = await query;

    if (error) {
      showError("Failed to load messages: " + error.message);
      console.error("Error fetching messages:", error);
      setMessages([]);
    } else {
      setMessages(data as Message[]);
    }
    setLoadingMessages(false);
  }, [supabase]);

  const sendMessage = useCallback(async (content: string) => {
    if (!chatId || !currentUserId || !chatType) {
      showError("Cannot send message: chat context is not fully loaded.");
      return;
    }

    const table = chatType === 'public' ? 'messages' : 'private_messages';
    const chat_id_column = chatType === 'public' ? 'chat_room_id' : 'private_chat_id';

    // Optimistic update object
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      [chat_id_column]: chatId,
      profiles: [
        {
          username: session?.user?.user_metadata?.username || 'You',
          avatar_url: session?.user?.user_metadata?.avatar_url,
          first_name: session?.user?.user_metadata?.first_name,
          last_name: session?.user?.user_metadata?.last_name,
        },
      ],
    };

    // Add to local state immediately
    setMessages(prev => [...prev, optimisticMessage]);

    const { error } = await supabase.from(table).insert({
      [chat_id_column]: chatId,
      sender_id: currentUserId,
      content: content,
    });

    if (error) {
      showError("Failed to send message: " + error.message);
      console.error("Error sending message:", error);
      // Revert optimistic update on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
    // The real-time subscription will replace the temporary message with the real one from the DB
  }, [chatId, chatType, currentUserId, supabase, session]);


  useEffect(() => {
    if (chatId && chatType) {
      fetchMessages(chatId, chatType);

      const handleNewMessage = async (payload: { new: any }) => {
        const newMessage = payload.new as Message;

        // Fetch sender profile if not already attached
        let profile = null;
        if (newMessage.sender_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url, first_name, last_name')
            .eq('id', newMessage.sender_id)
            .single();
          profile = profileData;
        }

        const messageWithProfile: Message = {
          ...newMessage,
          profiles: profile ? [profile] : [],
        };

        setMessages((prevMessages) => {
          // Remove temporary message if it exists, and add the real one
          const filtered = prevMessages.filter(m => !m.id.toString().startsWith('temp-'));
          if (filtered.some(msg => msg.id === messageWithProfile.id)) {
            return filtered; // Already have the real message
          }
          return [...filtered, messageWithProfile];
        });
      };

      const channel = supabase
        .channel(`${chatType}-chat-${chatId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: chatType === 'public' ? 'messages' : 'private_messages',
            filter: `${chatType === 'public' ? 'chat_room_id' : 'private_chat_id'}=eq.${chatId}`,
          },
          handleNewMessage
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setMessages([]); // Clear messages when no chat is selected
    }
  }, [chatId, chatType, fetchMessages, supabase, currentUserId]);

  return { messages, loadingMessages, sendMessage };
};
