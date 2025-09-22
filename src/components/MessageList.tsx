"use client";

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: string;
  text: string;
  avatarUrl?: string;
  isCurrentUser: boolean;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
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
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3",
              message.isCurrentUser ? "justify-end" : "justify-start"
            )}
          >
            {!message.isCurrentUser && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.avatarUrl} alt={message.sender} />
                <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "max-w-[70%] rounded-lg p-3 text-sm",
                message.isCurrentUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <p>{message.text}</p>
            </div>
            {message.isCurrentUser && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.avatarUrl} alt={message.sender} />
                <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MessageList;