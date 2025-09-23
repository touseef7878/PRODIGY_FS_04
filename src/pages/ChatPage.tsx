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
  const [selectedChatType, setSelectedChatType] = useState<'public' | 'private' | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const currentUserId = session?.user?.id;

  const fetchMessages = async (chatId: string, chatType: 'public' | 'private') => {
    setLoadingMessages(true);
    let data, error;

    if (chatType === 'public') {
      ({ data, error } = await supabase
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
        .order('created_at', { ascending: true }));
    } else { // chatType === 'private'
      ({ data, error } = await supabase
        .from('private_messages')
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
        .eq('private_chat_id', chatId)
        .order('created_at', { ascending: true }));
    }

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
    console.log(`[ChatPage] Setting up subscription for chat: ${selectedChatId}, type: ${selectedChatType}`);
    if (selectedChatId && selectedChatType) {
      fetchMessages(selectedChatId, selectedChatType);

      let channel;
      if (selectedChatType === 'public') {
        channel = supabase
          .channel(`chat_room_${selectedChatId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_room_id=eq.${selectedChatId}`
          }, async (payload) => {
            console.log("[ChatPage] Public chat real-time message received:", payload.new);
            const newMessageId = (payload.new as Message).id;
            const senderId = (payload.new as Message).sender_id;
            const content = (payload.new as Message).content;
            const createdAt = (payload.new as Message).created_at;

            const { data: profileDataArray, error: profileError } = await supabase
              .from('profiles')
              .select('username, avatar_url, first_name, last_name')
              .eq('id', senderId)
              .limit(1); // Use limit(1) for robustness

            const profileData = profileDataArray && profileDataArray.length > 0 ? profileDataArray[0] : null;

            if (profileError) {
              console.error("[ChatPage] Error fetching sender profile for real-time update:", profileError);
              setMessages((prevMessages) => {
                const newMsg = { id: newMessageId, sender_id: senderId, content: content, created_at: createdAt, profiles: null } as Message;
                console.log("[ChatPage] Adding message without profile:", newMsg);
                return [...prevMessages, newMsg];
              });
            } else {
              setMessages((prevMessages) => {
                const newMsg = { id: newMessageId, sender_id: senderId, content: content, created_at: createdAt, profiles: profileData ? [profileData] : null } as Message;
                console.log("[ChatPage] Adding message with profile:", newMsg);
                return [...prevMessages, newMsg];
              });
            }
          })
          .subscribe();
      } else { // selectedChatType === 'private'
        channel = supabase
          .channel(`private_chat_${selectedChatId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'private_messages',
            filter: `private_chat_id=eq.${selectedChatId}`
          }, async (payload) => {
            console.log("[ChatPage] Private chat real-time message received:", payload.new);
            const newMessageId = (payload.new as Message).id;
            const senderId = (payload.new as Message).sender_id;
            const content = (payload.new as Message).content;
            const createdAt = (payload.new as Message).created_at;

            const { data: profileDataArray, error: profileError } = await supabase
              .from('profiles')
              .select('username, avatar_url, first_name, last_name')
              .eq('id', senderId)
              .limit(1); // Use limit(1) for robustness

            const profileData = profileDataArray && profileDataArray.length > 0 ? profileDataArray[0] : null;

            if (profileError) {
              console.error("[ChatPage] Error fetching sender profile for real-time update:", profileError);
              setMessages((prevMessages) => {
                const newMsg = { id: newMessageId, sender_id: senderId, content: content, created_at: createdAt, profiles: null } as Message;
                console.log("[ChatPage] Adding message without profile:", newMsg);
                return [...prevMessages, newMsg];
              });
            } else {
              setMessages((prevMessages) => {
                const newMsg = { id: newMessageId, sender_id: senderId, content: content, created_at: createdAt, profiles: profileData ? [profileData] : null } as Message;
                console.log("[ChatPage] Adding message with profile:", newMsg);
                return [...prevMessages, newMsg];
              });
            }
          })
          .subscribe();
      }

      return () => {
        console.log(`[ChatPage] Tearing down subscription for chat: ${selectedChatId}, type: ${selectedChatType}`);
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    } else {
      console.log("[ChatPage] No chat selected, skipping subscription setup.");
    }
  }, [selectedChatId, selectedChatType, supabase]);

  const handleSelectChat = (chatId: string, chatName: string, chatType: 'public' | 'private') => {
    setSelectedChatId(chatId);
    setSelectedChatName(chatName);
    setSelectedChatType(chatType);
    setMessages([]); // Clear messages when switching chats
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId || !currentUserId || !selectedChatType) {
      showError("Please select a chat and ensure you are logged in to send messages.");
      return;
    }

    let error;
    if (selectedChatType === 'public') {
      ({ error } = await supabase.from('messages').insert({
        chat_room_id: selectedChatId,
        sender_id: currentUserId,
        content: content,
      }));
    } else { // selectedChatType === 'private'
      ({ error } = await supabase.from('private_messages').insert({
        private_chat_id: selectedChatId,
        sender_id: currentUserId,
        content: content,
      }));
    }

    if (error) {
      showError("Failed to send message: " + error.message);
      console.error("Error sending message:", error);
    }
  };

  return (
    <ChatLayout
      sidebar={
        <Sidebar
          selectedChatId={selectedChatId}
          selectedChatType={selectedChatType}
          onSelectChat={handleSelectChat}
        />
      }
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center h-16 border-b px-4">
          {selectedChatName ? (
            <h2 className="text-xl font-semibold">
              {selectedChatType === 'public' ? `Chat Room: ${selectedChatName}` : `Private Chat with ${selectedChatName}`}
            </h2>
          ) : (
            <h2 className="text-xl font-semibold text-muted-foreground">Select a chat</h2>
          )}
        </div>
        {selectedChatId && selectedChatType ? (
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