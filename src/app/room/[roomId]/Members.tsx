"use client";
import ConfirmDialog from "@/components/ConfirmDialog";
import Placeholder from "@/components/Placeholder";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/contexts/GlobalContext";
import { supabase } from "@/lib/supabaseClient";
import { Users, Crown, Trash2, UserCheck, Calendar } from "lucide-react";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

function Members() {
  const { roomData, localMember, isAdmin } = useGlobal();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Member | null>(null);


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
    setOpen(false);
  };

  const formatJoinedDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            // setMembers((prev) => prev.filter((m) => m.id !== payload.old.id));
            // if (localMember.id === payload.old.id) {
            //   localStorage.removeItem("member");
            //   toast.success(`You left the room.`);
            //   redirect("/");
            // } else {
            //   toast.info(`Someone left the room.`);
            // }
            setMembers((prev) => {
              const toRem = prev.find((m) => m.id === payload.old.id);
              if (localMember.id === payload.old.id) {
                localStorage.removeItem("member");
                toast.success(`You left the room.`);
                redirect("/");
              } else {
                toast.info(`${toRem?.name} left the room.`);

              }
              return prev.filter((m) => m.id !== payload.old.id);
            })
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-3" />
        <p className="text-muted-foreground text-sm">Loading members...</p>
      </div>
    );
  }


  const actionButtons: ConfirmActionButton[] = [
    {
      label: 'Cancel',
      onClick: () => {
        setOpen(false);
        setSelected(null);
      },
      variant: 'secondary'
      // className: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      label: 'Yes, Remove',
      onClick: () => {
        if (selected?.id) {
          handleRemoveMember(selected.id);
        }
      },
      variant: 'destructive',
      className: 'focus:ring-red-600',
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">
            Members
            {members.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({members.length})
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-lg">
          <Users className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-muted-foreground text-sm font-medium mb-1">No members yet</p>
          <p className="text-gray-400 text-xs">Invite people to join this room</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map((member, index) => (
            <div
              key={member.id}
              className="group relative bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 rounded-xl px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <Placeholder name={member.name} />
                <div className="flex-1 min-w-0">
                  {/* Name and Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {member.name}
                    </h3>

                    {member.role === "admin" && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        <Crown className="w-3 h-3" />
                        Admin
                      </span>
                    )}

                    {member.id === localMember.id && (
                      <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        <UserCheck className="w-3 h-3" />
                        You
                      </span>
                    )}
                  </div>

                  {/* Join Time */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined {formatJoinedDate(member.joined_at)}</span>
                  </div>
                </div>

                {/* Remove Button (Admin Only) */}
                {isAdmin && member.role !== "admin" && (
                  <Button
                    onClick={() => {
                      setOpen(true);
                      setSelected(member);
                    }}
                    variant="destructive"
                    size="icon"

                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Remove ${selected?.name}?`}
        description={`Are you sure you want to remove this member from the room? This action cannot be undone.`}
        actionButtons={actionButtons}
      />
    </div>
  );
}

export default Members;