"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/routing";
import { trpc } from "@/lib/trpc/client";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveCarButtonProps {
  carId: string;
  /** Visual variant — "overlay" renders as a round icon over the card image,
   *  "inline" renders as a standard button (used in sidebars, etc.). */
  variant?: "overlay" | "inline";
  className?: string;
}

/**
 * Heart / save-car toggle button.
 * Checks auth, calls the tRPC savedCars.toggle mutation, and shows
 * filled-red vs outline heart based on the current saved state.
 */
export function SaveCarButton({
  carId,
  variant = "overlay",
  className,
}: SaveCarButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const utils = trpc.useUtils();

  // Only query saved status when the user is logged in
  const { data: savedStatus } = trpc.savedCars.isSaved.useQuery(
    { carId },
    { enabled: !!session },
  );

  const toggleSave = trpc.savedCars.toggle.useMutation({
    onSuccess: () => {
      utils.savedCars.isSaved.invalidate({ carId });
      utils.savedCars.list.invalidate();
    },
  });

  const isSaved = savedStatus?.saved ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/auth/login");
      return;
    }

    toggleSave.mutate({ carId });
  };

  if (variant === "overlay") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={toggleSave.isPending}
        className={cn(
          "absolute end-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white",
          toggleSave.isPending && "opacity-50",
          className,
        )}
        aria-label={isSaved ? "Unsave car" : "Save car"}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            isSaved
              ? "fill-red-500 text-red-500"
              : "text-muted-foreground hover:text-coral",
          )}
        />
      </button>
    );
  }

  // "inline" variant — used inside sidebars / detail pages
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggleSave.isPending}
      className={cn(
        "inline-flex items-center gap-1.5",
        toggleSave.isPending && "opacity-50",
        className,
      )}
      aria-label={isSaved ? "Unsave car" : "Save car"}
    >
      <Heart
        size={14}
        className={cn(
          "transition-colors",
          isSaved ? "fill-coral text-coral" : "",
        )}
      />
    </button>
  );
}

export default SaveCarButton;
