"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isValidEmail, requireText, validatePassword } from "@/lib/validation";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { authService } from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const validationError =
      requireText(firstName, "Prenom") ||
      requireText(lastName, "Nom") ||
      requireText(email, "Email") ||
      (!isValidEmail(email) ? "Veuillez saisir un email valide." : "") ||
      validatePassword(password) ||
      (password !== confirmPassword ? "Les mots de passe ne correspondent pas." : "");

    if (validationError) {
      setError(validationError);
      showToast("error", validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      await authService.register({
        firstName,
        lastName,
        email,
        phone: String(formData.get("phone") ?? ""),
        address: String(formData.get("address") ?? ""),
        password,
        confirmPassword,
      });

      window.localStorage.setItem("yakout_pending_email", email);
      showToast("success", "Compte cree. Verifiez votre email avec le code OTP.");
      router.push("/verify-otp");
    } catch (submitError) {
      const message = getApiErrorMessage(submitError);
      setError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Creation de compte"
      title="Rejoindre Yakout Luxury"
      description="Creez votre espace client pour suivre vos commandes, conserver vos informations et acceder aux futures experiences privees."
    >
      <Card>
        <CardContent className="p-6 sm:p-8">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Prenom" name="firstName" required />
              <Input label="Nom" name="lastName" required />
            </div>
            <Input label="Email" name="email" required type="email" />
            <Input label="Telephone" name="phone" type="tel" />
            <Input label="Adresse" name="address" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Mot de passe"
                minLength={8}
                name="password"
                required
                type="password"
              />
              <Input
                label="Confirmer"
                minLength={8}
                name="confirmPassword"
                required
                type="password"
              />
            </div>

            {error ? (
              <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creation..." : "Creer mon compte"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-luxury-text">
            Deja inscrit ?{" "}
            <Link className="font-medium text-luxury-black" href="/login">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
