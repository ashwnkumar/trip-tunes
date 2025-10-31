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
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";


interface FormType {
  roomLink: string;
}

interface ErrorType {
  roomLink?: string;
  name?: string;
}

function JoinRoom() {
  const router = useRouter()
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
    router.push(`${formData.roomLink}`)
  };

  return (
    <div>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        variant={"secondary"}
        className="font-medium text-lg"
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
