"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface GlobalContextType {
  roomData: Room | null;
  setRoomData: (roomData: Room | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  isAdmin: boolean;
  localMember: Member | null;
  setLocalMember: (member: any) => void;
  removeLocalData: () => void;
  onlineMembers?: OnlinePresence[];
  setOnlineMembers?: (
    members: OnlinePresence[] | ((prev: OnlinePresence[]) => OnlinePresence[])
  ) => void;
  members?: Member[];
  setMembers?: (members: Member[] | ((prev: Member[]) => Member[])) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<OnlinePresence[]>([]);
  const [localMember, setLocalMember] = useState<Member | null>(null);
  const isAdmin = localMember?.role === "admin";

  const removeLocalData = () => {
    localStorage.removeItem("member");
    setLocalMember(null);
  };

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("member")!);
    if (local) {
      setLocalMember(local);
    }
  }, [router]);

  useEffect(() => {
    if (localMember) {
      localStorage.setItem("member", JSON.stringify(localMember));
    }
  }, [localMember, router]);

  return (
    <GlobalContext.Provider
      value={{
        roomData,
        setRoomData,
        loading,
        setLoading,
        isAdmin,
        localMember,
        removeLocalData,
        setLocalMember,
        onlineMembers,
        setOnlineMembers,
        members,
        setMembers,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
