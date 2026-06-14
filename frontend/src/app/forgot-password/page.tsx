"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isValidEmail } from "@/lib/validation";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { authService } from "@/services/auth.service";

const RESET_EMAIL_KEY = "yakout_reset_email";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      const validationError = "Veuillez saisir un email valide.";
      setError(validationError);
      showToast("error", validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.forgotPassword({ email: normalizedEmail });
      window.localStorage.setItem(RESET_EMAIL_KEY, normalizedEmail);
      setMessage(response.message);
      showToast("success", response.message);
      router.push(`/reset-password?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (submitError) {
      const nextError = getApiErrorMessage(submitError);
      setError(nextError);
      showToast("error", nextError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Mot de passe oublie"
      title="Recevoir un code de reinitialisation"
      description="Entrez votre email. Si un compte Yakout Luxury existe, un code vous sera envoye pour choisir un nouveau mot de passe."
    >
      <Card>
        <CardContent className="p-6 sm:p-8">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <Input
              label="Email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="client@yakoutluxury.com"
              required
              type="email"
              value={email}
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
              {isSubmitting ? "Envoi..." : "Envoyer le code"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm text-luxury-text sm:flex-row sm:items-center sm:justify-between">
            <Link className="font-medium text-luxury-black" href="/login">
              Retour connexion
            </Link>
            <Link className="font-medium text-luxury-black" href="/reset-password">
              J'ai deja un code
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
