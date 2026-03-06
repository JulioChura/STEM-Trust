<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Landmark, Percent, Clock, ChevronRight, Star, Info,
  ShieldCheck, Zap, TrendingUp, BadgePercent, Search, SlidersHorizontal, X
} from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";

const router = useRouter();

// ── Datos simulados de entidades financieras ──────────────
const ofertas = [
  {
    id: 1,
    entidad: "Caja Arequipa",
    tipo: "Caja Rural",
    logo: "🏦",
    logoColor: "bg-blue-500/15 border-blue-500/30",
    producto: "Crédito Mujer Emprendedora",
    categoria: "prestamo",
    montoMin: 500,
    montoMax: 5000,
    tasaTEA: 28.5,
    plazoMin: 3,
    plazoMax: 24,
    moneda: "PEN",
    requisitos: ["DNI vigente", "Constancia de domicilio", "Historial STEM-Trust ≥ 65"],
    beneficios: ["Sin aval físico", "Desembolso en 48h", "Tasa preferencial para usuarias STEM"],
    scoreMinimo: 65,
    badge: "Recomendado",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    estrellas: 4.7,
    desc: "Línea de crédito diseñada para emprendedoras STEM. Tu Score de Confianza reemplaza el aval tradicional.",
    featured: true,
  },
  {
    id: 2,
    entidad: "Caja Cusco",
    tipo: "Caja Municipal",
    logo: "🏛️",
    logoColor: "bg-violet-500/15 border-violet-500/30",
    producto: "Préstamo Tecnológico",
    categoria: "prestamo",
    montoMin: 1000,
    montoMax: 8000,
    tasaTEA: 32.0,
    plazoMin: 6,
    plazoMax: 36,
    moneda: "PEN",
    requisitos: ["DNI vigente", "3 meses de historial en plataforma", "Score ≥ 70"],
    beneficios: ["Compra directa a proveedor", "Seguro de desempleo incluido", "Cuotas fijas"],
    scoreMinimo: 70,
    badge: "Fintech-friendly",
    badgeColor: "text-violet-400 bg-violet-500/10 border-violet-500/30",
    estrellas: 4.4,
    desc: "Crédito exclusivo para adquisición de activos tecnológicos educativos y productivos.",
    featured: false,
  },
  {
    id: 3,
    entidad: "Financiera Confianza",
    tipo: "Microfinanciera",
    logo: "💡",
    logoColor: "bg-amber-500/15 border-amber-500/30",
    producto: "MicroSTEM 360",
    categoria: "microcredito",
    montoMin: 200,
    montoMax: 2000,
    tasaTEA: 45.0,
    plazoMin: 1,
    plazoMax: 12,
    moneda: "PEN",
    requisitos: ["DNI vigente", "Score STEM-Trust ≥ 50"],
    beneficios: ["Primer préstamo sin historial bancario", "Aprobación en 24h", "Ideal para inicio de historial"],
    scoreMinimo: 50,
    badge: "Accesible",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    estrellas: 4.1,
    desc: "Microcrédito de entrada para quienes están construyendo su historial financiero desde cero.",
    featured: false,
  },
  {
    id: 4,
    entidad: "BCP",
    tipo: "Banco",
    logo: "🏢",
    logoColor: "bg-cyan-500/15 border-cyan-500/30",
    producto: "Préstamo Personal Digital",
    categoria: "prestamo",
    montoMin: 2000,
    montoMax: 30000,
    tasaTEA: 22.0,
    plazoMin: 12,
    plazoMax: 60,
    moneda: "PEN",
    requisitos: ["DNI", "Recibo de servicios", "Score STEM-Trust ≥ 80", "Historial 6+ meses"],
    beneficios: ["Tasa competitiva", "App bancaria integrada", "Banca partnership STEM-Trust"],
    scoreMinimo: 80,
    badge: "Banco Premium",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    estrellas: 4.9,
    desc: "Acceso a productos bancarios tradicionales avalado por tu Score de Comportamiento STEM-Trust.",
    featured: true,
  },
  {
    id: 5,
    entidad: "Kiva Latam",
    tipo: "ONG / Crowdfunding",
    logo: "🌐",
    logoColor: "bg-fuchsia-500/15 border-fuchsia-500/30",
    producto: "Fondo STEM Women",
    categoria: "crowdfunding",
    montoMin: 500,
    montoMax: 4000,
    tasaTEA: 0,
    plazoMin: 6,
    plazoMax: 24,
    moneda: "USD",
    requisitos: ["Perfil completo", "1+ grupo activo", "Score ≥ 55"],
    beneficios: ["0% de interés", "Comunidad global de prestamistas", "Propósito educativo reconocido"],
    scoreMinimo: 55,
    badge: "0% interés",
    badgeColor: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30",
    estrellas: 4.8,
    desc: "Financiamiento solidario internacional para proyectos STEM con impacto social en América Latina.",
    featured: false,
  },
  {
    id: 6,
    entidad: "Compartamos Financiera",
    tipo: "Microfinanciera",
    logo: "🤝",
    logoColor: "bg-indigo-500/15 border-indigo-500/30",
    producto: "Crédito Grupal Solidario",
    categoria: "grupal",
    montoMin: 300,
    montoMax: 3000,
    tasaTEA: 38.5,
    plazoMin: 3,
    plazoMax: 18,
    moneda: "PEN",
    requisitos: ["Grupo STEM-Trust activo", "Mínimo 3 integrantes", "Score grupal ≥ 60"],
    beneficios: ["Aval comunitario = tu garantía", "Tasa grupal menor que individual", "Progreso colectivo computable"],
    scoreMinimo: 60,
    badge: "Para grupos",
    badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    estrellas: 4.3,
    desc: "Crédito basado en el Score Grupal de tu junta. El aval solidario de tu grupo sustituye las garantías bancarias.",
    featured: false,
  },
];

const categorias = [
  { id: "todos",       label: "Todas" },
  { id: "prestamo",    label: "Préstamos" },
  { id: "microcredito",label: "Microcrédito" },
  { id: "grupal",      label: "Grupal" },
  { id: "crowdfunding",label: "Crowdfunding" },
];

const filterCat    = ref("todos");
const searchQuery  = ref("");
const sortBy       = ref("recomendado");
const selectedId   = ref(null);
const showDetalle  = ref(false);

const selected = computed(() => ofertas.find(o => o.id === selectedId.value) || null);

const filtered = computed(() => {
  let list = ofertas.filter(o => {
    const matchCat  = filterCat.value === "todos" || o.categoria === filterCat.value;
    const matchQ    = !searchQuery.value ||
      o.entidad.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      o.producto.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchCat && matchQ;
  });
  if (sortBy.value === "tasa")   list = [...list].sort((a, b) => a.tasaTEA - b.tasaTEA);
  if (sortBy.value === "monto")  list = [...list].sort((a, b) => b.montoMax - a.montoMax);
  if (sortBy.value === "score")  list = [...list].sort((a, b) => a.scoreMinimo - b.scoreMinimo);
  if (sortBy.value === "recomendado") list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  return list;
});

const featuredList = computed(() => ofertas.filter(o => o.featured));

function openDetalle(id) {
  selectedId.value = id;
  showDetalle.value = true;
}

function formatMonto(n, moneda) {
  return `${moneda === "USD" ? "US$" : "S/"} ${n.toLocaleString()}`;
}

function tasaLabel(tasa) {
  return tasa === 0 ? "0% TEA" : `${tasa.toFixed(1)}% TEA`;
}
</script>

<template>
  <AppLayout title="Ofertas Financieras" subtitle="Créditos y financiamiento adaptados a tu Score STEM-Trust">

    <div class="max-w-5xl mx-auto space-y-7 pb-16">

      <!-- ═══════════════════════════════════════════
           BANNER EXPLICATIVO
      ═══════════════════════════════════════════ -->
      <div class="relative bg-gradient-to-r from-violet-600/20 via-indigo-600/15 to-transparent border border-violet-500/25 rounded-3xl p-7 overflow-hidden">
        <div class="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none">
          <Landmark class="w-full h-full" />
        </div>
        <div class="relative z-10 flex items-start gap-5">
          <div class="w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-500/35 flex items-center justify-center shrink-0">
            <BadgePercent class="w-7 h-7 text-violet-400" />
          </div>
          <div>
            <h2 class="text-base font-bold text-white mb-1">Tu Score abre puertas al sistema financiero</h2>
            <p class="text-sm text-slate-400 leading-relaxed max-w-xl">
              STEM-Trust comparte tu historial de comportamiento con entidades financieras aliadas.  
              Cuanto mayor sea tu Score, mejores condiciones conseguirás: más monto, menor tasa, sin aval físico.
            </p>
            <div class="flex gap-4 mt-4">
              <div class="flex items-center gap-1.5 text-xs text-emerald-400">
                <ShieldCheck class="w-3.5 h-3.5" /> Sin historial bancario requerido
              </div>
              <div class="flex items-center gap-1.5 text-xs text-violet-400">
                <Zap class="w-3.5 h-3.5" /> Aprobación acelerada
              </div>
              <div class="flex items-center gap-1.5 text-xs text-cyan-400">
                <TrendingUp class="w-3.5 h-3.5" /> Condiciones mejoran con tu score
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           DESTACADOS
      ═══════════════════════════════════════════ -->
      <div>
        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">⭐ Destacados para ti</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <div
            v-for="o in featuredList"
            :key="o.id"
            @click="openDetalle(o.id)"
            class="cursor-pointer relative bg-[#0D1225] border border-white/8 rounded-2xl p-5 hover:border-violet-500/40 hover:bg-white/4 transition-all group overflow-hidden"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent pointer-events-none"></div>
            <div class="relative flex items-start gap-4">
              <div :class="`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shrink-0 ${o.logoColor}`">
                {{ o.logo }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <p class="text-sm font-bold text-white">{{ o.entidad }}</p>
                  <span :class="`text-[10px] font-bold border px-2 py-0.5 rounded-full ${o.badgeColor}`">{{ o.badge }}</span>
                </div>
                <p class="text-xs text-slate-400">{{ o.producto }}</p>
                <div class="flex items-center gap-4 mt-3">
                  <div>
                    <p class="text-[10px] text-slate-600">Hasta</p>
                    <p class="text-sm font-extrabold text-white">{{ formatMonto(o.montoMax, o.moneda) }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-600">Tasa TEA</p>
                    <p class="text-sm font-extrabold" :class="o.tasaTEA === 0 ? 'text-fuchsia-400' : 'text-amber-400'">{{ tasaLabel(o.tasaTEA) }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-600">Score mín.</p>
                    <p class="text-sm font-extrabold text-violet-400">{{ o.scoreMinimo }}</p>
                  </div>
                </div>
              </div>
              <ChevronRight class="w-4 h-4 text-slate-600 group-hover:text-violet-400 shrink-0 mt-1 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           FILTROS
      ═══════════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Buscador -->
        <div class="relative flex-1">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            v-model="searchQuery"
            placeholder="Buscar entidad o producto..."
            class="w-full bg-white/4 border border-white/10 focus:border-violet-500/50 text-sm text-white placeholder-slate-600 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all"
          />
        </div>

        <!-- Categoría -->
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="cat in categorias"
            :key="cat.id"
            @click="filterCat = cat.id"
            :class="`text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${
              filterCat === cat.id
                ? 'bg-violet-500/15 border-violet-500/35 text-violet-300'
                : 'border-white/8 text-slate-500 hover:text-slate-300'
            }`"
          >{{ cat.label }}</button>
        </div>

        <!-- Ordenar -->
        <select
          v-model="sortBy"
          class="bg-white/4 border border-white/10 text-sm text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-violet-500/50"
        >
          <option value="recomendado">Recomendados</option>
          <option value="tasa">Menor tasa</option>
          <option value="monto">Mayor monto</option>
          <option value="score">Menor score req.</option>
        </select>
      </div>

      <!-- ═══════════════════════════════════════════
           LISTADO DE OFERTAS
      ═══════════════════════════════════════════ -->
      <div class="space-y-3">
        <div
          v-for="o in filtered"
          :key="o.id"
          @click="openDetalle(o.id)"
          class="cursor-pointer bg-[#0D1225] border border-white/8 rounded-2xl p-5 hover:border-violet-500/30 hover:bg-white/3 transition-all group"
        >
          <div class="flex items-center gap-4">
            <!-- Logo -->
            <div :class="`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shrink-0 ${o.logoColor}`">
              {{ o.logo }}
            </div>

            <!-- Info principal -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-0.5">
                <p class="text-sm font-bold text-white">{{ o.producto }}</p>
                <span :class="`text-[10px] font-bold border px-2 py-0.5 rounded-full ${o.badgeColor}`">{{ o.badge }}</span>
              </div>
              <p class="text-xs text-slate-500">{{ o.entidad }} · {{ o.tipo }}</p>
              <div class="flex items-center gap-1 mt-1">
                <Star v-for="i in 5" :key="i" :class="`w-3 h-3 ${i <= Math.round(o.estrellas) ? 'text-amber-400' : 'text-slate-700'}`" />
                <span class="text-[11px] text-slate-500 ml-1">{{ o.estrellas }}</span>
              </div>
            </div>

            <!-- Métricas -->
            <div class="hidden sm:flex items-center gap-6 shrink-0">
              <div class="text-center">
                <p class="text-[10px] text-slate-600 mb-0.5">Monto máx.</p>
                <p class="text-sm font-extrabold text-white">{{ formatMonto(o.montoMax, o.moneda) }}</p>
              </div>
              <div class="text-center">
                <p class="text-[10px] text-slate-600 mb-0.5">Tasa</p>
                <p class="text-sm font-extrabold" :class="o.tasaTEA === 0 ? 'text-fuchsia-400' : o.tasaTEA < 30 ? 'text-emerald-400' : o.tasaTEA < 40 ? 'text-amber-400' : 'text-rose-400'">
                  {{ tasaLabel(o.tasaTEA) }}
                </p>
              </div>
              <div class="text-center">
                <p class="text-[10px] text-slate-600 mb-0.5">Plazo</p>
                <p class="text-sm font-extrabold text-white">{{ o.plazoMin }}–{{ o.plazoMax }} m.</p>
              </div>
              <div class="text-center">
                <p class="text-[10px] text-slate-600 mb-0.5">Score mín.</p>
                <p class="text-sm font-extrabold text-violet-400">{{ o.scoreMinimo }}</p>
              </div>
            </div>

            <ChevronRight class="w-4 h-4 text-slate-600 group-hover:text-violet-400 shrink-0 transition-colors" />
          </div>
        </div>

        <!-- Vacío -->
        <div v-if="!filtered.length" class="text-center py-16">
          <BadgePercent class="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p class="text-slate-500">No hay ofertas para tu búsqueda</p>
          <button @click="searchQuery = ''; filterCat = 'todos'" class="mt-3 text-xs text-violet-400 hover:text-violet-300">
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           AVISO LEGAL
      ═══════════════════════════════════════════ -->
      <div class="flex items-start gap-3 bg-white/4 border border-white/8 rounded-2xl px-5 py-4">
        <Info class="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
        <p class="text-xs text-slate-600 leading-relaxed">
          Las ofertas mostradas son simulaciones para demostración del MVP. Las tasas, montos y condiciones son referenciales.  
          STEM-Trust actúa como conector entre usuarias y entidades financieras, no como entidad crediticia.  
          Toda operación financiera real estará sujeta a la evaluación de la entidad correspondiente.
        </p>
      </div>

    </div>

    <!-- ═══════════════════════════════════════════
         MODAL DETALLE
    ═══════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDetalle && selected"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="showDetalle = false"
        >
          <div class="relative w-full max-w-lg bg-[#0D1225] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

            <!-- Header -->
            <div class="flex items-start gap-4 p-6 border-b border-white/8">
              <div :class="`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl shrink-0 ${selected.logoColor}`">
                {{ selected.logo }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-0.5">
                  <h3 class="text-base font-bold text-white">{{ selected.producto }}</h3>
                  <span :class="`text-[10px] font-bold border px-2 py-0.5 rounded-full ${selected.badgeColor}`">{{ selected.badge }}</span>
                </div>
                <p class="text-sm text-slate-400">{{ selected.entidad }} · {{ selected.tipo }}</p>
                <div class="flex items-center gap-1 mt-1">
                  <Star v-for="i in 5" :key="i" :class="`w-3 h-3 ${i <= Math.round(selected.estrellas) ? 'text-amber-400' : 'text-slate-700'}`" />
                  <span class="text-[11px] text-slate-500 ml-1">{{ selected.estrellas }}</span>
                </div>
              </div>
              <button @click="showDetalle = false" class="text-slate-600 hover:text-white transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-5 max-h-[65vh] overflow-y-auto">

              <!-- Descripción -->
              <p class="text-sm text-slate-400 leading-relaxed">{{ selected.desc }}</p>

              <!-- Métricas principales -->
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-white/4 border border-white/8 rounded-2xl p-4">
                  <p class="text-[11px] text-slate-500 mb-1">Monto disponible</p>
                  <p class="text-lg font-extrabold text-white">{{ formatMonto(selected.montoMin, selected.moneda) }} – {{ formatMonto(selected.montoMax, selected.moneda) }}</p>
                </div>
                <div class="bg-white/4 border border-white/8 rounded-2xl p-4">
                  <p class="text-[11px] text-slate-500 mb-1">Tasa TEA anual</p>
                  <p class="text-lg font-extrabold" :class="selected.tasaTEA === 0 ? 'text-fuchsia-400' : selected.tasaTEA < 30 ? 'text-emerald-400' : selected.tasaTEA < 40 ? 'text-amber-400' : 'text-rose-400'">
                    {{ tasaLabel(selected.tasaTEA) }}
                  </p>
                </div>
                <div class="bg-white/4 border border-white/8 rounded-2xl p-4">
                  <p class="text-[11px] text-slate-500 mb-1">Plazo</p>
                  <p class="text-lg font-extrabold text-white">{{ selected.plazoMin }} – {{ selected.plazoMax }} meses</p>
                </div>
                <div class="bg-white/4 border border-white/8 rounded-2xl p-4">
                  <p class="text-[11px] text-slate-500 mb-1">Score mínimo requerido</p>
                  <p class="text-lg font-extrabold text-violet-400">{{ selected.scoreMinimo }} puntos</p>
                </div>
              </div>

              <!-- Beneficios -->
              <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Beneficios</p>
                <div class="space-y-2">
                  <div v-for="b in selected.beneficios" :key="b" class="flex items-center gap-3 text-sm text-slate-300">
                    <div class="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    </div>
                    {{ b }}
                  </div>
                </div>
              </div>

              <!-- Requisitos -->
              <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Requisitos</p>
                <div class="space-y-2">
                  <div v-for="r in selected.requisitos" :key="r" class="flex items-center gap-3 text-sm text-slate-400">
                    <div class="w-5 h-5 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0">
                      <div class="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                    </div>
                    {{ r }}
                  </div>
                </div>
              </div>

            </div>

            <!-- Footer CTA -->
            <div class="p-6 pt-0 border-t border-white/8 mt-0 flex flex-col gap-3">
              <button class="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-violet-500/20">
                Solicitar oferta →
              </button>
              <p class="text-center text-[11px] text-slate-700">Simulación demo · No genera compromisos financieros reales</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </AppLayout>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
