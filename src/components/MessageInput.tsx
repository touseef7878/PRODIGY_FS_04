"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Plus, Smile, Mic } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = React.useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 p-4 border-t border-border bg-card">
      <div className="flex items-center gap-2 flex-1">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-accent"
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">Add attachment</span>
        </Button>
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 rounded-2xl border border-input focus-visible:ring-accent-primary py-5 px-4 h-14"
        />
        {message.trim() ? (
          <Button 
            onClick={handleSend} 
            disabled={!message.trim()} 
            className="h-10 w-10 rounded-full bg-accent-primary hover:bg-[hsl(var(--accent-primary)_/_0.9)]"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-accent"
          >
            <Smile className="h-5 w-5" />
            <span className="sr-only">Add emoji</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;