"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSession } from '@/components/SessionContextProvider';
import { showError, showSuccess } from '@/utils/toast';
import { MessageSquareOff, Users, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ChatDataManagementSectionProps {
  onChatDataCleared: () => void;
}

const ChatDataManagementSection: React.FC<ChatDataManagementSectionProps> = ({ onChatDataCleared }) => {
  const { supabase, session } = useSession();
  const currentUserId = session?.user?.id;

  const [isClearingPublicRooms, setIsClearingPublicRooms] = useState(false);
  const [isClearingPrivateChats, setIsClearingPrivateChats] = useState(false);
  const [isClearingReadStatuses, setIsClearingReadStatuses] = useState(false);

  const handleClearPublicChatRooms = async () => {
    if (!currentUserId) {
      showError("You must be logged in to clear chat rooms.");
      return;
    }
    setIsClearingPublicRooms(true);
    try {
      const { error } = await supabase
        .from('chat_rooms')
        .delete()
        .eq('creator_id', currentUserId);

      if (error) throw error;
      showSuccess("All public chat rooms you created have been cleared!");
      onChatDataCleared();
    } catch (error: any) {
      showError("Failed to clear public chat rooms: " + error.message);
      console.error("Error clearing public chat rooms:", error);
    } finally {
      setIsClearingPublicRooms(false);
    }
  };

  const handleClearPrivateChats = async () => {
    if (!currentUserId) {
      showError("You must be logged in to clear private chats.");
      return;
    }
    setIsClearingPrivateChats(true);
    try {
      const { error } = await supabase
        .from('private_chats')
        .delete()
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

      if (error) throw error;
      showSuccess("All private chats you are involved in have been cleared!");
      onChatDataCleared();
    } catch (error: any) {
      showError("Failed to clear private chats: " + error.message);
      console.error("Error clearing private chats:", error);
    } finally {
      setIsClearingPrivateChats(false);
    }
  };

  const handleClearReadStatuses = async () => {
    if (!currentUserId) {
      showError("You must be logged in to clear read statuses.");
      return;
    }
    setIsClearingReadStatuses(true);
    try {
      const { error } = await supabase
        .from('user_chat_read_status')
        .delete()
        .eq('user_id', currentUserId);

      if (error) throw error;
      showSuccess("Your chat read statuses have been cleared!");
      onChatDataCleared();
    } catch (error: any) {
      showError("Failed to clear read statuses: " + error.message);
      console.error("Error clearing read statuses:", error);
    } finally {
      setIsClearingReadStatuses(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Chat Data Management</h3>
      <p className="text-sm text-muted-foreground">
        Manage and delete specific parts of your chat data.
      </p>

      {/* Clear Public Chat Rooms */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" /> Clear My Public Chat Rooms
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete ALL public chat rooms you have created, along with all messages within them.
              This will NOT delete public chat rooms created by other users, even if you participated in them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearingPublicRooms}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearPublicChatRooms} disabled={isClearingPublicRooms} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isClearingPublicRooms ? 'Clearing...' : 'Clear Public Rooms'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Private Chats */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <MessageSquareOff className="mr-2 h-4 w-4" /> Clear My Private Chats
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete ALL private chats you are involved in, along with all messages within them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearingPrivateChats}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearPrivateChats} disabled={isClearingPrivateChats} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isClearingPrivateChats ? 'Clearing...' : 'Clear Private Chats'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Read Statuses */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <History className="mr-2 h-4 w-4" /> Clear My Read Statuses
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all records of which chats you have read. This might cause previously read chats to appear as unread.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearingReadStatuses}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearReadStatuses} disabled={isClearingReadStatuses} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isClearingReadStatuses ? 'Clearing...' : 'Clear Read Statuses'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatDataManagementSection;