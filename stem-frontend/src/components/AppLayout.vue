<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Sparkles, Users, Laptop, TrendingUp, Bell,
  LogOut, BarChart2, BookOpen, Settings, User, Menu, CircleDollarSign
} from "lucide-vue-next";
import { authStore } from "../stores/authStore";
import { authService } from "../services/authService";

defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
});

const router = useRouter();
const route = useRoute();
const sidebarOpen = ref(false);

const user = computed(() => authStore.user);
const avatarInitials = computed(() => {
  const f = user.value?.first_name?.[0] || "";
  const l = user.value?.last_name?.[0] || "";
  return (f + l).toUpperCase() || user.value?.email?.[0]?.toUpperCase() || "U";
});

async function logout() {
  try { await authService.logout(); } catch (_) {}
  authService.clearSession();
  router.push("/");
}

const navLinks = [
  { label: "Dashboard",     icon: BarChart2,         to: "/dashboard" },
  { label: "Explorar grupos", icon: Users,            to: "/groups" },
  { label: "Pagos",          icon: CircleDollarSign,  to: "/pagos" },
  { label: "Activos STEM",   icon: Laptop,            to: "/assets" },
  { label: "Progreso STEM",  icon: TrendingUp,        to: "/progress" },
  { label: "Cursos",         icon: BookOpen,          to: "/courses" },
  { label: "Perfil",         icon: User,              to: "/profile" },
  { label: "Configuración",  icon: Settings,          to: "/settings" },
];
</script>

<template>
  <div class="min-h-screen bg-[#070B18] text-white flex">

    <!-- ── SIDEBAR ── -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 w-64 bg-[#0D1225] border-r border-white/5 flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="flex items-center gap-2 h-16 px-5 border-b border-white/5 shrink-0">
        <router-link to="/" class="flex items-center gap-2 no-underline">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles class="w-4 h-4 text-white" />
          </div>
          <span class="font-bold text-sm tracking-tight text-white">STEM<span class="text-violet-400">-Trust</span></span>
        </router-link>
      </div>

      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all no-underline"
          :class="route.path.startsWith(link.to)
            ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
            : 'text-slate-400 hover:text-white hover:bg-white/5'"
        >
          <component :is="link.icon" class="w-4 h-4 shrink-0" />
          {{ link.label }}
        </router-link>
      </nav>

      <div class="p-3 border-t border-white/5 shrink-0">
        <div class="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
            {{ avatarInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-white truncate">{{ user?.first_name || user?.email }}</p>
            <p class="text-xs text-slate-500 truncate">{{ user?.email }}</p>
          </div>
          <button @click="logout" class="text-slate-500 hover:text-rose-400 transition-colors">
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-30 lg:hidden" @click="sidebarOpen = false" />

    <!-- ── MAIN ── -->
    <div class="flex-1 lg:ml-64 flex flex-col min-h-screen">
      <!-- Topbar -->
      <header class="h-16 bg-[#0D1225] border-b border-white/5 flex items-center gap-4 px-5 shrink-0 sticky top-0 z-20">
        <button class="lg:hidden text-slate-400 hover:text-white transition-colors" @click="sidebarOpen = !sidebarOpen">
          <Menu class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-sm font-semibold text-white">{{ title }}</h1>
          <p v-if="subtitle" class="text-xs text-slate-500 hidden sm:block">{{ subtitle }}</p>
        </div>
        <div class="ml-auto flex items-center gap-3">
          <slot name="topbar-actions" />
          <button class="relative text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
            <Bell class="w-5 h-5" />
          </button>
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
            {{ avatarInitials }}
          </div>
        </div>
      </header>

      <!-- Page slot -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
