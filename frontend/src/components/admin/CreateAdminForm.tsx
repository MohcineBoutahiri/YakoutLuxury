"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { CreateAdminPayload } from "@/types/admin";
import type { AuthUser } from "@/types/auth";

type FormState = Omit<CreateAdminPayload, "phone" | "address"> & {
  phone: string;
  address: string;
};

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
};

type CreateAdminFormProps = {
  formId?: string;
  hideActions?: boolean;
  onCancel: () => void;
  onCreated: (admin: AuthUser) => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

export function CreateAdminForm({
  formId,
  hideActions,
  onCancel,
  onCreated,
  onSubmittingChange,
}: CreateAdminFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  function setField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.firstName.trim()) nextErrors.firstName = "Le prenom est requis.";
    if (!form.lastName.trim()) nextErrors.lastName = "Le nom est requis.";
    if (!form.email.trim()) nextErrors.email = "L'email est requis.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = "Email invalide.";
    }
    if (form.password.length < 8) {
      nextErrors.password = "Minimum 8 caracteres.";
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    onSubmittingChange?.(true);
    try {
      const createdAdmin = await adminService.createAdmin({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      showToast("success", "Compte admin cree avec succes.");
      onCreated(createdAdmin);
      setForm(initialForm);
      setErrors({});
    } catch (error) {
      showToast("error", getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
      onSubmittingChange?.(false);
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          error={errors.firstName}
          label="Prenom"
          onChange={(event) => setField("firstName", event.target.value)}
          value={form.firstName}
        />
        <Input
          error={errors.lastName}
          label="Nom"
          onChange={(event) => setField("lastName", event.target.value)}
          value={form.lastName}
        />
        <Input
          error={errors.email}
          label="Email"
          onChange={(event) => setField("email", event.target.value)}
          type="email"
          value={form.email}
        />
        <Input
          label="Telephone"
          onChange={(event) => setField("phone", event.target.value)}
          value={form.phone}
        />
        <label className="block text-sm text-luxury-black md:col-span-2">
          <span className="mb-2 block font-medium">Adresse</span>
          <textarea
            className="min-h-24 w-full rounded-md border border-luxury-beige bg-white px-4 py-3 outline-none transition focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20"
            onChange={(event) => setField("address", event.target.value)}
            value={form.address}
          />
        </label>
        <Input
          error={errors.password}
          label="Mot de passe"
          onChange={(event) => setField("password", event.target.value)}
          type="password"
          value={form.password}
        />
        <Input
          error={errors.confirmPassword}
          label="Confirmer mot de passe"
          onChange={(event) => setField("confirmPassword", event.target.value)}
          type="password"
          value={form.confirmPassword}
        />
      </div>
      {!hideActions ? (
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="soft">
          Annuler
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creation..." : "Creer le compte"}
        </Button>
      </div>
      ) : null}
    </form>
  );
}
