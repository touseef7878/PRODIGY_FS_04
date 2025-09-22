import React from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import Sidebar from '@/components/Sidebar';
import { MadeWithDyad } from '@/components/made-with-dyad';

const ChatPage: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = React.useState<string | undefined>(undefined);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    // In a real app, you would load messages for this chat
    console.log(`Selected chat: ${chatId}`);
  };

  return (
    <ChatLayout
      sidebar={
        <Sidebar selectedChatId={selectedChatId} onSelectChat={handleSelectChat} />
      }
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-center h-16 border-b px-4">
          {selectedChatId ? (
            <h2 className="text-xl font-semibold">Chat with {selectedChatId}</h2>
          ) : (
            <h2 className="text-xl font-semibold text-muted-foreground">Select a chat</h2>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          {selectedChatId ? (
            <p>Messages for chat {selectedChatId} will appear here.</p>
          ) : (
            <p>Start by selecting a chat from the sidebar.</p>
          )}
        </div>
        <div className="p-4 border-t">
          {/* Message input will go here */}
          <p className="text-sm text-muted-foreground">Message input area</p>
        </div>
        <MadeWithDyad />
      </div>
    </ChatLayout>
  );
};

export default ChatPage;