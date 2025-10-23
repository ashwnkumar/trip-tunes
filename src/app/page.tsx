import CreateRoom from "@/components/CreateRoom";
import JoinRoom from "@/components/JoinRoom";

export default function page() {
  return (
    <div className="w-full">
      <div className="flex h-full w-full flex-col items-center justify-center max-h-[80vh] gap-10">
        <h1 className="text-4xl font-semibold">Welcome to Trip Tunes</h1>
        <div className="flex flex-col items-center justify-center gap-5">
          <CreateRoom />
          <JoinRoom />
        </div>
      </div>
    </div>
  );
}
