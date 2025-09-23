"use client";

import React, { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useSession } from '@/components/SessionContextProvider';
import { showError } from '@/utils/toast';
import CreateChatRoomDialog from './CreateChatRoomDialog'; // Import the new component

interface ChatRoom {
  id: string;
  name: string;
  creator_id: string;
  last_message_content?: string; // To store the last message for display
  unread_count?: number; // This would require more complex logic
}

interface SidebarProps {
  selectedChatId?: string;
  onSelectChat: (chatId: string, chatName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedChatId, onSelectChat }) => {
  const { supabase, session } = useSession();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChatRooms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('id, name, creator_id, messages(content, created_at)')
      .order('created_at', { ascending: false });

    if (error) {
      showError("Failed to load chat rooms: " + error.message);
      console.error("Error fetching chat rooms:", error);
    } else {
      const roomsWithLastMessage = data.map(room => {
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
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchChatRooms();

      // Set up real-time subscription for new chat rooms
      const channel = supabase
        .channel('public:chat_rooms')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_rooms' }, payload => {
          // When a new chat room is inserted, refetch the list
          fetchChatRooms();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

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
        <CreateChatRoomDialog onChatRoomCreated={fetchChatRooms} />
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-2">
          {chatRooms.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">No chat rooms found. Create one!</p>
          ) : (
            chatRooms.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent cursor-pointer",
                  selectedChatId === chat.id && "bg-muted",
                )}
                onClick={() => onSelectChat(chat.id, chat.name)}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${chat.name}`} alt={chat.name} />
                  <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{chat.name}</p>
                    {/* Unread count logic would go here */}
                    {/* {chat.unreadCount && chat.unreadCount > 0 && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {chat.unreadCount}
                      </span>
                    )} */}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {chat.last_message_content?.substring(0, 30)}
                    {chat.last_message_content && chat.last_message_content.length > 30 ? "..." : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;