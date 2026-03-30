"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LebanesePhoneInput } from "@/components/shared/LebanesePhoneInput";
import { OtpInput } from "@/components/shared/OtpInput";
import { Loader2, Phone, MessageCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { getFullPhone } from "@/lib/phone";

export default function VerifyPhonePage() {
  const t = useTranslations("auth.register");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}`;

  const [step, setStep] = useState<1 | 2>(1);
  const [localPhone, setLocalPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const sendOtpMutation = trpc.auth.sendOtp.useMutation({
    onSuccess: () => {
      setError("");
      setStep(2);
      setResendCooldown(60);
    },
    onError: (err) => setError(err.message),
  });

  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation({
    onSuccess: () => {
      setError("");
      linkPhoneMutation.mutate({ phone });
    },
    onError: (err) => setError(err.message),
  });

  const linkPhoneMutation = trpc.auth.linkPhone.useMutation({
    onSuccess: async () => {
      await updateSession({ phone });
      window.location.href = callbackUrl;
    },
    onError: (err) => setError(err.message),
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const digits = localPhone.replace(/\D/g, "");
    if (digits.length < 6) {
      setError(isRtl ? "الرجاء إدخال رقم هاتف صالح" : "Please enter a valid phone number");
      return;
    }
    const fullPhone = getFullPhone(localPhone);
    setPhone(fullPhone);
    sendOtpMutation.mutate({ phone: fullPhone });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError(isRtl ? "الرجاء إدخال الرمز المكون من 6 أرقام" : "Please enter the 6-digit code");
      return;
    }
    verifyOtpMutation.mutate({ phone, otp: otpValue });
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    setError("");
    sendOtpMutation.mutate({ phone });
    setResendCooldown(60);
  };

  const isPending = sendOtpMutation.isPending || verifyOtpMutation.isPending || linkPhoneMutation.isPending;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] max-w-md flex-col items-center justify-center px-4 py-16">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Phone className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold">
            {isRtl ? "أكمل حسابك" : "Complete Your Account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRtl
              ? "يجب التحقق من رقم هاتفك عبر واتساب للمتابعة"
              : "You need to verify your phone number via WhatsApp to continue"}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {/* Step 1: Phone number */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <LebanesePhoneInput
                label={t("phoneLabel")}
                value={localPhone}
                onChange={setLocalPhone}
                hint={isRtl ? "ستستلم رمز التحقق على واتساب" : "You'll receive a verification code on WhatsApp"}
                autoFocus
              />
              <Button type="submit" className="w-full gap-2" disabled={sendOtpMutation.isPending}>
                {sendOtpMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                {t("sendCode")}
              </Button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span dir="ltr">{phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(["", "", "", "", "", ""]); setError(""); }}
                  className="text-xs text-primary hover:underline"
                >
                  {isRtl ? "تعديل" : "Edit"}
                </button>
              </div>

              <OtpInput
                value={otp}
                onChange={setOtp}
                label={isRtl ? "رمز التحقق" : "Verification Code"}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="me-2 h-4 w-4" />
                )}
                {isPending ? (isRtl ? "جارٍ التحقق..." : "Verifying...") : t("verify")}
              </Button>

              <div className="text-center space-y-1">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-muted-foreground">{t("resendIn", { seconds: resendCooldown })}</p>
                ) : (
                  <button type="button" onClick={handleResendOtp} className="text-sm text-primary hover:underline" disabled={sendOtpMutation.isPending}>
                    {t("resendCode")}
                  </button>
                )}
                <p className="text-xs text-muted-foreground">{t("didntReceive")}</p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
