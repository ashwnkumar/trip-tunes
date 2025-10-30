import CreateRoom from "@/components/CreateRoom";
import JoinRoom from "@/components/JoinRoom";
import { Music2, Users, Sparkles } from "lucide-react";

export default function page() {
  return (
    <div className="w-full min-h-screen">
      <div className="flex h-full w-full flex-col items-center justify-start  gap-12 px-4 py-12">

        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-5xl font-bold text-primary">
              Trip Tunes
            </h1>
          </div>

          <p className="text-xl text-gray-600 font-medium">
            The ultimate road trip playlist experience
          </p>

          <p className="text-muted-foreground max-w-md mx-auto">
            Create a room, invite your friends, and build your perfect
            travel soundtrack together — live and in sync. Whether you're
            cruising down the highway or stuck in traffic, the vibes never stop.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <CreateRoom />
          <JoinRoom />
        </div>

      </div>
    </div>
  );
}
