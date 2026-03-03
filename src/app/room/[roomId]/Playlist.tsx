import InputComponent from "@/components/form/InputComponent";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/contexts/GlobalContext";
import { getSpotifyAccessToken } from "@/lib/spotifyHelper";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Music, Search, Clock, User, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatTimeAgo } from "@/lib/formatTimeAgo";

function Playlist() {
  const { roomData, localMember, isAdmin } = useGlobal();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SongDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<PlaylistItem | null>(null);

  const handleAddToPlaylist = async (song: SongDetails) => {
    const { error } = await supabase
      .from("songs")
      .insert({
        room_id: roomData?.id || "",
        member_id: localMember?.id || "",
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
      toast.error(error.message || "Something went wrong");
      return;
    }
    setQuery("");
    setResults([]);
    toast.success("A song was added to playlist!");
  };

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const token = await getSpotifyAccessToken();

      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          searchTerm,
        )}&type=track&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error(`Spotify API error (${res.status})`);
      const data = await res.json();

      const tracks = data?.tracks?.items || [];
      const mapped: SongDetails[] = tracks.map((item: any) => ({
        id: item.id,
        name: item.name,
        artist: item.artists?.[0]?.name ?? "Unknown Artist",
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

  const handleRemoveSong = async (songId: string) => {
    const { error } = await supabase
      .from("songs")
      .delete()
      .match({ id: songId, room_id: roomData?.id });

    if (error) {
      console.error("Error deleting song:", error);
      toast.error(error.message || "Something went wrong");
      return;
    }

    setSelected(null);
    setOpen(false);
  };

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
          `,
        )
        .eq("room_id", roomData?.id)
        .order("added_at", { ascending: false });

      if (error) {
        toast.error(error.message || "Something went wrong");
        return;
      }

      const mapped: PlaylistItem[] = (data || []).map((row: any) => ({
        id: row.id,
        metadata: row.metadata,
        added_at: row.added_at,
        added_by: Array.isArray(row.added_by)
          ? (row.added_by[0]?.name ?? "Unknown")
          : (row.added_by?.name ?? row.added_by ?? "Unknown"),
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
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { data: member } = await supabase
              .from("members")
              .select("name")
              .eq("id", payload.new.member_id)
              .single();

            setPlaylist((prev) => [
              {
                id: payload.new.id,
                metadata: payload.new.metadata,
                added_at: payload.new.added_at,
                added_by: member?.name || "Unknown",
              } as PlaylistItem,
              ...prev,
            ]);
            toast.success(`${payload.new.name} was added to playlist`);
          }
          if (payload.eventType === "DELETE") {
            setPlaylist((prev) => {
              const toRem = prev.find((item) => item.id === payload.old.id);
              toast.info(`${toRem?.metadata?.name} was removed from playlist`);
              return prev.filter((item) => item.id !== payload.old.id);
            });
          }
        },
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actionButtons: ConfirmActionButton[] = [
    {
      label: "Cancel",
      onClick: () => {
        setOpen(false);
        setSelected(null);
      },
      variant: "secondary",
    },
    {
      label: "Yes, Remove",
      onClick: () => {
        if (selected?.id) {
          handleRemoveSong(selected?.id);
        }
      },
      variant: "destructive",
      className: "focus:ring-red-600",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Search Section */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <InputComponent
            id="query"
            name="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 w-full"
            placeholder="Search for songs, artists, albums..."
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="absolute w-full bg-white border border-gray-200 shadow-lg rounded-lg mt-2 p-8 z-50">
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Searching...</p>
            </div>
          </div>
        )}

        {results.length > 0 && !loading && (
          <>
            <div
              className="fixed inset-0  z-40"
              onClick={() => setResults([])}
            />
            <div className="absolute w-full bg-white border border-gray-200 shadow-xl rounded-lg mt-2 max-h-[500px] overflow-y-auto z-50">
              <div className="p-2 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2">
                  Search Results
                </p>
              </div>
              <div className="p-2 space-y-1">
                {results.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between hover:bg-gray-50 transition-all duration-200 rounded-lg p-2 group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <Image
                          src={item.album || "/placeholder.jpg"}
                          width={56}
                          height={56}
                          alt={item.name}
                          className="rounded-md shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-md" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.artist}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddToPlaylist(item)}
                      className="ml-2 flex-shrink-0"
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Playlist Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">
            Playlist
            {playlist.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({playlist.length} {playlist.length === 1 ? "song" : "songs"})
              </span>
            )}
          </h2>
        </div>

        {playlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-border rounded-xl bg-muted/30">
            <Music className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm font-medium mb-1">
              No songs yet
            </p>
            <p className="text-muted-foreground/70 text-xs">
              Search and add songs to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {playlist.map((item) => (
              <div
                key={item.id}
                className="group bg-card border border-border hover:border-accent/50 hover:shadow-md transition-all duration-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={item.metadata?.album || "/placeholder.jpg"}
                      width={72}
                      height={72}
                      alt={item.metadata?.name}
                      className="rounded-md shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all rounded-md" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 leading-tight truncate">
                      {item.metadata?.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5 truncate">
                      {item.metadata?.artist}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{item.added_by}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTimeAgo(item.added_at)}</span>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      onClick={() => {
                        setOpen(true);
                        setSelected(item);
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
      </div>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Remove ${selected?.metadata?.name}?`}
        description={`This song was added by ${selected?.added_by}. Are you sure you want to remove it? This action cannot be undone.`}
        actionButtons={actionButtons}
      />
    </div>
  );
}

export default Playlist;
