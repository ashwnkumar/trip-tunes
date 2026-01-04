"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  roomId: string;
  localMember: { id: string; name: string };
};

export default function RoomPresence({ roomId, localMember }: Props) {
  const { setOnlineMembers, setMembers } = useGlobal();
  const router = useRouter();

  useEffect(() => {
    if (!roomId || !localMember) return;

    const channel = supabase
      .channel(`members-${roomId}`)
      .on(
        "postgres_changes",
        {
          schema: "public",
          event: "*",
          table: "members",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMembers!((prev) => [...prev, payload.new as Member]);
            toast.info(`${payload.new.name} joined the room.`);
          } else if (payload.eventType === "DELETE") {
            setMembers!((prev) => {
              const toRem = prev.find((m) => m.id === payload.old.id);
              if (localMember.id === payload.old.id) {
                localStorage.removeItem("member");
                toast.success(`You left the room.`);
                router.push("/");
              } else {
                toast.info(`${toRem?.name} left the room.`);
              }
              return prev.filter((m) => m.id !== payload.old.id);
            });
          }
        }
      )
      .subscribe();

    const presenceChannel = supabase
      .channel(`presence-${roomId}`)
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const online = Object.values(state).flatMap(
          (arr) => arr
        ) as unknown as OnlinePresence[];
        setOnlineMembers?.(online);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        setOnlineMembers?.((prev) => [
          ...prev,
          ...(newPresences as unknown as OnlinePresence[]),
        ]);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        setOnlineMembers?.((prev) =>
          prev.filter((m) => !leftPresences.some((l) => l.id === m.id))
        );
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            id: localMember.id,
            name: localMember.name,
            joined_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(channel);
    };
  }, [roomId, localMember?.id]);

  return null;
}
