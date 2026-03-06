import { apiRequest } from "../lib/httpClient";

export const userService = {
  getMe() {
    return apiRequest("/auth/user/");
  },

  updateMe(payload) {
    return apiRequest("/auth/user/", {
      method: "PATCH",
      body: payload,
    });
  },
};
