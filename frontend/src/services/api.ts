import axios from "axios";

export const AUTH_TOKEN_KEY = "yakout_token";
export const AUTH_USER_KEY = "yakout_user";
export const AUTH_LOGOUT_EVENT = "yakout:auth:logout";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.localStorage.removeItem(AUTH_USER_KEY);
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return "Votre session a expire. Veuillez vous reconnecter.";
    }

    const message = error.response?.data?.message;
    const code = error.response?.data?.code;

    if (code === "OTP_REQUIRED") {
      return "Veuillez verifier votre email avant d'acceder au dashboard.";
    }

    const normalized = Array.isArray(message)
      ? message.join(" ")
      : typeof message === "string"
        ? message
        : message?.message && typeof message.message === "string"
          ? message.message
        : "";

    if (/compte existe deja|email.*existe|unique/i.test(normalized)) {
      return "Cet email est deja utilise. Connectez-vous ou choisissez une autre adresse.";
    }

    if (/code.*verification|otp|invalide.*expire/i.test(normalized)) {
      return "Code OTP incorrect ou expire. Verifiez le code ou demandez un nouveau code.";
    }

    if (/mot de passe incorrect|email ou mot de passe/i.test(normalized)) {
      return "Email ou mot de passe incorrect.";
    }

    if (/stock insuffisant|rupture|plus disponible/i.test(normalized)) {
      return "Ce produit est en rupture ou la quantite demandee n'est plus disponible.";
    }

    if (Array.isArray(message)) {
      return message.join(" ");
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return "Une erreur est survenue. Veuillez reessayer.";
}
