"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  labels,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="relative mb-2">
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-teal-500 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step dots and labels */}
      <div className="flex justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={stepNum} className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isCompleted && "bg-teal-500 text-white",
                  isCurrent && "bg-teal-500 text-white ring-4 ring-teal-500/20",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  stepNum
                )}
              </div>
              {labels && labels[i] && (
                <span
                  className={cn(
                    "mt-1.5 text-[10px] font-medium sm:text-xs",
                    isCurrent ? "text-teal-600" : "text-muted-foreground"
                  )}
                >
                  {labels[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;
