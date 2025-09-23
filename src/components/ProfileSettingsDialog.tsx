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
import { Settings, User } from 'lucide-react';
import { useSession } from '@/components/SessionContextProvider';
import { showError, showSuccess } from '@/utils/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import ClearChatHistoryDialog from './ClearChatHistoryDialog'; // Import the new component

interface Profile {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

interface ProfileSettingsDialogProps {
  onProfileUpdated: () => void;
}

const ProfileSettingsDialog: React.FC<ProfileSettingsDialogProps> = ({ onProfileUpdated }) => {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { supabase, session } = useSession();
  const currentUserId = session?.user?.id;

  const fetchProfile = async () => {
    if (!currentUserId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, username, avatar_url')
      .eq('id', currentUserId)
      .single();

    if (error) {
      showError("Failed to load profile: " + error.message);
      console.error("Error fetching profile:", error);
    } else if (data) {
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setUsername(data.username || '');
      setAvatarUrl(data.avatar_url || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchProfile();
    }
  }, [open, currentUserId]);

  const handleSave = async () => {
    if (!currentUserId) {
      showError("You must be logged in to update your profile.");
      return;
    }
    if (!username.trim()) {
      showError("Username cannot be empty.");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        avatar_url: avatarUrl.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentUserId);

    if (error) {
      showError("Failed to update profile: " + error.message);
      console.error("Error updating profile:", error);
    } else {
      showSuccess("Profile updated successfully!");
      setOpen(false);
      onProfileUpdated(); // Notify parent to refresh
    }
    setIsSaving(false);
  };

  const defaultAvatar = `https://api.dicebear.com/7.x/lorelei/svg?seed=${username || 'user'}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Profile Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Update your public profile information.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading profile...</div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || defaultAvatar} alt={username} />
                <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
              </Avatar>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., John"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Doe"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
                placeholder="e.g., johndoe"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatarUrl" className="text-right">
                Avatar URL
              </Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="col-span-3"
                placeholder="Optional: URL to your avatar image"
              />
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your chat history and related data.
              </p>
              <ClearChatHistoryDialog onHistoryCleared={onProfileUpdated} />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>Cancel</Button>
          <Button type="submit" onClick={handleSave} disabled={isSaving || loading}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsDialog;