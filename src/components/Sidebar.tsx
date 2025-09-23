"use client";

import React, { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useSession } from '@/components/SessionContextProvider';
import { showError } from '@/utils/toast';
import CreateChatRoomDialog from './CreateChatRoomDialog';
import StartPrivateChatDialog from './StartPrivateChatDialog';
import ProfileSettingsDialog from './ProfileSettingsDialog'; // Import the new component
import { Users, MessageSquare } from 'lucide-react';

interface ChatRoom {
  id: string;
  name: string;
  creator_id: string;
  last_message_content?: string;
  unread_count?: number;
}

// Define a type for the profile data returned by the join
interface SupabaseProfile {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

// Define a type for the raw private chat data from Supabase
interface RawPrivateChatData {
  id: string;
  user1_id: string;
  user2_id: string;
  private_messages: Array<{ content: string; created_at: string }> | null;
  user1: SupabaseProfile[] | null;
  user2: SupabaseProfile[] | null;
}

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

const Sidebar: React.FC<SidebarProps> = ({ selectedChatId, selectedChatType, onSelectChat }) => {
  const { supabase, session } = useSession();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = session?.user?.id;

  const fetchChats = async () => {
    setLoading(true);
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    // Fetch public chat rooms
    const { data: publicRooms, error: publicError } = await supabase
      .from('chat_rooms')
      .select('id, name, creator_id, messages(content, created_at)')
      .order('created_at', { ascending: false });

    if (publicError) {
      showError("Failed to load public chat rooms: " + publicError.message);
      console.error("Error fetching public chat rooms:", publicError);
    } else {
      const roomsWithLastMessage = publicRooms.map(room => {
        const lastMessage = room.messages && room.messages.length > 0
          ? room.messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].content
          : 'No messages yet.';
        return {
          id: room.id,
          name: room.name,
          creator_id: room.creator_id,
          last_message_content: lastMessage,
        };
      });
      setChatRooms(roomsWithLastMessage);
    }

    // Fetch private chats
    const { data: privateConvos, error: privateError } = await supabase
      .from('private_chats')
      .select(`
        id,
        user1_id,
        user2_id,
        private_messages(content, created_at),
        user1:user1_id(id, username, first_name, last_name, avatar_url),
        user2:user2_id(id, username, first_name, last_name, avatar_url)
      `)
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false });

    if (privateError) {
      showError("Failed to load private chats: " + privateError.message);
      console.error("Error fetching private chats:", privateError);
    } else {
      const typedPrivateConvos = privateConvos as RawPrivateChatData[];

      const convosWithOtherUser = typedPrivateConvos.map(convo => {
        const user1Profile = convo.user1?.[0];
        const user2Profile = convo.user2?.[0];

        if (!user1Profile || !user2Profile) {
          console.warn("Missing profile data for private chat:", convo.id);
          return null;
        }

        const otherUser = user1Profile.id === currentUserId ? user2Profile : user1Profile;
        const lastMessage = convo.private_messages && convo.private_messages.length > 0
          ? convo.private_messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].content
          : 'No messages yet.';
        return {
          id: convo.id,
          user1_id: convo.user1_id,
          user2_id: convo.user2_id,
          other_user_profile: otherUser,
          last_message_content: lastMessage,
        };
      }).filter(Boolean) as PrivateChat[];
      setPrivateChats(convosWithOtherUser);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchChats();

      const publicChannel = supabase
        .channel('public:chat_rooms')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_rooms' }, payload => {
          fetchChats();
        })
        .subscribe();

      const privateChannel = supabase
        .channel('public:private_chats')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_chats' }, payload => {
          fetchChats();
        })
        .subscribe();

      const publicMessageChannel = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          fetchChats();
        })
        .subscribe();

      const privateMessageChannel = supabase
        .channel('public:private_messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_messages' }, payload => {
          fetchChats();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(publicChannel);
        supabase.removeChannel(privateChannel);
        supabase.removeChannel(publicMessageChannel);
        supabase.removeChannel(privateMessageChannel);
      };
    }
  }, [session, currentUserId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading chats...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full max-h-screen flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold">Chats</h2>
        <div className="flex items-center">
          <CreateChatRoomDialog onChatRoomCreated={fetchChats} />
          <StartPrivateChatDialog onChatSelected={(id, name, type) => {
            onSelectChat(id, name, type);
            fetchChats();
          }} />
          <ProfileSettingsDialog onProfileUpdated={fetchChats} /> {/* Added ProfileSettingsDialog */}
        </div>
      </div>
      <Separator />
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
                        "flex items-center gap-3 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent cursor-pointer",
                        selectedChatId === chat.id && selectedChatType === 'public' && "bg-muted",
                      )}
                      onClick={() => onSelectChat(chat.id, chat.name, 'public')}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${chat.name}`} alt={chat.name} />
                        <AvatarFallback><Users className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{chat.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
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
                        "flex items-center gap-3 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent cursor-pointer",
                        selectedChatId === chat.id && selectedChatType === 'private' && "bg-muted",
                      )}
                      onClick={() => onSelectChat(chat.id, chat.other_user_profile.username, 'private')}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={chat.other_user_profile.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${chat.other_user_profile.username}`} alt={chat.other_user_profile.username} />
                        <AvatarFallback><MessageSquare className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{chat.other_user_profile.first_name || chat.other_user_profile.username}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
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