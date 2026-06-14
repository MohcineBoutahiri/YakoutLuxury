"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import axios from "axios";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { isValidEmail, requireText, validatePassword } from "@/lib/validation";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const validationError =
      requireText(email, "Email") ||
      (!isValidEmail(email) ? "Veuillez saisir un email valide." : "") ||
      requireText(password, "Mot de passe") ||
      validatePassword(password);

    if (validationError) {
      setError(validationError);
      showToast("error", validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const loggedUser = await login({
        email,
        password,
      });
      showToast("success", "Connexion reussie.");
      const redirectAfterLogin = window.localStorage.getItem(
        "yakout_post_login_redirect",
      );
      window.localStorage.removeItem("yakout_post_login_redirect");
      router.push(
        redirectAfterLogin && loggedUser.role === "ADMIN"
          ? redirectAfterLogin
          : loggedUser.role === "ADMIN"
            ? "/admin/dashboard"
            : "/profile",
      );
    } catch (submitError) {
      if (
        axios.isAxiosError(submitError) &&
        submitError.response?.data?.code === "OTP_REQUIRED"
      ) {
        const pendingEmail =
          submitError.response.data.email ?? String(new FormData(event.currentTarget).get("email") ?? "");
        window.localStorage.setItem("yakout_pending_email", pendingEmail);
        const message = "Veuillez verifier votre email avant d'acceder au dashboard.";
        setError(message);
        showToast("error", message);
        router.push("/verify-otp");
        return;
      }

      const message = getApiErrorMessage(submitError);
      setError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Connexion"
      title="Acceder a votre espace"
      description="Connectez-vous pour retrouver votre profil, vos informations et vos prochains parcours d'achat Yakout Luxury."
    >
      <Card>
        <CardContent className="p-6 sm:p-8">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <Input label="Email" name="email" required type="email" />
            <Input
              label="Mot de passe"
              minLength={8}
              name="password"
              required
              type="password"
            />

            {error ? (
              <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm text-luxury-text sm:flex-row sm:items-center sm:justify-between">
            <Link className="font-medium text-luxury-black" href="/register">
              Creer un compte
            </Link>
            <div className="flex flex-col gap-3 sm:items-end">
              <Link className="font-medium text-luxury-black" href="/forgot-password">
                Mot de passe oublie ?
              </Link>
              <Link className="font-medium text-luxury-black" href="/verify-otp">
                Verifier un compte
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
