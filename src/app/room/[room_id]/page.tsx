"use client";

import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRealtime } from "@/lib/realtime-client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Message } from "@/components/common";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyButton } from "@/components/animate-ui/components/buttons/copy";

function formatTimeRemaining(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

const RoomPage = () => {
  const params = useParams();
  const room_id = params.room_id as string;
  const { username } = useUsername();
  const router = useRouter();

  const link = typeof window === "undefined" ? "" : window.location.href;
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const messageRef = useRef<HTMLInputElement>(null);
  const hasShownOneMinuteToast = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: ttlData } = useQuery({
    queryKey: ["ttl", room_id],
    queryFn: async () => {
      const res = await client.room.ttl.get({ query: { room_id } });
      return res.data;
    },
  });

  useEffect(() => {
    if (ttlData?.ttl !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeRemaining(ttlData.ttl);
    }
  }, [ttlData]);

  useEffect(() => {
    if (
      timeRemaining !== null &&
      timeRemaining <= 60 &&
      !hasShownOneMinuteToast.current
    ) {
      toast.warning("Only 1 minute left.", {
        position: "top-center",
      });
      hasShownOneMinuteToast.current = true;
    }
  }, [timeRemaining]);

  const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      await client.messages.post(
        {
          sender: username,
          text,
          room_id,
        },
        { query: { room_id } },
      );
      setMessage("");
    },
  });

  const { mutate: destroyRoom, isPending: isDestroyingRoom } = useMutation({
    mutationFn: async () => {
      await client.room.delete(room_id, { query: { room_id } });
    },
  });

  const { data: messages, refetch } = useQuery({
    queryKey: ["messages", room_id],
    queryFn: async () => {
      const res = await client.messages.get({ query: { room_id } });
      return res.data;
    },
  });

  useRealtime({
    channels: [room_id],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event }) => {
      if (event === "chat.message") {
        refetch();
      }
      if (event === "chat.destroy") {
        // send user back to homepage
        router.push("/?destroyed=true");
      }
    },
  });

  useEffect(() => {
    if (timeRemaining === null || timeRemaining < 0) return;

    if (timeRemaining === 0) {
      router.push("/?destroyed=true");
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.messages.length]);

  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/30">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">Room ID</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-500">{room_id}</span>
              <CopyButton
                content={link}
                variant={"ghost"}
                size={"sm"}
                className="text-zinc-500"
              />
            </div>
          </div>
          <Separator orientation="vertical" />
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">
              Self Destruct
            </span>
            <span
              className={`text-sm font-bold flex items-center gap-2 ${timeRemaining !== null && timeRemaining < 60 ? "text-red-500" : "text-amber-500"}`}
            >
              {timeRemaining !== null
                ? formatTimeRemaining(timeRemaining)
                : "--:--"}
            </span>
          </div>
        </div>
        <Button
          onClick={() => destroyRoom()}
          variant={"destructive"}
          size={"sm"}
          disabled={isDestroyingRoom}
          className="min-w-28"
        >
          {isDestroyingRoom ? <Spinner /> : "DESTROY NOW"}
        </Button>
      </header>

      {/* MESSAGES */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-4 space-y-4">
          {messages?.messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-zinc-600 text-sm font-mono">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
          {messages?.messages.map((msg) => (
            <Message
              key={msg.id}
              id={msg.id}
              sender={msg.sender}
              text={msg.text}
              timestamp={msg.timestamp}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 animate-pulse">
              {`>`}
            </span>
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && message.trim()) {
                  sendMessage({ text: message });
                  messageRef.current?.focus();
                }
              }}
              placeholder="Type message..."
              autoFocus
              className="h-10 pl-8 pr-4 focus:outline-none focus-visible:ring-0"
            />
          </div>

          <Button
            onClick={() => {
              sendMessage({ text: message });
              messageRef.current?.focus();
            }}
            disabled={!message.trim() || isSendingMessage}
            size={"lg"}
            className="min-w-24"
          >
            {isSendingMessage ? <Spinner /> : "SEND"}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default RoomPage;
