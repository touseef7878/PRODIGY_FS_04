"use client";

import React, { useState, useCallback, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatLayout from '@/components/layout/ChatLayout';
import { MadeWithProchat } from '@/components/MadeWithProchat';
import MessageInput from '@/components/MessageInput';
import MessageList from '@/components/MessageList';
import { showError } from '@/utils/toast';
import { useSession } from '@/components/SessionContextProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChatMessages } from '@/hooks/useChatMessages';

// Dynamically import Sidebar to reduce initial bundle size
const Sidebar = React.lazy(() => import('@/components/Sidebar'));

interface PrivateChatNotificationQueryResult {
  user1: Array<{ id: string; username: string; first_name?: string }> | null; // Changed to array
  user2: Array<{ id: string; username: string; first_name?: string }> | null; // Changed to array
}

const GuestChatPage: React.FC = memo(() => {
  const { supabase, session, isGuest, signOut } = useSession();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(undefined);
  const [selectedChatName, setSelectedChatName] = useState<string | undefined>(undefined);
  const [selectedChatType, setSelectedChatType] = useState<'public' | 'private' | undefined>(undefined);

  const currentUserId = session?.user?.id;
  const isMobile = useIsMobile();

  // Use a stable reference for the key to prevent unnecessary re-renders
  const chatKey = selectedChatId ? `${selectedChatId}-${selectedChatType}` : 'no-chat';

  const { messages, loadingMessages } = useChatMessages(selectedChatId, selectedChatType);

  const handleSelectChat = (chatId: string, chatName: string, chatType: 'public' | 'private') => {
    setSelectedChatId(chatId);
    setSelectedChatName(chatName);
    setSelectedChatType(chatType);
  };

  const handleBackToSidebar = useCallback(() => {
    setSelectedChatId(undefined);
    setSelectedChatName(undefined);
    setSelectedChatType(undefined);
  }, []);

  // Show a message to guest users about read-only mode
  const renderGuestMessage = () => {
    if (isGuest) {
      return (
        <div className="p-4 bg-blue-50 border-b border-blue-200 text-blue-800 text-sm">
          You are viewing as a guest. You can view chats but cannot send messages.
        </div>
      );
    }
    return null;
  };

  // For guest users, we don't allow sending messages, so we create a no-op function
  const handleSendMessage = useCallback(async (content: string) => {
    // Do nothing for guests
  }, []);

  // Handle browser close/unload for guests
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isGuest) {
        // Clear guest session so they return to welcome page
        localStorage.removeItem('guestSession');
      }
    };

    const handleUnload = () => {
      if (isGuest) {
        // Clear guest session so they return to welcome page
        localStorage.removeItem('guestSession');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    // Also set up a navigation guard to clear guest session when leaving
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      
      // Only clear if this is a guest session when leaving
      if (isGuest) {
        localStorage.removeItem('guestSession');
      }
    };
  }, [isGuest]);

  // Handle back navigation for guests
  const handleGuestBack = useCallback(() => {
    // Clear guest session so they return to welcome page
    localStorage.removeItem('guestSession');
    navigate('/');
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <React.Suspense fallback={<div className="h-screen flex items-center justify-center bg-background">Loading chat...</div>}>
        <ChatLayout
          sidebar={
            <Sidebar
              selectedChatId={selectedChatId}
              selectedChatType={selectedChatType}
              onSelectChat={handleSelectChat}
            />
          }
          isChatSelected={!!(selectedChatId && selectedChatType)}
          onBackToSidebar={isMobile ? handleBackToSidebar : handleGuestBack}
        >
          <div className="flex h-full flex-col">
            {renderGuestMessage()}
            <div className="flex items-center h-16 border-b border-border px-4 bg-card/70 backdrop-blur-sm">
              {selectedChatName ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full ring-2 ring-border overflow-hidden">
                      <img 
                        src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${selectedChatName}`} 
                        alt={selectedChatName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-background"></div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold leading-none">
                      {selectedChatType === 'public' ? `${selectedChatName}` : `${selectedChatName}`}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-none">
                      {selectedChatType === 'public' ? 'Public room' : 'Online'}
                    </p>
                  </div>
                </div>
              ) : (
                <h2 className="text-xl font-semibold text-muted-foreground">Select a chat</h2>
              )}
            </div>
            {selectedChatId && selectedChatType ? (
              <>
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <p>Loading messages...</p>
                  </div>
                ) : (
                  <MessageList key={chatKey} messages={messages} currentUserId={currentUserId} />
                )}
                <MessageInput onSendMessage={handleSendMessage} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
                <p className="text-center">Start by selecting a chat from the sidebar or create a new one.</p>
              </div>
            )}
            {!isMobile && (
              <div className="footer">
                Made with ❤️ by Touseef
              </div>
            )}
          </div>
        </ChatLayout>
      </React.Suspense>
    </div>
  );
});

GuestChatPage.displayName = 'GuestChatPage';

export default GuestChatPage;