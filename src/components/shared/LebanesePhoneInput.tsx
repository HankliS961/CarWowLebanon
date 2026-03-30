"use client";

import { Label } from "@/components/ui/label";

interface LebanesePhoneInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  autoFocus?: boolean;
}

export function LebanesePhoneInput({
  id = "phone",
  label,
  value,
  onChange,
  hint,
  autoFocus,
}: LebanesePhoneInputProps) {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div
        className="flex items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        dir="ltr"
      >
        <span className="flex items-center gap-1.5 border-e px-3 text-sm text-muted-foreground select-none">
          <span>{"\u{1F1F1}\u{1F1E7}"}</span>
          <span>+961</span>
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          placeholder="3 XXX XXX"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d\s]/g, ""))}
          className="flex h-10 w-full bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
          autoComplete="tel-local"
          autoFocus={autoFocus}
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
