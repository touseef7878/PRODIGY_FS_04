"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { showError } from '@/utils/toast';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  chat_room_id?: string;
  private_chat_id?: string;
  profile?: {
    username: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export const useChatMessages = (chatId: string | undefined, chatType: 'public' | 'private' | undefined) => {
  const { supabase, session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [profileCache, setProfileCache] = useState<Record<string, any>>({});
  const currentUserId = session?.user?.id;

  // Memoize the fetchMessages function to avoid unnecessary re-renders
  const fetchMessages = useCallback(async (id: string, type: 'public' | 'private') => {
    if (!id || !type) return;
    
    setLoadingMessages(true);
    let query = supabase
      .from(type === 'public' ? 'messages' : 'private_messages')
      .select(`
        id,
        created_at,
        sender_id,
        content,
        ${type === 'public' ? 'chat_room_id' : 'private_chat_id'}
      `)
      .eq(type === 'public' ? 'chat_room_id' : 'private_chat_id', id)
      .order('created_at', { ascending: true });

    const { data, error } = await query;

    if (error) {
      showError("Failed to load messages: " + error.message);
      console.error("Error fetching messages:", error);
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    // Extract unique sender IDs to batch profile requests
    const uniqueSenderIds = [...new Set(data.map(msg => msg.sender_id))];
    
    // Fetch profiles in batch to reduce database queries
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, first_name, last_name')
      .in('id', uniqueSenderIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Create a profile cache for quick lookup
    const newProfileCache: Record<string, any> = {};
    if (profilesData) {
      profilesData.forEach(profile => {
        newProfileCache[profile.id] = profile;
      });
      
      // Update the global profile cache
      setProfileCache(prev => ({ ...prev, ...newProfileCache }));
    }

    // Process messages with cached profiles
    const processedData = data.map(msg => ({
      ...msg,
      profile: newProfileCache[msg.sender_id] || null
    }));

    setMessages(processedData as Message[]);
    setLoadingMessages(false);
  }, [supabase]);

  const sendMessage = useCallback(async (content: string) => {
    if (!chatId || !currentUserId || !chatType) {
      showError("Cannot send message: chat context is not fully loaded.");
      return;
    }

    const table = chatType === 'public' ? 'messages' : 'private_messages';
    const chat_id_column = chatType === 'public' ? 'chat_room_id' : 'private_chat_id';

    // Get current user profile from session to avoid fetching
    const userProfile = {
      username: session?.user?.user_metadata?.username || 'You',
      avatar_url: session?.user?.user_metadata?.avatar_url,
      first_name: session?.user?.user_metadata?.first_name,
      last_name: session?.user?.user_metadata?.last_name,
    };

    // Optimistic update object
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      [chat_id_column]: chatId,
      profile: userProfile,
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
      // Only fetch messages if we don't already have them for this chat
      if (messages.length === 0 || messages[0]?.[chatType === 'public' ? 'chat_room_id' : 'private_chat_id'] !== chatId) {
        fetchMessages(chatId, chatType);
      }

      const handleNewMessage = async (payload: { new: any }) => {
        const newMessage = payload.new as Message;

        // Check if profile is already in cache before fetching
        let profile = profileCache[newMessage.sender_id];
        
        if (!profile && newMessage.sender_id) {
          // Fetch sender profile if not in cache
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username, avatar_url, first_name, last_name')
            .eq('id', newMessage.sender_id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile for message:', profileError);
          } else {
            profile = profileData;
            // Update cache
            setProfileCache(prev => ({ ...prev, [newMessage.sender_id]: profileData }));
          }
        }

        const messageWithProfile: Message = {
          ...newMessage,
          profile: profile || null,
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
  }, [chatId, chatType, fetchMessages, supabase, currentUserId, profileCache, messages]);

  return { messages, loadingMessages, sendMessage };
};