import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-7 w-28" />
      <Skeleton className="mt-2 mb-6 h-4 w-72" />
      <Skeleton className="h-72 w-full rounded-card" />
    </div>
  );
}
