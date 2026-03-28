"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";

export interface WizardStep {
  /** Step title in English. */
  title: string;
  /** Step title in Arabic. */
  titleAr: string;
}

export interface StepWizardProps {
  /** Array of step configurations. */
  steps: WizardStep[];
  /** Current active step (0-indexed). */
  currentStep: number;
  /** Callback when step changes. */
  onStepChange: (step: number) => void;
  /** The content for the current step. */
  children: React.ReactNode;
  /** Whether the "Continue" button should be disabled. */
  continueDisabled?: boolean;
  /** Custom label for the final step's continue button. */
  submitLabel?: string;
  /** Custom Arabic label for the final step's continue button. */
  submitLabelAr?: string;
  /** Callback when the form is submitted (last step continue). */
  onSubmit?: () => void;
  /** Additional CSS classes. */
  className?: string;
}

export function StepWizard({
  steps,
  currentStep,
  onStepChange,
  children,
  continueDisabled = false,
  submitLabel = "Submit",
  submitLabelAr = "إرسال",
  onSubmit,
  className,
}: StepWizardProps) {
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onSubmit?.();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Progress bar */}
      <div className="mb-6">
        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            const stepTitle =
              locale === "ar" ? step.titleAr : step.title;

            return (
              <React.Fragment key={index}>
                {/* Step circle + label */}
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      // Only allow navigation to completed steps
                      if (isCompleted) onStepChange(index);
                    }}
                    disabled={!isCompleted}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors sm:h-10 sm:w-10",
                      isCompleted &&
                        "bg-teal-500 text-white hover:bg-teal-600 cursor-pointer",
                      isActive &&
                        "border-2 border-teal-500 bg-teal-50 text-teal-700",
                      !isCompleted &&
                        !isActive &&
                        "border-2 border-border bg-background text-muted-foreground"
                    )}
                    aria-label={`${stepTitle} - ${
                      isCompleted
                        ? "Completed"
                        : isActive
                          ? "Current"
                          : "Upcoming"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {isCompleted ? (
                      <Check size={16} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </button>
                  <span
                    className={cn(
                      "hidden text-xs font-medium sm:block",
                      isActive
                        ? "text-teal-700"
                        : isCompleted
                          ? "text-charcoal"
                          : "text-muted-foreground"
                    )}
                  >
                    {stepTitle}
                  </span>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1 rounded-full sm:mx-4",
                      index < currentStep ? "bg-teal-500" : "bg-border"
                    )}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile: show current step label */}
        <p className="mt-3 text-center text-sm font-medium text-charcoal sm:hidden">
          {locale === "ar"
            ? steps[currentStep].titleAr
            : steps[currentStep].title}
        </p>

        {/* Progress percentage bar */}
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
            role="progressbar"
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-label={`Step ${currentStep + 1} of ${steps.length}`}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1">{children}</div>

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isFirstStep}
          className={cn(isFirstStep && "invisible")}
        >
          {tc("back")}
        </Button>

        <Button
          onClick={handleNext}
          disabled={continueDisabled}
        >
          {isLastStep
            ? locale === "ar"
              ? submitLabelAr
              : submitLabel
            : tc("next")}
        </Button>
      </div>
    </div>
  );
}

export default StepWizard;
