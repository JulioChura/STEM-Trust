<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Search, SlidersHorizontal, MapPin, Users, Clock,
  CircleDollarSign, Star, Sparkles, TrendingUp, ChevronRight, X, Plus
} from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";
import { mockGroups, objetivoConfig, statusConfig, tagConfig } from "../data/mockGroups.js";

const router = useRouter();

// ── Interests from onboarding ──
const myTopics = computed(() => {
  try {
    return JSON.parse(localStorage.getItem("onboarding_topics") || "[]");
  } catch { return []; }
});
const myObjetivo = computed(() => localStorage.getItem("onboarding_objetivo") || "");

// ── Filters state ──
const search         = ref("");
const filterObjetivo = ref("");
const filterNivel    = ref("");
const filterStatus   = ref("open");
const filterPais     = ref("");
const sortBy         = ref("match"); // match | monto | plazo | reciente
const showFilters    = ref(false);

// ── Active filter count ──
const activeFilterCount = computed(() =>
  [filterObjetivo.value, filterNivel.value, filterPais.value, filterStatus.value !== "open" ? filterStatus.value : ""].filter(Boolean).length
);

function clearFilters() {
  filterObjetivo.value = "";
  filterNivel.value    = "";
  filterStatus.value   = "open";
  filterPais.value     = "";
  search.value         = "";
}

// ── Recommended: match on user interests + objetivo ──
const recommended = computed(() =>
  mockGroups
    .filter(g => g.status === "open")
    .map(g => {
      let score = g.matchScore;
      if (myObjetivo.value && g.objetivo === myObjetivo.value) score += 30;
      const tagOverlap = g.tags.filter(t => myTopics.value.includes(t)).length;
      score += tagOverlap * 10;
      return { ...g, computedScore: Math.min(score, 99) };
    })
    .sort((a, b) => b.computedScore - a.computedScore)
    .slice(0, 3)
);

// ── Filtered & sorted list ──
const filteredGroups = computed(() => {
  let list = mockGroups.filter(g => {
    const q = search.value.toLowerCase();
    if (q && !g.name.toLowerCase().includes(q) && !g.description.toLowerCase().includes(q) && !g.ubicacion.toLowerCase().includes(q)) return false;
    if (filterObjetivo.value && g.objetivo !== filterObjetivo.value) return false;
    if (filterNivel.value    && g.nivel    !== filterNivel.value)    return false;
    if (filterStatus.value   && g.status   !== filterStatus.value)   return false;
    if (filterPais.value     && g.pais     !== filterPais.value)     return false;
    return true;
  });

  if (sortBy.value === "match")   list = [...list].sort((a, b) => b.matchScore - a.matchScore);
  if (sortBy.value === "monto")   list = [...list].sort((a, b) => a.montoObjetivo - b.montoObjetivo);
  if (sortBy.value === "plazo")   list = [...list].sort((a, b) => a.plazoMeses - b.plazoMeses);
  if (sortBy.value === "reciente") list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return list;
});

function progressPct(g) {
  return Math.round((g.montoActual / g.montoObjetivo) * 100);
}

function goDetail(slug) {
  router.push(`/groups/${slug}`);
}

const objetivoOptions = [
  { value: "",              label: "Todos los activos" },
  { value: "laptop",        label: "💻 Laptop" },
  { value: "tablet",        label: "📱 Tablet" },
  { value: "curso",         label: "🎓 Curso / Cert." },
  { value: "equipo-lab",    label: "🔬 Equipo lab" },
  { value: "impresora-3d",  label: "🖨️ Impresora 3D" },
  { value: "proyecto-stem", label: "🚀 Proyecto STEM" },
  { value: "otro",          label: "✨ Otro activo" },
];

const paisOptions = [
  { value: "",          label: "Todos los países" },
  { value: "Perú",      label: "🇵🇪 Perú" },
  { value: "Colombia",  label: "🇨🇴 Colombia" },
  { value: "México",    label: "🇲🇽 México" },
  { value: "Chile",     label: "🇨🇱 Chile" },
  { value: "Argentina", label: "🇦🇷 Argentina" },
  { value: "Otro",      label: "🌎 Otro" },
];
</script>

<template>
  <AppLayout title="Explorar grupos" subtitle="STEM-Trust · Encuentra tu comunidad">
    <template #topbar-actions>
      <button
        @click="router.push('/groups/new')"
        class="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-violet-500/20"
      >
        <Plus class="w-3.5 h-3.5" /> Crear grupo
      </button>
    </template>

    <div class="p-5 sm:p-8 space-y-8">

      <!-- ── HERO BANNER ── -->
      <div class="relative bg-gradient-to-r from-cyan-600/20 via-teal-600/15 to-transparent border border-cyan-500/20 rounded-2xl px-6 py-7 overflow-hidden">
        <div class="absolute top-0 right-0 w-72 h-full bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none"></div>
        <div class="absolute -right-10 -top-10 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative z-10 max-w-lg">
          <p class="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Sparkles class="w-3.5 h-3.5" /> HU4 · HU5 · HU6
          </p>
          <h2 class="text-2xl font-extrabold text-white mb-2">Grupos de ahorro STEM disponibles</h2>
          <p class="text-slate-400 text-sm leading-relaxed">
            Únete a una comunidad con tus mismos intereses. La IA de STEM-Trust calcula tu afinidad con cada grupo en base a tu perfil.
          </p>
        </div>
      </div>

      <!-- ── RECOMMENDED ── -->
      <div v-if="recommended.length > 0">
        <div class="flex items-center gap-2 mb-4">
          <Star class="w-4 h-4 text-amber-400" />
          <h3 class="text-sm font-semibold text-amber-300 uppercase tracking-widest">Recomendados para ti</h3>
          <span class="text-xs text-slate-500">(basado en tu perfil)</span>
        </div>
        <div class="grid sm:grid-cols-3 gap-4">
          <button
            v-for="g in recommended"
            :key="g.id"
            @click="goDetail(g.slug)"
            class="group text-left bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
          >
            <div class="flex items-start justify-between mb-3">
              <span class="text-2xl">{{ objetivoConfig[g.objetivo]?.emoji }}</span>
              <div class="flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">
                <TrendingUp class="w-3 h-3" /> {{ g.computedScore }}% match
              </div>
            </div>
            <h4 class="text-sm font-bold text-white mb-1 leading-tight">{{ g.name }}</h4>
            <p class="text-xs text-slate-400 mb-3 line-clamp-2">{{ g.description }}</p>
            <!-- Progress -->
            <div class="mb-2">
              <div class="flex justify-between text-xs text-slate-500 mb-1">
                <span>S/ {{ g.montoActual.toLocaleString() }} / S/ {{ g.montoObjetivo.toLocaleString() }}</span>
                <span class="text-amber-400 font-medium">{{ progressPct(g) }}%</span>
              </div>
              <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all" :style="{ width: progressPct(g) + '%' }"></div>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span class="flex items-center gap-1"><Users class="w-3 h-3" /> {{ g.participantes }}/{{ g.maxParticipantes }}</span>
              <span class="flex items-center gap-1"><MapPin class="w-3 h-3" /> {{ g.ubicacion.split(",")[0] }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- ── SEARCH + FILTERS ── -->
      <div class="space-y-3">
        <div class="flex gap-3">
          <!-- Search -->
          <div class="relative flex-1">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar por nombre, descripción o ciudad..."
              class="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 pl-10 text-sm outline-none transition-all"
            />
            <button v-if="search" @click="search = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Filter toggle -->
          <button
            @click="showFilters = !showFilters"
            :class="['flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
              showFilters || activeFilterCount > 0
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20']"
          >
            <SlidersHorizontal class="w-4 h-4" />
            Filtros
            <span v-if="activeFilterCount > 0" class="bg-violet-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {{ activeFilterCount }}
            </span>
          </button>
        </div>

        <!-- Filter panel -->
        <Transition name="slide-down">
          <div v-if="showFilters" class="bg-white/5 border border-white/10 rounded-2xl p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <!-- Objetivo -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400">Activo objetivo</label>
              <select v-model="filterObjetivo" class="w-full bg-[#0D1225] border border-white/10 text-sm text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-violet-500/50">
                <option v-for="o in objetivoOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
            <!-- País -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400">País</label>
              <select v-model="filterPais" class="w-full bg-[#0D1225] border border-white/10 text-sm text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-violet-500/50">
                <option v-for="p in paisOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>
            <!-- Nivel -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400">Nivel</label>
              <select v-model="filterNivel" class="w-full bg-[#0D1225] border border-white/10 text-sm text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-violet-500/50">
                <option value="">Todos</option>
                <option value="social">Social (Gratis)</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <!-- Status -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400">Estado</label>
              <select v-model="filterStatus" class="w-full bg-[#0D1225] border border-white/10 text-sm text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-violet-500/50">
                <option value="">Todos</option>
                <option value="open">Abierto</option>
                <option value="full">Completo</option>
                <option value="in_progress">En progreso</option>
              </select>
            </div>
            <!-- Sort -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400">Ordenar por</label>
              <select v-model="sortBy" class="w-full bg-[#0D1225] border border-white/10 text-sm text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-violet-500/50">
                <option value="match">Mayor afinidad</option>
                <option value="monto">Menor monto</option>
                <option value="plazo">Menor plazo</option>
                <option value="reciente">Más reciente</option>
              </select>
            </div>
            <!-- Clear -->
            <div class="sm:col-span-2 lg:col-span-5 flex justify-end">
              <button @click="clearFilters" class="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
                <X class="w-3 h-3" /> Limpiar filtros
              </button>
            </div>
          </div>
        </Transition>

        <!-- Status chips -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="status in [{v:'open',l:'Abiertos'},{v:'full',l:'Completos'},{v:'in_progress',l:'En progreso'},{v:'',l:'Todos'}]"
            :key="status.v"
            @click="filterStatus = status.v"
            :class="['text-xs px-3 py-1.5 rounded-full border transition-all',
              filterStatus === status.v
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white']"
          >
            {{ status.l }}
          </button>
          <span class="text-xs text-slate-600 flex items-center ml-auto">
            {{ filteredGroups.length }} grupo{{ filteredGroups.length !== 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <!-- ── GROUP GRID ── -->
      <div v-if="filteredGroups.length > 0" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <button
          v-for="g in filteredGroups"
          :key="g.id"
          @click="goDetail(g.slug)"
          class="group text-left bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/25 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30"
        >
          <!-- Card header -->
          <div class="px-5 pt-5 pb-4">
            <!-- Top row -->
            <div class="flex items-start justify-between mb-4">
              <div :class="`w-11 h-11 rounded-xl ${objetivoConfig[g.objetivo]?.bg} border flex items-center justify-center text-xl shrink-0`">
                {{ objetivoConfig[g.objetivo]?.emoji }}
              </div>
              <div class="flex flex-col items-end gap-1.5">
                <span :class="`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig[g.status]?.bg} ${statusConfig[g.status]?.color}`">
                  {{ statusConfig[g.status]?.label }}
                </span>
                <span :class="`text-xs px-2 py-0.5 rounded-full border ${g.nivel === 'pro' ? 'bg-violet-500/15 border-violet-500/30 text-violet-400' : 'bg-slate-500/15 border-slate-500/30 text-slate-400'}`">
                  {{ g.nivel === 'pro' ? '⚡ Pro' : '🆓 Social' }}
                </span>
              </div>
            </div>

            <!-- Name & desc -->
            <h3 class="text-base font-bold text-white leading-tight mb-1.5">{{ g.name }}</h3>
            <p class="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">{{ g.description }}</p>

            <!-- Progress -->
            <div class="mb-4">
              <div class="flex justify-between text-xs mb-1.5">
                <span class="text-slate-500">Recaudado</span>
                <span class="font-semibold" :class="progressPct(g) >= 80 ? 'text-emerald-400' : 'text-slate-300'">
                  {{ progressPct(g) }}%
                </span>
              </div>
              <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="progressPct(g) >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-violet-500 to-indigo-400'"
                  :style="{ width: progressPct(g) + '%' }"
                ></div>
              </div>
              <div class="flex justify-between text-xs mt-1 text-slate-500">
                <span>S/ {{ g.montoActual.toLocaleString() }}</span>
                <span>S/ {{ g.montoObjetivo.toLocaleString() }}</span>
              </div>
            </div>

            <!-- Meta row -->
            <div class="grid grid-cols-3 gap-2 text-xs text-slate-400 mb-4">
              <div class="flex flex-col items-center bg-white/5 rounded-xl py-2">
                <Users class="w-3.5 h-3.5 mb-1 text-slate-500" />
                <span class="font-semibold text-white">{{ g.participantes }}/{{ g.maxParticipantes }}</span>
                <span class="text-slate-600 text-[10px]">integrantes</span>
              </div>
              <div class="flex flex-col items-center bg-white/5 rounded-xl py-2">
                <Clock class="w-3.5 h-3.5 mb-1 text-slate-500" />
                <span class="font-semibold text-white">{{ g.plazoMeses }}m</span>
                <span class="text-slate-600 text-[10px]">plazo</span>
              </div>
              <div class="flex flex-col items-center bg-white/5 rounded-xl py-2">
                <CircleDollarSign class="w-3.5 h-3.5 mb-1 text-slate-500" />
                <span class="font-semibold text-white">{{ g.aporteMensual }}</span>
                <span class="text-slate-600 text-[10px]">S//mes</span>
              </div>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span
                v-for="tag in g.tags.slice(0,3)"
                :key="tag"
                class="text-[11px] bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-full"
              >
                {{ tagConfig[tag]?.emoji }} {{ tagConfig[tag]?.label }}
              </span>
            </div>

            <!-- Organizer -->
            <div class="flex items-center gap-2 pt-3 border-t border-white/5">
              <div :class="`w-7 h-7 rounded-full bg-gradient-to-br ${g.organizer.color} flex items-center justify-center text-[10px] font-bold shrink-0`">
                {{ g.organizer.initials }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-slate-300 truncate">{{ g.organizer.name }}</p>
                <p class="text-[10px] text-slate-500 truncate">{{ g.organizer.role }}</p>
              </div>
              <div class="flex items-center gap-0.5 text-amber-400 text-[10px] shrink-0">
                <Star class="w-3 h-3 fill-current" /> {{ g.organizer.rating }}
              </div>
            </div>
          </div>

          <!-- Footer CTA -->
          <div :class="['flex items-center justify-between px-5 py-3 border-t border-white/5 transition-all',
            g.status === 'open' ? 'group-hover:bg-violet-500/10' : 'opacity-50']">
            <span class="text-xs font-medium" :class="g.status === 'open' ? 'text-violet-300' : 'text-slate-500'">
              {{ g.status === 'open' ? '✦ Cupos disponibles: ' + (g.maxParticipantes - g.participantes) : 'Sin cupos disponibles' }}
            </span>
            <div class="flex items-center gap-1 text-xs text-slate-400 group-hover:text-white transition-colors">
              Ver grupo <ChevronRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </button>
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Search class="w-7 h-7 text-slate-500" />
        </div>
        <h4 class="text-base font-bold text-white mb-2">Sin resultados</h4>
        <p class="text-sm text-slate-400 max-w-xs mb-4">No hay grupos que coincidan con tus filtros actuales.</p>
        <button @click="clearFilters" class="text-sm text-violet-400 hover:text-violet-300 transition-colors">
          Limpiar filtros
        </button>
      </div>

    </div>
  </AppLayout>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
