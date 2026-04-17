"use client";

import { ErrorMessage } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { COLORS } from "@/theme";
import { useMutation } from "@tanstack/react-query";
import { ArrowUpRight, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";

const Page = () => {
  return (
    <Suspense>
      <Lobby />
    </Suspense>
  );
};

function Lobby() {
  const router = useRouter();
  const { username } = useUsername();
  const searchParams = useSearchParams();

  const destroyed = searchParams.get("destroyed") === "true";
  const error = searchParams.get("error");

  const { mutate: createRoom, isPending } = useMutation({
    mutationFn: async () => {
      const res = await client.room.create.post({
        created_by: username,
        connected: [],
        created_at: Date.now(),
      });
      if (res.status === 200) {
        router.push(`/room/${res.data?.room_id}`);
      }
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <DotPattern
        glow={true}
        className={cn(
          "mask-[radial-gradient(600px_circle_at_center,white,transparent)]",
        )}
      />
      <div className="w-full max-w-md space-y-8">
        {destroyed && (
          <ErrorMessage
            title="ROOM DESTROYED"
            description="All messages were permanently deleted."
          />
        )}
        {error === "room-not-found" && (
          <ErrorMessage
            title="ROOM NOT FOUND"
            description="This room may have expired or never existed. Please check the link and try again."
          />
        )}
        {error === "room-full" && (
          <ErrorMessage
            title="ROOM FULL"
            description="This room is at maximum capacity. Please try again later."
          />
        )}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-x-3">
            <Lock color={COLORS.green} size={24} />
            <h1 className="text-2xl font-bold tracking-tight text-green-500">
              {`private_chat`}
            </h1>
          </div>
          <p className="text-zinc-500 text-sm">
            A private, self-destructing chat room.
          </p>
        </div>
        <div className="border rounded-md border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
          <div className="space-y-5">
            <div className="space-y-4">
              <Label className="flex items-center text-zinc-500">
                Your Identity
              </Label>
              <Input
                value={username}
                onChange={() => {}}
                disabled
                className="h-10"
              />
            </div>
            <Button
              onClick={() => createRoom()}
              size={"lg"}
              className="w-full"
              disabled={isPending}
            >
              {isPending ? <Spinner /> : "Create New Room"}
            </Button>
          </div>
        </div>
        {/* <div className="flex items-center justify-center">
          <LiquidButton variant={"ghost"} size={"sm"}>
            Subscribe Now
            <ArrowUpRight />
          </LiquidButton>
        </div> */}
      </div>
    </main>
  );
}

export default Page;
