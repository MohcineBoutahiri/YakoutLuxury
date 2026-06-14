export type Role = "CLIENT" | "ADMIN";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  password: string;
  confirmPassword: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type VerifyOtpPayload = {
  email: string;
  code: string;
};

export type ResendOtpPayload = {
  email: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type MessageResponse = {
  message: string;
  user?: AuthUser;
};
