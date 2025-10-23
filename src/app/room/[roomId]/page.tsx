import React from "react";
import RoomDetailsPage from "./RoomDetailsPage";

async function page({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;

  return (
    <div className="w-full h-full">
      <RoomDetailsPage roomId={roomId} />
    </div>
  );
}

export default page;
