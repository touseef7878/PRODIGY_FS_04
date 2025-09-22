"use client";

import React from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import Sidebar from '@/components/Sidebar';
import { MadeWithDyad } from '@/components/made-with-dyad';
import MessageInput from '@/components/MessageInput';
import MessageList from '@/components/MessageList';
import { showSuccess } from '@/utils/toast'; // Import showSuccess

interface Message {
  id: string;
  sender: string;
  text: string;
  avatarUrl?: string;
  isCurrentUser: boolean;
}

const ChatPage: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = React.useState<string | undefined>(undefined);
  const [messages, setMessages] = React.useState<Message[]>([]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    showSuccess(`Selected chat: ${chatId}`); // Add this line to show a toast
    // Simulate loading messages for the selected chat
    setMessages([
      { id: 'm1', sender: 'Alice', text: `Hello from ${chatId}!`, avatarUrl: 'https://github.com/shadcn.png', isCurrentUser: false },
      { id: 'm2', sender: 'You', text: `Hi ${chatId}, how are you?`, avatarUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=You', isCurrentUser: true },
    ]);
    console.log(`Selected chat: ${chatId}`);
  };

  const handleSendMessage = (text: string) => {
    if (selectedChatId) {
      const newMessage: Message = {
        id: `m${messages.length + 1}`,
        sender: 'You',
        text,
        avatarUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=You',
        isCurrentUser: true,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      // Simulate a response from the other user
      setTimeout(() => {
        const botResponse: Message = {
          id: `m${messages.length + 2}`,
          sender: selectedChatId,
          text: `Thanks for your message! This is an automated response from ${selectedChatId}.`,
          avatarUrl: 'https://github.com/shadcn.png', // Using a generic avatar for the other user
          isCurrentUser: false,
        };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      }, 1000);
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
          {selectedChatId ? (
            <h2 className="text-xl font-semibold">Chat with {selectedChatId}</h2>
          ) : (
            <h2 className="text-xl font-semibold text-muted-foreground">Select a chat</h2>
          )}
        </div>
        {selectedChatId ? (
          <>
            <MessageList messages={messages} />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Start by selecting a chat from the sidebar.</p>
          </div>
        )}
        <MadeWithDyad />
      </div>
    </ChatLayout>
  );
};

export default ChatPage;