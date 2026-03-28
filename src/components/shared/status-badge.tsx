import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/** Renders a color-coded status badge based on the status enum value. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-700",
  };

  const label = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        colors.bg,
        colors.text,
        className
      )}
    >
      {label.toLowerCase()}
    </span>
  );
}
