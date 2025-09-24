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
import { Settings, User, LogOut } from 'lucide-react';
import { useSession } from '@/components/SessionContextProvider';
import { showError, showSuccess } from '@/utils/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import ChatDataManagementSection from './ChatDataManagementSection';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

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
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchProfile = async () => {
    if (!currentUserId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, username, avatar_url')
      .eq('id', currentUserId);

    if (error) {
      showError("Failed to load profile: " + error.message);
      console.error("Error fetching profile:", error);
    } else if (data && data.length > 0) {
      const profile = data[0];
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || '');
    } else {
      setFirstName('');
      setLastName('');
      setUsername('');
      setAvatarUrl('');
      console.warn(`[ProfileSettingsDialog] No profile found for user ID: ${currentUserId}. Initializing with empty fields.`);
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
      onProfileUpdated();
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Failed to log out: " + error.message);
      console.error("Error logging out:", error);
    } else {
      showSuccess("You have been logged out successfully!");
      setOpen(false);
      onProfileUpdated(); // Still call this for any parent component cleanup
      navigate('/'); // Explicitly navigate to the home page
    }
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
      <DialogContent className="sm:max-w-[425px] shadow-lg border-border">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Manage your profile and chat data.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading profile...</div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid gap-4 py-4">
              {/* Profile Update Section */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Update Profile</h3>
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
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>Cancel</Button>
                  <Button type="submit" onClick={handleSave} disabled={isSaving || loading}>
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </Button>
                </DialogFooter>
              </div>

              <Separator className="my-4" />

              {/* Chat Data Management Section */}
              <ChatDataManagementSection onChatDataCleared={onProfileUpdated} />

              <Separator className="my-4" />

              {/* Logout Section */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Account Actions</h3>
                <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsDialog;