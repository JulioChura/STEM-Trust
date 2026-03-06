<script setup>
import { computed } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";
import { authService } from "./services/authService";
import { authStore } from "./stores/authStore";

const router = useRouter();
const hasSession = computed(() => Boolean(authStore.accessToken));

function logoutLocal() {
  authService.clearSession();
  router.push("/auth");
}
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <header class="border-b border-slate-200 bg-white">
      <nav class="mx-auto flex max-w-6xl items-center gap-3 p-4 text-sm">
        <RouterLink class="nav-link" to="/auth">Auth</RouterLink>
        <RouterLink class="nav-link" to="/dashboard">Dashboard</RouterLink>
        <RouterLink class="nav-link" to="/profile">Profile</RouterLink>
        <button v-if="hasSession" class="logout-btn" @click="logoutLocal">Limpiar sesion</button>
      </nav>
    </header>

    <main class="mx-auto max-w-6xl p-4 sm:p-6">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.nav-link {
  border-radius: 0.6rem;
  border: 1px solid rgb(203 213 225);
  background: white;
  color: rgb(15 23 42);
  padding: 0.4rem 0.8rem;
  text-decoration: none;
}

.router-link-active {
  border-color: rgb(15 118 110);
  color: rgb(15 118 110);
}

.logout-btn {
  margin-left: auto;
  border-radius: 0.6rem;
  border: none;
  background: rgb(220 38 38);
  color: white;
  padding: 0.45rem 0.9rem;
}
</style>