"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { LogIn } from "lucide-react";
import InputComponent from "./form/InputComponent";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";

type Room = {
    id: string;
    name: string;
    code: string;
};

export default function CreateRoom() {
    const [formData, setFormData] = useState({ name: "", roomName: "" });
    const [createModal, setCreateModal] = useState(false);
    const [infoModal, setInfoModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [room, setRoom] = useState<Room | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => setFormData({ name: "", roomName: "" });

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.roomName.trim()) {
            toast.warning("Please fill out all fields");
            return;
        }

        try {
            setLoading(true);

            // Create admin participant
            const { data: participant, error: participantError } = await supabase
                .from("participants")
                .insert([{ name: formData.name, role: "admin" }])
                .select()
                .single();

            if (participantError) throw participantError;

            const roomCode = `room-${formData.roomName
                .replace(/\s+/g, "-")
                .toLowerCase()}-${uuidv4().slice(0, 8)}`;

            // Create the room
            const { data: roomData, error: roomError } = await supabase
                .from("rooms")
                .insert({
                    name: formData.roomName,
                    code: roomCode,
                    admin_id: participant.id,
                })
                .select()
                .single();

            if (roomError) throw roomError;

            // Link participant to room
            await supabase
                .from("participants")
                .update({ room_id: roomData.id })
                .eq("id", participant.id);

            setRoom(roomData);
            setCreateModal(false);
            setInfoModal(true);
            toast.success("Room created successfully!");
            resetForm();
        } catch (err: any) {
            console.error("Error creating room:", err.message);
            toast.error("Failed to create room. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inviteLink = room
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/join?code=${room.code}`
        : "";

    return (
        <>
            {/* Create Room Dialog */}
            <Dialog open={createModal} onOpenChange={setCreateModal}>
                <DialogTrigger asChild>
                    <Button size="lg" onClick={() => setCreateModal(true)}>
                        <LogIn className="mr-2" />
                        Create Room
                    </Button>
                </DialogTrigger>

                <DialogContent className="">
                    <form onSubmit={handleCreateRoom}>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold">
                                Create Room
                            </DialogTitle>
                            <DialogDescription>
                                Create a new room to invite your friends and start your
                                collaborative playlist.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <InputComponent
                                label="Your Name"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                            <InputComponent
                                label="Room Name"
                                id="roomName"
                                name="roomName"
                                value={formData.roomName}
                                onChange={handleInputChange}
                            />
                        </div>

                        <DialogFooter className="flex justify-end gap-2">
                            <DialogClose asChild>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Spinner className="mr-2" /> : null}
                                Create Room
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Info Dialog */}
            <Dialog open={infoModal} onOpenChange={setInfoModal}>
                <DialogContent className="text-center">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold">
                            Room <span className="text-primary">{room?.name}</span> Created!
                        </DialogTitle>
                        <DialogDescription>
                            Share this link to invite others:
                        </DialogDescription>
                    </DialogHeader>

                    <div className="w-full p-3 bg-muted rounded-md font-mono text-sm break-all">
                        {inviteLink}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
