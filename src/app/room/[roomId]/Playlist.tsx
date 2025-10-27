import InputComponent from "@/components/form/InputComponent";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/contexts/GlobalContext";
import { getSpotiftyAccessToken } from "@/lib/spotifyHelper";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

function Playlist() {
  const { roomData } = useGlobal();
  const localMember = JSON.parse(localStorage.getItem("member") || "{}");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SongDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  console.log("playlist", playlist);

  const handleAddToPlaylist = async (song: SongDetails) => {
    const { data, error } = await supabase
      .from("songs")
      .insert({
        room_id: roomData?.id || "",
        member_id: localMember.id || "",
        spotify_id: song.id,
        metadata: song,
      })
      .select()
      .single();
    if (error) {
      if (error.code === "23505") {
        toast.error("Song is already in the playlist!");
        return;
      }
      console.log("Error adding song to playlist:", error);
      toast.error(error.message || "Something went wrong");
      return;
    }
    toast.success("Song added to playlist successfully!");
  };

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const token = await getSpotiftyAccessToken();

      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          searchTerm
        )}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`Spotify API error (${res.status})`);
      const data = await res.json();

      const tracks = data?.tracks?.items || [];
      const mapped: SongDetails[] = tracks.map((item: any) => ({
        id: item.id,
        name: item.name,
        artist: item.artists?.[0]?.name ?? "Unknown Artist",
        // album: item.album?.images?.[0]?.url ?? "",
        album: item.album?.images?.[1]?.url ?? "",
        url: item.external_urls?.spotify ?? "#",
      }));

      setResults(mapped);
    } catch (error) {
      console.error("Error fetching Spotify results:", error);
      toast.error("Failed to fetch results. Try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase
        .from("songs")
        .select(
          `
          id,
          added_by: member_id (name),
          metadata,
          added_at

          `
        )
        .eq("room_id", roomData?.id);

      if (error) {
        console.log(error);
        toast.error(error.message || "Something went wrong");
        return;
      }

      console.log("data", data);

      const mapped: PlaylistItem[] = (data || []).map((row: any) => ({
        id: row.id,
        metadata: row.metadata,
        added_at: row.added_at,
        added_by: Array.isArray(row.added_by)
          ? row.added_by[0]?.name ?? "Unknown"
          : row.added_by?.name ?? row.added_by ?? "Unknown",
      }));

      setPlaylist(mapped);
    };

    const channel = supabase
      .channel(`playlist-${roomData?.id}`)
      .on(
        "postgres_changes",
        {
          schema: "public",
          event: "*",
          table: "songs",
          filter: `room_id=eq.${roomData?.id}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            console.log("payload", payload);
            const { data: member } = await supabase
              .from("members")
              .select("name")
              .eq("id", payload.new.member_id)
              .single();

            setPlaylist((prev) => [
              ...prev,
              {
                id: payload.new.id,
                metadata: payload.new.metadata,
                added_at: payload.new.added_at,
                added_by: member?.name || "Unknown",
              } as PlaylistItem,
            ]);
          }
        }
      )
      .subscribe();

    if (roomData?.id) {
      init();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomData?.id]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch(query);
    }, 500);

    return () => clearTimeout(debounce);
  }, [query, handleSearch]);

  return (
    <div className="w-full">
      <InputComponent
        id="query"
        name="query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="relative w-full"
        placeholder="Search for songs, artists, albums..."
      />

      {loading && (
        <p className="text-center mt-4 text-gray-500 text-sm">Searching...</p>
      )}

      {results.length > 0 && !loading && (
        <div className="w-full shadow rounded-md p-2 mt-2 max-h-[65vh] overflow-y-auto space-y-4">
          {results.map((item) => (
            <div
              key={item.id}
              className="w-full flex items-center justify-between hover:bg-gray-50 transition rounded-md p-1"
            >
              <div className="flex items-center gap-2">
                <Image
                  src={item.album || "/placeholder.jpg"}
                  width={70}
                  height={70}
                  alt={item.name}
                  className="rounded-md"
                />
                <div className="flex flex-col items-start justify-center">
                  <p className="text-base font-medium leading-tight">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">{item.artist}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => handleAddToPlaylist(item)}>
                Add
              </Button>
            </div>
          ))}
        </div>
      )}
      {playlist.length > 0 && (
        <div className="w-full shadow rounded-md p-2 mt-2 max-h-[65vh] overflow-y-auto space-y-4">
          {playlist.map((item) => (
            <div
              key={item.id}
              className="w-full flex items-center justify-between hover:bg-gray-50 transition rounded-md p-1"
            >
              <div className="flex items-center gap-2">
                <Image
                  src={item.metadata?.album || "/placeholder.jpg"}
                  width={70}
                  height={70}
                  alt={item.metadata?.name}
                  className="rounded-md"
                />
                <div className="flex flex-col items-start justify-center">
                  <p className="text-base font-medium leading-tight">
                    {item.metadata?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.metadata?.artist}
                  </p>
                </div>
              </div>
              <p>Added by {item.added_by}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Playlist;
