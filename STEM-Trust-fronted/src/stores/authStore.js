import { reactive } from "vue";

const ACCESS_KEY = "auth_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "auth_user";

const savedAccess = localStorage.getItem(ACCESS_KEY);
const savedRefresh = localStorage.getItem(REFRESH_KEY);
const savedUser = localStorage.getItem(USER_KEY);

export const authStore = reactive({
  accessToken: savedAccess || "",
  refreshToken: savedRefresh || "",
  user: savedUser ? JSON.parse(savedUser) : null,
});

export function setSession({ access, refresh, user }) {
  authStore.accessToken = access || "";
  authStore.refreshToken = refresh || "";
  authStore.user = user || null;

  if (access) {
    localStorage.setItem(ACCESS_KEY, access);
  } else {
    localStorage.removeItem(ACCESS_KEY);
  }

  if (refresh) {
    localStorage.setItem(REFRESH_KEY, refresh);
  } else {
    localStorage.removeItem(REFRESH_KEY);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearSession() {
  setSession({ access: "", refresh: "", user: null });
}
