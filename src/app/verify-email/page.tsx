"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { applyActionCode } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/features/core/firebase/config";

type VerificationState = "verifying" | "success" | "redirecting" | "error";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<VerificationState>("verifying");
  const [message, setMessage] = useState("Verifying your email...");

  const oobCode = useMemo(() => searchParams.get("oobCode"), [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const verifyEmail = async () => {
      if (!oobCode) {
        if (!cancelled) {
          setState("error");
          setMessage("Missing verification code in the URL.");
        }
        return;
      }

      try {
        await applyActionCode(auth, oobCode);

        if (!cancelled) {
          setState("success");
          setMessage("Email verified successfully. Redirecting to login...");

          const timer = window.setTimeout(() => {
            router.replace("/admin/login");
          }, 1500);

          setState("redirecting");

          return () => window.clearTimeout(timer);
        }
      } catch (error) {
        console.error("Email verification error:", error);

        if (!cancelled) {
          setState("error");
          setMessage("This verification link is invalid or has expired.");
        }
      }
    };

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [oobCode, router]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Email Verification
        </h1>
        <p className="mt-4 text-slate-300">{message}</p>

        {(state === "verifying" || state === "redirecting") && (
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-cyan-400" />
            <span>
              {state === "verifying"
                ? "Checking verification link..."
                : "Taking you to login..."}
            </span>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {state === "error" && (
            <button
              type="button"
              onClick={() => router.push("/admin/login")}
              className="rounded-lg bg-slate-700 px-4 py-2 text-slate-100 font-medium hover:bg-slate-600 transition-colors"
            >
              Back to Login
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function VerifyEmailFallback() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Email Verification
        </h1>
        <p className="mt-4 text-slate-300">Loading verification data...</p>
        <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-cyan-400" />
          <span>Preparing verification...</span>
        </div>
      </section>
    </main>
  );
}
