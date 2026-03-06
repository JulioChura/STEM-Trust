import { createRouter, createWebHistory } from "vue-router";
import { authStore } from "../stores/authStore";
import AuthPlaygroundView from "../views/AuthPlaygroundView.vue";
import DashboardView from "../views/DashboardView.vue";
import ProfileView from "../views/ProfileView.vue";

const routes = [
  {
    path: "/",
    redirect: () => (authStore.accessToken ? "/dashboard" : "/auth"),
  },
  {
    path: "/auth",
    name: "auth",
    component: AuthPlaygroundView,
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const isLoggedIn = Boolean(authStore.accessToken);

  if (to.meta.requiresAuth && !isLoggedIn) {
    return {
      path: "/auth",
      query: { redirect: to.fullPath },
    };
  }

  if (to.path === "/auth" && isLoggedIn) {
    return "/dashboard";
  }

  return true;
});

export default router;
