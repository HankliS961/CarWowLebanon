# Development Bypasses — REVERT BEFORE PRODUCTION

All bypasses are gated behind `process.env.NODE_ENV === "development"` so they only
apply when running locally with `npm run dev`. They will NOT activate in a production
build (`npm run build && npm start`) since Next.js sets `NODE_ENV=production` there.

However, you should still remove these blocks before deploying to make the code clean.

---

## 1. OTP Bypass (WhatsApp verification codes)

**File:** `src/server/routers/auth.ts`

**What it does:** Instead of generating a random 6-digit code and sending it via
Twilio WhatsApp, a fixed code `000000` is stored in the DB and logged to the console.
The verify step also accepts `000000` without a full DB lookup.

**How to test:** Enter any phone number, then type `000000` as the OTP code.

**Procedures affected (3):**

| Procedure | What to find | Line hint |
|-----------|-------------|-----------|
| `sendOtp` | `[DEV BYPASS] Skip Twilio — use fixed code 000000` | Near line 91 |
| `verifyOtp` | `[DEV BYPASS] Accept fixed code 000000 without DB lookup` | Near line 143 |
| `resetPasswordRequest` | `[DEV BYPASS] Skip Twilio — use fixed code 000000` | Near line 180 |
| `resetPassword` | `[DEV BYPASS] Accept fixed code 000000` | Near line 230 |

**How to revert:** In each procedure, find the `// [DEV BYPASS]` comment block. Delete
the entire `if (process.env.NODE_ENV === "development") { ... }` block and its contents.
The production code immediately below it will then execute unconditionally.

---

## 2. Email Bypass (Resend notifications)

**File:** `src/lib/notifications/email.ts`

**What it does:** Skips all email sending and logs recipient + subject to the console.

**What to find:** `[DEV BYPASS] Email skipped` (inside the `sendEmail` function, near line 18)

**How to revert:** Delete this block:
```typescript
// [DEV BYPASS] Skip all email sending — log to console instead
// REVERT: Remove this block
if (process.env.NODE_ENV === "development") {
  console.log(`[DEV BYPASS] Email skipped → to: ${payload.to}, subject: ${payload.subject}`);
  return { success: true };
}
```

---

## 3. WhatsApp Notification Bypass (Twilio messages)

**File:** `src/lib/notifications/whatsapp.ts`

**What it does:** Skips all WhatsApp message sending and logs recipient + body preview
to the console. Returns `true` so callers think it succeeded.

**What to find:** `[DEV BYPASS] WhatsApp skipped` (inside `sendWhatsAppMessage`, near line 34)

**How to revert:** Delete this block:
```typescript
// [DEV BYPASS] Skip all WhatsApp sending — log to console instead
// REVERT: Remove this block
if (process.env.NODE_ENV === "development") {
  console.log(`[DEV BYPASS] WhatsApp skipped → to: ${to}, body: ${body.slice(0, 80)}...`);
  return true;
}
```

---

## Quick Revert Checklist

Search the entire codebase for `[DEV BYPASS]` to find all bypasses:

```bash
grep -rn "\[DEV BYPASS\]" src/
```

This should return exactly **6 matches** across 3 files:

| # | File | Block to remove |
|---|------|-----------------|
| 1 | `src/server/routers/auth.ts` | `sendOtp` dev bypass |
| 2 | `src/server/routers/auth.ts` | `verifyOtp` dev bypass |
| 3 | `src/server/routers/auth.ts` | `resetPasswordRequest` dev bypass |
| 4 | `src/server/routers/auth.ts` | `resetPassword` dev bypass |
| 5 | `src/lib/notifications/email.ts` | `sendEmail` dev bypass |
| 6 | `src/lib/notifications/whatsapp.ts` | `sendWhatsAppMessage` dev bypass |

After removing all 6, run `npx tsc --noEmit` to confirm no type errors.
