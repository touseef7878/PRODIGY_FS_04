import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  avatarUrl?: string;
  unreadCount?: number;
}

const dummyChats: ChatItem[] = [
  { id: '1', name: 'Alice', lastMessage: 'Hey, how are you?', avatarUrl: 'https://github.com/shadcn.png', unreadCount: 2 },
  { id: '2', name: 'Bob', lastMessage: 'Meeting at 3 PM.', unreadCount: 0 },
  { id: '3', name: 'Charlie', lastMessage: 'Don\'t forget the report!', avatarUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Charlie' },
  { id: '4', name: 'David', lastMessage: 'See you tomorrow.', unreadCount: 1 },
  { id: '5', name: 'Eve', lastMessage: 'Sounds good!', avatarUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Eve' },
  { id: '6', name: 'Frank', lastMessage: 'Got it.', unreadCount: 0 },
  { id: '7', name: 'Grace', lastMessage: 'What about the new feature?', avatarUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Grace' },
  { id: '8', name: 'Heidi', lastMessage: 'I\'ll check it.', unreadCount: 3 },
  { id: '9', name: 'Ivan', lastMessage: 'Thanks!', avatarUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Ivan' },
  { id: '10', name: 'Judy', lastMessage: 'No problem.', unreadCount: 0 },
];

interface SidebarProps {
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedChatId, onSelectChat }) => {
  return (
    <div className="flex h-full max-h-screen flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold">Chats</h2>
        {/* Add any header actions here, e.g., new chat button */}
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-2">
          {dummyChats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "flex items-center gap-3 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent",
                selectedChatId === chat.id && "bg-muted",
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={chat.avatarUrl} alt={chat.name} />
                <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{chat.name}</p>
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {chat.lastMessage.substring(0, 30)}
                  {chat.lastMessage.length > 30 ? "..." : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;