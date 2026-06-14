export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidOtp(value: string) {
  return /^\d{6}$/.test(value.trim());
}

export function validatePassword(value: string) {
  if (value.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caracteres.";
  }

  return "";
}

export function requireText(value: string, label: string) {
  if (!value.trim()) {
    return `${label} est requis.`;
  }

  return "";
}
