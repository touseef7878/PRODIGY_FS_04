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
import { useNavigate } from 'react-router-dom';

interface DeleteAccountDialogProps {
  onAccountDeleted: () => void;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ onAccountDeleted }) => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { supabase, session } = useSession();
  const navigate = useNavigate();
  const currentUserId = session?.user?.id;

  const handleDeleteAccount = async () => {
    if (!currentUserId) {
      showError("You must be logged in to delete your account.");
      return;
    }

    setIsDeleting(true);
    try {
      // First, delete related data in public schema tables that reference auth.users
      // Supabase RLS policies should handle user-specific deletions, but explicit deletion
      // of related data in public tables is good practice before deleting the auth.user entry.

      // Delete user's chat read statuses
      const { error: readStatusError } = await supabase
        .from('user_chat_read_status')
        .delete()
        .eq('user_id', currentUserId);
      if (readStatusError) throw readStatusError;

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

      // Delete the user's profile entry (this should cascade from auth.users, but explicit is safer)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', currentUserId);
      if (profileError) throw profileError;

      // Finally, delete the user from auth.users
      const { error: authError } = await supabase.auth.admin.deleteUser(currentUserId);
      if (authError) throw authError;

      showSuccess("Your account and all associated data have been permanently deleted.");
      setOpen(false);
      onAccountDeleted(); // Notify parent to refresh/redirect
      navigate('/login'); // Redirect to login page after account deletion
    } catch (error: any) {
      showError("Failed to delete account: " + error.message);
      console.error("Error deleting account:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" /> Delete My Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your user account, profile, and ALL associated data, including:
            <ul className="list-disc list-inside mt-2 text-red-600 dark:text-red-400">
              <li>Your user account and profile information.</li>
              <li>All public messages you have sent.</li>
              <li>All private messages you have sent.</li>
              <li>All private chats you are involved in.</li>
              <li>All public chat rooms you have created.</li>
              <li>All your chat read statuses.</li>
            </ul>
            You will be logged out and will not be able to log in with this account again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isDeleting ? 'Deleting...' : 'Delete My Account'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;