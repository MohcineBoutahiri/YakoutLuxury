import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  api,
} from "@/services/api";
import type {
  AuthResponse,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  MessageResponse,
  RegisterPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from "@/types/auth";

export const authService = {
  async register(payload: RegisterPayload) {
    const { data } = await api.post<MessageResponse>("/auth/register", payload);
    return data;
  },

  async verifyOtp(payload: VerifyOtpPayload) {
    const { data } = await api.post<MessageResponse>(
      "/auth/verify-otp",
      payload,
    );
    return data;
  },

  async resendOtp(payload: ResendOtpPayload) {
    const { data } = await api.post<MessageResponse>(
      "/auth/resend-otp",
      payload,
    );
    return data;
  },

  async login(payload: LoginPayload) {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    const { data } = await api.post<MessageResponse>(
      "/auth/forgot-password",
      payload,
    );
    return data;
  },

  async resetPassword(payload: ResetPasswordPayload) {
    const { data } = await api.post<MessageResponse>(
      "/auth/reset-password",
      payload,
    );
    return data;
  },

  async resendPasswordOtp(payload: ForgotPasswordPayload) {
    const { data } = await api.post<MessageResponse>(
      "/auth/resend-password-otp",
      payload,
    );
    return data;
  },

  async me() {
    const { data } = await api.get<{ user: AuthUser }>("/auth/me");
    return data.user;
  },

  logout() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
  },
};
