"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  LockKeyhole,
  PackageCheck,
  Palette,
  Search,
  Settings,
  Share2,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/cn";
import { useToast } from "@/providers/ToastProvider";
import {
  defaultAdminSettings,
  settingsService,
} from "@/services/settings.service";
import type { AdminSettings } from "@/types/settings";

type SectionId = keyof AdminSettings;

const sections: Array<{
  id: SectionId;
  label: string;
  icon: typeof Store;
}> = [
  { id: "general", label: "General", icon: Store },
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "delivery", label: "Livraison", icon: Truck },
  { id: "payment", label: "Paiement", icon: CreditCard },
  { id: "orders", label: "Commandes", icon: ShoppingBag },
  { id: "stock", label: "Stock", icon: PackageCheck },
  { id: "security", label: "Securite", icon: LockKeyhole },
  { id: "seo", label: "SEO", icon: Search },
  { id: "social", label: "Reseaux sociaux", icon: Share2 },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(defaultAdminSettings);
  const [activeSection, setActiveSection] = useState<SectionId>("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    settingsService
      .getSettings()
      .then(setSettings)
      .finally(() => setIsLoading(false));
  }, []);

  const currentSection = useMemo(
    () => sections.find((section) => section.id === activeSection) ?? sections[0],
    [activeSection],
  );

  function updateSection<Key extends SectionId>(
    section: Key,
    values: Partial<AdminSettings[Key]>,
  ) {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        ...values,
      },
    }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 500));
      await settingsService.saveSettings(settings);
      showToast("success", "Parametres enregistres.");
    } catch {
      showToast("error", "Impossible d'enregistrer les parametres.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Parametres">
        <Loader label="Chargement des parametres" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Parametres">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm leading-6 text-luxury-text">
            Configurez l'experience boutique. Les valeurs sont sauvegardees localement
            en attendant une API settings dediee.
          </p>
        </div>
        <Button disabled={isSaving} onClick={handleSave}>
          <Settings size={17} />
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardContent className="grid gap-2 p-3">
            {sections.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;

              return (
                <button
                  className={cn(
                    "flex items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium transition",
                    active
                      ? "bg-luxury-black text-luxury-ivory"
                      : "text-luxury-text hover:bg-luxury-ivory hover:text-luxury-black",
                  )}
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  type="button"
                >
                  <Icon
                    className={active ? "text-luxury-gold" : "text-luxury-text"}
                    size={17}
                  />
                  {section.label}
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="premium-eyebrow">Configuration</p>
              <CardTitle className="mt-1">{currentSection.label}</CardTitle>
            </div>
            <Badge variant="gold">Local mock</Badge>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            {activeSection === "general" ? (
              <SettingsGrid>
                <Input
                  label="Nom boutique"
                  onChange={(event) =>
                    updateSection("general", { shopName: event.target.value })
                  }
                  value={settings.general.shopName}
                />
                <Input
                  label="Slogan"
                  onChange={(event) =>
                    updateSection("general", { slogan: event.target.value })
                  }
                  value={settings.general.slogan}
                />
                <Input
                  label="Email contact"
                  onChange={(event) =>
                    updateSection("general", { contactEmail: event.target.value })
                  }
                  type="email"
                  value={settings.general.contactEmail}
                />
                <Input
                  label="Telephone / WhatsApp"
                  onChange={(event) =>
                    updateSection("general", { phone: event.target.value })
                  }
                  value={settings.general.phone}
                />
                <TextArea
                  label="Adresse boutique"
                  onChange={(value) => updateSection("general", { address: value })}
                  value={settings.general.address}
                />
              </SettingsGrid>
            ) : null}

            {activeSection === "appearance" ? (
              <SettingsGrid>
                <Input
                  label="Logo"
                  onChange={(event) =>
                    updateSection("appearance", { logoUrl: event.target.value })
                  }
                  placeholder="https://..."
                  value={settings.appearance.logoUrl}
                />
                <Input
                  label="Favicon"
                  onChange={(event) =>
                    updateSection("appearance", { faviconUrl: event.target.value })
                  }
                  placeholder="https://..."
                  value={settings.appearance.faviconUrl}
                />
                <ColorInput
                  label="Couleur principale"
                  onChange={(value) =>
                    updateSection("appearance", { primaryColor: value })
                  }
                  value={settings.appearance.primaryColor}
                />
                <ColorInput
                  label="Couleur secondaire"
                  onChange={(value) =>
                    updateSection("appearance", { secondaryColor: value })
                  }
                  value={settings.appearance.secondaryColor}
                />
                <Toggle
                  checked={settings.appearance.enable3D}
                  label="Activer animation 3D"
                  onChange={(value) =>
                    updateSection("appearance", { enable3D: value })
                  }
                />
                <Toggle
                  checked={settings.appearance.enableMobile3D}
                  label="Activer 3D sur mobile"
                  onChange={(value) =>
                    updateSection("appearance", { enableMobile3D: value })
                  }
                />
              </SettingsGrid>
            ) : null}

            {activeSection === "delivery" ? (
              <SettingsGrid>
                <Input
                  label="Prix livraison standard"
                  min={0}
                  onChange={(event) =>
                    updateSection("delivery", {
                      standardPrice: Number(event.target.value),
                    })
                  }
                  type="number"
                  value={settings.delivery.standardPrice}
                />
                <Input
                  label="Livraison gratuite a partir de"
                  min={0}
                  onChange={(event) =>
                    updateSection("delivery", { freeFrom: Number(event.target.value) })
                  }
                  type="number"
                  value={settings.delivery.freeFrom}
                />
                <Input
                  label="Villes disponibles"
                  onChange={(event) =>
                    updateSection("delivery", { cities: event.target.value })
                  }
                  value={settings.delivery.cities}
                />
                <Input
                  label="Delai livraison estime"
                  onChange={(event) =>
                    updateSection("delivery", {
                      estimatedDelay: event.target.value,
                    })
                  }
                  value={settings.delivery.estimatedDelay}
                />
                <TextArea
                  label="Message livraison"
                  onChange={(value) => updateSection("delivery", { message: value })}
                  value={settings.delivery.message}
                />
              </SettingsGrid>
            ) : null}

            {activeSection === "payment" ? (
              <SettingsGrid>
                <Toggle
                  checked={settings.payment.enableCashOnDelivery}
                  label="Activer paiement a la livraison"
                  onChange={(value) =>
                    updateSection("payment", { enableCashOnDelivery: value })
                  }
                />
                <Toggle
                  checked={settings.payment.enableCardPayment}
                  disabled
                  helperText="Paiement carte desactive pour l'instant."
                  label="Activer paiement carte"
                  onChange={(value) =>
                    updateSection("payment", { enableCardPayment: value })
                  }
                />
                <TextArea
                  label="Message paiement checkout"
                  onChange={(value) =>
                    updateSection("payment", { checkoutMessage: value })
                  }
                  value={settings.payment.checkoutMessage}
                />
              </SettingsGrid>
            ) : null}

            {activeSection === "orders" ? (
              <SettingsGrid>
                <SelectField
                  label="Statut par defaut"
                  onChange={(value) => updateSection("orders", { defaultStatus: value })}
                  options={[
                    ["PENDING", "PENDING"],
                    ["CONFIRMED", "CONFIRMED"],
                    ["PROCESSING", "PROCESSING"],
                  ]}
                  value={settings.orders.defaultStatus}
                />
                <Toggle
                  checked={settings.orders.notifyClientByEmail}
                  label="Notification email client"
                  onChange={(value) =>
                    updateSection("orders", { notifyClientByEmail: value })
                  }
                />
                <Toggle
                  checked={settings.orders.notifyAdmin}
                  label="Notification admin"
                  onChange={(value) => updateSection("orders", { notifyAdmin: value })}
                />
                <TextArea
                  label="Message confirmation commande"
                  onChange={(value) =>
                    updateSection("orders", { confirmationMessage: value })
                  }
                  value={settings.orders.confirmationMessage}
                />
              </SettingsGrid>
            ) : null}

            {activeSection === "stock" ? (
              <SettingsGrid>
                <Input
                  label="Seuil stock faible"
                  min={0}
                  onChange={(event) =>
                    updateSection("stock", {
                      lowStockThreshold: Number(event.target.value),
                    })
                  }
                  type="number"
                  value={settings.stock.lowStockThreshold}
                />
                <Toggle
                  checked={settings.stock.blockOutOfStockPurchase}
                  label="Bloquer achat si stock = 0"
                  onChange={(value) =>
                    updateSection("stock", { blockOutOfStockPurchase: value })
                  }
                />
                <Toggle
                  checked={settings.stock.showRemainingStock}
                  label="Afficher stock restant au client"
                  onChange={(value) =>
                    updateSection("stock", { showRemainingStock: value })
                  }
                />
              </SettingsGrid>
            ) : null}

            {activeSection === "security" ? (
              <SettingsGrid>
                <Input
                  label="Duree expiration OTP (minutes)"
                  min={1}
                  onChange={(event) =>
                    updateSection("security", {
                      otpExpirationMinutes: Number(event.target.value),
                    })
                  }
                  type="number"
                  value={settings.security.otpExpirationMinutes}
                />
                <Input
                  label="Nombre maximum tentatives OTP"
                  min={1}
                  onChange={(event) =>
                    updateSection("security", {
                      maxOtpAttempts: Number(event.target.value),
                    })
                  }
                  type="number"
                  value={settings.security.maxOtpAttempts}
                />
                <Toggle
                  checked={settings.security.allowAdminCreation}
                  label="Autoriser creation admin"
                  onChange={(value) =>
                    updateSection("security", { allowAdminCreation: value })
                  }
                />
                <Input
                  label="Duree session admin (heures)"
                  min={1}
                  onChange={(event) =>
                    updateSection("security", {
                      adminSessionHours: Number(event.target.value),
                    })
                  }
                  type="number"
                  value={settings.security.adminSessionHours}
                />
              </SettingsGrid>
            ) : null}

            {activeSection === "seo" ? (
              <SettingsGrid>
                <Input
                  label="Titre SEO"
                  onChange={(event) =>
                    updateSection("seo", { title: event.target.value })
                  }
                  value={settings.seo.title}
                />
                <Input
                  label="Mots-cles"
                  onChange={(event) =>
                    updateSection("seo", { keywords: event.target.value })
                  }
                  value={settings.seo.keywords}
                />
                <Input
                  label="Image Open Graph"
                  onChange={(event) =>
                    updateSection("seo", { openGraphImage: event.target.value })
                  }
                  placeholder="https://..."
                  value={settings.seo.openGraphImage}
                />
                <TextArea
                  label="Description SEO"
                  onChange={(value) => updateSection("seo", { description: value })}
                  value={settings.seo.description}
                />
              </SettingsGrid>
            ) : null}

            {activeSection === "social" ? (
              <SettingsGrid>
                <Input
                  label="Instagram"
                  onChange={(event) =>
                    updateSection("social", { instagram: event.target.value })
                  }
                  value={settings.social.instagram}
                />
                <Input
                  label="Facebook"
                  onChange={(event) =>
                    updateSection("social", { facebook: event.target.value })
                  }
                  value={settings.social.facebook}
                />
                <Input
                  label="TikTok"
                  onChange={(event) =>
                    updateSection("social", { tiktok: event.target.value })
                  }
                  value={settings.social.tiktok}
                />
                <Input
                  label="WhatsApp"
                  onChange={(event) =>
                    updateSection("social", { whatsapp: event.target.value })
                  }
                  value={settings.social.whatsapp}
                />
              </SettingsGrid>
            ) : null}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              disabled={isSaving}
              onClick={() => setSettings(defaultAdminSettings)}
              variant="soft"
            >
              Reinitialiser
            </Button>
            <Button disabled={isSaving} onClick={handleSave}>
              {isSaving ? "Enregistrement..." : "Enregistrer les parametres"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}

function SettingsGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 lg:grid-cols-2">{children}</div>;
}

function TextArea({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block text-sm text-luxury-black lg:col-span-2">
      <span className="mb-2 block font-medium text-luxury-black">{label}</span>
      <textarea
        className="min-h-28 w-full rounded-md border border-luxury-beige bg-white px-4 py-3 text-luxury-black shadow-[0_10px_30px_rgba(11,11,11,0.035)] outline-none transition placeholder:text-luxury-text/70 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function ColorInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_56px] items-end gap-3">
      <Input
        label={label}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
      <input
        aria-label={label}
        className="h-12 w-14 rounded-md border border-luxury-beige bg-white p-1"
        onChange={(event) => onChange(event.target.value)}
        type="color"
        value={value}
      />
    </div>
  );
}

function Toggle({
  checked,
  disabled,
  helperText,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  helperText?: string;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-4 rounded-md border border-luxury-beige bg-white px-4 py-3 text-sm shadow-[0_10px_30px_rgba(11,11,11,0.035)]",
        disabled && "opacity-60",
      )}
    >
      <span>
        <span className="block font-medium text-luxury-black">{label}</span>
        {helperText ? (
          <span className="mt-1 block text-xs text-luxury-text">{helperText}</span>
        ) : null}
      </span>
      <input
        checked={checked}
        className="h-5 w-5 accent-luxury-gold"
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
  value: string;
}) {
  return (
    <label className="block text-sm text-luxury-black">
      <span className="mb-2 block font-medium text-luxury-black">{label}</span>
      <select
        className="h-12 w-full rounded-md border border-luxury-beige bg-white px-4 text-luxury-black shadow-[0_10px_30px_rgba(11,11,11,0.035)] outline-none focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
