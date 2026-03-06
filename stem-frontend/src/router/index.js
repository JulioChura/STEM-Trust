import { createRouter, createWebHistory } from "vue-router";
import { authStore } from "../stores/authStore";
import LandingView from "../views/LandingView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import OnboardingView from "../views/OnboardingView.vue";
import AuthPlaygroundView from "../views/AuthPlaygroundView.vue";
import DashboardView from "../views/DashboardView.vue";
import ProfileView from "../views/ProfileView.vue";
import GroupsView from "../views/GroupsView.vue";
import GroupDetailView from "../views/GroupDetailView.vue";
import CreateGroupView from "../views/CreateGroupView.vue";
import InviteView from "../views/InviteView.vue";

const routes = [
  {
    path: "/",
    name: "landing",
    component: LandingView,
    meta: { requiresAuth: false },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
    meta: { requiresAuth: false },
  },
  {
    path: "/onboarding",
    name: "onboarding",
    component: OnboardingView,
    meta: { requiresAuth: true },
  },
  {
    // Legacy playground — useful for devs
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
  {
    path: "/groups",
    name: "groups",
    component: GroupsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/groups/new",
    name: "create-group",
    component: CreateGroupView,
    meta: { requiresAuth: true },
  },
  {
    path: "/groups/:slug",
    name: "group-detail",
    component: GroupDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: "/invite/:code",
    name: "invite",
    component: InviteView,
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const isLoggedIn = Boolean(authStore.accessToken);
  const isDemo = to.query.demo === "true";

  if (to.meta.requiresAuth && !isLoggedIn && !isDemo) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  // Redirect logged-in users away from auth pages (but not landing)
  if (["login", "register", "auth"].includes(to.name) && isLoggedIn) {
    return "/dashboard";
  }

  return true;
});

export default router;
