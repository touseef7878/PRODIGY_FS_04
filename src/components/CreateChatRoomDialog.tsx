"use client";

import React from 'react';
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
import { PlusCircle } from 'lucide-react';
import { useSession } from '@/components/SessionContextProvider';
import { showSuccess, showError } from '@/utils/toast';

interface CreateChatRoomDialogProps {
  onChatRoomCreated: () => void;
}

const CreateChatRoomDialog: React.FC<CreateChatRoomDialogProps> = ({ onChatRoomCreated }) => {
  const [open, setOpen] = React.useState(false);
  const [chatRoomName, setChatRoomName] = React.useState('');
  const { supabase, session } = useSession();

  const handleCreateChatRoom = async () => {
    if (!chatRoomName.trim()) {
      showError("Chat room name cannot be empty.");
      return;
    }
    if (!session?.user?.id) {
      showError("You must be logged in to create a chat room.");
      return;
    }

    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({ name: chatRoomName.trim(), creator_id: session.user.id })
      .select();

    if (error) {
      showError("Failed to create chat room: " + error.message);
      console.error("Error creating chat room:", error);
    } else {
      showSuccess(`Chat room "${chatRoomName}" created successfully!`);
      setChatRoomName('');
      setOpen(false);
      onChatRoomCreated(); // Notify parent component to refresh chat list
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-auto">
          <PlusCircle className="h-5 w-5" />
          <span className="sr-only">Create new chat room</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chat Room</DialogTitle>
          <DialogDescription>
            Enter a name for your new chat room.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={chatRoomName}
              onChange={(e) => setChatRoomName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Team Discussion"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreateChatRoom}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatRoomDialog;