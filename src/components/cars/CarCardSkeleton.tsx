import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CarCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm",
        className
      )}
    >
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="flex flex-col p-4">
        <Skeleton className="h-5 w-3/4" />
        <div className="mt-2 flex gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="mt-3 h-3 w-1/2" />
        <Skeleton className="mt-4 h-6 w-24" />
        <Skeleton className="mt-1 h-3 w-20" />
      </div>
    </div>
  );
}

export default CarCardSkeleton;
