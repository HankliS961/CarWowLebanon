"use client";

import { useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
}

export function OtpInput({ value, onChange, label }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      if (inputValue.length > 1) {
        // Handle paste of full OTP
        const digits = inputValue.replace(/\D/g, "").slice(0, 6).split("");
        const newOtp = [...value];
        digits.forEach((d, i) => {
          if (index + i < 6) newOtp[index + i] = d;
        });
        onChange(newOtp);
        const nextIndex = Math.min(index + digits.length, 5);
        refs.current[nextIndex]?.focus();
        return;
      }

      if (inputValue && !/^\d$/.test(inputValue)) return;

      const newOtp = [...value];
      newOtp[index] = inputValue;
      onChange(newOtp);

      if (inputValue && index < 5) {
        refs.current[index + 1]?.focus();
      }
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !value[index] && index > 0) {
        refs.current[index - 1]?.focus();
      }
    },
    [value]
  );

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex justify-center gap-2" dir="ltr">
        {value.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="h-12 w-12 text-center text-lg font-semibold p-0"
            autoFocus={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
