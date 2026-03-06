<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  BarChart2, Users, CircleDollarSign, Laptop, TrendingUp,
  User, Settings, LogOut, Menu, X,
  History, Plus, BookOpen, Award, Clock, Zap, Filter,
} from "lucide-vue-next";

import { authStore }   from "../../stores/authStore";
import { authService } from "../../services/authService";

import progresoData from "./data/progreso.json";
import CursoCard              from "./componentes/CursoCard.vue";
import CertificadoCard        from "./componentes/CertificadoCard.vue";
import ScoreImpacto           from "./componentes/ScoreImpacto.vue";
import ModalRegistrarProgreso from "./componentes/ModalRegistrarProgreso.vue";

const router = useRouter();
const route  = useRoute();

// ─── Sidebar ─────────────────────────────────────────────────────────────────
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
const perfil    = ref(progresoData.perfil);
const cursos    = ref(progresoData.cursos);
const plataformas  = progresoData.plataformas;
const categorias   = progresoData.categorias;
const niveles      = progresoData.niveles;
const impactoCategoria = progresoData.impactoCategoria;

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const tabActivo = ref("cursos"); // "cursos" | "certificados" | "impacto"

// ─── Filters ─────────────────────────────────────────────────────────────────
const busqueda      = ref("");
const filtroEstado  = ref("todos");
const filtroCategoria = ref("todas");

const cursosVisibles = computed(() => {
  let lista = cursos.value;
  if (filtroEstado.value !== "todos")
    lista = lista.filter((c) => c.estado === filtroEstado.value);
  if (filtroCategoria.value !== "todas")
    lista = lista.filter((c) => c.categoria === filtroCategoria.value);
  if (busqueda.value.trim())
    lista = lista.filter((c) =>
      c.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      c.plataforma.toLowerCase().includes(busqueda.value.toLowerCase())
    );
  return lista;
});

const cursosConCertificado = computed(() =>
  cursos.value.filter((c) => c.certificado)
);

const cursosRestantes = computed(() =>
  cursos.value.filter((c) => c.estado !== "completado")
);

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = computed(() => [
  {
    label: "Cursos completados", value: String(perfil.value.cursosCompletados),
    icon: BookOpen, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    label: "En progreso", value: String(perfil.value.cursosEnProgreso),
    icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    label: "Horas aprendidas", value: `${perfil.value.horasAprendizaje}h`,
    icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    label: "Certificados", value: String(perfil.value.certificados),
    icon: Award, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20",
  },
]);

// ─── Modal ────────────────────────────────────────────────────────────────────
const modalAbierto  = ref(false);
const cursoEditing  = ref(null);

function abrirModal(curso = null) {
  cursoEditing.value = curso;
  modalAbierto.value = true;
}

function guardarProgreso(datos) {
  if (cursoEditing.value) {
    // Update existing
    const idx = cursos.value.findIndex((c) => c.id === cursoEditing.value.id);
    if (idx !== -1) {
      cursos.value[idx] = {
        ...cursos.value[idx],
        progreso:         datos.progreso,
        horasCompletadas: datos.horasCompletadas,
        certificado:      datos.tieneCertificado,
        estado: datos.progreso === 100 ? "completado"
              : datos.progreso > 0    ? "en_progreso"
              : "no_iniciado",
      };
    }
    perfil.value.scoringActual = Math.min(100, perfil.value.scoringActual + datos.scoringBoost);
  } else {
    // Add new course
    cursos.value.unshift({
      id:               `cur-${Date.now()}`,
      nombre:           datos.nombre,
      plataforma:       datos.plataforma,
      categoria:        datos.categoria,
      categoriaColor:   categorias.find((c) => c.nombre === datos.categoria)?.color ?? "violet",
      imagen:           categorias.find((c) => c.nombre === datos.categoria)?.icono ?? "📚",
      progreso:         datos.progreso,
      estado:           datos.progreso === 100 ? "completado" : datos.progreso > 0 ? "en_progreso" : "no_iniciado",
      horasTotal:       datos.horasTotal || 0,
      horasCompletadas: datos.horasCompletadas || 0,
      fechaInicio:      new Date().toISOString().split("T")[0],
      fechaFin:         datos.progreso === 100 ? new Date().toISOString().split("T")[0] : null,
      certificado:      datos.tieneCertificado,
      certificadoUrl:   null,
      impactoScore:     datos.scoringBoost,
      descripcion:      datos.nota || "",
      nivel:            datos.nivel || "Principiante",
    });
    perfil.value.cursosEnProgreso++;
    perfil.value.scoringActual = Math.min(100, perfil.value.scoringActual + datos.scoringBoost);
  }
  modalAbierto.value = false;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function handleLogout() {
  try { await authService.logout(); } catch (_) {}
  authService.clearSession();
  router.push("/");
}
</script>

<template>

  <!-- Mobile overlay -->
  <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-20 lg:hidden" @click="sidebarOpen = false" />

  <!-- Sidebar -->
  <aside :class="[
    'fixed top-0 left-0 h-full w-64 bg-[#0D1225] border-r border-white/8 flex flex-col z-30 transition-transform duration-300',
    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
  ]">
    <div class="px-6 py-5 border-b border-white/8">
      <h1 class="text-lg font-black text-white tracking-tight">STEM<span class="text-violet-400">Trust</span></h1>
      <p class="text-[10px] text-slate-500 mt-0.5">Red de ahorro colaborativo</p>
    </div>

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

    <div class="px-4 py-4 border-t border-white/8">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {{ authStore.user?.first_name?.[0] ?? "U" }}
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-white truncate">
            {{ authStore.user?.first_name ?? authStore.user?.email?.split("@")[0] ?? "Usuario" }}
          </p>
          <p class="text-[10px] text-slate-500 truncate">{{ authStore.user?.email }}</p>
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
            <TrendingUp class="w-4 h-4 text-violet-400" />
            Progreso STEM
          </h2>
          <p class="text-xs text-slate-500 hidden sm:block">Cursos · Certificados · Impacto en score</p>
        </div>
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all"
        @click="abrirModal()"
      >
        <Plus class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Registrar progreso</span>
        <span class="sm:hidden">Nuevo</span>
      </button>
    </header>

    <!-- Body -->
    <main class="p-5 space-y-6 max-w-7xl">

      <!-- Stat cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="stat in stats"
          :key="stat.label"
          :class="`bg-[#0D1225] border rounded-2xl p-4 flex items-center gap-3 ${stat.bg}`"
        >
          <div :class="`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-current/20`">
            <component :is="stat.icon" :class="`w-5 h-5 ${stat.color}`" />
          </div>
          <div>
            <p :class="`text-xl font-black ${stat.color}`">{{ stat.value }}</p>
            <p class="text-xs text-slate-500 leading-tight">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Score boost banner -->
      <div class="bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border border-violet-500/30 rounded-2xl px-5 py-4 flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center shrink-0">
          <Zap class="w-5 h-5 text-violet-300" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-black text-white">
            Completa tus cursos en progreso y sube tu score a
            <span class="text-emerald-400">{{ perfil.scoringProyectado }} pts</span>
          </p>
          <p class="text-xs text-slate-400 mt-0.5">
            Tienes {{ perfil.cursosEnProgreso }} cursos activos con potencial de
            +{{ cursos.filter(c => c.estado === 'en_progreso').reduce((s,c) => s + c.impactoScore, 0) }} pts adicionales
          </p>
        </div>
        <button
          class="shrink-0 px-3 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-xs font-semibold border border-violet-500/40 transition-all hidden sm:flex items-center gap-1"
          @click="tabActivo = 'impacto'"
        >
          Ver impacto →
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit flex-wrap">
        <button
          v-for="tab in [
            { key: 'cursos',       label: 'Mis Cursos',   icon: BookOpen   },
            { key: 'certificados', label: 'Certificados', icon: Award      },
            { key: 'impacto',      label: 'Impacto Score',icon: TrendingUp },
          ]"
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
          <span class="hidden sm:inline">{{ tab.label }}</span>
        </button>
      </div>

      <!-- ── Tab: Cursos ── -->
      <section v-show="tabActivo === 'cursos'" class="space-y-4">

        <!-- Filters -->
        <div class="flex flex-wrap gap-3 items-center">
          <input
            v-model="busqueda"
            type="search"
            placeholder="Buscar curso o plataforma…"
            class="bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-white
              placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 min-w-[200px]"
          />
          <select
            v-model="filtroEstado"
            class="bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300
              focus:outline-none focus:ring-2 focus:ring-violet-500/60"
          >
            <option value="todos">Todos los estados</option>
            <option value="completado">Completados</option>
            <option value="en_progreso">En progreso</option>
            <option value="no_iniciado">No iniciados</option>
          </select>
          <select
            v-model="filtroCategoria"
            class="bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300
              focus:outline-none focus:ring-2 focus:ring-violet-500/60"
          >
            <option value="todas">Todas las categorías</option>
            <option v-for="cat in categorias" :key="cat.nombre" :value="cat.nombre">
              {{ cat.icono }} {{ cat.nombre }}
            </option>
          </select>
          <span class="text-xs text-slate-500 ml-auto">{{ cursosVisibles.length }} cursos</span>
        </div>

        <!-- Course grid -->
        <div v-if="cursosVisibles.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <CursoCard
            v-for="curso in cursosVisibles"
            :key="curso.id"
            :curso="curso"
            @registrar="abrirModal($event)"
            @ver-certificado="() => { tabActivo = 'certificados'; }"
          />
        </div>
        <div v-else class="text-center py-16 text-slate-500 text-sm">
          No se encontraron cursos con los filtros aplicados.
        </div>
      </section>

      <!-- ── Tab: Certificados ── -->
      <section v-show="tabActivo === 'certificados'" class="space-y-4">
        <p class="text-xs text-slate-500">{{ cursosConCertificado.length }} certificados obtenidos</p>
        <div v-if="cursosConCertificado.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <CertificadoCard
            v-for="curso in cursosConCertificado"
            :key="curso.id"
            :curso="curso"
          />
        </div>
        <div v-else class="text-center py-16 text-slate-500 text-sm">
          Aún no tienes certificados. ¡Completa un curso para obtener el tuyo!
        </div>
      </section>

      <!-- ── Tab: Impacto Score ── -->
      <section v-show="tabActivo === 'impacto'">
        <ScoreImpacto
          :scoring-actual="perfil.scoringActual"
          :scoring-proyectado="perfil.scoringProyectado"
          :impacto-categoria="impactoCategoria"
          :evolucion-score="perfil.evolucionScore"
          :cursos-restantes="cursosRestantes"
        />
      </section>

    </main>
  </div>

  <!-- Modal -->
  <ModalRegistrarProgreso
    :show="modalAbierto"
    :curso-inicial="cursoEditing"
    :plataformas="plataformas"
    :categorias="categorias"
    :niveles="niveles"
    @close="modalAbierto = false"
    @guardar="guardarProgreso"
  />

</template>
