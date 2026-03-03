"use client";
import React, { ChangeEvent, useState } from "react";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";
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
import { useRouter } from "next/navigation";

interface FormType {
  roomLink: string;
}

interface ErrorType {
  roomLink?: string;
  name?: string;
}

function JoinRoom() {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorType>({});
  const [formData, setFormData] = useState<FormType>({
    roomLink: "",
  });

  const resetForm = () => {
    setFormData({ roomLink: "" });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const err: ErrorType = {};
    if (!formData.roomLink.trim()) {
      err.roomLink = "Room Name is required";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return toast.error("Enter all required fields");
    }

    // Extract room code from the link
    const url = formData.roomLink.trim();
    let roomCode = "";

    try {
      // Handle full URL format: http://localhost:3000/join?code=ABC123
      if (url.includes("/join?code=")) {
        const urlObj = new URL(url);
        roomCode = urlObj.searchParams.get("code") || "";
      }
      // Handle direct room ID format: /room/uuid
      else if (url.includes("/room/")) {
        toast.error("Please use the join link format: /join?code=ROOMCODE");
        return;
      }
      // Handle just the code: ABC123
      else if (!url.includes("/") && !url.includes("?")) {
        roomCode = url;
      }
      // Handle /join?code=ABC123 format
      else if (url.startsWith("/join?code=")) {
        roomCode = url.split("code=")[1];
      } else {
        toast.error("Invalid room link format");
        return;
      }

      if (!roomCode) {
        toast.error("Could not extract room code from link");
        return;
      }

      setOpen(false);
      router.push(`/join?code=${roomCode}`);
    } catch (error) {
      toast.error("Invalid room link format");
    }
  };

  return (
    <div>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        variant={"secondary"}
        className="font-medium text-lg w-full sm:w-auto h-12 px-8 shadow-md hover:shadow-lg"
      >
        <LogIn />
        Join Room
      </Button>

      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Room</DialogTitle>
            <DialogDescription>
              Enter the room link provided by the host
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-2">
            <InputComponent
              label="Room Link"
              name="roomLink"
              type="text"
              id="roomLink"
              value={formData.roomLink}
              onChange={handleInputChange}
              required
              error={errors.roomLink}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Join Room</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default JoinRoom;
