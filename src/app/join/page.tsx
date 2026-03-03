"use client";
import InputComponent from "@/components/form/InputComponent";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/contexts/GlobalContext";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, Check, Loader2, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

function Page() {
  const { setLocalMember } = useGlobal();
  const { loading, setLoading, roomData, setRoomData } = useGlobal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("code");

  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: insertError } = await supabase
      .from("members")
      .insert([{ name, room_id: roomData?.id }])
      .select()
      .single();

    if (insertError) {
      setError(insertError.message || "Something went wrong");
      toast.error(insertError.message || "Something went wrong");
      setLoading(false);
      return;
    }

    toast.success("Joined room successfully!");
    setLoading(false);
    setName("");
    setRoomData(null);
    setLocalMember(data);
    router.push(`/room/${roomData?.id}`);
  };

  const init = async () => {
    setLoading(true);
    setError("");

    const local = JSON.parse(localStorage.getItem("member") || "{}");
    if (local?.id) {
      const { data: existing } = await supabase
        .from("members")
        .select("*")
        .eq("id", local.id)
        .single();

      if (existing) {
        toast.success(`Welcome back ${existing.name}!`);
        setLocalMember(existing);
        router.push(`/room/${existing.room_id}`);
        return;
      }
    }

    const { data, error: fetchError } = await supabase
      .from("rooms")
      .select("*")
      .eq("room_code", roomCode)
      .single();

    if (fetchError) {
      setError("Room not found. Please check the code and try again.");
      toast.error("Room not found");
      setLoading(false);
      return;
    }

    setRoomData(data);
    toast.success("Room found! Ready to join");
    setLoading(false);
  };

  useEffect(() => {
    if (roomCode) {
      init();
    }
  }, [roomCode]);

  return (
    <div className="min-h-screen w-full flex items-start justify-center py-12 p-4">
      <div className="w-full max-w-md">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-slate-900">
                  Finding your room...
                </p>
                <p className="text-sm text-slate-500">
                  This will only take a moment
                </p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-slate-900">
                  Room Not Found
                </p>
                <p className="text-sm text-slate-600">{error}</p>
              </div>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="mt-4"
              >
                Go Back
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 border">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Join Room
              </h1>
              <p className="text-slate-600">Enter your name to join the room</p>
            </div>

            {/* Room Info Card */}
            {roomData && (
              <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/40">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      Room Name:{" "}
                      <span className="text-primary font-medium">
                        {roomData.name}
                      </span>
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Room found and ready to join
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <InputComponent
                  label="Your Name"
                  placeholder="e.g., John Doe"
                  type="text"
                  id="name"
                  name="name"
                  className="w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500">
                  This name will be visible to other room members
                </p>
              </div>

              <Button
                disabled={!roomData || !name || loading}
                type="submit"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    Join Room
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
