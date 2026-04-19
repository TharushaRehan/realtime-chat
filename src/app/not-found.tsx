import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function NotFound() {
  return (
    <div className="w-full flex flex-col gap-y-5 items-center justify-center min-h-screen">
      <p className="text-3xl">404 - Page Not Found</p>
      <Link
        href={"/"}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "text-green-500 border-green-500 hover:text-green-500",
        )}
      >
        Start a private chat
      </Link>
    </div>
  );
}
