"use client";
import { createContext, useContext, useState } from "react";

interface GlobalContextType {
  roomData: Room | null;
  setRoomData: (roomData: Room | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  return (
    <GlobalContext.Provider
      value={{ roomData, setRoomData, loading, setLoading }}
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
