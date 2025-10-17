import CreateRoom from "@/components/CreateRoom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function page() {
  return (
    <div className="w-full">
      <div className="flex h-full w-full flex-col items-center justify-center max-h-[80vh] gap-10">
        <h1 className="text-4xl font-semibold">Welcome to Trip Tunes</h1>
        <div className="flex flex-col items-center justify-center gap-5">
          <CreateRoom />
          <Button className="text-lg" size={"lg"} variant={"outline"}><LogIn /> Join Room</Button>
        </div>
      </div>
    </div>
  );
}