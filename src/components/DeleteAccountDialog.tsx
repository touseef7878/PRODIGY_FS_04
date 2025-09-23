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
  const accessToken = session?.access_token; // Get the access token for the Edge Function

  const handleDeleteAccount = async () => {
    if (!currentUserId || !accessToken) {
      showError("You must be logged in to delete your account.");
      return;
    }

    setIsDeleting(true);
    try {
      // Invoke the Edge Function to delete the user
      const { data, error } = await supabase.functions.invoke('delete-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // The Edge Function returns a JSON object, check for an error property
      if (data && data.error) {
        throw new Error(data.error);
      }

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