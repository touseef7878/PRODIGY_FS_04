"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSession } from '@/components/SessionContextProvider';
import { showError } from '@/utils/toast';
import CreateChatRoomDialog from './CreateChatRoomDialog';
import StartPrivateChatDialog from './StartPrivateChatDialog';
import ProfileSettingsDialog from './ProfileSettingsDialog';
import { Users, MessageSquare } from 'lucide-react';

interface ChatRoom {
  id: string;
  name: string;
  creator_id: string;
  last_message_content?: string;
  unread_count?: number;
}

interface SupabaseProfile {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

// Define the exact type for the data returned by the private chats select query

interface PrivateChat {
  id: string;
  user1_id: string;
  user2_id: string;
  other_user_profile: SupabaseProfile;
  last_message_content?: string;
  unread_count?: number;
}

interface SidebarProps {
  selectedChatId?: string;
  selectedChatType?: 'public' | 'private';
  onSelectChat: (chatId: string, chatName: string, chatType: 'public' | 'private') => void;
}

// Debounce function to avoid excessive API calls
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Sidebar: React.FC<SidebarProps> = ({ selectedChatId, selectedChatType, onSelectChat }) => {
  const { supabase, session } = useSession();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = session?.user?.id;

  const fetchChats = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch public chat rooms
    try {
      const { data: publicRooms, error: publicError } = await supabase
        .from('chat_rooms')
        .select(`id, name, creator_id`)
        .order('created_at', { ascending: false });

      let rooms: ChatRoom[] = [];
      if (publicError) {
        showError("Failed to load public chat rooms: " + publicError.message);
        console.error("Error fetching public chat rooms:", publicError);
      } else if (publicRooms) {
        // Fetch unread_count for each room using the RPC
        rooms = await Promise.all(
          publicRooms.map(async (room: any) => {
            let unread_count = 0;
            try {
              const { data: unreadData, error: unreadError } = await supabase.rpc('get_unread_count', {
                p_chat_room_id: room.id,
                p_user_id: currentUserId
              });
              if (!unreadError && typeof unreadData === 'number') {
                unread_count = unreadData;
              }
            } catch (e) {
              // ignore
            }
            return {
              id: room.id,
              name: room.name,
              creator_id: room.creator_id,
              last_message_content: '', // Will be populated when needed
              unread_count,
            };
          })
        );
        setChatRooms(rooms);
      }
    } catch (err) {
      showError("Unexpected error loading public chat rooms.");
      console.error(err);
    }

    // Fetch private chats
    try {
      const { data: privateConvos, error: privateError } = await supabase
        .from('private_chats')
        .select(`id, user1_id, user2_id, user1:user1_id(id, username, first_name, last_name, avatar_url), user2:user2_id(id, username, first_name, last_name, avatar_url)`)
        .order('id', { ascending: false });

      let processedPrivateChats: (PrivateChat | null)[] = [];
      if (privateError) {
        showError("Failed to load private chats: " + privateError.message);
        console.error("Error fetching private chats:", privateError);
      } else if (privateConvos) {
        processedPrivateChats = await Promise.all(
          privateConvos.map(async (convo: any) => {
            const user1Profile = convo.user1?.[0];
            const user2Profile = convo.user2?.[0];
            if (!user1Profile || !user2Profile) {
              console.warn("Missing profile data for private chat:", convo.id);
              return null;
            }
            const otherUser = user1Profile.id === currentUserId ? user2Profile : user1Profile;
            let unread_count = 0;
            try {
              const { data: unreadData, error: unreadError } = await supabase.rpc('get_private_unread_count', {
                p_private_chat_id: convo.id,
                p_user_id: currentUserId
              });
              if (!unreadError && typeof unreadData === 'number') {
                unread_count = unreadData;
              }
            } catch (e) {
              // ignore
            }
            return {
              id: convo.id,
              user1_id: convo.user1_id,
              user2_id: convo.user2_id,
              other_user_profile: otherUser,
              last_message_content: '',
              unread_count,
            };
          })
        );
        setPrivateChats(processedPrivateChats.filter(Boolean) as PrivateChat[]);
      }
    } catch (err) {
      showError("Unexpected error loading private chats.");
      console.error(err);
    }

    setLoading(false);
  }, [currentUserId, supabase]);

  // Debounced version of fetchChats to reduce API calls on multiple events
  const debouncedFetchChats = useMemo(() => debounce(fetchChats, 500), [fetchChats]);

  useEffect(() => {
    if (session) {
      // Initial fetch
      fetchChats();

      // Realtime subscription - simplified to reduce unnecessary updates
      const allChannels = [
        supabase
          .channel('public-changes')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_rooms' }, () => {
            // Only update if we're interested in this change
            if (Math.random() > 0.7) { // Introduce a small delay to reduce frequency 
              setTimeout(() => debouncedFetchChats(), 100); // Debounced call
            }
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_chats' }, () => {
            if (Math.random() > 0.7) {
              setTimeout(() => debouncedFetchChats(), 100);
            }
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
            // For messages, we might only want to update if it's in a chat we're currently watching
            // This is a simplified approach - in a more complex app, we'd be more selective
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_messages' }, () => {
            // Same as above
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'user_chat_read_status', filter: `user_id=eq.${session.user.id}` }, () => {
            if (Math.random() > 0.7) {
              setTimeout(() => debouncedFetchChats(), 100);
            }
          })
          .subscribe()
      ];

      return () => {
        allChannels.forEach(channel => supabase.removeChannel(channel));
      };
    }
  }, [session, debouncedFetchChats, supabase]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-card p-4">
        <p className="text-muted-foreground">Loading chats...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full max-h-screen flex-col bg-sidebar-background text-foreground">
      {/* Mobile Navigation Bar */}
      <div className="p-4 border-b border-sidebar-border md:hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chats</h2>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full hover:bg-accent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-accent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-accent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.73v-.52a2 2 0 0 1 1-1.74l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between p-4 border-b border-sidebar-border">
        <h2 className="text-xl font-semibold">Chats</h2>
        <div className="flex items-center space-x-2">
          <CreateChatRoomDialog onChatRoomCreated={fetchChats} />
          <StartPrivateChatDialog onChatSelected={(id, name, type) => {
            onSelectChat(id, name, type);
            fetchChats();
          }} />
          <ProfileSettingsDialog onProfileUpdated={fetchChats} />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {chatRooms.length === 0 && privateChats.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">No chats found. Create a public room or start a private chat!</p>
          ) : (
            <>
              {/* Public Chat Rooms */}
              {chatRooms.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground px-3 py-2">Public Rooms</h3>
                  {chatRooms.map((chat) => (
                    <div
                      key={`public-${chat.id}`}
                      className={cn(
                        "flex items-center gap-3 rounded-xl p-3 text-left text-sm transition-all hover:bg-accent cursor-pointer shadow-sm mb-2 bg-card backdrop-blur-sm border border-sidebar-border/50",
                        selectedChatId === chat.id && selectedChatType === 'public' && "ring-2 ring-accent-primary/50 bg-accent",
                      )}
                      onClick={() => onSelectChat(chat.id, chat.name, 'public')}
                    >
                      <div className="relative">
                        <Avatar className="h-11 w-11 ring-2 ring-sidebar-border/50">
                          <AvatarImage 
                            src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${chat.name}`} 
                            alt={chat.name} 
                          />
                          <AvatarFallback className="bg-accent/30 text-accent-foreground">
                            <Users className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                          {/* Unread Badge for Receivers Only */}
                          {chat.unread_count && chat.unread_count > 0 && chat.creator_id !== currentUserId && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] flex items-center justify-center">
                              {chat.unread_count}
                            </span>
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{chat.name}</p>
                        </div>
                        <p className={chat.unread_count && chat.unread_count > 0 && chat.creator_id !== currentUserId ? "font-bold text-black truncate" : "text-xs text-muted-foreground truncate"}>
                          {chat.last_message_content?.substring(0, 30)}
                          {chat.last_message_content && chat.last_message_content.length > 30 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Private Chats */}
              {privateChats.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground px-3 py-2">Private Chats</h3>
                  {privateChats.map((chat) => (
                    <div
                      key={`private-${chat.id}`}
                      className={cn(
                        "flex items-center gap-3 rounded-xl p-3 text-left text-sm transition-all hover:bg-accent cursor-pointer shadow-sm mb-2 bg-card backdrop-blur-sm border border-sidebar-border/50",
                        selectedChatId === chat.id && selectedChatType === 'private' && "ring-2 ring-accent-primary/50 bg-accent",
                      )}
                      onClick={() => onSelectChat(chat.id, chat.other_user_profile.username, 'private')}
                    >
                      <div className="relative">
                        <Avatar className="h-11 w-11 ring-2 ring-sidebar-border/50">
                          <AvatarImage 
                            src={chat.other_user_profile.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${chat.other_user_profile.username}`} 
                            alt={chat.other_user_profile.username} 
                          />
                          <AvatarFallback className="bg-accent/30 text-accent-foreground">
                            <MessageSquare className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                          {/* Unread Badge for Receivers Only */}
                          {chat.unread_count && chat.unread_count > 0 && chat.other_user_profile.id !== currentUserId && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] flex items-center justify-center">
                              {chat.unread_count}
                            </span>
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{chat.other_user_profile.first_name || chat.other_user_profile.username}</p>
                        </div>
                        <p className={chat.unread_count && chat.unread_count > 0 && chat.other_user_profile.id !== currentUserId ? "font-bold text-black truncate" : "text-xs text-muted-foreground truncate"}>
                          {chat.last_message_content?.substring(0, 30)}
                          {chat.last_message_content && chat.last_message_content.length > 30 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;