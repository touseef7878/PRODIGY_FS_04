"use client";

import React, { useEffect, useState, useCallback } from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import Sidebar from '@/components/Sidebar';
import { MadeWithDyad } from '@/components/made-with-dyad';
import MessageInput from '@/components/MessageInput';
import MessageList from '@/components/MessageList';
import { showError, showInfo } from '@/utils/toast';
import { useSession } from '@/components/SessionContextProvider';

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

const ChatPage: React.FC = () => {
  const { supabase, session } = useSession();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(undefined);
  const [selectedChatName, setSelectedChatName] = useState<string | undefined>(undefined);
  const [selectedChatType, setSelectedChatType] = useState<'public' | 'private' | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0); // Key to force sidebar re-render

  const currentUserId = session?.user?.id;

  const markChatAsRead = useCallback(async (chatId: string, chatType: 'public' | 'private') => {
    if (!currentUserId) return;

    const now = new Date().toISOString();
    const upsertData = {
      user_id: currentUserId,
      last_read_at: now,
      // 'created_at' is intentionally omitted here. It should be set by the database's default
      // on initial insert and not updated on subsequent upserts.
    };

    let query;
    if (chatType === 'public') {
      query = supabase
        .from('user_chat_read_status')
        .upsert({ ...upsertData, chat_room_id: chatId, private_chat_id: null }, { onConflict: 'user_id,chat_room_id' }); // Corrected onConflict to use column names
    } else { // private
      query = supabase
        .from('user_chat_read_status')
        .upsert({ ...upsertData, private_chat_id: chatId, chat_room_id: null }, { onConflict: 'user_id,private_chat_id' }); // Corrected onConflict to use column names
    }

    const { error } = await query;

    if (error) {
      console.error("Error marking chat as read:", error);
      showError("Failed to mark chat as read: " + error.message); // Show error toast
    } else {
      console.log(`[ChatPage] Chat ${chatId} marked as read for user ${currentUserId}`);
      setSidebarRefreshKey(prev => prev + 1); // Trigger sidebar refresh
    }
  }, [currentUserId, supabase]);

  const handleSelectChat = useCallback((chatId: string, chatName: string, chatType: 'public' | 'private') => {
    setSelectedChatId(chatId);
    setSelectedChatName(chatName);
    setSelectedChatType(chatType);
    setMessages([]); // Clear messages when switching chats
    console.log(`[ChatPage] Chat selected: ID=${chatId}, Name=${chatName}, Type=${chatType}. Messages cleared.`);
    markChatAsRead(chatId, chatType); // Mark as read when selected
  }, [markChatAsRead]);

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
          chat_room_id,
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
          private_chat_id,
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
      console.log(`[ChatPage] Fetched initial messages for ${chatType} chat ${chatId}:`, data);
    }
    setLoadingMessages(false);
  };

  useEffect(() => {
    console.log(`[ChatPage] Effect running. Selected Chat ID: ${selectedChatId}, Type: ${selectedChatType}`);
    if (selectedChatId && selectedChatType) {
      fetchMessages(selectedChatId, selectedChatType);

      const handleNewMessage = async (payload: any, type: 'public' | 'private') => {
        const incomingMessage = payload.new as Message;
        const incomingChatId = type === 'public' ? incomingMessage.chat_room_id : incomingMessage.private_chat_id;

        // Fetch sender profile
        const { data: profileDataArray } = await supabase
          .from('profiles')
          .select('username, first_name, last_name')
          .eq('id', incomingMessage.sender_id)
          .limit(1);

        const senderProfile = profileDataArray && profileDataArray.length > 0 ? profileDataArray[0] : null;
        const senderName = senderProfile?.first_name || senderProfile?.username || 'Unknown User';

        // If the message is for the currently selected chat, update messages state
        if (selectedChatId === incomingChatId && selectedChatType === type) {
          setMessages((prevMessages) => {
            const newMsg: Message = {
              ...incomingMessage,
              profiles: senderProfile ? [senderProfile] : [],
            };
            console.log("[ChatPage] New message object created for state update (current chat):", newMsg);
            const updatedMessages = [...prevMessages, newMsg];
            console.log("[ChatPage] Messages state after adding (current chat):", updatedMessages);
            return updatedMessages;
          });
          // Mark as read since the user is currently viewing this chat
          markChatAsRead(incomingChatId, type);
        } else {
          // Message is for a different chat, show a notification
          let chatNameForNotification = 'a chat';
          if (type === 'public') {
            const { data: chatRoom } = await supabase
              .from('chat_rooms')
              .select('name')
              .eq('id', incomingChatId)
              .single();
            if (chatRoom) {
              chatNameForNotification = chatRoom.name;
            }
          } else { // private chat
            const { data: privateChat } = await supabase
              .from('private_chats')
              .select(`
                user1:user1_id(id, username, first_name),
                user2:user2_id(id, username, first_name)
              `)
              .eq('id', incomingChatId)
              .single();

            if (privateChat) {
                const otherUser = privateChat.user1?.[0]?.id === currentUserId ? privateChat.user2?.[0] : privateChat.user1?.[0];
                chatNameForNotification = otherUser?.first_name || otherUser?.username || 'a private chat';
            }
          }
          showInfo(
            `New message from ${senderName} in ${chatNameForNotification}`,
            (incomingMessage.content ?? '').substring(0, 100) + ((incomingMessage.content?.length ?? 0) > 100 ? '...' : ''),
            // Ensure incomingChatId is not undefined before passing to handleSelectChat
            incomingChatId ? () => handleSelectChat(incomingChatId, chatNameForNotification, type) : undefined
          );
          setSidebarRefreshKey(prev => prev + 1); // Trigger sidebar refresh for unread count
        }
      };

      let channel;
      if (selectedChatType === 'public') {
        console.log(`[ChatPage] Subscribing to public chat_room_${selectedChatId}`);
        channel = supabase
          .channel(`chat_room_${selectedChatId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_room_id=eq.${selectedChatId}`
          }, (payload) => handleNewMessage(payload, 'public'))
          .subscribe();
      } else { // selectedChatType === 'private'
        console.log(`[ChatPage] Subscribing to private_chat_${selectedChatId}`);
        channel = supabase
          .channel(`private_chat_${selectedChatId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'private_messages',
            filter: `private_chat_id=eq.${selectedChatId}`
          }, (payload) => handleNewMessage(payload, 'private'))
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
  }, [selectedChatId, selectedChatType, supabase, currentUserId, handleSelectChat, markChatAsRead]);

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId || !currentUserId || !selectedChatType) {
      showError("Please select a chat and ensure you are logged in to send messages.");
      return;
    }

    console.log(`[ChatPage] Sending message: "${content}" to ${selectedChatType} chat ${selectedChatId}`);

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
    } else {
      console.log("[ChatPage] Message sent successfully (DB insert acknowledged).");
      markChatAsRead(selectedChatId, selectedChatType); // Mark as read after sending
    }
  };

  // The _handleChatDataCleared function is no longer needed as Sidebar manages its own refreshes
  // and ChatPage uses sidebarRefreshKey for full re-mounts if necessary.

  console.log("[ChatPage] Rendered. Current messages state:", messages);

  return (
    <ChatLayout
      sidebar={
        <Sidebar
          key={sidebarRefreshKey} // Use key to force re-render and re-fetch chats
          selectedChatId={selectedChatId}
          selectedChatType={selectedChatType}
          onSelectChat={handleSelectChat}
          // Removed onChatsUpdated prop as it's no longer expected by Sidebar
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
              <MessageList key={selectedChatId} messages={messages} currentUserId={currentUserId} />
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