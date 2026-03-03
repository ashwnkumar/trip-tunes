"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import Members from "./Members";
import { useGlobal } from "@/contexts/GlobalContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import Playlist from "./Playlist";
import {
  ChevronDown,
  Users,
  Music,
  Share2,
  Check,
  LogOut,
  Trash2,
  Calendar,
  User,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useRouter } from "next/navigation";
import RoomPresence from "./RoomPresence";

type Props = {
  roomId: string;
};

type Tab = "members" | "playlist";

const data: { label: string; value: Tab; icon: React.ReactNode }[] = [
  { label: "Members", value: "members", icon: <Users className="w-4 h-4" /> },
  { label: "Playlist", value: "playlist", icon: <Music className="w-4 h-4" /> },
];

function RoomDetailsPage({ roomId }: Props) {
  const {
    setRoomData,
    setLoading,
    roomData,
    isAdmin,
    localMember,
    removeLocalData,
  } = useGlobal();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("members");
  const [open, setOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<"leave" | "delete" | false>(false);
  const [adminName, setAdminName] = useState<string>("Loading...");

  const init = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();
    if (error) {
      toast.error(error.message || "Something went wrong");
      return;
    }
    setRoomData(data);

    // Fetch admin member details
    if (data.admin_id) {
      const { data: adminData } = await supabase
        .from("members")
        .select("name")
        .eq("id", data.admin_id)
        .single();

      if (adminData) {
        setAdminName(adminData.name);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    init();
    const roomSubscription = supabase
      .channel("room-deleted")
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        () => {
          toast.error("This Room has been deleted!");
          setRoomData(null);
          removeLocalData();
          router.push("/");
        },
      )
      .subscribe();

    return () => {
      roomSubscription.unsubscribe();
    };
  }, [roomId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomData?.invite_link!);
    setCopied(true);
    toast.success("Copied room link to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleLeaveRoom = async () => {
    const { error } = await supabase
      .from("members")
      .delete()
      .match({ id: localMember?.id, room_id: roomData?.id });

    if (error) {
      console.error("Error leaving room:", error);
      toast.error(error.message || "Something went wrong");
      return;
    }
    toast.success("Left room successfully!");
    setRoomData(null);
    removeLocalData();
    setConfirm(false);
    router.push("/");
  };

  const handleDeleteRoom = async () => {
    const { error } = await supabase
      .from("rooms")
      .delete()
      .match({ id: roomData?.id });

    if (error) {
      console.error("Error deleting room:", error);
      toast.error(error.message || "Something went wrong");
      return;
    }

    toast.success("Room deleted successfully!");
    setRoomData(null);
    removeLocalData();
    setConfirm(false);
    router.push("/");
  };

  const confirmActions = () => {
    switch (confirm) {
      case "leave":
        return [
          {
            label: "Cancel",
            onClick: () => setConfirm(false),
            variant: "secondary" as const,
          },
          {
            label: "Leave Room",
            onClick: handleLeaveRoom,
            variant: "default" as const,
          },
        ];
      case "delete":
        return [
          {
            label: "Cancel",
            onClick: () => setConfirm(false),
            variant: "secondary" as const,
          },
          {
            label: "Delete Room",
            onClick: handleDeleteRoom,
            variant: "destructive" as const,
          },
        ];
      default:
        return [];
    }
  };

  const getConfirmTitle = () => {
    switch (confirm) {
      case "leave":
        return `Leave ${roomData?.name}?`;
      case "delete":
        return `Delete ${roomData?.name}?`;
      default:
        return "";
    }
  };

  const getConfirmDesc = () => {
    switch (confirm) {
      case "leave":
        return `Are you sure you want to leave ${roomData?.name}? You will have to re-join the room to access it again.`;
      case "delete":
        return `Are you sure you want to delete ${roomData?.name}? All members will be removed from the room and the playlist will be deleted. This action cannot be undone.`;
      default:
        return "";
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <RoomPresence roomId={roomData?.id!} localMember={localMember!} />

      {/* Room Header Card */}
      <div className="w-full bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div
          onClick={() => setOpen((p) => !p)}
          className="w-full p-6 cursor-pointer group hover:bg-muted/50 transition-colors"
        >
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Music className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {roomData?.name || "Getting Room Name..."}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Click to view room details
                </p>
              </div>
            </div>
            <div
              className={`${
                open ? "rotate-180" : ""
              } transition-all duration-300 text-muted-foreground group-hover:text-primary`}
            >
              <ChevronDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 pb-6 space-y-4 border-t border-border pt-6 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Created By
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {adminName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Created On
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {roomData?.created_at && formatDate(roomData.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button onClick={handleCopyLink} className="w-full" size="lg">
                <span className="flex items-center gap-2">
                  {copied ? <Check /> : <Share2 />}
                  {copied ? "Copied!" : "Copy Room Link"}
                </span>
              </Button>

              <Button
                onClick={() => setConfirm("leave")}
                className="w-full"
                size="lg"
                variant={"secondary"}
              >
                <span className="flex items-center gap-2">
                  <LogOut />
                  Leave Room
                </span>
              </Button>
            </div>

            {isAdmin && (
              <Button
                onClick={() => setConfirm("delete")}
                className="w-full"
                size="lg"
                variant={"destructive"}
              >
                <span className="flex items-center gap-2">
                  <Trash2 />
                  Delete Room
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full bg-card border border-border flex gap-2 rounded-xl p-2">
        {data.map((item) => (
          <Button
            variant={tab === item.value ? "default" : "ghost"}
            key={item.value}
            onClick={() => setTab(item.value)}
            size="lg"
            className={`flex-1 gap-2 transition-all duration-200`}
          >
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="w-full animate-in fade-in duration-300">
        {tab === "members" && <Members />}
        {tab === "playlist" && <Playlist />}
      </div>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => setConfirm(open ? confirm : false)}
        title={getConfirmTitle()}
        description={getConfirmDesc()}
        actionButtons={confirmActions()}
      />
    </div>
  );
}

export default RoomDetailsPage;
