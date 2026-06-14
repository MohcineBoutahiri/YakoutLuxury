"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isValidEmail, isValidOtp } from "@/lib/validation";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { authService } from "@/services/auth.service";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    setEmail(window.localStorage.getItem("yakout_pending_email") ?? "");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const nextEmail = String(formData.get("email") ?? "").trim();
    const code = String(formData.get("code") ?? "").trim();
    const validationError =
      (!isValidEmail(nextEmail) ? "Veuillez saisir un email valide." : "") ||
      (!isValidOtp(code) ? "Le code OTP doit contenir 6 chiffres." : "");

    if (validationError) {
      setError(validationError);
      showToast("error", validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      await authService.verifyOtp({
        email: nextEmail,
        code,
      });
      window.localStorage.removeItem("yakout_pending_email");
      showToast("success", "Compte verifie. Vous pouvez vous connecter.");
      router.push("/login");
    } catch (submitError) {
      const message = getApiErrorMessage(submitError);
      setError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");
    setIsResending(true);

    try {
      const response = await authService.resendOtp({ email });
      setMessage(response.message);
      showToast("success", response.message);
    } catch (resendError) {
      const message = getApiErrorMessage(resendError);
      setError(message);
      showToast("error", message);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Verification"
      title="Confirmez votre email"
      description="Entrez le code a six chiffres envoye a votre adresse email pour activer votre compte client."
    >
      <Card>
        <CardContent className="p-6 sm:p-8">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
            <Input
              inputMode="numeric"
              label="Code OTP"
              maxLength={6}
              minLength={6}
              name="code"
              placeholder="000000"
              required
            />

            {error ? (
              <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="border border-luxury-beige bg-luxury-ivory px-4 py-3 text-sm text-luxury-text">
                {message}
              </p>
            ) : null}

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Verification..." : "Verifier mon compte"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm text-luxury-text sm:flex-row sm:items-center sm:justify-between">
            <button
              className="text-left font-medium text-luxury-black disabled:opacity-50"
              disabled={!email || isResending}
              onClick={handleResend}
              type="button"
            >
              {isResending ? "Envoi..." : "Renvoyer le code"}
            </button>
            <Link className="font-medium text-luxury-black" href="/login">
              Retour connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
