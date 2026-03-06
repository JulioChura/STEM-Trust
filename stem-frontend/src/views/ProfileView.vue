<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import {
  Sparkles, Star, Shield, TrendingUp, Clock, CheckCircle, Users,
  CircleDollarSign, Award, Zap, Target, Calendar, BarChart2,
  AlertCircle, ChevronRight, Laptop, MapPin, Mail, Edit3, Lock
} from "lucide-vue-next";
import { authStore } from "../stores/authStore";
import AppLayout from "../components/AppLayout.vue";
import mockData from "./pagos/data/pagos.json";
import { mockGroups, objetivoConfig } from "../data/mockGroups.js";

const router = useRouter();

// ── User info ──────────────────────────────────────────────
const user = computed(() => authStore.user);
const displayName = computed(() => {
  const u = user.value;
  if (!u) return "Usuaria STEM";
  if (u.first_name || u.last_name) return `${u.first_name || ""} ${u.last_name || ""}`.trim();
  return u.email?.split("@")[0] || "Usuaria STEM";
});
const initials = computed(() => {
  const parts = displayName.value.split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : displayName.value.slice(0, 2).toUpperCase();
});

// ── Grupos joined ──────────────────────────────────────────
const joinedGroups = computed(() => {
  try { return JSON.parse(localStorage.getItem("joined_groups") || "[]"); }
  catch { return []; }
});
const myCreatedGroups = computed(() => {
  try { return JSON.parse(localStorage.getItem("my_groups") || "[]"); }
  catch { return []; }
});

// ── Pagos data ────────────────────────────────────────────
const pagos        = mockData.pagos;
const resumen      = mockData.resumen;
const pagosValidos  = pagos.filter(p => p.estado === "validado");
const pagosEnTiempo = pagosValidos.filter(p => p.puntualidad !== null && p.puntualidad >= 0);
const pagosTardios  = pagosValidos.filter(p => p.puntualidad !== null && p.puntualidad < 0);

// ── Score de confianza (HU13) ─────────────────────────────
// Algoritmo:
//  (1) Tasa de puntualidad  → 0-40 pts   (% pagos a tiempo sobre validados)
//  (2) Consistencia         → 0-25 pts   (nº pagos validados, cap en 8)
//  (3) Verificación OCR     → 0-20 pts   (% comprobantes verificados)
//  (4) Participación grupal → 0-10 pts   (nº grupos activos, cap en 5)
//  (5) Sin pagos tardíos    → 0-5 pts    (bonus si 0 tardíos)

const scoreBreakdown = computed(() => {
  const totalVal = pagosValidos.length || 1;

  const puntualidadRate = pagosValidos.length > 0
    ? pagosEnTiempo.length / pagosValidos.length : 0;
  const puntualidadPts = Math.round(puntualidadRate * 40);

  const consistenciaPts = Math.min(pagosValidos.length, 8) / 8 * 25;

  const ocrCount = pagosValidos.filter(p => p.ocr_verificado).length;
  const ocrPts   = Math.round((ocrCount / totalVal) * 20);

  const gruposPts = Math.min(joinedGroups.value.length, 5) / 5 * 10;

  const bonusPts = pagosTardios.length === 0 ? 5 : 0;

  const total = Math.round(puntualidadPts + consistenciaPts + ocrPts + gruposPts + bonusPts);

  return {
    total: Math.min(total, 100),
    puntualidad:  { pts: puntualidadPts,        max: 40, label: "Puntualidad de aportes",  icon: Clock },
    consistencia: { pts: Math.round(consistenciaPts), max: 25, label: "Consistencia de pagos", icon: TrendingUp },
    ocr:         { pts: ocrPts,                max: 20, label: "Verificación OCR",         icon: CheckCircle },
    grupos:      { pts: Math.round(gruposPts),  max: 10, label: "Participación grupal",     icon: Users },
    bonus:       { pts: bonusPts,               max: 5,  label: "Bonus sin tardanzas",      icon: Zap },
  };
});

const score = computed(() => scoreBreakdown.value.total);

// ── Score Individual (comportamiento personal de pagos) ───
// Basado exclusivamente en dimensiones propias: puntualidad + consistencia + OCR + bonus
const scoreIndividual = computed(() => {
  const b = scoreBreakdown.value;
  // Esas 3 dimensiones suman hasta 65 pts → normalizar a 100
  const raw = b.puntualidad.pts + b.consistencia.pts + b.ocr.pts + b.bonus.pts;
  return Math.min(Math.round(raw / 90 * 100), 100);
});

const scoreIndividualTier = computed(() => {
  const s = scoreIndividual.value;
  if (s >= 90) return { label: "Excelente", color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   bar: "from-amber-400 to-yellow-300",   icon: "🏆" };
  if (s >= 70) return { label: "Muy bueno", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", bar: "from-emerald-400 to-teal-300",   icon: "✅" };
  if (s >= 50) return { label: "Regular",   color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/30",    bar: "from-cyan-400 to-blue-300",     icon: "📈" };
  return         { label: "Inicial",   color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/30",  bar: "from-violet-400 to-indigo-300", icon: "🌱" };
});

// ── Score Grupal (comportamiento dentro de grupos) ───────
// Basado en participación, rol, diversidad y tamaño de grupos
const scoreGrupal = computed(() => {
  const total  = joinedGroups.value.length;
  const org    = myCreatedGroups.value.length;
  // Participación (0-40): hasta 5 grupos
  const partPts  = Math.min(total, 5) / 5 * 40;
  // Rol organizadora (0-25): cada grupo liderado suma
  const orgPts   = Math.min(org, 3) / 3 * 25;
  // Diversidad de objetivos (0-20): objetivos únicos
  const uniqueObj = new Set(joinedGroups.value.map(g => g.objetivo)).size;
  const divPts   = Math.min(uniqueObj, 4) / 4 * 20;
  // Completitud del perfil de grupos (0-15): tiene foto comprobante, etc.
  const pagosEnGrupo = pagosValidos.length;
  const complPts = Math.min(pagosEnGrupo, 3) / 3 * 15;
  return Math.min(Math.round(partPts + orgPts + divPts + complPts), 100);
});

const scoreGrupalTier = computed(() => {
  const s = scoreGrupal.value;
  if (s >= 85) return { label: "Líder",       color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/30", bar: "from-fuchsia-400 to-violet-400",  icon: "👑" };
  if (s >= 65) return { label: "Activa",      color: "text-indigo-400",  bg: "bg-indigo-500/10",  border: "border-indigo-500/30",  bar: "from-indigo-400 to-blue-400",    icon: "🤝" };
  if (s >= 40) return { label: "Participante",color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/30",    bar: "from-cyan-400 to-teal-300",      icon: "👥" };
  return         { label: "Nueva",       color: "text-slate-400",  bg: "bg-slate-500/10",  border: "border-slate-500/30",  bar: "from-slate-400 to-slate-300",   icon: "🌱" };
});

// SVG params for mini gauges
const R2 = 36;
const C2 = 2 * Math.PI * R2;
const dashIndividual = computed(() => C2 * (1 - scoreIndividual.value / 100));
const dashGrupal     = computed(() => C2 * (1 - scoreGrupal.value     / 100));

const scoreTier = computed(() => {
  const s = score.value;
  if (s >= 90) return { label: "Elite", color: "text-amber-400",   ring: "ring-amber-400/40",   bg: "bg-amber-500/10",   bar: "from-amber-400 to-yellow-300",  desc: "Reputación financiera excepcional" };
  if (s >= 75) return { label: "Alta",  color: "text-emerald-400", ring: "ring-emerald-400/40", bg: "bg-emerald-500/10", bar: "from-emerald-400 to-teal-300",  desc: "Muy confiable — historial sólido" };
  if (s >= 55) return { label: "Media", color: "text-cyan-400",    ring: "ring-cyan-400/40",    bg: "bg-cyan-500/10",    bar: "from-cyan-400 to-blue-300",     desc: "En crecimiento — sigue mejorando" };
  return         { label: "Inicial",   color: "text-violet-400",  ring: "ring-violet-400/40",  bg: "bg-violet-500/10",  bar: "from-violet-400 to-indigo-300", desc: "Comienza tu historial de confianza" };
});

// SVG circle params
const RADIUS  = 54;
const CIRCUM  = 2 * Math.PI * RADIUS;
const dashOff = computed(() => CIRCUM * (1 - score.value / 100));

// ── Logros / badges ───────────────────────────────────────
const badges = computed(() => {
  const earned = [];
  if (score.value >= 90)                              earned.push({ icon: "🏆", label: "Top Score",          desc: "Score ≥ 90", color: "border-amber-500/30 bg-amber-500/10" });
  if (pagosEnTiempo.length >= 3)                      earned.push({ icon: "⚡", label: "Puntual",            desc: "3+ pagos a tiempo", color: "border-emerald-500/30 bg-emerald-500/10" });
  if (pagosTardios.length === 0 && pagosValidos.length) earned.push({ icon: "🛡️", label: "Zero tardanzas",    desc: "Sin ningún pago tardío", color: "border-cyan-500/30 bg-cyan-500/10" });
  if (myCreatedGroups.value.length >= 1)              earned.push({ icon: "👑", label: "Organizadora",       desc: "Creaste un grupo STEM", color: "border-violet-500/30 bg-violet-500/10" });
  if (joinedGroups.value.length >= 2)                 earned.push({ icon: "🤝", label: "Colaboradora",       desc: "2+ grupos activos", color: "border-indigo-500/30 bg-indigo-500/10" });
  if (pagosValidos.filter(p => p.ocr_verificado).length >= 3) earned.push({ icon: "🔬", label: "OCR Pro",    desc: "3+ comprobantes verificados", color: "border-rose-500/30 bg-rose-500/10" });
  // Always give first badge
  if (!earned.length) earned.push({ icon: "🌱", label: "Nuevasita",        desc: "Bienvenida a STEM-Trust", color: "border-slate-500/30 bg-slate-500/10" });
  return earned;
});

// ── Timeline de actividad ─────────────────────────────────
const activityLog = computed(() => {
  const events = [];
  pagosValidos.slice(-4).reverse().forEach(p => {
    events.push({
      icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10",
      text: `Aporte validado · ${p.grupo}`,
      sub: `S/ ${p.monto} · ${p.metodo}`,
      date: p.fecha,
    });
  });
  joinedGroups.value.slice(-2).reverse().forEach(g => {
    events.push({
      icon: Users, color: "text-violet-400", bg: "bg-violet-500/10",
      text: `Te uniste a ${g.name}`,
      sub: `Grupo ${g.isOrganizer ? "organizado" : "como miembro"}`,
      date: null,
    });
  });
  return events.slice(0, 5);
});

// ── Onboarding data ───────────────────────────────────────
const onboardingTopics = computed(() => {
  try { return JSON.parse(localStorage.getItem("onboarding_topics") || "[]"); }
  catch { return []; }
});
const onboardingObjetivo = computed(() => localStorage.getItem("onboarding_objetivo") || null);

const topicEmojis = {
  programacion: "💻", ia: "🤖", ciberseguridad: "🔐", datos: "📊",
  robotica: "🦾", electronica: "⚡", bioingenieria: "🧬", educacion: "📚",
};

// ── Stats cards ───────────────────────────────────────────
const statsCards = computed(() => [
  {
    label: "Total aportado",
    value: `S/ ${resumen.totalAportado.toLocaleString()}`,
    icon: CircleDollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    label: "Grupos activos",
    value: joinedGroups.value.length,
    icon: Users, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    label: "Pagos validados",
    value: pagosValidos.length,
    icon: CheckCircle, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    label: "Grupos creados",
    value: myCreatedGroups.value.length,
    icon: Award, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20",
  },
]);

// ══════════════════════════════════════════════════════════
//  ACTIVOS STEM — catálogo de herramientas que la usuaria
//  financia / ha adquirido a través de grupos
// ══════════════════════════════════════════════════════════
const assetTab = ref("todos");

const stemAssets = [
  {
    id: 1, emoji: "💻", name: "MacBook Air M2",
    cat: "Hardware", catColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25",
    objetivo: 1800, ahorrado: 1800, estado: "adquirido",
    grupo: "Codelandia", fechaAdq: "Nov 2025",
    desc: "Laptop principal para desarrollo",
  },
  {
    id: 2, emoji: "✏️", name: "Tablet Wacom Intuos",
    cat: "Diseño", catColor: "text-pink-400 bg-pink-500/10 border-pink-500/25",
    objetivo: 450, ahorrado: 351, estado: "ahorrando",
    grupo: "Diseñadoras Pro", fechaAdq: null,
    desc: "Para ilustración y UX/UI",
  },
  {
    id: 3, emoji: "🎓", name: "Bootcamp Full Stack",
    cat: "Educación", catColor: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    objetivo: 1200, ahorrado: 540, estado: "ahorrando",
    grupo: "Dev Sisters", fechaAdq: null,
    desc: "React + Node · 6 meses",
  },
  {
    id: 4, emoji: "📡", name: "Kit IoT Arduino Pro",
    cat: "Hardware", catColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25",
    objetivo: 280, ahorrado: 280, estado: "adquirido",
    grupo: "Makers LATAM", fechaAdq: "Ene 2026",
    desc: "Sensores + microcontroladores",
  },
  {
    id: 5, emoji: "🖥️", name: "Monitor Ultrawide 34\"",
    cat: "Hardware", catColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25",
    objetivo: 700, ahorrado: 168, estado: "ahorrando",
    grupo: "Setup Pro", fechaAdq: null,
    desc: "LG 34\" curvo para productividad",
  },
  {
    id: 6, emoji: "🔬", name: "Microscopio digital",
    cat: "Ciencia", catColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    objetivo: 380, ahorrado: 0, estado: "próximo",
    grupo: null, fechaAdq: null,
    desc: "Para biología y electrónica",
  },
];

const filteredAssets = computed(() => {
  if (assetTab.value === "adquiridos") return stemAssets.filter(a => a.estado === "adquirido");
  if (assetTab.value === "ahorrando")  return stemAssets.filter(a => a.estado === "ahorrando");
  return stemAssets;
});

const assetStats = computed(() => ({
  adquiridos:    stemAssets.filter(a => a.estado === "adquirido").length,
  ahorrando:     stemAssets.filter(a => a.estado === "ahorrando").length,
  totalInvertido: stemAssets.filter(a => a.estado === "adquirido").reduce((s, a) => s + a.objetivo, 0),
  totalEnCurso:  stemAssets.filter(a => a.estado === "ahorrando").reduce((s, a) => s + a.ahorrado, 0),
}));

// ══════════════════════════════════════════════════════════
//  PROGRESO STEM — sistema de niveles + hitos alcanzados
// ══════════════════════════════════════════════════════════

// XP formula: pagos *15 + grupos *30 + score *3 + activos adquiridos *75
const stemXP = computed(() => {
  const pXP  = pagosValidos.length * 15;
  const gXP  = joinedGroups.value.length * 30;
  const sXP  = Math.round(score.value * 3);
  const aXP  = stemAssets.filter(a => a.estado === "adquirido").length * 75;
  return pXP + gXP + sXP + aXP;
});

const LEVEL_XP         = [0, 100, 250, 500, 900, 1500, 2400];
const LEVEL_NAMES      = ["", "Exploradora", "Aprendiz", "Constructora", "Innovadora", "Pionera", "Visionaria"];
const LEVEL_COLORS     = ["", "text-slate-400", "text-emerald-400", "text-cyan-400", "text-violet-400", "text-fuchsia-400", "text-amber-400"];
const LEVEL_GRADIENTS  = ["", "from-slate-500 to-slate-400", "from-emerald-500 to-teal-400", "from-cyan-500 to-blue-400",
                             "from-violet-500 to-indigo-400", "from-fuchsia-500 to-violet-400", "from-amber-400 to-yellow-300"];
const LEVEL_BG         = ["", "bg-slate-500/10 border-slate-500/25", "bg-emerald-500/10 border-emerald-500/25",
                             "bg-cyan-500/10 border-cyan-500/25", "bg-violet-500/10 border-violet-500/25",
                             "bg-fuchsia-500/10 border-fuchsia-500/25", "bg-amber-500/10 border-amber-500/25"];

const stemLevel = computed(() => {
  const xp = stemXP.value;
  let lv = 1;
  for (let i = 1; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) lv = i + 1; else break;
  }
  return Math.min(lv, LEVEL_NAMES.length - 1);
});

const stemLevelInfo = computed(() => {
  const lv   = stemLevel.value;
  const xpCur = LEVEL_XP[lv - 1];
  const xpNext = LEVEL_XP[lv] ?? null;
  const pct  = xpNext ? Math.min(Math.round((stemXP.value - xpCur) / (xpNext - xpCur) * 100), 100) : 100;
  return {
    level:    lv,
    name:     LEVEL_NAMES[lv],
    color:    LEVEL_COLORS[lv],
    gradient: LEVEL_GRADIENTS[lv],
    bg:       LEVEL_BG[lv],
    xp:       stemXP.value,
    xpNext,
    pct,
    xpToNext: xpNext ? xpNext - stemXP.value : 0,
  };
});

// Milestones dinámicos derivados del estado real del usuario
const stemMilestones = computed(() => {
  const done = [];
  const pend = [];

  if (pagosValidos.length >= 1)
    done.push({ emoji: "💸", label: "Primer aporte validado",      sub: "Historial financiero iniciado",     date: "Ene 2026" });
  if (joinedGroups.value.length >= 1)
    done.push({ emoji: "🤝", label: "Primer grupo activo",          sub: "Comunidad de ahorro colaborativo",  date: "Dic 2025" });
  if (stemAssets.filter(a => a.estado === "adquirido").length >= 1)
    done.push({ emoji: "✅", label: "Primer activo STEM adquirido", sub: "Herramienta financiada con el grupo", date: "Nov 2025" });
  if (score.value >= 75)
    done.push({ emoji: "⭐", label: "Score 'Alta' alcanzado",       sub: "Reputación financiera sólida",      date: "Feb 2026" });
  if (myCreatedGroups.value.length >= 1)
    done.push({ emoji: "👑", label: "Grupo propio creado",          sub: "Eres organizadora activa",          date: "Feb 2026" });
  if (pagosValidos.length >= 5)
    done.push({ emoji: "🔥", label: "5 aportes validados",          sub: "Consistencia financiera demostrada",date: "Feb 2026" });

  if (score.value < 90)
    pend.push({ emoji: "🏆", label: "Alcanzar Score Elite",         sub: `Faltan ${90 - score.value} puntos`,  target: "Score ≥ 90" });
  if (joinedGroups.value.length < 5)
    pend.push({ emoji: "🌐", label: "5 grupos activos",             sub: `Faltan ${5 - joinedGroups.value.length} grupos`, target: "Grupos activos" });
  if (stemAssets.filter(a => a.estado === "adquirido").length < 3)
    pend.push({ emoji: "💎", label: "3 activos STEM adquiridos",    sub: `${3 - stemAssets.filter(a => a.estado === "adquirido").length} más por completar`, target: "Activos STEM" });
  if (stemLevel.value < 5)
    pend.push({ emoji: "🚀", label: `Nivel ${LEVEL_NAMES[5]}`,      sub: `${(LEVEL_XP[5] - stemXP.value).toLocaleString()} XP restantes`, target: "XP" });

  return { done, pend };
});

// ── Edit mode (UI only) ───────────────────────────────────
const editMode = ref(false);
const bioText  = ref("Apasionada por la tecnología y el ahorro colaborativo. Busco financiar mis herramientas STEM junto a otras mujeres increíbles. 🚀");
</script>

<template>
  <AppLayout title="Mi Perfil" subtitle="Tu reputación financiera en STEM-Trust">

    <div class="max-w-5xl mx-auto space-y-7 pb-16">

      <!-- ═══════════════════════════════════════════
           HERO — Avatar + info + stats rápidas
      ═══════════════════════════════════════════ -->
      <div class="relative bg-gradient-to-br from-violet-600/20 via-indigo-600/15 to-transparent border border-violet-500/25 rounded-3xl p-8 overflow-hidden">
        <div class="absolute -right-16 -top-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-8 -bottom-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <!-- Avatar -->
          <div class="relative shrink-0">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-xl shadow-violet-500/30">
              {{ initials }}
            </div>
            <div :class="`absolute -bottom-2 -right-2 w-7 h-7 rounded-lg ${scoreTier.bg} border ${scoreTier.ring.replace('ring-','border-').replace('/40','/60')} flex items-center justify-center`">
              <Star class="w-3.5 h-3.5" :class="scoreTier.color" />
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start gap-3 flex-wrap">
              <h1 class="text-2xl font-extrabold text-white">{{ displayName }}</h1>
              <span :class="`text-xs font-bold px-2.5 py-1 rounded-full border ${scoreTier.bg} ${scoreTier.ring.replace('ring','border')} ${scoreTier.color}`">
                Confianza {{ scoreTier.label }}
              </span>
            </div>
            <p class="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
              <Mail class="w-3.5 h-3.5" /> {{ user?.email || "—" }}
            </p>
            <p v-if="!editMode" class="text-sm text-slate-400 mt-2 leading-relaxed max-w-lg">{{ bioText }}</p>
            <textarea
              v-else
              v-model="bioText"
              rows="2"
              class="mt-2 w-full max-w-lg bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-300 resize-none focus:outline-none focus:border-violet-500/50"
            />
            <div class="flex flex-wrap gap-2 mt-3">
              <span
                v-for="topic in onboardingTopics"
                :key="topic"
                class="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2.5 py-1 rounded-full"
              >{{ topicEmojis[topic] || "✨" }} {{ topic }}</span>
            </div>
          </div>

          <!-- Edit toggle -->
          <button
            @click="editMode = !editMode"
            class="shrink-0 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl transition-all"
          >
            <Edit3 class="w-3.5 h-3.5" />
            {{ editMode ? "Guardar" : "Editar bio" }}
          </button>
        </div>

        <!-- Stats rápidas -->
        <div class="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
          <div
            v-for="s in statsCards"
            :key="s.label"
            :class="`${s.bg} border rounded-2xl p-4 text-center`"
          >
            <component :is="s.icon" :class="`w-5 h-5 ${s.color} mx-auto mb-2`" />
            <div class="text-xl font-extrabold text-white">{{ s.value }}</div>
            <div class="text-[11px] text-slate-500 mt-0.5">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           SCORE DE CONFIANZA (HU13 + HU14)
      ═══════════════════════════════════════════ -->
      <div class="grid lg:grid-cols-5 gap-6">

        <!-- Gauge principal -->
        <div class="lg:col-span-2 bg-[#0D1225] border border-white/8 rounded-3xl p-7 flex flex-col items-center justify-center">
          <!-- SVG gauge -->
          <div class="relative w-40 h-40 mb-5">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" :r="RADIUS" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10" />
              <circle
                cx="60" cy="60" :r="RADIUS" fill="none"
                :stroke="`url(#scoreGrad)`"
                stroke-width="10" stroke-linecap="round"
                :stroke-dasharray="CIRCUM"
                :stroke-dashoffset="dashOff"
                style="transition: stroke-dashoffset 1s ease"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stop-color="#7c3aed" />
                  <stop offset="100%" stop-color="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-4xl font-black text-white leading-none">{{ score }}</span>
              <span class="text-xs text-slate-500 mt-1">/ 100</span>
            </div>
          </div>

          <h2 class="text-lg font-extrabold text-white mb-1">Score de Confianza</h2>
          <span :class="`text-sm font-semibold px-3 py-1 rounded-full border ${scoreTier.bg} ${scoreTier.ring.replace('ring','border')} ${scoreTier.color} mb-2`">
            Nivel {{ scoreTier.label }}
          </span>
          <p class="text-xs text-slate-500 text-center leading-relaxed">{{ scoreTier.desc }}</p>

          <!-- Barra visual -->
          <div class="w-full mt-5">
            <div class="flex justify-between text-[10px] text-slate-600 mb-1">
              <span>0</span><span>Inicial</span><span>Media</span><span>Alta</span><span>Elite</span>
            </div>
            <div class="w-full h-2.5 bg-white/8 rounded-full overflow-hidden">
              <div
                :class="`h-full rounded-full bg-gradient-to-r ${scoreTier.bar} transition-all duration-1000`"
                :style="{ width: score + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-[10px] text-slate-600 mt-0.5">
              <span>0</span><span>55</span><span>75</span><span>90</span><span>100</span>
            </div>
          </div>
        </div>

        <!-- Desglose del score -->
        <div class="lg:col-span-3 bg-[#0D1225] border border-white/8 rounded-3xl p-7">
          <h3 class="text-sm font-bold text-white mb-1">Desglose del score</h3>
          <p class="text-xs text-slate-500 mb-5">Cada dimensión contribuye a tu reputación financiera</p>

          <div class="space-y-4">
            <div
              v-for="([key, dim]) in Object.entries(scoreBreakdown).filter(([k]) => k !== 'total')"
              :key="key"
            >
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2 text-sm text-slate-300">
                  <component :is="dim.icon" class="w-4 h-4 text-slate-500" />
                  {{ dim.label }}
                </div>
                <span class="text-sm font-bold text-white">{{ dim.pts }}<span class="text-slate-600 font-normal"> / {{ dim.max }}</span></span>
              </div>
              <div class="w-full h-2 bg-white/8 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-700"
                  :style="{ width: (dim.pts / dim.max * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Tip -->
          <div class="mt-5 bg-violet-500/8 border border-violet-500/20 rounded-xl p-4 flex items-start gap-3">
            <Target class="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-semibold text-violet-300 mb-1">¿Cómo mejorar tu score?</p>
              <p class="text-xs text-slate-400 leading-relaxed">
                Realiza tus aportes antes de la fecha límite, sube comprobantes con OCR verificado, y únete a más grupos STEM para aumentar tu reputación.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           SCORE INDIVIDUAL + SCORE GRUPAL
      ═══════════════════════════════════════════ -->
      <div class="grid sm:grid-cols-2 gap-6">

        <!-- Score Individual -->
        <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
          <div class="flex items-start justify-between mb-5">
            <div>
              <h3 class="text-sm font-bold text-white">Score Individual</h3>
              <p class="text-xs text-slate-500 mt-0.5">Tu comportamiento personal de pagos</p>
            </div>
            <span :class="`text-lg`">{{ scoreIndividualTier.icon }}</span>
          </div>

          <div class="flex items-center gap-6">
            <!-- Mini gauge -->
            <div class="relative w-24 h-24 shrink-0">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 88 88">
                <circle cx="44" cy="44" :r="R2" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8" />
                <circle cx="44" cy="44" :r="R2" fill="none"
                  stroke="url(#indGrad)" stroke-width="8" stroke-linecap="round"
                  :stroke-dasharray="C2" :stroke-dashoffset="dashIndividual"
                  style="transition: stroke-dashoffset 1s ease"
                />
                <defs>
                  <linearGradient id="indGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stop-color="#10b981" />
                    <stop offset="100%" stop-color="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-black text-white leading-none">{{ scoreIndividual }}</span>
                <span class="text-[10px] text-slate-600">/ 100</span>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <span :class="`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${scoreIndividualTier.bg} ${scoreIndividualTier.border} ${scoreIndividualTier.color} mb-3`">
                {{ scoreIndividualTier.label }}
              </span>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-slate-500 w-20 shrink-0">Puntualidad</span>
                  <div class="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" :style="`width: ${scoreBreakdown.puntualidad.pts / scoreBreakdown.puntualidad.max * 100}%`"></div>
                  </div>
                  <span class="text-[11px] text-slate-400 w-9 text-right">{{ scoreBreakdown.puntualidad.pts }}/{{ scoreBreakdown.puntualidad.max }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-slate-500 w-20 shrink-0">Consistencia</span>
                  <div class="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400" :style="`width: ${scoreBreakdown.consistencia.pts / scoreBreakdown.consistencia.max * 100}%`"></div>
                  </div>
                  <span class="text-[11px] text-slate-400 w-9 text-right">{{ scoreBreakdown.consistencia.pts }}/{{ scoreBreakdown.consistencia.max }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-slate-500 w-20 shrink-0">OCR ok</span>
                  <div class="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400" :style="`width: ${scoreBreakdown.ocr.pts / scoreBreakdown.ocr.max * 100}%`"></div>
                  </div>
                  <span class="text-[11px] text-slate-400 w-9 text-right">{{ scoreBreakdown.ocr.pts }}/{{ scoreBreakdown.ocr.max }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 h-px bg-white/6"></div>
          <div class="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p class="text-base font-extrabold text-white">{{ pagosEnTiempo.length }}</p>
              <p class="text-[11px] text-slate-500">A tiempo</p>
            </div>
            <div>
              <p class="text-base font-extrabold" :class="pagosTardios.length > 0 ? 'text-rose-400' : 'text-emerald-400'">{{ pagosTardios.length }}</p>
              <p class="text-[11px] text-slate-500">Tardíos</p>
            </div>
            <div>
              <p class="text-base font-extrabold text-white">{{ pagosValidos.filter(p => p.ocr_verificado).length }}</p>
              <p class="text-[11px] text-slate-500">OCR ok</p>
            </div>
          </div>
        </div>

        <!-- Score Grupal -->
        <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
          <div class="flex items-start justify-between mb-5">
            <div>
              <h3 class="text-sm font-bold text-white">Score Grupal</h3>
              <p class="text-xs text-slate-500 mt-0.5">Tu impacto dentro de la comunidad</p>
            </div>
            <span class="text-lg">{{ scoreGrupalTier.icon }}</span>
          </div>

          <div class="flex items-center gap-6">
            <!-- Mini gauge -->
            <div class="relative w-24 h-24 shrink-0">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 88 88">
                <circle cx="44" cy="44" :r="R2" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8" />
                <circle cx="44" cy="44" :r="R2" fill="none"
                  stroke="url(#grpGrad)" stroke-width="8" stroke-linecap="round"
                  :stroke-dasharray="C2" :stroke-dashoffset="dashGrupal"
                  style="transition: stroke-dashoffset 1s ease"
                />
                <defs>
                  <linearGradient id="grpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stop-color="#a855f7" />
                    <stop offset="100%" stop-color="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-black text-white leading-none">{{ scoreGrupal }}</span>
                <span class="text-[10px] text-slate-600">/ 100</span>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <span :class="`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${scoreGrupalTier.bg} ${scoreGrupalTier.border} ${scoreGrupalTier.color} mb-3`">
                {{ scoreGrupalTier.label }}
              </span>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-slate-500 w-20 shrink-0">Participación</span>
                  <div class="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400" :style="`width: ${Math.min(joinedGroups.length, 5) / 5 * 100}%`"></div>
                  </div>
                  <span class="text-[11px] text-slate-400 w-9 text-right">{{ Math.min(joinedGroups.length, 5) }}/5</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-slate-500 w-20 shrink-0">Organizadora</span>
                  <div class="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-400" :style="`width: ${Math.min(myCreatedGroups.length, 3) / 3 * 100}%`"></div>
                  </div>
                  <span class="text-[11px] text-slate-400 w-9 text-right">{{ Math.min(myCreatedGroups.length, 3) }}/3</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-slate-500 w-20 shrink-0">Diversidad</span>
                  <div class="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" :style="`width: ${Math.min(new Set(joinedGroups.map(g => g.objetivo)).size, 4) / 4 * 100}%`"></div>
                  </div>
                  <span class="text-[11px] text-slate-400 w-9 text-right">{{ Math.min(new Set(joinedGroups.map(g => g.objetivo)).size, 4) }}/4</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 h-px bg-white/6"></div>
          <div class="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p class="text-base font-extrabold text-white">{{ joinedGroups.length }}</p>
              <p class="text-[11px] text-slate-500">Grupos</p>
            </div>
            <div>
              <p class="text-base font-extrabold text-fuchsia-400">{{ myCreatedGroups.length }}</p>
              <p class="text-[11px] text-slate-500">Organizados</p>
            </div>
            <div>
              <p class="text-base font-extrabold text-white">{{ new Set(joinedGroups.map(g => g.objetivo)).size }}</p>
              <p class="text-[11px] text-slate-500">Objetivos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           LOGROS / BADGES
      ═══════════════════════════════════════════ -->
      <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="text-sm font-bold text-white">Logros desbloqueados</h3>
            <p class="text-xs text-slate-500 mt-0.5">{{ badges.length }} de 6 badges obtenidos</p>
          </div>
          <Award class="w-5 h-5 text-amber-400" />
        </div>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="b in badges"
            :key="b.label"
            :class="`flex items-center gap-3 border ${b.color} rounded-2xl px-4 py-3`"
          >
            <span class="text-2xl">{{ b.icon }}</span>
            <div>
              <p class="text-sm font-bold text-white leading-none mb-0.5">{{ b.label }}</p>
              <p class="text-[11px] text-slate-500">{{ b.desc }}</p>
            </div>
          </div>
          <!-- Locked badges -->
          <div
            v-for="i in Math.max(0, 6 - badges.length)"
            :key="'lock-'+i"
            class="flex items-center gap-3 border border-white/8 bg-white/3 rounded-2xl px-4 py-3 opacity-40"
          >
            <Lock class="w-5 h-5 text-slate-600" />
            <div>
              <p class="text-sm font-bold text-slate-600 leading-none mb-0.5">Bloqueado</p>
              <p class="text-[11px] text-slate-700">Sigue participando</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           MIS GRUPOS + ACTIVIDAD RECIENTE
      ═══════════════════════════════════════════ -->
      <div class="grid lg:grid-cols-2 gap-6">

        <!-- Grupos activos -->
        <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-sm font-bold text-white">Mis grupos STEM</h3>
            <button @click="router.push('/groups')" class="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
              Ver todos <ChevronRight class="w-3 h-3" />
            </button>
          </div>

          <div v-if="joinedGroups.length" class="space-y-3">
            <div
              v-for="g in joinedGroups.slice(0, 4)"
              :key="g.id"
              @click="router.push(`/groups/${g.slug}`)"
              class="flex items-center gap-3 bg-white/4 hover:bg-white/7 border border-white/8 rounded-xl p-3 cursor-pointer transition-all group"
            >
              <div :class="`w-9 h-9 rounded-lg ${objetivoConfig[g.objetivo]?.bg || 'bg-violet-500/15 border-violet-500/30'} border flex items-center justify-center text-lg shrink-0`">
                {{ objetivoConfig[g.objetivo]?.emoji || "✨" }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-white truncate">{{ g.name }}</p>
                <div class="w-full h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
                    :style="{ width: Math.round(g.montoActual / g.montoObjetivo * 100) + '%' }"
                  ></div>
                </div>
              </div>
              <span v-if="g.isOrganizer" class="text-[10px] text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">Org.</span>
              <ChevronRight class="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0" />
            </div>
          </div>
          <div v-else class="text-center py-8">
            <Users class="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p class="text-sm text-slate-500">Aún no te has unido a ningún grupo</p>
            <button @click="router.push('/groups')" class="mt-3 text-xs text-violet-400 hover:text-violet-300">
              Explorar grupos →
            </button>
          </div>
        </div>

        <!-- Actividad reciente -->
        <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-sm font-bold text-white">Actividad reciente</h3>
            <Calendar class="w-4 h-4 text-slate-600" />
          </div>

          <div v-if="activityLog.length" class="space-y-4">
            <div v-for="(ev, i) in activityLog" :key="i" class="flex items-start gap-3">
              <div :class="`w-8 h-8 rounded-lg ${ev.bg} border border-white/8 flex items-center justify-center shrink-0 mt-0.5`">
                <component :is="ev.icon" :class="`w-4 h-4 ${ev.color}`" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-white leading-snug">{{ ev.text }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ ev.sub }}</p>
              </div>
              <span v-if="ev.date" class="text-[11px] text-slate-600 shrink-0">{{ ev.date }}</span>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <BarChart2 class="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p class="text-sm text-slate-500">Sin actividad registrada aún</p>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           ACTIVOS STEM
      ═══════════════════════════════════════════ -->
      <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">

        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <h3 class="text-sm font-bold text-white">Activos STEM</h3>
            <p class="text-xs text-slate-500 mt-0.5">Herramientas que estás financiando o ya adquiriste</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <p class="text-xs text-slate-600">Adquiridos</p>
              <p class="text-lg font-black text-emerald-400">{{ assetStats.adquiridos }}</p>
            </div>
            <div class="w-px h-8 bg-white/8"></div>
            <div class="text-right">
              <p class="text-xs text-slate-600">Ahorrando</p>
              <p class="text-lg font-black text-violet-400">{{ assetStats.ahorrando }}</p>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 mb-5">
          <button
            v-for="tab in [['todos','Todos'],['adquiridos','Adquiridos'],['ahorrando','Ahorrando']]"
            :key="tab[0]"
            @click="assetTab = tab[0]"
            :class="`text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${
              assetTab === tab[0]
                ? 'bg-violet-500/15 border-violet-500/35 text-violet-300'
                : 'border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/20'
            }`"
          >{{ tab[1] }}</button>
        </div>

        <!-- Asset cards grid -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="asset in filteredAssets"
            :key="asset.id"
            class="relative bg-white/4 border border-white/8 rounded-2xl p-4 flex flex-col gap-3 hover:border-white/16 transition-all"
          >
            <!-- Status ribbon -->
            <div
              v-if="asset.estado === 'adquirido'"
              class="absolute top-3 right-3 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full"
            >✓ Adquirido</div>
            <div
              v-else-if="asset.estado === 'próximo'"
              class="absolute top-3 right-3 text-[10px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/30 px-2 py-0.5 rounded-full"
            >Próximo</div>

            <!-- Emoji + name -->
            <div class="flex items-start gap-3">
              <div class="w-11 h-11 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center text-2xl shrink-0">
                {{ asset.emoji }}
              </div>
              <div class="flex-1 min-w-0 pr-16">
                <p class="text-sm font-semibold text-white leading-tight">{{ asset.name }}</p>
                <p class="text-[11px] text-slate-600 mt-0.5">{{ asset.desc }}</p>
              </div>
            </div>

            <!-- Category tag -->
            <span :class="`inline-flex w-fit text-[10px] font-bold border px-2 py-0.5 rounded-full ${asset.catColor}`">
              {{ asset.cat }}
            </span>

            <!-- Progress / amount -->
            <div v-if="asset.estado !== 'próximo'">
              <div class="flex justify-between text-[11px] mb-1.5">
                <span class="text-slate-500">
                  S/ {{ asset.ahorrado.toLocaleString() }}
                  <span class="text-slate-700"> / S/ {{ asset.objetivo.toLocaleString() }}</span>
                </span>
                <span :class="asset.estado === 'adquirido' ? 'text-emerald-400' : 'text-violet-400'" class="font-bold">
                  {{ Math.round(asset.ahorrado / asset.objetivo * 100) }}%
                </span>
              </div>
              <div class="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  :class="`h-full rounded-full bg-gradient-to-r ${asset.estado === 'adquirido' ? 'from-emerald-500 to-teal-400' : 'from-violet-500 to-indigo-400'}`"
                  :style="{ width: Math.round(asset.ahorrado / asset.objetivo * 100) + '%' }"
                ></div>
              </div>
            </div>
            <div v-else class="h-1.5 bg-white/6 rounded-full"></div>

            <!-- Group / adq date -->
            <div class="flex items-center justify-between mt-auto">
              <p v-if="asset.grupo" class="text-[11px] text-slate-600 flex items-center gap-1">
                <Users class="w-3 h-3" />{{ asset.grupo }}
              </p>
              <p v-else class="text-[11px] text-slate-700 italic">Sin grupo asignado</p>
              <p v-if="asset.fechaAdq" class="text-[11px] text-emerald-500">{{ asset.fechaAdq }}</p>
            </div>
          </div>
        </div>

        <!-- Footer totales -->
        <div class="mt-6 pt-5 border-t border-white/6 grid grid-cols-2 gap-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle class="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p class="text-[11px] text-slate-500">Total adquirido</p>
              <p class="text-base font-extrabold text-white">S/ {{ assetStats.totalInvertido.toLocaleString() }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <TrendingUp class="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p class="text-[11px] text-slate-500">En progreso activo</p>
              <p class="text-base font-extrabold text-white">S/ {{ assetStats.totalEnCurso.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           PROGRESO STEM
      ═══════════════════════════════════════════ -->
      <div class="grid lg:grid-cols-5 gap-6">

        <!-- NIVEL DE USUARIA (col-span-2) -->
        <div class="lg:col-span-2 bg-[#0D1225] border border-white/8 rounded-3xl p-7 flex flex-col gap-5">
          <div>
            <h3 class="text-sm font-bold text-white">Progreso STEM</h3>
            <p class="text-xs text-slate-500 mt-0.5">Tu nivel en la comunidad</p>
          </div>

          <!-- Level badge -->
          <div class="flex flex-col items-center py-4">
            <div :class="`w-24 h-24 rounded-full flex items-center justify-center text-5xl font-black border-2 ${stemLevelInfo.bg} shadow-lg shadow-black/30`">
              <span :class="stemLevelInfo.color">{{ stemLevelInfo.level }}</span>
            </div>
            <p :class="`text-lg font-extrabold mt-3 ${stemLevelInfo.color}`">{{ stemLevelInfo.name }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ stemLevelInfo.xp.toLocaleString() }} XP acumulados</p>
          </div>

          <!-- XP bar -->
          <div>
            <div class="flex justify-between text-[11px] text-slate-500 mb-1.5">
              <span>Nivel {{ stemLevelInfo.level }}</span>
              <span v-if="stemLevelInfo.xpNext">{{ stemLevelInfo.xpToNext }} XP para nivel {{ stemLevelInfo.level + 1 }}</span>
              <span v-else class="text-amber-400">¡Nivel máximo!</span>
            </div>
            <div class="h-2.5 bg-white/8 rounded-full overflow-hidden">
              <div
                :class="`h-full rounded-full bg-gradient-to-r ${stemLevelInfo.gradient} transition-all duration-1000`"
                :style="{ width: stemLevelInfo.pct + '%' }"
              ></div>
            </div>
            <p class="text-center text-[10px] text-slate-600 mt-1.5">{{ stemLevelInfo.pct }}% completado</p>
          </div>

          <!-- XP breakdown -->
          <div class="space-y-2 pt-2 border-t border-white/6">
            <p class="text-[11px] text-slate-600 font-semibold uppercase tracking-wide mb-3">Fuentes de XP</p>
            <div v-for="row in [
              { label: 'Pagos validados',    val: pagosValidos.length * 15,   icon: '💸', desc: `${pagosValidos.length} × 15 XP` },
              { label: 'Grupos activos',     val: joinedGroups.length * 30,   icon: '🤝', desc: `${joinedGroups.length} × 30 XP` },
              { label: 'Score de confianza', val: Math.round(score * 3),      icon: '⭐', desc: `${score} × 3 XP` },
              { label: 'Activos adquiridos', val: assetStats.adquiridos * 75, icon: '✅', desc: `${assetStats.adquiridos} × 75 XP` },
            ]" :key="row.label" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-base">{{ row.icon }}</span>
                <div>
                  <p class="text-[11px] text-white">{{ row.label }}</p>
                  <p class="text-[10px] text-slate-600">{{ row.desc }}</p>
                </div>
              </div>
              <span class="text-xs font-bold text-slate-400">+{{ row.val }} XP</span>
            </div>
          </div>
        </div>

        <!-- HITOS / MILESTONES (col-span-3) -->
        <div class="lg:col-span-3 bg-[#0D1225] border border-white/8 rounded-3xl p-7 flex flex-col gap-5">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-white">Hitos alcanzados</h3>
              <p class="text-xs text-slate-500 mt-0.5">{{ stemMilestones.done.length }} logros desbloqueados</p>
            </div>
            <span class="text-2xl">🗺️</span>
          </div>

          <!-- Done milestones -->
          <div class="space-y-3">
            <div
              v-for="(m, i) in stemMilestones.done"
              :key="'done-' + i"
              class="flex items-start gap-3 bg-white/4 border border-white/8 rounded-2xl p-4 relative overflow-hidden"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-xl shrink-0 relative">
                {{ m.emoji }}
              </div>
              <div class="flex-1 min-w-0 relative">
                <p class="text-sm font-semibold text-white leading-tight">{{ m.label }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ m.sub }}</p>
              </div>
              <div class="text-right relative shrink-0">
                <span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full block">✓</span>
                <p class="text-[10px] text-slate-600 mt-1">{{ m.date }}</p>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="flex items-center gap-3">
            <div class="flex-1 h-px bg-white/6"></div>
            <span class="text-[11px] text-slate-600 font-semibold">Próximos objetivos</span>
            <div class="flex-1 h-px bg-white/6"></div>
          </div>

          <!-- Pending milestones -->
          <div class="space-y-3">
            <div
              v-for="(m, i) in stemMilestones.pend"
              :key="'pend-' + i"
              class="flex items-start gap-3 border border-dashed border-white/10 rounded-2xl p-4 opacity-75"
            >
              <div class="w-10 h-10 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center text-xl shrink-0 grayscale opacity-60">
                {{ m.emoji }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-400 leading-tight">{{ m.label }}</p>
                <p class="text-xs text-slate-600 mt-0.5">{{ m.sub }}</p>
              </div>
              <span class="text-[10px] text-slate-700 border border-white/8 px-2 py-0.5 rounded-full shrink-0">Pendiente</span>
            </div>
            <div v-if="!stemMilestones.pend.length" class="text-center py-4">
              <p class="text-sm text-amber-400 font-semibold">🏆 ¡Todos los hitos completados!</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           INTERESES Y OBJETIVO (Onboarding data)
      ═══════════════════════════════════════════ -->
      <div v-if="onboardingTopics.length || onboardingObjetivo" class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
        <h3 class="text-sm font-bold text-white mb-5">Mis intereses STEM</h3>
        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="t in onboardingTopics"
            :key="t"
            class="text-sm bg-violet-500/10 border border-violet-500/25 text-violet-300 px-4 py-2 rounded-xl font-medium"
          >
            {{ topicEmojis[t] || "✨" }} {{ t }}
          </span>
        </div>
        <div v-if="onboardingObjetivo" class="flex items-center gap-3 text-sm text-slate-400">
          <Target class="w-4 h-4 text-indigo-400" />
          Objetivo principal:
          <span class="text-white font-semibold">
            {{ objetivoConfig[onboardingObjetivo]?.emoji }} {{ objetivoConfig[onboardingObjetivo]?.label || onboardingObjetivo }}
          </span>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           SEGURIDAD DE CUENTA
      ═══════════════════════════════════════════ -->
      <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
        <h3 class="text-sm font-bold text-white mb-5 flex items-center gap-2">
          <Shield class="w-4 h-4 text-emerald-400" /> Seguridad de la cuenta
        </h3>
        <div class="grid sm:grid-cols-3 gap-4">
          <div class="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl p-4">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle class="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p class="text-sm font-semibold text-white">Email verificado</p>
              <p class="text-xs text-slate-500">Cuenta activa</p>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl p-4">
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Lock class="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p class="text-sm font-semibold text-white">Contraseña</p>
              <p class="text-xs text-amber-400 cursor-pointer hover:text-amber-300">Cambiar →</p>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl p-4">
            <div class="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Sparkles class="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p class="text-sm font-semibold text-white">Google OAuth</p>
              <p class="text-xs text-slate-500">Vinculado</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </AppLayout>
</template>
