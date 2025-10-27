"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import Members from "./Members";
import { useGlobal } from "@/contexts/GlobalContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import Playlist from "./Playlist";

type Props = {
  roomId: string;
};

type Tab = "members" | "playlist";

const data: { label: string; value: Tab }[] = [
  { label: "Members", value: "members" },
  { label: "Playlist", value: "playlist" },
];

function RoomDetailsPage({ roomId }: Props) {
  const { setRoomData, setLoading } = useGlobal();
  const [tab, setTab] = useState<Tab>("playlist");

  const init = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();
    if (error) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
      return;
    }
    setRoomData(data);
    setLoading(false);
  };

  useEffect(() => {
    if (roomId) {
      init();
    }
  }, [roomId]);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full bg-accent flex gap-2 rounded-lg p-1.5">
        {data.map((item) => (
          <Button
            variant={tab === item.value ? "default" : "ghost"}
            key={item.value}
            onClick={() => setTab(item.value)}
            className="w-1/2"
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {tab === "members" && <Members />}
        {tab === "playlist" && <Playlist />}
      </div>
    </div>
  );
}

export default RoomDetailsPage;
