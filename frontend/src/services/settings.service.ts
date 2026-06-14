import type { AdminSettings } from "@/types/settings";

const storageKey = "yakout_admin_settings";

export const defaultAdminSettings: AdminSettings = {
  general: {
    shopName: "Yakout Luxury",
    slogan: "Elegance moderne, style unique",
    contactEmail: "contact@yakoutluxury.com",
    phone: "+212 600 000 000",
    address: "Casablanca, Maroc",
  },
  appearance: {
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#0B0B0B",
    secondaryColor: "#C8A24A",
    enable3D: true,
    enableMobile3D: false,
  },
  delivery: {
    standardPrice: 30,
    freeFrom: 700,
    cities: "Casablanca, Rabat, Marrakech, Tanger, Fes",
    estimatedDelay: "24h a 72h",
    message: "Livraison rapide avec paiement a la livraison disponible.",
  },
  payment: {
    enableCashOnDelivery: true,
    enableCardPayment: false,
    checkoutMessage: "Paiement a la livraison lors de la reception de votre commande.",
  },
  orders: {
    defaultStatus: "PENDING",
    confirmationMessage: "Votre commande a ete creee avec succes.",
    notifyClientByEmail: true,
    notifyAdmin: true,
  },
  stock: {
    lowStockThreshold: 5,
    blockOutOfStockPurchase: true,
    showRemainingStock: true,
  },
  security: {
    otpExpirationMinutes: 10,
    maxOtpAttempts: 5,
    allowAdminCreation: true,
    adminSessionHours: 24,
  },
  seo: {
    title: "Yakout Luxury | Vetements premium",
    description: "Boutique e-commerce premium de vetements modernes et elegants.",
    keywords: "yakout luxury, mode, vetements, luxe, boutique",
    openGraphImage: "",
  },
  social: {
    instagram: "https://instagram.com/yakoutluxury",
    facebook: "",
    tiktok: "",
    whatsapp: "https://wa.me/212600000000",
  },
};

function isAdminSettings(value: unknown): value is AdminSettings {
  return Boolean(value && typeof value === "object" && "general" in value);
}

export const settingsService = {
  async getSettings() {
    if (typeof window === "undefined") {
      return defaultAdminSettings;
    }

    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return defaultAdminSettings;
    }

    try {
      const parsed = JSON.parse(stored);
      return isAdminSettings(parsed) ? parsed : defaultAdminSettings;
    } catch {
      return defaultAdminSettings;
    }
  },

  async saveSettings(settings: AdminSettings) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(settings));
    }

    return settings;
  },
};
