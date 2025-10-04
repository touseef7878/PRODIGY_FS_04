"use client";

import React, { useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profile?: {
    username: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string | undefined;
}

const getDisplayName = (profile: Message['profile'], userId: string) => {
  if (!profile) return `User ${userId.slice(0, 8)}`;
  const isEmail = (str: string) => /^[[\w-\.]+@([[\w-]+.)+[\w-]{2,4}$/.test(str);
  if (profile.first_name) return profile.first_name;
  if (profile.username && !isEmail(profile.username)) return profile.username;
  return `User ${userId.slice(0, 8)}`;
};

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change using a more efficient approach
  useEffect(() => {
    // Use a timeout to ensure the DOM is updated before scrolling
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 10);
    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4 bg-background">
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.sender_id === currentUserId;
          
          const senderName = isCurrentUser ? 'You' : getDisplayName(message.profile, message.sender_id);
          
          const senderAvatar = message.profile?.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${senderName}`;

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
                <p className="font-medium text-xs mb-1 opacity-80">
                  {senderName}
                </p>
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
        <div ref={messagesEndRef} /> {/* Invisible element to scroll to */}
      </div>
    </ScrollArea>
  );
};

export default MessageList;