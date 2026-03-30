"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { LebanesePhoneInput } from "@/components/shared/LebanesePhoneInput";
import { OtpInput } from "@/components/shared/OtpInput";
import { Link } from "@/i18n/routing";
import {
  Loader2,
  Phone,
  Lock,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { getFullPhone } from "@/lib/phone";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === "ar";

  // Multi-step state
  const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=new password
  const [localPhone, setLocalPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);

  // New password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // --- Mutations ---
  const resetRequestMutation = trpc.auth.resetPasswordRequest.useMutation({
    onSuccess: () => {
      setError("");
      setStep(2);
      setResendCooldown(60);
    },
    onError: (err) => setError(err.message),
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setError("");
      setSuccess(true);
    },
    onError: (err) => setError(err.message),
  });

  // --- Handlers ---
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const digits = localPhone.replace(/\D/g, "");
    if (digits.length < 6) {
      setError(isRtl ? "الرجاء إدخال رقم هاتف صالح" : "Please enter a valid phone number");
      return;
    }
    const fullPhone = getFullPhone(localPhone);
    setPhone(fullPhone);
    resetRequestMutation.mutate({ phone: fullPhone });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError(isRtl ? "الرجاء إدخال الرمز المكون من 6 أرقام" : "Please enter the 6-digit code");
      return;
    }
    // Move to step 3 (we verify with the password reset call)
    setStep(3);
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    setError("");
    resetRequestMutation.mutate({ phone });
    setResendCooldown(60);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(isRtl ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError(
        isRtl
          ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
          : "Password must be at least 8 characters"
      );
      return;
    }

    const otpValue = otp.join("");
    resetPasswordMutation.mutate({ phone, otp: otpValue, newPassword });
  };

  const goBack = () => {
    setError("");
    if (step === 2) {
      setOtp(["", "", "", "", "", ""]);
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  // --- WhatsApp Icon ---
  const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  // --- Success State ---
  if (success) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-200px)] max-w-md flex-col items-center justify-center px-4 py-16">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400 text-center">
              {t("success")}
            </div>
            <Button asChild className="w-full">
              <Link href="/auth/login">{t("backToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] max-w-md flex-col items-center justify-center px-4 py-16">
      <Card className="w-full">
        <CardHeader className="text-center">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    s === step
                      ? "bg-primary text-primary-foreground"
                      : s < step
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`h-0.5 w-6 transition-colors ${s < step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {t("step", { current: step, total: 3 })}
          </p>

          {step === 1 && (
            <>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <WhatsAppIcon />
              </div>
              <h1 className="text-2xl font-bold">{t("phoneStep")}</h1>
              <p className="text-sm text-muted-foreground">{t("phoneStepSubtitle")}</p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold">{t("otpStep")}</h1>
              <p className="text-sm text-muted-foreground">{t("otpStepSubtitle")}</p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold">{t("newPasswordStep")}</h1>
              <p className="text-sm text-muted-foreground">{t("newPasswordStepSubtitle")}</p>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {/* ========== STEP 1: Phone Number ========== */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <LebanesePhoneInput
                label={isRtl ? "رقم الهاتف *" : "Phone Number *"}
                value={localPhone}
                onChange={setLocalPhone}
                hint={isRtl ? "ستستلم رمز إعادة التعيين على واتساب" : "You'll receive a reset code on WhatsApp"}
                autoFocus
              />

              <Button type="submit" className="w-full gap-2" disabled={resetRequestMutation.isPending}>
                {resetRequestMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                {t("sendCode")}
              </Button>

              <div className="text-center">
                <Link href="/auth/login" className="text-sm text-primary hover:underline">
                  {t("backToLogin")}
                </Link>
              </div>
            </form>
          )}

          {/* ========== STEP 2: OTP Verification ========== */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span dir="ltr">{phone}</span>
                </div>
                <button type="button" onClick={goBack} className="text-xs text-primary hover:underline">
                  {isRtl ? "تعديل" : "Edit"}
                </button>
              </div>

              <OtpInput
                value={otp}
                onChange={setOtp}
                label={isRtl ? "رمز إعادة التعيين" : "Reset Code"}
              />

              <Button type="submit" className="w-full">{t("verify")}</Button>

              <div className="text-center space-y-1">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-muted-foreground">{t("resendIn", { seconds: resendCooldown })}</p>
                ) : (
                  <button type="button" onClick={handleResendCode} className="text-sm text-primary hover:underline" disabled={resetRequestMutation.isPending}>
                    {t("resendCode")}
                  </button>
                )}
              </div>

              <Button type="button" variant="ghost" className="w-full gap-2" onClick={goBack}>
                <BackArrow className="h-4 w-4" />
                {t("back")}
              </Button>
            </form>
          )}

          {/* ========== STEP 3: New Password ========== */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("newPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="newPassword" type={showPassword ? "text" : "password"} placeholder={t("newPassword")} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="ps-10 pe-10" required minLength={8} autoComplete="new-password" autoFocus />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder={t("confirmPassword")} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="ps-10" required minLength={8} autoComplete="new-password" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
                {resetPasswordMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t("resetPassword")}
              </Button>

              <Button type="button" variant="ghost" className="w-full gap-2" onClick={goBack}>
                <BackArrow className="h-4 w-4" />
                {t("back")}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">{t("signUp")}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
