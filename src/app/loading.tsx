import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="w-full flex items-center justify-center min-h-screen gap-x-2">
      <Spinner />
      <p>Loading...</p>
    </div>
  );
}
