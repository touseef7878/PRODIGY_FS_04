"use client";

import React, { useEffect, useState } from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import Sidebar from '@/components/Sidebar';
import { MadeWithDyad } from '@/components/made-with-dyad';
import MessageInput from '@/components/MessageInput';
import MessageList from '@/components/MessageList';
import { showError } from '@/utils/toast';
import { useSession } from '@/components/SessionContextProvider';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles: Array<{
    username: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
  }> | null;
}

const ChatPage: React.FC = () => {
  const { supabase, session } = useSession();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(undefined);
  const [selectedChatName, setSelectedChatName] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const currentUserId = session?.user?.id;

  const fetchMessages = async (chatId: string) => {
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        created_at,
        sender_id,
        content,
        profiles (
          username,
          avatar_url,
          first_name,
          last_name
        )
      `)
      .eq('chat_room_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      showError("Failed to load messages: " + error.message);
      console.error("Error fetching messages:", error);
      setMessages([]);
    } else {
      setMessages(data as Message[]);
    }
    setLoadingMessages(false);
  };

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);

      // Set up real-time subscription for messages in the selected chat room
      const channel = supabase
        .channel(`chat_room_${selectedChatId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${selectedChatId}`
        }, async (payload) => {
          const newMessageId = (payload.new as Message).id;
          const senderId = (payload.new as Message).sender_id;
          const content = (payload.new as Message).content;
          const createdAt = (payload.new as Message).created_at;

          // Fetch sender profile separately to ensure it's available for real-time updates
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username, avatar_url, first_name, last_name')
            .eq('id', senderId)
            .single();

          if (profileError) {
            console.error("Error fetching sender profile for real-time update:", profileError);
            // Add message without profile if profile fetch fails
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: newMessageId,
                sender_id: senderId,
                content: content,
                created_at: createdAt,
                profiles: null,
              } as Message,
            ]);
          } else {
            // Construct the full message object with the fetched profile
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: newMessageId,
                sender_id: senderId,
                content: content,
                created_at: createdAt,
                profiles: profileData ? [profileData] : null, // Ensure it's an array or null
              } as Message,
            ]);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedChatId, supabase]);

  const handleSelectChat = (chatId: string, chatName: string) => {
    setSelectedChatId(chatId);
    setSelectedChatName(chatName);
    setMessages([]); // Clear messages when switching chats
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId || !currentUserId) {
      showError("Please select a chat and ensure you are logged in to send messages.");
      return;
    }

    const { error } = await supabase.from('messages').insert({
      chat_room_id: selectedChatId,
      sender_id: currentUserId,
      content: content,
    });

    if (error) {
      showError("Failed to send message: " + error.message);
      console.error("Error sending message:", error);
    }
  };

  return (
    <ChatLayout
      sidebar={
        <Sidebar selectedChatId={selectedChatId} onSelectChat={handleSelectChat} />
      }
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center h-16 border-b px-4">
          {selectedChatName ? (
            <h2 className="text-xl font-semibold">Chat with {selectedChatName}</h2>
          ) : (
            <h2 className="text-xl font-semibold text-muted-foreground">Select a chat</h2>
          )}
        </div>
        {selectedChatId ? (
          <>
            {loadingMessages ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Loading messages...</p>
              </div>
            ) : (
              <MessageList messages={messages} currentUserId={currentUserId} />
            )}
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Start by selecting a chat from the sidebar or create a new one.</p>
          </div>
        )}
        <MadeWithDyad />
      </div>
    </ChatLayout>
  );
};

export default ChatPage;