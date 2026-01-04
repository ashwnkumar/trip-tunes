"use client";
import Placeholder from "@/components/Placeholder";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/contexts/GlobalContext";
import { dexieDB } from "@/lib/dexie";
import { Calendar, Menu, UserCircle, X, Music } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState, useRef } from "react";
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

  console.log("joined", joined);
  console.log("created", created);

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
        console.log("userData", userData);
        console.log("userData", userData);
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
    <div className="w-full flex items-center justify-between px-4 py-3  border-b border-gray-200">
      <Link href={"/"} className="group">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-500 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
            <Music className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-600 bg-clip-text text-transparent">
            Trip Tunes
          </h1>
        </div>
      </Link>

      {localMember && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            type="button"
            className="hover:ring-2 hover:ring-orange-300 rounded-full transition-all"
          >
            <Placeholder name={localMember.name} size={40} />
          </button>

          {open && (
            <div className="absolute top-full right-0 mt-2 md:w-80 w-[95vw] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-500 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Placeholder name={localMember.name} size={48} />
                    <div>
                      <p className="font-semibold text-white text-lg">
                        {localMember.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 p-3 bg-gray-50 border-b">
                {items.map((item) => (
                  <Button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className="flex-1 gap-2"
                    variant={tab === item.id ? "default" : "ghost"}
                    size="sm"
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden">
                      {item.id === "joined" ? "Joined" : "Created"}
                    </span>
                  </Button>
                ))}
              </div>

              {/* Room List */}
              <div className="max-h-64 overflow-y-auto">
                {currentRooms.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Music size={48} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-medium">
                      No rooms {tab === "joined" ? "joined" : "created"} yet
                    </p>
                    <p className="text-sm mt-1">Start exploring music rooms!</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {currentRooms.map((room) => (
                      <Link
                        key={room.id}
                        href={`/room/${room.id}`}
                        className="block p-3 rounded-lg hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200"
                        onClick={() => setOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-400 rounded-lg flex items-center justify-center">
                            <Music size={20} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {room.name}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar size={12} />
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
