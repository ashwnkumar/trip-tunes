"use client";
import Placeholder from "@/components/Placeholder";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/contexts/GlobalContext";
import { dexieDB } from "@/lib/dexie";
import { Calendar, Menu, UserCircle, X, Music } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

const items = [
  { id: "joined", label: "Joined Rooms", icon: <Menu size={16} /> },
  { id: "created", label: "Created Rooms", icon: <UserCircle size={16} /> },
];

function Navbar() {
  const { localMember } = useGlobal();
  const [open, setOpen] = useState(false);
  const [joined, setJoined] = useState<Room[]>([]);
  const [created, setCreated] = useState<Room[]>([]);
  const [tab, setTab] = useState("joined");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (!localMember || Object.keys(localMember).length === 0) return;
    const getRoomData = async () => {
      try {
        const userData = await dexieDB.members.get(localMember?.id);
        if (userData) {
          setJoined(userData.joined);
          setCreated(userData.created);
        }
      } catch (error) {
        console.error("Error getting room data", error);
        toast.error("Error getting room data");
      }
    };

    getRoomData();
  }, [localMember]);

  const currentRooms = tab === "joined" ? joined : created;

  return (
    <div className="w-full flex items-center justify-between px-4 lg:px-8 py-4 border-b border-border bg-card sticky top-0 z-50">
      <Link href={"/"} className="group">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
            <Music className="text-primary-foreground" size={24} />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Trip Tunes
          </h1>
        </div>
      </Link>

      {localMember && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-muted transition-colors border border-border"
          >
            <Placeholder name={localMember.name} size={32} />
            <span className="hidden sm:inline text-sm font-medium text-foreground">
              {localMember.name}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/50">
                <div className="flex items-center gap-3">
                  <Placeholder name={localMember.name} size={40} />
                  <div>
                    <p className="font-semibold text-foreground">
                      {localMember.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your Profile
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex border-b border-border bg-muted/30">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      tab === item.id
                        ? "text-primary border-b-2 border-primary bg-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {item.icon}
                      <span className="hidden sm:inline">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="max-h-64 overflow-y-auto">
                {currentRooms.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No rooms found
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    {currentRooms.map((room) => (
                      <Link
                        key={room.id}
                        href={`/room/${room.id}`}
                        onClick={() => setOpen(false)}
                        className="block p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Music className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {room.name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(room.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Navbar;
