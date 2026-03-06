<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Sparkles, Users, Laptop, TrendingUp, Bell, LogOut,
  Plus, ChevronRight, CircleDollarSign, BarChart2,
  BookOpen, Shield, Clock, CheckCircle, Settings, User, History
} from "lucide-vue-next";
import { authStore } from "../stores/authStore";
import { authService } from "../services/authService";
import { objetivoConfig } from "../data/mockGroups.js";

const router = useRouter();
const route  = useRoute();

const user = computed(() => authStore.user);
const firstName = computed(() => user.value?.first_name || user.value?.email?.split("@")[0] || "Bienvenida");
const avatarInitials = computed(() => {
  const f = user.value?.first_name?.[0] || "";
  const l = user.value?.last_name?.[0] || "";
  return (f + l).toUpperCase() || user.value?.email?.[0]?.toUpperCase() || "U";
});

const sidebarOpen = ref(false);

const joinedGroups = computed(() => {
  try { return JSON.parse(localStorage.getItem("joined_groups") || "[]"); }
  catch { return []; }
});

const totalAhorros = computed(() =>
  joinedGroups.value.reduce((sum, g) => sum + (g.montoActual || 0), 0)
);

async function logout() {
  try { await authService.logout(); } catch (_) {}
  authService.clearSession();
  router.push("/");
}

const stats = computed(() => [
  { label: "Grupos activos",    value: String(joinedGroups.value.length),                 icon: Users,           color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { label: "Ahorros totales",   value: `S/ ${totalAhorros.value.toLocaleString()}`,       icon: CircleDollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { label: "Tu scoring",        value: joinedGroups.value.length > 0 ? "100%" : "--",     icon: BarChart2,        color: "text-cyan-400",    bg: "bg-cyan-500/10 border-cyan-500/20" },
  { label: "Cursos en progreso",value: "0",                                              icon: BookOpen,         color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
]);

const quickActions = [
  { label: "Crear grupo",        desc: "Forma un grupo de ahorro STEM",   icon: Plus,             to: "/groups/new",       accent: "from-violet-600 to-indigo-600" },
  { label: "Unirse a grupo",     desc: "Busca grupos con tu objetivo",    icon: Users,            to: "/groups",           accent: "from-cyan-600 to-teal-600"    },
  { label: "Mis pagos",          desc: "Historial y comprobantes OCR",    icon: CircleDollarSign, to: "/pagos",            accent: "from-emerald-600 to-green-600" },
  { label: "Mi historial",       desc: "Scoring y reporte financiero",   icon: History,          to: "/historial",        accent: "from-indigo-600 to-violet-600" },
  { label: "Cargar comprobante", desc: "Valida tu aporte con OCR",        icon: Shield,           to: "/payments/upload",  accent: "from-amber-600 to-orange-600" },
];

const navLinks = [
  { label: "Dashboard",     icon: BarChart2,        to: "/dashboard" },
  { label: "Mis grupos",    icon: Users,            to: "/groups" },
  { label: "Pagos",         icon: CircleDollarSign, to: "/pagos" },
  { label: "Historial",     icon: History,          to: "/historial" },
  { label: "Activos STEM",  icon: Laptop,           to: "/assets" },
  { label: "Progreso STEM", icon: TrendingUp,       to: "/progress" },
  { label: "Perfil",        icon: User,             to: "/profile" },
  { label: "Configuración", icon: Settings,         to: "/settings" },
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
      <!-- Logo -->
      <div class="flex items-center gap-2 h-16 px-5 border-b border-white/5 shrink-0">
        <router-link to="/" class="flex items-center gap-2 no-underline">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles class="w-4 h-4 text-white" />
          </div>
          <span class="font-bold text-sm tracking-tight text-white">STEM<span class="text-violet-400">-Trust</span></span>
        </router-link>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <router-link
          v-for="link in navLinks"
          :key="link.label"
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

      <!-- User + logout -->
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
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-30 lg:hidden" @click="sidebarOpen = false"></div>

    <!-- ── MAIN ── -->
    <div class="flex-1 lg:ml-64 flex flex-col min-h-screen">

      <!-- Topbar -->
      <header class="h-16 bg-[#0D1225] border-b border-white/5 flex items-center gap-4 px-5 shrink-0 sticky top-0 z-20">
        <button class="lg:hidden text-slate-400 hover:text-white transition-colors" @click="sidebarOpen = !sidebarOpen">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div>
          <h1 class="text-sm font-semibold text-white">Dashboard</h1>
          <p class="text-xs text-slate-500 hidden sm:block">STEM-Trust · Panel principal</p>
        </div>
        <div class="ml-auto flex items-center gap-3">
          <button class="relative text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
            <Bell class="w-5 h-5" />
          </button>
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
            {{ avatarInitials }}
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8">

        <!-- Welcome banner -->
        <div class="relative bg-gradient-to-r from-violet-600/20 via-indigo-600/15 to-transparent border border-violet-500/20 rounded-2xl p-6 overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-violet-500/5 to-transparent pointer-events-none"></div>
          <div class="absolute -right-8 -top-8 w-40 h-40 bg-violet-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="relative z-10 flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xl font-extrabold shadow-xl shadow-violet-500/30 shrink-0">
              {{ avatarInitials }}
            </div>
            <div>
              <p class="text-sm text-violet-300 font-medium">¡Bienvenida de vuelta!</p>
              <h2 class="text-2xl font-extrabold text-white">{{ firstName }}</h2>
              <p class="text-sm text-slate-400 mt-0.5">Estás lista para construir tu historial financiero STEM</p>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div>
          <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Resumen</h3>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="stat in stats"
              :key="stat.label"
              :class="`${stat.bg} border rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-all cursor-default`"
            >
              <component :is="stat.icon" :class="`w-5 h-5 ${stat.color}`" />
              <div>
                <div class="text-2xl font-extrabold text-white">{{ stat.value }}</div>
                <div class="text-xs text-slate-400 mt-0.5">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div>
          <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Acciones rápidas</h3>
          <div class="grid sm:grid-cols-3 gap-4">
            <button
              v-for="action in quickActions"
              :key="action.label"
              @click="router.push(action.to)"
              class="group text-left bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all hover:-translate-y-0.5"
            >
              <div :class="`w-10 h-10 rounded-xl bg-gradient-to-br ${action.accent} flex items-center justify-center mb-4 shadow-lg`">
                <component :is="action.icon" class="w-5 h-5 text-white" />
              </div>
              <div class="font-semibold text-white text-sm mb-1">{{ action.label }}</div>
              <div class="text-xs text-slate-400">{{ action.desc }}</div>
              <div class="flex items-center gap-1 text-xs text-slate-500 mt-3 group-hover:text-slate-300 transition-colors">
                Comenzar <ChevronRight class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        <!-- Mis grupos section -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-widest">Mis grupos</h3>
            <router-link to="/groups" class="text-xs text-violet-400 hover:text-violet-300 transition-colors no-underline flex items-center gap-1">
              Explorar <ChevronRight class="w-3 h-3" />
            </router-link>
          </div>

          <!-- Joined groups grid -->
          <div v-if="joinedGroups.length > 0" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
              v-for="g in joinedGroups"
              :key="g.id"
              class="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
            >
              <div class="p-5">
                <!-- Header -->
                <div class="flex items-start gap-3 mb-4">
                  <div :class="`w-10 h-10 rounded-xl ${objetivoConfig[g.objetivo]?.bg} border flex items-center justify-center text-lg shrink-0`">
                    {{ objetivoConfig[g.objetivo]?.emoji }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-bold text-white truncate">{{ g.name }}</h4>
                    <p class="text-xs text-slate-500 mt-0.5 truncate">{{ g.ubicacion }}</p>
                  </div>
                  <span :class="`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
                    g.status === 'open' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                    g.status === 'in_progress' ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' :
                    'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  }`">
                    {{ g.isOrganizer ? '★ Org.' : 'Miembro' }}
                  </span>
                </div>
                <!-- Progress -->
                <div class="mb-4">
                  <div class="flex justify-between text-xs mb-1.5">
                    <span class="text-slate-500">Recaudado</span>
                    <span class="font-semibold text-slate-300">{{ Math.round((g.montoActual / g.montoObjetivo) * 100) }}%</span>
                  </div>
                  <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all"
                      :style="{ width: Math.round((g.montoActual / g.montoObjetivo) * 100) + '%' }"
                    ></div>
                  </div>
                  <div class="flex justify-between text-xs mt-1 text-slate-600">
                    <span>S/ {{ g.montoActual.toLocaleString() }}</span>
                    <span>S/ {{ g.montoObjetivo.toLocaleString() }}</span>
                  </div>
                </div>
                <!-- Footer -->
                <div class="flex items-center justify-between">
                  <span class="text-xs text-slate-500">S/ {{ g.aporteMensual }}/mes · {{ g.plazoMeses }}m</span>
                  <router-link
                    :to="`/groups/${g.slug}`"
                    class="text-xs text-violet-400 hover:text-violet-300 transition-colors no-underline flex items-center gap-1 font-medium"
                  >
                    Ver estado <ChevronRight class="w-3 h-3" />
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Create new group CTA card -->
            <button
              @click="router.push('/groups/new')"
              class="group flex flex-col items-center justify-center gap-3 bg-white/3 hover:bg-white/5 border border-dashed border-white/15 hover:border-violet-500/40 rounded-2xl p-8 transition-all hover:-translate-y-0.5 min-h-[180px]"
            >
              <div class="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-violet-500/20 border border-white/10 group-hover:border-violet-500/30 flex items-center justify-center transition-all">
                <Plus class="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition-colors" />
              </div>
              <span class="text-xs text-slate-500 group-hover:text-slate-300 text-center transition-colors">Crear o unirse a otro grupo</span>
            </button>
          </div>

          <!-- Empty state -->
          <div v-else class="bg-white/5 border border-white/10 rounded-2xl p-10 flex flex-col items-center text-center">
            <div class="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <Users class="w-8 h-8 text-violet-400" />
            </div>
            <h4 class="text-base font-bold text-white mb-2">Aún no tienes grupos</h4>
            <p class="text-sm text-slate-400 max-w-xs mb-6">
              Crea o únete a un grupo de ahorro para empezar a construir tu historial financiero y acceder a activos STEM.
            </p>
            <div class="flex gap-3">
              <button
                @click="router.push('/groups/new')"
                class="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-violet-500/20 hover:-translate-y-0.5"
              >
                <Plus class="w-4 h-4" /> Crear grupo
              </button>
              <button
                @click="router.push('/groups')"
                class="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 font-medium px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                Explorar grupos
              </button>
            </div>
          </div>
        </div>

        <!-- How to start -->
        <div class="bg-gradient-to-br from-cyan-600/10 to-teal-600/5 border border-cyan-500/20 rounded-2xl p-6">
          <h3 class="text-sm font-semibold text-cyan-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Sparkles class="w-4 h-4" /> Cómo empezar
          </h3>
          <div class="space-y-3">
            <div v-for="(step, i) in [
              { text: 'Completa tu perfil con tu objetivo tecnológico', done: false },
              { text: 'Crea un grupo o únete a uno existente', done: false },
              { text: 'Realiza tu primer aporte y valídalo con OCR', done: false },
              { text: 'Conecta tus cursos STEM para aumentar tu scoring', done: false },
            ]" :key="i" class="flex items-center gap-3 text-sm">
              <div :class="['w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold', step.done ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400']">
                <CheckCircle v-if="step.done" class="w-4 h-4" />
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span :class="step.done ? 'text-slate-500 line-through' : 'text-slate-300'">{{ step.text }}</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>
