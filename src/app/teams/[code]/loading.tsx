import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function TeamLoading() {
  return (
    <div className="flex flex-col gap-4">
      <LoadingSkeleton className="h-40 w-full" />
      <LoadingSkeleton className="h-48 w-full" />
    </div>
  );
}
