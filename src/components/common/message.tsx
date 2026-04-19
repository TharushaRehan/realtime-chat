import { useUsername } from "@/hooks/use-username";
import { format } from "date-fns";

type MessageProps = {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
};

const Message = ({ id, sender, text, timestamp }: MessageProps) => {
  const { username } = useUsername();
  return (
    <div key={id} className="flex flex-col items-start">
      <div className="max-w-[80%] group">
        <div className="flex items-baseline gap-3 mb-1">
          <span
            className={`text-xs font-bold ${sender === username ? "text-green-500" : "text-blue-500"}`}
          >
            {sender === username ? "You" : sender}
          </span>
          <span className="text-[10px] text-zinc-600">
            {format(timestamp, "Pp")}
          </span>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed break-all">
          {text}
        </p>
      </div>
    </div>
  );
};

export { Message };
