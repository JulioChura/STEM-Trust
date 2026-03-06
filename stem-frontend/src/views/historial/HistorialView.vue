<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  BarChart2, Users, CircleDollarSign, Laptop, TrendingUp,
  User, Settings, LogOut, Menu, X,
  FileDown, Sheet, History, Clock,
} from "lucide-vue-next";
import { authStore } from "../../stores/authStore";
import { authService } from "../../services/authService";

import historialData from "./data/historial.json";
import ScoreGauge              from "./componentes/ScoreGauge.vue";
import ScoringCrediticio       from "./componentes/ScoringCrediticio.vue";
import HistorialIndividualTable from "./componentes/HistorialIndividualTable.vue";
import HistorialGrupalTable     from "./componentes/HistorialGrupalTable.vue";
import { useExportHistorial }  from "./composables/useExportHistorial.js";

const router = useRouter();
const route  = useRoute();

// ─── Sidebar nav ─────────────────────────────────────────────────────────────
const navLinks = [
  { label: "Dashboard",     icon: BarChart2,        to: "/dashboard" },
  { label: "Mis grupos",    icon: Users,            to: "/groups"    },
  { label: "Pagos",         icon: CircleDollarSign, to: "/pagos"     },
  { label: "Historial",     icon: History,          to: "/historial" },
  { label: "Activos STEM",  icon: Laptop,           to: "/assets"    },
  { label: "Progreso STEM", icon: TrendingUp,       to: "/progress"  },
  { label: "Perfil",        icon: User,             to: "/profile"   },
  { label: "Configuración", icon: Settings,         to: "/settings"  },
];
const sidebarOpen = ref(false);

// ─── Data ─────────────────────────────────────────────────────────────────────
const perfil       = ref(historialData.perfil);
const todosAportes = ref(historialData.aportes);
const grupal       = ref(historialData.historialGrupal);

// ─── Tabs ────────────────────────────────────────────────────────────────────
const tabActivo = ref("individual"); // "individual" | "grupal"

// ─── Filters (individual) ────────────────────────────────────────────────────
const busqueda     = ref("");
const filtroEstado = ref("todos");
const filtroPeriodo= ref("todos");
const filtroGrupo  = ref("todos");

const gruposUnicos = computed(() => [...new Set(todosAportes.value.map((a) => a.grupo))]);

const aportesVisibles = computed(() => {
  let lista = todosAportes.value;

  if (filtroEstado.value !== "todos")
    lista = lista.filter((a) => a.estado === filtroEstado.value);

  if (filtroGrupo.value !== "todos")
    lista = lista.filter((a) => a.grupo === filtroGrupo.value);

  if (busqueda.value.trim())
    lista = lista.filter((a) =>
      a.grupo.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      (a.nota ?? "").toLowerCase().includes(busqueda.value.toLowerCase())
    );

  return lista;
});

// ─── Export ──────────────────────────────────────────────────────────────────
const { exportarPDF, exportarCSV } = useExportHistorial(perfil, todosAportes, grupal);

// ─── Auth util ───────────────────────────────────────────────────────────────
async function handleLogout() {
  try { await authService.logout(); } catch (_) {}
  authService.clearSession();
  router.push("/");
}
</script>

<template>

  <!-- Mobile overlay -->
  <div
    v-if="sidebarOpen"
    class="fixed inset-0 bg-black/50 z-20 lg:hidden"
    @click="sidebarOpen = false"
  />

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed top-0 left-0 h-full w-64 bg-[#0D1225] border-r border-white/8 flex flex-col z-30 transition-transform duration-300',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <!-- Brand -->
    <div class="px-6 py-5 border-b border-white/8">
      <h1 class="text-lg font-black text-white tracking-tight">
        STEM<span class="text-violet-400">Trust</span>
      </h1>
      <p class="text-[10px] text-slate-500 mt-0.5">Red de ahorro colaborativo</p>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
      <RouterLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
          route.path.startsWith(link.to)
            ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
            : 'text-slate-400 hover:bg-white/8 hover:text-white',
        ]"
        @click="sidebarOpen = false"
      >
        <component :is="link.icon" class="w-4 h-4 shrink-0" />
        {{ link.label }}
      </RouterLink>
    </nav>

    <!-- User footer -->
    <div class="px-4 py-4 border-t border-white/8">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {{ perfil.nombre?.[0] ?? "U" }}
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-white truncate">{{ perfil.nombre }}</p>
          <p class="text-[10px] text-slate-500 truncate">{{ perfil.email }}</p>
        </div>
      </div>
      <button
        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs transition-all"
        @click="handleLogout"
      >
        <LogOut class="w-3.5 h-3.5" /> Cerrar sesión
      </button>
    </div>
  </aside>

  <!-- Main -->
  <div class="lg:ml-64 min-h-screen bg-[#070B18] text-white">

    <!-- Topbar -->
    <header class="sticky top-0 z-10 bg-[#0D1225]/90 backdrop-blur-md border-b border-white/8 px-5 py-3.5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="lg:hidden p-2 rounded-lg hover:bg-white/8" @click="sidebarOpen = !sidebarOpen">
          <component :is="sidebarOpen ? X : Menu" class="w-5 h-5" />
        </button>
        <div>
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <History class="w-4 h-4 text-violet-400" />
            Historial Financiero
          </h2>
          <p class="text-xs text-slate-500 hidden sm:block">Scoring crediticio · Aportes · Historia grupal</p>
        </div>
      </div>

      <!-- Export buttons -->
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 text-xs font-semibold text-slate-300 transition-all"
          @click="exportarCSV"
        >
          <Sheet class="w-3.5 h-3.5 text-emerald-400" />
          <span class="hidden sm:inline">Excel</span>
        </button>
        <button
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-all"
          @click="exportarPDF"
        >
          <FileDown class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">PDF</span>
        </button>
      </div>
    </header>

    <!-- Body -->
    <main class="p-5 space-y-6 max-w-7xl">

      <!-- Score section -->
      <section class="bg-[#0D1225] border border-white/10 rounded-2xl p-6">
        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
          Scoring crediticio personal
        </h3>
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Gauge -->
          <div class="flex flex-col items-center justify-center border-r border-white/8 pr-8 md:min-w-[200px]">
            <ScoreGauge
              :puntuacion="perfil.scoring.puntuacion"
              :nivel="perfil.scoring.nivel"
              :size="180"
            />
            <p class="text-xs text-slate-500 mt-2 text-center">Miembro desde {{ perfil.fechaRegistro }}</p>
          </div>
          <!-- Detail bars + sparkline -->
          <div class="flex-1">
            <ScoringCrediticio
              :categorias="perfil.scoring.categorias"
              :evolucion-mensual="perfil.scoring.evolucionMensual"
            />
          </div>
        </div>
      </section>

      <!-- Tabs -->
      <div class="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        <button
          v-for="tab in [{ key: 'individual', label: 'Historial Individual', icon: User }, { key: 'grupal', label: 'Historial Grupal', icon: Users }]"
          :key="tab.key"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
            tabActivo === tab.key
              ? 'bg-violet-600 text-white shadow'
              : 'text-slate-400 hover:text-white',
          ]"
          @click="tabActivo = tab.key"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Individual tab -->
      <section v-show="tabActivo === 'individual'" class="space-y-4">
        <!-- Filters -->
        <div class="flex flex-wrap gap-3">
          <input
            v-model="busqueda"
            type="search"
            placeholder="Buscar por grupo o nota…"
            class="bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 min-w-[200px]"
          />
          <select
            v-model="filtroEstado"
            class="bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
          >
            <option value="todos">Todos los estados</option>
            <option value="validado">Validado</option>
            <option value="pendiente">Pendiente</option>
            <option value="revisando">En revisión</option>
            <option value="rechazado">Rechazado</option>
          </select>
          <select
            v-model="filtroGrupo"
            class="bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
          >
            <option value="todos">Todos los grupos</option>
            <option v-for="g in gruposUnicos" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>

        <HistorialIndividualTable
          :aportes="aportesVisibles"
          :filtro-grupo="filtroGrupo"
          :filtro-periodo="filtroPeriodo"
          :filtro-estado="filtroEstado"
        />
      </section>

      <!-- Grupal tab -->
      <section v-show="tabActivo === 'grupal'">
        <HistorialGrupalTable :grupos="grupal" />
      </section>

    </main>
  </div>
</template>
