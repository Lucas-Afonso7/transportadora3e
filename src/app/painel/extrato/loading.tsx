import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 mb-6 h-4 w-56" />
      <Skeleton className="h-48 w-full rounded-card" />
    </div>
  );
}
