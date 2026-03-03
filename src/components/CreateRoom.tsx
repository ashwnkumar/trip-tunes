"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import InputComponent from "./form/InputComponent";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabaseClient";
import { useGlobal } from "@/contexts/GlobalContext";

interface FormType {
  roomName: string;
  name: string;
}

interface ErrorType {
  roomName?: string;
  name?: string;
}

function CreateRoom() {
  const { setLocalMember, localMember } = useGlobal();
  const [open, setOpen] = useState<boolean>(false);
  const [inviteOpen, setInviteOpen] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorType>({});
  const [formData, setFormData] = useState<FormType>({
    roomName: "",
    name: "",
  });
  const [inviteLink, setInviteLink] = useState<string>("");

  const resetForm = () => {
    setFormData({ roomName: "", name: "" });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const err: ErrorType = {};
    if (!formData.roomName.trim()) err.roomName = "Room Name is required";
    if (!formData.name.trim()) err.name = "Your Name is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return toast.error("Enter all required fields");

    const formatted = formData.roomName
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
    const roomCode = `${formatted}-${uuidv4().slice(0, 4)}`;
    const inviteLink = `${window.location.origin}/join?code=${roomCode}`;

    try {
      let member = localMember;

      // ✅ If no localMember, create one
      if (!member) {
        const { data: newMember, error: memberError } = await supabase
          .from("members")
          .insert([{ name: formData.name }])
          .select()
          .single();

        if (memberError) throw memberError;
        member = newMember;
        setLocalMember(newMember);
      }

      // ✅ Create room
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .insert([
          {
            name: formData.roomName,
            room_code: roomCode,
            invite_link: inviteLink,
            admin_id: member.id,
          },
        ])
        .select()
        .single();

      if (roomError) throw roomError;

      // ✅ Update member to link them to the room
      const { data: updatedMember, error: updateError } = await supabase
        .from("members")
        .update({ room_id: roomData.id, role: "admin", name: formData.name })
        .eq("id", member.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setLocalMember(updatedMember);
      setInviteLink(inviteLink);
      setInviteOpen(true);
      setOpen(false);
      resetForm();

      toast.success("Room created successfully!");
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
      setOpen(false);
      resetForm();
    }
  };

  useEffect(() => {
    if (localMember) setFormData({ roomName: "", name: localMember.name });
  }, [localMember]);

  return (
    <div>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="font-medium text-lg"
      >
        <Plus />
        Create Room
      </Button>

      {/* Create Room Dialog */}
      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Room</DialogTitle>
            <DialogDescription>
              Create a new room to share with your friends!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-2">
            <InputComponent
              label="Room Name"
              name="roomName"
              type="text"
              id="roomName"
              value={formData.roomName}
              onChange={handleInputChange}
              required
              error={errors.roomName}
            />

            <InputComponent
              label="Name"
              name="name"
              type="text"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              error={errors.name}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Create Room</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite Link Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Invite Link</DialogTitle>
            <DialogDescription>
              Share this link with your friends to invite them to the room
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 p-2 rounded-md border">
            <span className="break-all text-sm">{inviteLink}</span>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                toast.success("Invite link copied!");
              }}
            >
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateRoom;
