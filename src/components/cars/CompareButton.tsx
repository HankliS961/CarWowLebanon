"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { GitCompareArrows } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CompareButtonProps {
  carId: string;
  variant?: "icon" | "small" | "inline";
  className?: string;
}

export function CompareButton({
  carId,
  variant = "small",
  className,
}: CompareButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: compareStatus } = trpc.compare.isInCompare.useQuery(
    { carId },
    { enabled: !!session },
  );

  const { data: compareCount } = trpc.compare.count.useQuery(undefined, {
    enabled: !!session,
  });

  const addMutation = trpc.compare.add.useMutation({
    onSuccess: () => {
      utils.compare.isInCompare.invalidate({ carId });
      utils.compare.list.invalidate();
      utils.compare.count.invalidate();
      toast.success("Added to compare", {
        action: {
          label: "View Compare",
          onClick: () => router.push("/tools/compare"),
        },
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const removeMutation = trpc.compare.remove.useMutation({
    onSuccess: () => {
      utils.compare.isInCompare.invalidate({ carId });
      utils.compare.list.invalidate();
      utils.compare.count.invalidate();
      toast.success("Removed from compare");
    },
  });

  if (!session) return null;

  const inCompare = compareStatus?.inCompare ?? false;
  const isPending = addMutation.isPending || removeMutation.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeMutation.mutate({ carId });
    } else if ((compareCount ?? 0) >= 3) {
      // List is full — take user to compare page to choose which car to replace
      toast.info("Compare list is full — choose a car to replace", {
        duration: 3000,
      });
      router.push(`/tools/compare?replace=${carId}`);
    } else {
      addMutation.mutate({ carId });
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          inCompare
            ? "bg-teal-500 text-white"
            : "bg-white/80 text-gray-600 hover:bg-teal-50 hover:text-teal-600 backdrop-blur-sm",
          isPending && "opacity-50",
          className,
        )}
        title={inCompare ? "Remove from compare" : "Add to compare"}
      >
        <GitCompareArrows className="h-4 w-4" />
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <Button
        variant={inCompare ? "default" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          inCompare && "bg-teal-500 hover:bg-teal-600",
          className,
        )}
      >
        <GitCompareArrows className="mr-1.5 h-3.5 w-3.5" />
        {inCompare ? "In Compare" : "Compare"}
      </Button>
    );
  }

  // "small" variant (default) — compact pill
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        inCompare
          ? "bg-teal-500 text-white hover:bg-teal-600"
          : "bg-muted text-muted-foreground hover:bg-teal-50 hover:text-teal-600",
        isPending && "opacity-50",
        className,
      )}
      title={inCompare ? "Remove from compare" : "Add to compare"}
    >
      <GitCompareArrows className="h-3 w-3" />
      {inCompare ? "In Compare" : "Compare"}
    </button>
  );
}

export default CompareButton;
