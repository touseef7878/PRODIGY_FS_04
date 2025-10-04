"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare } from 'lucide-react'; // Removed 'Search'
import { useSession } from '@/components/SessionContextProvider';
import { showError, showSuccess } from '@/utils/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

interface StartPrivateChatDialogProps {
  onChatSelected: (chatId: string, chatName: string, chatType: 'private') => void;
}

const StartPrivateChatDialog: React.FC<StartPrivateChatDialogProps> = ({ onChatSelected }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { supabase, session } = useSession();
  const currentUserId = session?.user?.id;

  const isEmail = (str: string) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(str);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      const searchLower = `%${searchTerm.trim().toLowerCase()}%`;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, avatar_url')
        .or(`username.ilike.${searchLower},first_name.ilike.${searchLower},last_name.ilike.${searchLower}`) // Search across multiple fields
        .neq('id', currentUserId); // Exclude current user

      if (error) {
        showError("Failed to search users: " + error.message);
        console.error("Error searching users:", error);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
      }
      setLoading(false);
    };

    const debounceSearch = setTimeout(() => {
      searchUsers();
    }, 300); // Debounce search to prevent too many requests

    return () => clearTimeout(debounceSearch);
  }, [searchTerm, supabase, currentUserId]);

  const handleSelectUser = async (selectedUser: Profile) => {
    if (!currentUserId) {
      showError("You must be logged in to start a private chat.");
      return;
    }

    // Check if a private chat already exists between these two users
    const { data: existingChat, error: chatError } = await supabase
      .from('private_chats')
      .select('id')
      .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${selectedUser.id}),and(user1_id.eq.${selectedUser.id},user2_id.eq.${currentUserId})`)
      .single();

    if (chatError && chatError.code !== 'PGRST116') { // PGRST116 means "no rows found"
      showError("Failed to check for existing chat: " + chatError.message);
      console.error("Error checking existing chat:", chatError);
      return;
    }

    let chatId: string;
    if (existingChat) {
      chatId = existingChat.id;
      showSuccess(`Opening chat with ${selectedUser.username}`);
    } else {
      // Create a new private chat
      const { data: newChat, error: createError } = await supabase
        .from('private_chats')
        .insert({ user1_id: currentUserId, user2_id: selectedUser.id })
        .select('id')
        .single();

      if (createError) {
        showError("Failed to create private chat: " + createError.message);
        console.error("Error creating private chat:", createError);
        return;
      }
      chatId = newChat.id;
      showSuccess(`Started new private chat with ${selectedUser.username}`);
    }

    onChatSelected(chatId, selectedUser.username, 'private');
    setOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2">
          <MessageSquare className="h-5 w-5" />
          <span className="sr-only">Start private chat</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] shadow-lg border-border">
        <DialogHeader>
          <DialogTitle>Start Private Chat</DialogTitle>
          <DialogDescription>
            Search for a user by username, first name, or last name to start a private conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="search" className="text-right">
              Search
            </Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="col-span-3"
              placeholder="Search by name or username"
            />
          </div>
          {loading && <p className="text-center text-muted-foreground">Searching...</p>}
          {!loading && searchTerm.trim() && searchResults.length === 0 && (
            <p className="text-center text-muted-foreground">No users found.</p>
          )}
          {!loading && searchResults.length > 0 && (
            <ScrollArea className="h-[200px] w-full rounded-md border">
              <div className="p-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent cursor-pointer"
                    )}
                    onClick={() => handleSelectUser(user)}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${user.username}`} alt={user.username} />
                      <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{isEmail(user.username) ? `User ${user.id.slice(0, 8)}` : user.username}</p>
                      {!isEmail(user.username) && <p className="text-xs text-muted-foreground">@{user.username}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartPrivateChatDialog;