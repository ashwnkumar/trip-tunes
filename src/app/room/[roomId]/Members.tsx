"use client";
import ConfirmDialog from "@/components/ConfirmDialog";
import Placeholder from "@/components/Placeholder";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/contexts/GlobalContext";
import { formatTimeAgo } from "@/lib/formatTimeAgo";
import { supabase } from "@/lib/supabaseClient";
import { Users, Crown, Trash2, UserCheck, Calendar } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

function Members() {
  const { roomData, localMember, isAdmin, onlineMembers, members, setMembers } =
    useGlobal();

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

    const updatedMembers = members!.filter((member) => member.id !== memberId);
    toast.success("Member removed successfully!");
    setMembers!(updatedMembers);
    setSelected(null);
    setOpen(false);
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

      setMembers!(data || []);
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
  }, [roomData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-3" />
        <p className="text-muted-foreground text-sm">Loading members!...</p>
      </div>
    );
  }

  const actionButtons: ConfirmActionButton[] = [
    {
      label: "Cancel",
      onClick: () => {
        setOpen(false);
        setSelected(null);
      },
      variant: "secondary",
      // className: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      label: "Yes, Remove",
      onClick: () => {
        if (selected?.id) {
          handleRemoveMember(selected.id);
        }
      },
      variant: "destructive",
      className: "focus:ring-red-600",
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">
            Members
            {members!.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({members!.length})
              </span>
            )}
          </h2>
        </div>
      </div>

      {members!.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-lg">
          <Users className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-muted-foreground text-sm font-medium mb-1">
            No members yet
          </p>
          <p className="text-gray-400 text-xs">
            Invite people to join this room
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members!.map((member) => {
            const isOnline = onlineMembers?.some((m) => m.id === member.id);
            return (
              <div
                key={member.id}
                className="group relative bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 rounded-xl px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="relative">
                    <Placeholder name={member.name} />
                    <div
                      className={`absolute right-0 top-0 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? "bg-green-500" : "bg-gray-300"
                      }`}
                      title={isOnline ? "Online" : "Offline"}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate flex items-center gap-1">
                        {member.name}
                      </h3>

                      {member.role === "admin" && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-full text-xs font-medium leading-none">
                          <Crown className="w-3 h-3" />
                          Admin
                        </span>
                      )}

                      {member.id === localMember?.id && (
                        <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded-full text-xs font-medium leading-none">
                          <UserCheck className="w-3 h-3" />
                          You
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Joined {formatTimeAgo(member.joined_at)}</span>
                    </div>
                  </div>

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
            );
          })}
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
