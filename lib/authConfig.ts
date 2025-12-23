// frontend/lib/authConfig.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export const AUTH_ENDPOINTS = {
  login: `${API_BASE_URL}/accounts/login/`,
  refresh: `${API_BASE_URL}/accounts/refresh/`,
  register: `${API_BASE_URL}/accounts/register/`,
  confirmRegistration: `${API_BASE_URL}/accounts/confirm-registration/`,
  // If your backend uses the single resend endpoint:
  resendVerification: `${API_BASE_URL}/accounts/auth/resend-verification/`,
  // If your backend uses the separated endpoints (recommended), use these instead:
  resendSignup: `${API_BASE_URL}/accounts/auth/resend-signup/`,
  resendReset: `${API_BASE_URL}/accounts/auth/resend-reset/`,
  passwordResetRequest: `${API_BASE_URL}/accounts/password-reset/`,
  passwordResetConfirm: `${API_BASE_URL}/accounts/password-reset/confirm/`,
  passwordResetVerifyCode: `${API_BASE_URL}/accounts/password-reset/verify/`,
  me: `${API_BASE_URL}/accounts/me/`,

  // 🔐 SOCIAL AUTH (GENERIC — WORKS FOR ALL PROVIDERS)
  socialStart: (provider: string) =>
    `${API_BASE_URL}/accounts/social-start/${provider}/`,

  socialJwt: `${API_BASE_URL}/accounts/social/login/`,
};

export const TOKEN_KEYS = {
  access: "emma_access_token",
  refresh: "emma_refresh_token",
};
