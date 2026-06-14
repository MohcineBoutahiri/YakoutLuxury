export type AdminSettings = {
  general: {
    shopName: string;
    slogan: string;
    contactEmail: string;
    phone: string;
    address: string;
  };
  appearance: {
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    enable3D: boolean;
    enableMobile3D: boolean;
  };
  delivery: {
    standardPrice: number;
    freeFrom: number;
    cities: string;
    estimatedDelay: string;
    message: string;
  };
  payment: {
    enableCashOnDelivery: boolean;
    enableCardPayment: boolean;
    checkoutMessage: string;
  };
  orders: {
    defaultStatus: string;
    confirmationMessage: string;
    notifyClientByEmail: boolean;
    notifyAdmin: boolean;
  };
  stock: {
    lowStockThreshold: number;
    blockOutOfStockPurchase: boolean;
    showRemainingStock: boolean;
  };
  security: {
    otpExpirationMinutes: number;
    maxOtpAttempts: number;
    allowAdminCreation: boolean;
    adminSessionHours: number;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    openGraphImage: string;
  };
  social: {
    instagram: string;
    facebook: string;
    tiktok: string;
    whatsapp: string;
  };
};
