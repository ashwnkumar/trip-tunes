import React from "react";
import RoomDetailsPage from "./RoomDetailsPage";

async function page({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;

  return (
    <div className="w-full min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <RoomDetailsPage roomId={roomId} />
      </div>
    </div>
  );
}

export default page;
