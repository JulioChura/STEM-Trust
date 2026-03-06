<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import {
  Sparkles, Users, Laptop, TrendingUp, Bell, LogOut,
  Plus, BarChart2, BookOpen, CircleDollarSign, Settings,
  User, Search, Filter, Upload, X, History
} from "lucide-vue-next";
import { authStore } from "../../stores/authStore";
import { authService } from "../../services/authService";
import PagosResumen from "./componentes/PagosResumen.vue";
import PagoCard from "./componentes/PagoCard.vue";
import ModalNuevoAporte from "./componentes/ModalNuevoAporte.vue";

// ── Datos simulados de la "API" ──────────────────────────────────────────────
import mockData from "./data/pagos.json";

const router = useRouter();
const user = computed(() => authStore.user);
const firstName = computed(() => user.value?.first_name || user.value?.email?.split("@")[0] || "Usuaria");
const avatarInitials = computed(() => {
  const f = user.value?.first_name?.[0] || "";
  const l = user.value?.last_name?.[0] || "";
  return (f + l).toUpperCase() || user.value?.email?.[0]?.toUpperCase() || "U";
});

const sidebarOpen = ref(false);

async function logout() {
  try { await authService.logout(); } catch (_) {}
  authService.clearSession();
  router.push("/");
}

// ── Nav ───────────────────────────────────────────────────────────────────────
const navLinks = [
  { label: "Dashboard",    icon: BarChart2,         to: "/dashboard"  },
  { label: "Mis grupos",   icon: Users,             to: "/groups"     },
  { label: "Pagos",        icon: CircleDollarSign,  to: "/pagos"      },
  { label: "Historial",    icon: History,           to: "/historial"  },
  { label: "Activos STEM", icon: Laptop,            to: "/assets"     },
  { label: "Progreso STEM",icon: TrendingUp,        to: "/progress"   },
  { label: "Perfil",       icon: User,              to: "/profile"    },
  { label: "Configuración",icon: Settings,          to: "/settings"   },
];

// ── Estado de filtros ─────────────────────────────────────────────────────────
const searchQuery = ref("");
const estadoFiltro = ref("todos");
const grupoFiltro  = ref("todos");

const estados = ["todos", "validado", "pendiente", "revisando", "rechazado"];
const grupos  = computed(() => [
  { id: "todos", nombre: "Todos los grupos" },
  ...mockData.grupos,
]);

// ── Datos reactivos ────────────────────────────────────────────────────────────
const resumen = ref({ ...mockData.resumen });
const pagos   = ref([...mockData.pagos]);

// ── Filtrado ──────────────────────────────────────────────────────────────────
const pagosFiltrados = computed(() => {
  return pagos.value.filter((p) => {
    const matchEstado = estadoFiltro.value === "todos" || p.estado === estadoFiltro.value;
    const matchGrupo  = grupoFiltro.value  === "todos" || p.grupo_id === grupoFiltro.value;
    const q = searchQuery.value.trim().toLowerCase();
    const matchSearch = !q || p.grupo.toLowerCase().includes(q) || p.nota.toLowerCase().includes(q);
    return matchEstado && matchGrupo && matchSearch;
  });
});

// ── Próximo pago ─────────────────────────────────────────────────────────────
const proximoPago = computed(() => {
  const pendientes = pagos.value
    .filter((p) => p.estado === "pendiente" && p.fechaLimite)
    .sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite));
  return pendientes[0] ?? null;
});

const diasParaProximo = computed(() => {
  if (!proximoPago.value) return null;
  const hoy   = new Date();
  const limite = new Date(proximoPago.value.fechaLimite + "T00:00:00");
  return Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24));
});

// ── Modal "Nuevo Aporte" ──────────────────────────────────────────────────────
const mostrarModalNuevoAporte = ref(false);

function abrirNuevoAporte() {
  mostrarModalNuevoAporte.value = true;
}

function cerrarNuevoAporte() {
  mostrarModalNuevoAporte.value = false;
}

/**
 * Recibe el nuevo pago emitido por ModalNuevoAporte y lo agrega
 * a la lista local, actualizando el resumen en consecuencia.
 */
function onAporteConfirmado(nuevoPago) {
  pagos.value.unshift(nuevoPago);

  if (nuevoPago.estado === "pendiente") {
    resumen.value.totalPendiente = parseFloat(
      (resumen.value.totalPendiente + nuevoPago.monto).toFixed(2)
    );
  }

  resumen.value.totalAportado = parseFloat(
    (resumen.value.totalAportado + nuevoPago.monto).toFixed(2)
  );
}

// ── Modal "Subir comprobante" ─────────────────────────────────────────────────
const uploadTarget = ref(null);

function abrirUpload(pago) {
  uploadTarget.value = pago;
}
function cerrarUpload() {
  uploadTarget.value = null;
}
function confirmarUpload() {
  if (!uploadTarget.value) return;
  const idx = pagos.value.findIndex((p) => p.id === uploadTarget.value.id);
  if (idx !== -1) {
    const pagoActualizado = { ...pagos.value[idx], estado: "revisando" };
    // Mover de pendiente a en-revisión en el resumen
    resumen.value.totalPendiente = parseFloat(
      Math.max(0, resumen.value.totalPendiente - pagoActualizado.monto).toFixed(2)
    );
    pagos.value[idx] = pagoActualizado;
  }
  cerrarUpload();
}
</script>

<template>
  <div class="min-h-screen bg-[#070B18] text-white flex">

    <!-- ── SIDEBAR ────────────────────────────────────────────────────────── -->
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

      <!-- Nav Links -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <router-link
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all no-underline"
          :class="$route.path === link.to
            ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
            : 'text-slate-400 hover:text-white hover:bg-white/5'"
        >
          <component :is="link.icon" class="w-4 h-4 shrink-0" />
          {{ link.label }}
        </router-link>
      </nav>

      <!-- User + Logout -->
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

    <!-- ── MAIN ───────────────────────────────────────────────────────────── -->
    <div class="flex-1 lg:ml-64 flex flex-col min-h-screen">

      <!-- Topbar -->
      <header class="h-16 bg-[#0D1225] border-b border-white/5 flex items-center gap-4 px-5 shrink-0 sticky top-0 z-20">
        <button class="lg:hidden text-slate-400 hover:text-white transition-colors" @click="sidebarOpen = !sidebarOpen">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 class="text-sm font-semibold text-white">Mis Pagos</h1>
          <p class="text-xs text-slate-500 hidden sm:block">STEM-Trust · Historial de aportes</p>
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
          <div class="absolute -right-8 -top-8 w-40 h-40 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
          <div class="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <p class="text-sm text-violet-300 font-medium mb-1">Mis Pagos</p>
              <h2 class="text-2xl font-extrabold text-white">Historial de aportes</h2>
              <p class="text-sm text-slate-400 mt-1">Gestiona y valida tus comprobantes para construir tu historial financiero.</p>
            </div>
            <!-- Alerta próximo pago -->
            <div
              v-if="proximoPago"
              class="shrink-0 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm"
            >
              <p class="text-amber-300 font-semibold mb-0.5">Próximo pago</p>
              <p class="text-slate-300">{{ proximoPago.grupo }}</p>
              <p class="text-slate-400 text-xs mt-1">
                Vence en
                <span :class="diasParaProximo <= 3 ? 'text-rose-400 font-bold' : 'text-amber-300 font-semibold'">
                  {{ diasParaProximo }}d
                </span>
                · S/ {{ proximoPago.monto.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Resumen stats -->
        <div>
          <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Resumen</h3>
          <PagosResumen :resumen="resumen" />
        </div>

        <!-- Filtros -->
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Buscador -->
          <div class="relative flex-1 max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por grupo o nota…"
              class="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors"
            />
          </div>

          <!-- Filtro estado -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <Filter class="w-4 h-4 text-slate-500 shrink-0" />
            <button
              v-for="e in estados"
              :key="e"
              @click="estadoFiltro = e"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                estadoFiltro === e
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10'
              ]"
            >
              {{ e === "todos" ? "Todos" : e }}
            </button>
          </div>

          <!-- Filtro grupo -->
          <select
            v-model="grupoFiltro"
            class="bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none transition-colors cursor-pointer"
          >
            <option v-for="g in grupos" :key="g.id" :value="g.id" class="bg-[#0D1225]">
              {{ g.nombre }}
            </option>
          </select>
        </div>

        <!-- Lista de pagos -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-widest">
              Pagos
              <span class="ml-2 text-violet-400 normal-case">{{ pagosFiltrados.length }}</span>
            </h3>
            <button
              @click="abrirNuevoAporte"
              class="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:-translate-y-0.5"
            >
              <Plus class="w-3.5 h-3.5" /> Nuevo aporte
            </button>
          </div>

          <!-- Grid de tarjetas -->
          <div v-if="pagosFiltrados.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PagoCard
              v-for="pago in pagosFiltrados"
              :key="pago.id"
              :pago="pago"
              @subir="abrirUpload"
            />
          </div>

          <!-- Empty state -->
          <div v-else class="bg-white/5 border border-white/10 rounded-2xl p-10 flex flex-col items-center text-center">
            <div class="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <CircleDollarSign class="w-8 h-8 text-violet-400" />
            </div>
            <h4 class="text-base font-bold text-white mb-2">Sin resultados</h4>
            <p class="text-sm text-slate-400 max-w-xs">
              No hay pagos que coincidan con los filtros aplicados.
            </p>
          </div>
        </div>

        <!-- Progreso de grupos -->
        <div>
          <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Progreso de grupos</h3>
          <div class="space-y-3">
            <div
              v-for="grupo in mockData.grupos"
              :key="grupo.id"
              class="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-white">{{ grupo.nombre }}</span>
                <span class="text-xs text-slate-400">{{ grupo.participantes }} participantes</span>
              </div>
              <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>S/ {{ grupo.acumulado.toFixed(2) }} acumulado</span>
                <span>Meta: S/ {{ grupo.meta.toFixed(2) }}</span>
              </div>
              <!-- Barra de progreso -->
              <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  class="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                  :style="{ width: `${Math.min((grupo.acumulado / grupo.meta) * 100, 100)}%` }"
                />
              </div>
              <p class="text-xs text-slate-500 mt-1 text-right">
                {{ Math.round((grupo.acumulado / grupo.meta) * 100) }}% completado
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>

    <!-- ── MODAL: Nuevo aporte ────────────────────────────────────────────── -->
    <Transition name="fade">
      <ModalNuevoAporte
        v-if="mostrarModalNuevoAporte"
        :grupos="mockData.grupos"
        @confirmar="onAporteConfirmado"
        @cerrar="cerrarNuevoAporte"
      />
    </Transition>

    <!-- ── MODAL: Subir comprobante ─────────────────────────────────────── -->
    <Transition name="fade">
      <div
        v-if="uploadTarget"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="cerrarUpload"
      >
        <div class="bg-[#0D1225] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-base font-bold text-white">Subir comprobante</h3>
            <button @click="cerrarUpload" class="text-slate-500 hover:text-white transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="mb-4 text-sm text-slate-400 space-y-1">
            <p>Grupo: <span class="text-white font-medium">{{ uploadTarget.grupo }}</span></p>
            <p>Monto: <span class="text-white font-medium">S/ {{ uploadTarget.monto.toFixed(2) }}</span></p>
            <p>Nota: <span class="text-white font-medium">{{ uploadTarget.nota }}</span></p>
          </div>

          <!-- Zona drag-and-drop (stub visual) -->
          <label class="block cursor-pointer">
            <div class="border-2 border-dashed border-violet-500/40 hover:border-violet-400/70 rounded-xl p-8 flex flex-col items-center gap-3 transition-colors">
              <Upload class="w-8 h-8 text-violet-400" />
              <p class="text-sm text-slate-300 font-medium">Haz clic o arrastra tu comprobante</p>
              <p class="text-xs text-slate-500">JPG, PNG o PDF · Máx 5 MB</p>
            </div>
            <input type="file" class="hidden" accept=".jpg,.jpeg,.png,.pdf" />
          </label>

          <p class="text-xs text-cyan-400 mt-3 flex items-center gap-1.5">
            <BookOpen class="w-3.5 h-3.5" />
            El comprobante será analizado automáticamente mediante OCR para verificar su autenticidad.
          </p>

          <div class="flex gap-3 mt-6">
            <button
              @click="cerrarUpload"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              Cancelar
            </button>
            <button
              @click="confirmarUpload"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 transition-all"
            >
              Enviar comprobante
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
