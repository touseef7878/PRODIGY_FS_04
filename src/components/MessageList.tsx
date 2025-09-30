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
  profiles: Array<{
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
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    console.log("[MessageList] Messages prop updated:", messages); // Log to confirm prop updates
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4 bg-background">
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
                  "max-w-[70%] p-4 text-sm rounded-3xl relative", 
                  isCurrentUser
                    ? "bg-accent-primary text-white rounded-br-none message-outgoing" 
                    : "bg-card text-foreground rounded-bl-none border border-sidebar-border/50 message-incoming"
                )}
              >
                {!isCurrentUser && (
                  <p className="font-medium text-xs mb-1 opacity-80">{senderName}</p>
                )}
                <p>{message.content}</p>
                {isCurrentUser && (
                  <p className="font-medium text-xs mt-1 text-right opacity-80">You</p>
                )}
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
        <div ref={messagesEndRef} /> {/* Invisible element to scroll to */}
      </div>
    </ScrollArea>
  );
};

export default MessageList;