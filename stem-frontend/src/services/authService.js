import { apiRequest } from "../lib/httpClient";
import { clearSession, setSession } from "../stores/authStore";

export const authService = {
  register(payload) {
    return apiRequest("/auth/registration/", {
      method: "POST",
      body: payload,
    });
  },

  login(payload) {
    return apiRequest("/auth/login/", {
      method: "POST",
      body: payload,
    });
  },

  loginWithGoogle(credential) {
    return apiRequest("/auth/google/", {
      method: "POST",
      body: {
        access_token: credential,
        id_token: credential,
      },
    });
  },

  logout() {
    return apiRequest("/auth/logout/", {
      method: "POST",
      body: {},
    });
  },

  changePassword(payload) {
    return apiRequest("/auth/password/change/", {
      method: "POST",
      body: payload,
    });
  },

  resetPassword(payload) {
    return apiRequest("/auth/password/reset/", {
      method: "POST",
      body: payload,
    });
  },

  confirmResetPassword(payload) {
    return apiRequest("/auth/password/reset/confirm/", {
      method: "POST",
      body: payload,
    });
  },

  me() {
    return apiRequest("/auth/user/");
  },

  async saveSessionFromAuthResponse(authResponse) {
    setSession({
      access: authResponse?.access || authResponse?.key || "",
      refresh: authResponse?.refresh || "",
      user: authResponse?.user || null,
    });
  },

  clearSession,
};
