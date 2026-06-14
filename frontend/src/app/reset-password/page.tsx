"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isValidEmail, isValidOtp, validatePassword } from "@/lib/validation";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { authService } from "@/services/auth.service";

const RESET_EMAIL_KEY = "yakout_reset_email";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryEmail = params.get("email");
    setEmail(queryEmail ?? window.localStorage.getItem(RESET_EMAIL_KEY) ?? "");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const validationError =
      (!isValidEmail(normalizedEmail) ? "Veuillez saisir un email valide." : "") ||
      (!isValidOtp(otp) ? "Le code OTP doit contenir 6 chiffres." : "") ||
      validatePassword(newPassword) ||
      (!confirmPassword ? "La confirmation du mot de passe est requise." : "") ||
      (newPassword !== confirmPassword
        ? "Les mots de passe ne correspondent pas."
        : "");

    if (validationError) {
      setError(validationError);
      showToast("error", validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.resetPassword({
        email: normalizedEmail,
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      });
      window.localStorage.removeItem(RESET_EMAIL_KEY);
      setMessage(response.message);
      showToast("success", response.message);
      router.push("/login");
    } catch (submitError) {
      const nextError = getApiErrorMessage(submitError);
      setError(nextError);
      showToast("error", nextError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      const validationError = "Veuillez saisir un email valide.";
      setError(validationError);
      showToast("error", validationError);
      return;
    }

    setIsResending(true);

    try {
      const response = await authService.resendPasswordOtp({ email: normalizedEmail });
      window.localStorage.setItem(RESET_EMAIL_KEY, normalizedEmail);
      setMessage(response.message);
      showToast("success", response.message);
    } catch (resendError) {
      const nextError = getApiErrorMessage(resendError);
      setError(nextError);
      showToast("error", nextError);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Reinitialisation"
      title="Choisir un nouveau mot de passe"
      description="Utilisez le code recu par email pour proteger a nouveau votre compte Yakout Luxury."
    >
      <Card>
        <CardContent className="p-6 sm:p-8">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <Input
              label="Email"
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
              onChange={(event) => setOtp(event.target.value)}
              placeholder="000000"
              required
              value={otp}
            />
            <Input
              label="Nouveau mot de passe"
              minLength={8}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              type="password"
              value={newPassword}
            />
            <Input
              label="Confirmer le mot de passe"
              minLength={8}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type="password"
              value={confirmPassword}
            />

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-md border border-luxury-beige bg-luxury-ivory px-4 py-3 text-sm text-luxury-text">
                {message}
              </p>
            ) : null}

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Reinitialisation..." : "Reinitialiser le mot de passe"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm text-luxury-text sm:flex-row sm:items-center sm:justify-between">
            <button
              className="text-left font-medium text-luxury-black disabled:opacity-50"
              disabled={isResending || !email}
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
