"use client";
import TableComponent from "@/components/TableComponent";
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
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/contexts/GlobalContext";
import { supabase } from "@/lib/supabaseClient";
import { Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

function Members() {
  const { roomData } = useGlobal();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Member | null>(null);
  const localMember = JSON.parse(localStorage.getItem("member") || "{}");
  const isAdmin = localMember?.role === "admin";

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase
      .from("members")
      .delete()
      .match({ id: memberId, room_id: roomData?.id });

    if (error) {
      console.error("Error deleting member:", error);
      toast.error(error.message || "Something went wrong");
      return;
    }

    const updatedMembers = members.filter((member) => member.id !== memberId);
    toast.success("Member removed successfully!");
    setMembers(updatedMembers);
    setSelected(null);
  };

  const init = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("room_id", roomData?.id)
        .order("joined_at", { ascending: true });

      if (error) {
        console.error("Error getting members:", error);
        toast.error(error.message || "Something went wrong");
        return;
      }

      setMembers(data || []);
    } catch (err) {
      console.error("Unexpected error fetching members:", err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomData) {
      init();
    }

    const channel = supabase
      .channel(`members-${roomData?.id}`)
      .on(
        "postgres_changes",
        {
          schema: "public",
          event: "*",
          table: "members",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMembers((prev) => [...prev, payload.new as Member]);
            toast.info(`${payload.new.name} joined the room.`);
          } else if (payload.eventType === "DELETE") {
            setMembers((prev) => prev.filter((m) => m.id !== payload.old.id));
            if (localMember.id === payload.old.id) {
              localStorage.removeItem("member");
              toast.success(`You left the room.`);
            } else {
              toast.info(`Someone left the room.`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomData]);

  const columns = [
    {
      label: "Name",
      key: "name",
      render: (row: Member) => (
        <div className="flex items-center gap-2 w-full">
          <p>{row.name}</p>
          {row.role === "admin" && (
            <span className="bg-primary/10 border border-primary text-primary px-2 rounded text-xs">
              Admin
            </span>
          )}
          {row.id === localMember.id && (
            <span className="bg-green-600/10 border border-green-600 text-green-600 px-2 rounded text-xs">
              You
            </span>
          )}
        </div>
      ),
    },
    ...(isAdmin
      ? [
          {
            label: "Actions",
            key: "actions",
            render: (row: Member) =>
              row.role === "admin" ? null : (
                <Button
                  onClick={() => {
                    setOpen(true);
                    setSelected(row);
                  }}
                  variant={"destructive"}
                >
                  Remove
                </Button>
              ),
          },
        ]
      : []),
  ];

  return (
    <div className=" flex flex-col gap-2 ">
      {loading && <div>Loading members...</div>}
      {!loading && members.length === 0 && <div>No members found.</div>}
      <TableComponent data={members} columns={columns} />
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {selected?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemoveMember(selected?.id!)}
            >
              Yes, Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Members;
