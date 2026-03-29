"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === "ar";

  // Multi-step state
  const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=register
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Registration form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // OTP input refs
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // --- Mutations ---
  const sendOtpMutation = trpc.auth.sendOtp.useMutation({
    onSuccess: () => {
      setError("");
      setStep(2);
      setResendCooldown(60);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation({
    onSuccess: () => {
      setError("");
      setPhoneVerified(true);
      setStep(3);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.ok) {
        // Hard redirect to ensure session is picked up everywhere
        window.location.href = `/${locale}`;
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // --- Handlers ---
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone.trim()) {
      setError(isRtl ? "الرجاء إدخال رقم الهاتف" : "Please enter your phone number");
      return;
    }
    sendOtpMutation.mutate({ phone });
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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(isRtl ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError(
        isRtl
          ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
          : "Password must be at least 8 characters"
      );
      return;
    }

    registerMutation.mutate({
      name,
      email,
      password,
      phone,
    });
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: `/${locale}` });
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of full OTP
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
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

  // --- Step Indicator ---
  const StepIndicator = () => (
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
            <div
              className={`h-0.5 w-6 transition-colors ${
                s < step ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // --- WhatsApp Icon ---
  const WhatsAppIcon = () => (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] max-w-md flex-col items-center justify-center px-4 py-16">
      <Card className="w-full">
        <CardHeader className="text-center">
          <StepIndicator />
          <p className="text-xs text-muted-foreground mb-2">
            {t("step", { current: step, total: 3 })}
          </p>

          {/* Step 1 Header */}
          {step === 1 && (
            <>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <WhatsAppIcon />
              </div>
              <h1 className="text-2xl font-bold">{t("phoneStep")}</h1>
              <p className="text-sm text-muted-foreground">{t("phoneStepSubtitle")}</p>
            </>
          )}

          {/* Step 2 Header */}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold">{t("otpStep")}</h1>
              <p className="text-sm text-muted-foreground">{t("otpStepSubtitle")}</p>
            </>
          )}

          {/* Step 3 Header */}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold">{t("completeStep")}</h1>
              <p className="text-sm text-muted-foreground">{t("completeStepSubtitle")}</p>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error display */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* ========== STEP 1: Phone Number Entry ========== */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phoneLabel")}</Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t("phonePlaceholder")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="ps-10"
                    required
                    autoComplete="tel"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {isRtl
                    ? "ستستلم رمز التحقق على واتساب"
                    : "You'll receive a verification code on WhatsApp"}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={sendOtpMutation.isPending}
              >
                {sendOtpMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                {t("sendCode")}
              </Button>
            </form>
          )}

          {/* ========== STEP 2: OTP Verification ========== */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Phone number display with edit button */}
              <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span dir="ltr">{phone}</span>
                </div>
                <button
                  type="button"
                  onClick={goBack}
                  className="text-xs text-primary hover:underline"
                >
                  {isRtl ? "تعديل" : "Edit"}
                </button>
              </div>

              {/* 6-digit OTP input */}
              <div className="space-y-2">
                <Label>{isRtl ? "رمز التحقق" : "Verification Code"}</Label>
                <div className="flex justify-center gap-2" dir="ltr">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="h-12 w-12 text-center text-lg font-semibold p-0"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={verifyOtpMutation.isPending}
              >
                {verifyOtpMutation.isPending && (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                )}
                {t("verify")}
              </Button>

              {/* Resend code */}
              <div className="text-center space-y-1">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("resendIn", { seconds: resendCooldown })}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-primary hover:underline"
                    disabled={sendOtpMutation.isPending}
                  >
                    {t("resendCode")}
                  </button>
                )}
                <p className="text-xs text-muted-foreground">{t("didntReceive")}</p>
              </div>

              {/* Back button */}
              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2"
                onClick={goBack}
              >
                <BackArrow className="h-4 w-4" />
                {t("back")}
              </Button>
            </form>
          )}

          {/* ========== STEP 3: Complete Registration ========== */}
          {step === 3 && (
            <>
              {/* Verified phone badge */}
              <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>{t("phoneVerified")}</span>
                <span className="ms-auto font-mono text-xs" dir="ltr">
                  {phone}
                </span>
              </div>

              {/* Google Sign Up */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                type="button"
              >
                <svg className="me-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isRtl ? "المتابعة مع Google" : "Continue with Google"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {isRtl ? "أو" : "Or"}
                  </span>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("nameLabel")}</Label>
                  <div className="relative">
                    <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder={t("namePlaceholder")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="ps-10"
                      required
                      autoComplete="name"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("emailLabel")}</Label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="ps-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t("passwordLabel")}</Label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="ps-10 pe-10"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</Label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("confirmPasswordPlaceholder")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="ps-10"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending && (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  )}
                  {t("submit")}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  {t("terms")}{" "}
                  <Link href="/legal/terms" className="text-primary hover:underline">
                    {t("termsLink")}
                  </Link>{" "}
                  &{" "}
                  <Link href="/legal/privacy" className="text-primary hover:underline">
                    {t("privacyLink")}
                  </Link>
                </p>
              </form>

              {/* Back button */}
              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2"
                onClick={goBack}
              >
                <BackArrow className="h-4 w-4" />
                {t("back")}
              </Button>
            </>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              {t("signIn")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
