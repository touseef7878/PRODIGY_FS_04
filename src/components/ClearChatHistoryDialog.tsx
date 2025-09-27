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
import { Trash2 } from 'lucide-react';

interface ClearChatHistoryDialogProps {
  onHistoryCleared: () => void;
}

const ClearChatHistoryDialog: React.FC<ClearChatHistoryDialogProps> = ({ onHistoryCleared }) => {
  const [open, setOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { supabase, session } = useSession();
  const currentUserId = session?.user?.id;

  const handleClearHistory = async () => {
    if (!currentUserId) {
      showError("You must be logged in to clear your chat history.");
      return;
    }

    setIsClearing(true);
    try {
      // Delete public messages sent by the user
      const { error: publicMsgError } = await supabase
        .from('messages')
        .delete()
        .eq('sender_id', currentUserId);
      if (publicMsgError) throw publicMsgError;

      // Delete private messages sent by the user
      const { error: privateMsgError } = await supabase
        .from('private_messages')
        .delete()
        .eq('sender_id', currentUserId);
      if (privateMsgError) throw privateMsgError;

      // Delete private chats where the user is involved (this will cascade delete private messages)
      const { error: privateChatError } = await supabase
        .from('private_chats')
        .delete()
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);
      if (privateChatError) throw privateChatError;

      // Delete public chat rooms created by the user (this will cascade delete public messages in those rooms)
      const { error: chatRoomError } = await supabase
        .from('chat_rooms')
        .delete()
        .eq('creator_id', currentUserId);
      if (chatRoomError) throw chatRoomError;

      // Delete user's chat read statuses
      const { error: readStatusError } = await supabase
        .from('user_chat_read_status')
        .delete()
        .eq('user_id', currentUserId);
      if (readStatusError) throw readStatusError;

      showSuccess("Your chat history has been cleared successfully!");
      setOpen(false);
      onHistoryCleared(); // Notify parent to refresh
    } catch (error) {
      if (error instanceof Error) {
        showError("Failed to clear chat history: " + error.message);
        console.error("Error clearing chat history:", error);
      } else {
        showError("An unknown error occurred while clearing history.");
        console.error("An unknown error occurred:", error);
      }
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" /> Clear My Chat Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="shadow-lg border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete:
            <ul className="list-disc list-inside mt-2 text-red-600 dark:text-red-400">
              <li>All public messages you have sent.</li>
              <li>All private messages you have sent.</li>
              <li>All private chats you are involved in.</li>
              <li>All public chat rooms you have created.</li>
              <li>All your chat read statuses.</li>
            </ul>
            This will NOT delete your user account or profile information.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClearHistory} disabled={isClearing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isClearing ? 'Clearing...' : 'Clear My Chat Data'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClearChatHistoryDialog;