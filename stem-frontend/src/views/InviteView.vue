<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Sparkles, MapPin, Users, Clock, CircleDollarSign, Star,
  CheckCircle, Shield, TrendingUp, UserPlus, LogIn, AlertCircle, Share2
} from "lucide-vue-next";
import { mockGroups, objetivoConfig, statusConfig, tagConfig } from "../data/mockGroups.js";
import { authStore } from "../stores/authStore";

const route  = useRoute();
const router = useRouter();

// ── Resolve code (URL param is "STEM-XXXXX" or just "XXXXX") ──
const rawCode = computed(() => {
  const c = route.params.code || "";
  return c.startsWith("STEM-") ? c.slice(5) : c;
});

// ── Find group ──
const group = computed(() => {
  // Check mock groups
  const fromMock = mockGroups.find(g => g.inviteCode === rawCode.value);
  if (fromMock) return fromMock;
  // Check localStorage created groups
  try {
    const my = JSON.parse(localStorage.getItem("my_groups") || "[]");
    return my.find(g => g.inviteCode === rawCode.value) || null;
  } catch { return null; }
});

const notFound   = computed(() => !group.value && rawCode.value.length > 0);
const isLoggedIn = computed(() => Boolean(authStore.accessToken));

const alreadyJoined = computed(() => {
  if (!group.value) return false;
  try {
    const joined = JSON.parse(localStorage.getItem("joined_groups") || "[]");
    return joined.some(j => j.id === group.value.id);
  } catch { return false; }
});

function progressPct(g) {
  return Math.round((g.montoActual / g.montoObjetivo) * 100);
}

// ── Join ──
const joinBusy    = ref(false);
const joinSuccess = ref(false);

async function joinGroup() {
  if (!isLoggedIn.value) {
    router.push(`/register?redirect=/invite/${route.params.code}`);
    return;
  }
  joinBusy.value = true;
  await new Promise(r => setTimeout(r, 1000));
  try {
    const g = group.value;
    const existing = JSON.parse(localStorage.getItem("joined_groups") || "[]");
    if (!existing.some(j => j.id === g.id)) {
      const snapshot = {
        id: g.id, slug: g.slug, name: g.name,
        objetivo: g.objetivo, montoObjetivo: g.montoObjetivo,
        montoActual: g.montoActual, aporteMensual: g.aporteMensual,
        plazoMeses: g.plazoMeses, participantes: g.participantes + 1,
        maxParticipantes: g.maxParticipantes, status: g.status,
        pais: g.pais || "Perú", ubicacion: g.ubicacion,
        organizer: { initials: g.organizer.initials, color: g.organizer.color, name: g.organizer.name },
        joinedAt: Date.now(), isOrganizer: false,
      };
      localStorage.setItem("joined_groups", JSON.stringify([...existing, snapshot]));
    }
  } catch (_) {}
  joinBusy.value  = false;
  joinSuccess.value = true;
}
</script>

<template>
  <div class="min-h-screen bg-[#070B18] text-white">

    <!-- ── NAVBAR ── -->
    <nav class="h-14 px-6 flex items-center justify-between border-b border-white/5 bg-[#070B18]/80 backdrop-blur-md sticky top-0 z-20">
      <router-link to="/" class="flex items-center gap-2 no-underline">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow shadow-violet-500/30">
          <Sparkles class="w-4 h-4 text-white" />
        </div>
        <span class="font-bold text-sm text-white tracking-tight">STEM<span class="text-violet-400">-Trust</span></span>
      </router-link>
      <div class="flex items-center gap-3">
        <router-link v-if="!isLoggedIn" to="/login" class="text-sm text-slate-400 hover:text-white transition-colors no-underline flex items-center gap-1.5">
          <LogIn class="w-4 h-4" /> Iniciar sesión
        </router-link>
        <router-link v-if="isLoggedIn" to="/dashboard" class="text-sm text-slate-400 hover:text-white transition-colors no-underline">
          Dashboard
        </router-link>
      </div>
    </nav>

    <!-- ── NOT FOUND ── -->
    <div v-if="notFound" class="flex flex-col items-center justify-center py-32 px-6 text-center">
      <div class="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
        <AlertCircle class="w-8 h-8 text-rose-400" />
      </div>
      <h2 class="text-2xl font-extrabold text-white mb-3">Invitación no encontrada</h2>
      <p class="text-slate-400 text-sm mb-6">El código <span class="font-mono text-white">STEM-{{ rawCode }}</span> no corresponde a ningún grupo activo.</p>
      <router-link to="/groups" class="no-underline text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all">
        Explorar grupos disponibles
      </router-link>
    </div>

    <!-- ── INVITE CONTENT ── -->
    <div v-else-if="group" class="max-w-2xl mx-auto px-5 py-12">

      <!-- Invite badge -->
      <div class="flex items-center justify-center mb-8">
        <div class="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold px-4 py-2 rounded-full">
          <Share2 class="w-3.5 h-3.5" /> Invitación personal · STEM-Trust
        </div>
      </div>

      <!-- Group hero card -->
      <div class="relative bg-gradient-to-br from-violet-600/20 via-indigo-600/15 to-transparent border border-violet-500/25 rounded-3xl p-7 mb-6 overflow-hidden">
        <div class="absolute -right-10 -top-10 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative z-10">
          <div class="flex items-start gap-5 mb-6">
            <div :class="`w-16 h-16 rounded-2xl ${objetivoConfig[group.objetivo]?.bg} border flex items-center justify-center text-3xl shrink-0`">
              {{ objetivoConfig[group.objetivo]?.emoji }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap gap-2 mb-2">
                <span :class="`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConfig[group.status]?.bg} ${statusConfig[group.status]?.color}`">
                  {{ statusConfig[group.status]?.label }}
                </span>
                <span class="text-xs px-2.5 py-1 rounded-full border bg-amber-500/15 border-amber-500/30 text-amber-400">
                  {{ objetivoConfig[group.objetivo]?.label }}
                </span>
              </div>
              <h1 class="text-xl font-extrabold text-white leading-tight mb-1.5">{{ group.name }}</h1>
              <p class="text-xs text-slate-400 leading-relaxed">{{ group.description }}</p>
            </div>
          </div>

          <!-- Stats row -->
          <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="bg-white/5 rounded-xl p-3 text-center">
              <div class="text-lg font-extrabold text-white">S/ {{ group.aporteMensual }}</div>
              <div class="text-[11px] text-slate-500 mt-0.5">aporte/mes</div>
            </div>
            <div class="bg-white/5 rounded-xl p-3 text-center">
              <div class="text-lg font-extrabold text-white">{{ group.plazoMeses }}m</div>
              <div class="text-[11px] text-slate-500 mt-0.5">plazo total</div>
            </div>
            <div class="bg-white/5 rounded-xl p-3 text-center">
              <div class="text-lg font-extrabold text-white">{{ group.participantes }}/{{ group.maxParticipantes }}</div>
              <div class="text-[11px] text-slate-500 mt-0.5">integrantes</div>
            </div>
          </div>

          <!-- Progress -->
          <div class="mb-2">
            <div class="flex justify-between text-xs mb-2">
              <span class="text-slate-400">Fondo recaudado</span>
              <span class="font-bold" :class="progressPct(group) >= 80 ? 'text-emerald-400' : 'text-violet-300'">
                {{ progressPct(group) }}%
              </span>
            </div>
            <div class="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :class="progressPct(group) >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-violet-500 to-indigo-400'"
                :style="{ width: progressPct(group) + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-xs mt-1.5 text-slate-500">
              <span>S/ {{ group.montoActual.toLocaleString() }}</span>
              <span>S/ {{ group.montoObjetivo.toLocaleString() }}</span>
            </div>
          </div>

          <!-- Location -->
          <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-4">
            <MapPin class="w-3.5 h-3.5 text-slate-500" /> {{ group.ubicacion }}
          </div>
        </div>
      </div>

      <!-- Organizer -->
      <div class="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Te invita</p>
        <div class="flex items-center gap-4">
          <div :class="`w-12 h-12 rounded-xl bg-gradient-to-br ${group.organizer.color} flex items-center justify-center text-sm font-extrabold shrink-0`">
            {{ group.organizer.initials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-white">{{ group.organizer.name }}</p>
            <p class="text-xs text-slate-400 truncate">{{ group.organizer.role }}</p>
            <p class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin class="w-3 h-3" /> {{ group.organizer.location }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <div class="text-sm font-bold text-amber-400 flex items-center gap-1">
              <Star class="w-3.5 h-3.5 fill-current" /> {{ group.organizer.rating }}
            </div>
            <div class="text-xs text-emerald-400 mt-0.5">{{ group.organizer.successRate }}% éxito</div>
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="group.tags?.length" class="flex flex-wrap gap-2 mb-6">
        <span
          v-for="tag in group.tags"
          :key="tag"
          class="text-xs bg-violet-500/10 border border-violet-500/25 text-violet-300 px-3 py-1.5 rounded-full"
        >
          {{ tagConfig[tag]?.emoji }} {{ tagConfig[tag]?.label }}
        </span>
      </div>

      <!-- Trust points -->
      <div class="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-5 mb-8 space-y-2.5">
        <p class="text-xs font-semibold text-emerald-300 flex items-center gap-2 mb-3">
          <Shield class="w-3.5 h-3.5" /> ¿Por qué es seguro unirse?
        </p>
        <div v-for="pt in [
          'Aportes validados con OCR — sin efectivo, sin riesgo',
          'Pago final directo al proveedor en bucle cerrado',
          'Tu comportamiento construye historial crediticio verificable',
          'Garantía solidaria del grupo respaldada por STEM-Trust',
        ]" :key="pt" class="flex items-start gap-2.5 text-xs text-slate-400">
          <CheckCircle class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          {{ pt }}
        </div>
      </div>

      <!-- ── CTA ── -->

      <!-- Success state -->
      <div v-if="joinSuccess" class="text-center py-2">
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle class="w-8 h-8 text-emerald-400" />
        </div>
        <h3 class="text-xl font-extrabold text-white mb-2">¡Bienvenida al grupo!</h3>
        <p class="text-slate-400 text-sm mb-6">
          Ya eres parte de <strong class="text-white">{{ group.name }}</strong>. Accede al dashboard para ver tu progreso.
        </p>
        <button
          @click="router.push('/dashboard')"
          class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
        >
          Ir al Dashboard
        </button>
      </div>

      <!-- Already joined -->
      <div v-else-if="alreadyJoined" class="text-center">
        <div class="w-full flex items-center justify-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium py-4 rounded-xl text-sm mb-4">
          <CheckCircle class="w-4 h-4" /> Ya eres miembro de este grupo
        </div>
        <button @click="router.push(`/groups/${group.slug}`)" class="text-sm text-violet-400 hover:text-violet-300 transition-colors">
          Ver el estado del grupo →
        </button>
      </div>

      <!-- Group full -->
      <div v-else-if="group.status !== 'open'" class="text-center">
        <div class="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-500 font-medium py-4 rounded-xl text-sm mb-4">
          Grupo completo — no quedan cupos disponibles
        </div>
        <router-link to="/groups" class="text-sm text-violet-400 hover:text-violet-300 transition-colors no-underline">
          Ver otros grupos →
        </router-link>
      </div>

      <!-- Not logged in -->
      <div v-else-if="!isLoggedIn" class="space-y-3">
        <p class="text-center text-sm text-slate-400 mb-5">
          Para unirte necesitas una cuenta en STEM-Trust — es gratis.
        </p>
        <router-link
          :to="`/register?redirect=/invite/${route.params.code}`"
          class="no-underline w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:-translate-y-0.5"
        >
          <UserPlus class="w-4 h-4" /> Crear cuenta y unirse
        </router-link>
        <router-link
          :to="`/login?redirect=/invite/${route.params.code}`"
          class="no-underline w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 font-medium py-3.5 rounded-xl text-sm transition-all"
        >
          <LogIn class="w-4 h-4" /> Ya tengo cuenta — iniciar sesión
        </router-link>
      </div>

      <!-- Logged in — join CTA -->
      <div v-else>
        <button
          @click="joinGroup"
          :disabled="joinBusy"
          class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:-translate-y-0.5 text-base"
        >
          <span v-if="joinBusy" class="flex items-center gap-2">
            <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            Procesando...
          </span>
          <span v-else class="flex items-center gap-2">
            <UserPlus class="w-5 h-5" /> Solicitar unirme a {{ group.name }}
          </span>
        </button>
        <p class="text-xs text-slate-500 text-center mt-3">
          Al unirte aceptas las reglas del grupo y el compromiso de aporte mensual de S/ {{ group.aporteMensual }}.
        </p>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-slate-600 mt-10">
        STEM-Trust · Plataforma de ahorro colaborativo para mujeres STEM · WIE IEEE 2026
      </p>
    </div>

    <!-- Loading / empty code -->
    <div v-else class="flex items-center justify-center py-32 text-slate-600 text-sm">
      Cargando invitación…
    </div>
  </div>
</template>
