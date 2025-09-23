"use client";

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles: Array<{ // Changed to Array
    username: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
  }> | null;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string | undefined;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.sender_id === currentUserId;
          // Access the first element of the profiles array
          const senderName = message.profiles?.[0]?.first_name || message.profiles?.[0]?.username || 'Unknown User';
          const senderAvatar = message.profiles?.[0]?.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${senderName}`;

          return (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3",
                isCurrentUser ? "justify-end" : "justify-start"
              )}
            >
              {!isCurrentUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={senderAvatar} alt={senderName} />
                  <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-lg p-3 text-sm",
                  isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <p className="font-medium text-xs mb-1">{senderName}</p>
                <p>{message.content}</p>
              </div>
              {isCurrentUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={senderAvatar} alt={senderName} />
                  <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default MessageList;