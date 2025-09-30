"use client";

import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSend = useCallback(() => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  }, [message, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  return (
    <div className="flex gap-2 p-4 border-t border-border bg-card">
      <div className="flex items-center gap-2 flex-1">
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="flex-1 rounded-2xl border border-input focus-visible:ring-accent-primary py-5 px-4 h-14"
        />
        <Button 
          onClick={handleSend} 
          disabled={!message.trim()} 
          className="h-10 w-10 rounded-full bg-accent-primary hover:bg-[hsl(var(--accent-primary)_/_0.9)]"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;