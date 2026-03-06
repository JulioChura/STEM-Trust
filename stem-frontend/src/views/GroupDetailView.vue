<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  MapPin, Users, Clock, CircleDollarSign, Star, Shield,
  ChevronLeft, CheckCircle, AlertCircle, Sparkles, TrendingUp,
  FileCheck, Lock, Info, X, UserPlus, Copy, Share2, QrCode, Link
} from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";
import { mockGroups, objetivoConfig, statusConfig, tagConfig } from "../data/mockGroups.js";

const route  = useRoute();
const router = useRouter();

const group = computed(() => {
  const fromMock = mockGroups.find(g => g.slug === route.params.slug);
  if (fromMock) return fromMock;
  try {
    const myGroups = JSON.parse(localStorage.getItem("my_groups") || "[]");
    return myGroups.find(g => g.slug === route.params.slug) || null;
  } catch { return null; }
});

function progressPct(g) {
  return Math.round((g.montoActual / g.montoObjetivo) * 100);
}

// ── Join modal ──
const showJoinModal = ref(false);
const joinStep      = ref(1); // 1 = confirm, 2 = success
const joinBusy      = ref(false);

const alreadyJoined = computed(() => {
  try {
    const joined = JSON.parse(localStorage.getItem("joined_groups") || "[]");
    return joined.some(j => j.id === group.value?.id);
  } catch { return false; }
});

function openJoin() {
  joinStep.value  = 1;
  showJoinModal.value = true;
}
function closeJoin() {
  showJoinModal.value = false;
}
async function confirmJoin() {
  joinBusy.value = true;
  await new Promise(r => setTimeout(r, 1200));
  // Save snapshot to localStorage
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
  joinBusy.value = false;
  joinStep.value = 2;
}
function goToDashboard() {
  closeJoin();
  router.push("/dashboard");
}

// ── Organizer / invite ──
const isOrganizer = computed(() => {
  try {
    const joined = JSON.parse(localStorage.getItem("joined_groups") || "[]");
    return joined.some(j => j.id === group.value?.id && j.isOrganizer);
  } catch { return false; }
});

const groupInviteCode = computed(() => {
  if (group.value?.inviteCode) return group.value.inviteCode;
  try {
    const my = JSON.parse(localStorage.getItem("my_groups") || "[]");
    return my.find(g => g.slug === route.params.slug)?.inviteCode || null;
  } catch { return null; }
});

const inviteLink = computed(() =>
  groupInviteCode.value ? `https://stem-trust.app/invite/STEM-${groupInviteCode.value}` : ""
);

const copiedLink   = ref(false);
const copiedCode   = ref(false);

function copyLink() {
  navigator.clipboard.writeText(inviteLink.value).catch(() => {});
  copiedLink.value = true;
  setTimeout(() => { copiedLink.value = false; }, 2000);
}
function copyCode() {
  navigator.clipboard.writeText(`STEM-${groupInviteCode.value}`).catch(() => {});
  copiedCode.value = true;
  setTimeout(() => { copiedCode.value = false; }, 2000);
}
function shareWhatsApp() {
  const text = encodeURIComponent(`¡Únete a mi grupo STEM-Trust "${group.value?.name}"! 🚀\n\nCódigo: STEM-${groupInviteCode.value}\nEnlace: ${inviteLink.value}`);
  window.open(`https://wa.me/?text=${text}`, "_blank");
}
</script>

<template>
  <AppLayout :title="group?.name || 'Grupo'" subtitle="STEM-Trust · Detalle del grupo">
    <template #topbar-actions>
      <button
        @click="router.push('/groups')"
        class="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
      >
        <ChevronLeft class="w-4 h-4" /> Volver
      </button>
    </template>

    <div v-if="!group" class="flex items-center justify-center py-32 text-slate-500">
      Grupo no encontrado.
    </div>

    <div v-else class="p-5 sm:p-8">
      <div class="max-w-6xl mx-auto space-y-6">

        <!-- ── HERO ── -->
        <div class="relative bg-gradient-to-br from-violet-600/20 via-indigo-600/15 to-transparent border border-violet-500/20 rounded-2xl p-6 sm:p-8 overflow-hidden">
          <div class="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-violet-500/5 to-transparent pointer-events-none"></div>
          <div class="absolute -right-12 -top-12 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative z-10 flex flex-col sm:flex-row sm:items-start gap-5">
            <!-- Objetivo icon -->
            <div :class="`w-16 h-16 rounded-2xl ${objetivoConfig[group.objetivo]?.bg} border flex items-center justify-center text-3xl shrink-0`">
              {{ objetivoConfig[group.objetivo]?.emoji }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span :class="`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConfig[group.status]?.bg} ${statusConfig[group.status]?.color}`">
                  {{ statusConfig[group.status]?.label }}
                </span>
                <span :class="`text-xs px-2.5 py-1 rounded-full border ${group.nivel === 'pro' ? 'bg-violet-500/15 border-violet-500/30 text-violet-400' : 'bg-slate-500/15 border-slate-500/30 text-slate-400'}`">
                  {{ group.nivel === 'pro' ? '⚡ Pro' : '🆓 Social' }}
                </span>
                <span class="text-xs px-2.5 py-1 rounded-full border bg-amber-500/15 border-amber-500/30 text-amber-400 flex items-center gap-1">
                  <TrendingUp class="w-3 h-3" /> {{ group.matchScore }}% afinidad
                </span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">{{ group.name }}</h1>
              <p class="text-slate-400 text-sm leading-relaxed max-w-2xl">{{ group.description }}</p>
              <div class="flex flex-wrap gap-3 mt-3 text-sm text-slate-400">
                <span class="flex items-center gap-1.5"><MapPin class="w-4 h-4 text-slate-500" /> {{ group.ubicacion }}</span>
                <span class="flex items-center gap-1.5"><Users class="w-4 h-4 text-slate-500" /> {{ group.participantes }}/{{ group.maxParticipantes }} integrantes</span>
                <span class="flex items-center gap-1.5"><Clock class="w-4 h-4 text-slate-500" /> {{ group.plazoMeses }} meses</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">

          <!-- ── LEFT COLUMN ── -->
          <div class="lg:col-span-2 space-y-5">

            <!-- Progress card -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2">
                <CircleDollarSign class="w-4 h-4 text-emerald-400" /> Progreso del fondo
              </h3>
              <div class="flex items-end justify-between mb-3">
                <div>
                  <span class="text-3xl font-extrabold text-white">S/ {{ group.montoActual.toLocaleString() }}</span>
                  <span class="text-slate-500 text-sm ml-2">de S/ {{ group.montoObjetivo.toLocaleString() }}</span>
                </div>
                <span class="text-2xl font-extrabold" :class="progressPct(group) >= 80 ? 'text-emerald-400' : 'text-violet-400'">
                  {{ progressPct(group) }}%
                </span>
              </div>
              <div class="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="progressPct(group) >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-violet-500 to-indigo-400'"
                  :style="{ width: progressPct(group) + '%' }"
                ></div>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div class="bg-white/5 rounded-xl p-3 text-center">
                  <div class="text-lg font-extrabold text-white">S/ {{ group.aporteMensual }}</div>
                  <div class="text-xs text-slate-500 mt-0.5">aporte/mes</div>
                </div>
                <div class="bg-white/5 rounded-xl p-3 text-center">
                  <div class="text-lg font-extrabold text-white">{{ group.plazoMeses }}m</div>
                  <div class="text-xs text-slate-500 mt-0.5">plazo total</div>
                </div>
                <div class="bg-white/5 rounded-xl p-3 text-center">
                  <div class="text-lg font-extrabold text-white capitalize">{{ group.frecuencia }}</div>
                  <div class="text-xs text-slate-500 mt-0.5">frecuencia</div>
                </div>
              </div>
            </div>

            <!-- Members -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Users class="w-4 h-4 text-cyan-400" /> Integrantes
                <span class="ml-auto text-xs font-normal text-slate-500">{{ group.participantes }}/{{ group.maxParticipantes }} cupos</span>
              </h3>
              <div class="space-y-3">
                <div v-for="m in group.members" :key="m.id" class="flex items-center gap-3">
                  <div :class="`w-9 h-9 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-xs font-bold shrink-0`">
                    {{ m.initials }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white truncate">{{ m.name }}</p>
                    <div class="flex items-center gap-2 mt-0.5">
                      <div class="flex-1 h-1 bg-white/10 rounded-full overflow-hidden max-w-24">
                        <div
                          class="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full"
                          :style="{ width: ((m.aportado / (group.montoObjetivo / group.maxParticipantes)) * 100).toFixed(0) + '%' }"
                        ></div>
                      </div>
                      <span class="text-xs text-slate-500">S/ {{ m.aportado.toLocaleString() }}</span>
                    </div>
                  </div>
                  <div v-if="m.puntualidad !== null" class="flex items-center gap-1 text-xs"
                    :class="m.puntualidad >= 90 ? 'text-emerald-400' : 'text-amber-400'">
                    <CheckCircle class="w-3.5 h-3.5" />
                    {{ m.puntualidad }}%
                  </div>
                </div>
                <!-- Empty slots -->
                <div
                  v-for="i in (group.maxParticipantes - group.participantes)"
                  :key="`empty-${i}`"
                  class="flex items-center gap-3 opacity-40"
                >
                  <div class="w-9 h-9 rounded-full bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center">
                    <UserPlus class="w-4 h-4 text-slate-500" />
                  </div>
                  <span class="text-sm text-slate-500 italic">Cupo disponible</span>
                </div>
              </div>
            </div>

            <!-- Activity -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2">
                <FileCheck class="w-4 h-4 text-violet-400" /> Actividad reciente
              </h3>
              <div class="space-y-4">
                <div v-for="(act, i) in group.recentActivity" :key="i" class="flex items-start gap-3">
                  <div :class="`w-8 h-8 rounded-full bg-gradient-to-br ${act.color} flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5`">
                    {{ act.initials }}
                  </div>
                  <div>
                    <p class="text-sm text-slate-300">
                      <span class="font-semibold text-white">{{ act.user }}</span>
                      {{ ' ' + act.action }}
                    </p>
                    <p class="text-xs text-slate-500 mt-0.5">{{ act.time }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rules -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info class="w-4 h-4 text-indigo-400" /> Reglas del grupo
              </h3>
              <ul class="space-y-2.5">
                <li v-for="(r, i) in group.reglas" :key="i" class="flex items-start gap-2.5 text-sm text-slate-400">
                  <span class="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {{ i + 1 }}
                  </span>
                  {{ r }}
                </li>
              </ul>
            </div>
          </div>

          <!-- ── RIGHT COLUMN ── -->
          <div class="space-y-5">

            <!-- Join CTA -->
            <div class="sticky top-24">
              <div class="bg-gradient-to-b from-violet-600/20 to-indigo-600/10 border border-violet-500/30 rounded-2xl p-6">
                <div class="text-center mb-5">
                  <div class="text-3xl font-extrabold text-white mb-1">S/ {{ group.aporteMensual }}<span class="text-sm text-slate-400 font-normal">/mes</span></div>
                  <p class="text-xs text-slate-400">por {{ group.plazoMeses }} meses · pago {{ group.frecuencia }}</p>
                </div>

                <button
                  v-if="group.status === 'open' && !alreadyJoined"
                  @click="openJoin"
                  class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 mb-3"
                >
                  <UserPlus class="w-4 h-4" /> Unirse a este grupo
                </button>
                <div
                  v-else-if="alreadyJoined"
                  class="w-full flex items-center justify-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium py-3.5 rounded-xl text-sm mb-3"
                >
                  <CheckCircle class="w-4 h-4" /> Ya eres miembro de este grupo
                </div>
                <div
                  v-else
                  class="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-500 font-medium py-3.5 rounded-xl cursor-not-allowed mb-3 text-sm"
                >
                  <Lock class="w-4 h-4" /> Grupo sin cupos disponibles
                </div>

                <div class="space-y-2 text-xs text-slate-400">
                  <div class="flex items-center gap-2">
                    <CheckCircle class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Pago directo al proveedor (bucle cerrado)
                  </div>
                  <div class="flex items-center gap-2">
                    <CheckCircle class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Validación OCR de comprobantes
                  </div>
                  <div class="flex items-center gap-2">
                    <CheckCircle class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Historial crediticio verificable
                  </div>
                  <div class="flex items-center gap-2">
                    <CheckCircle class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Garantía solidaria del grupo
                  </div>
                </div>
              </div>

              <!-- Organizer card -->
              <div class="bg-white/5 border border-white/10 rounded-2xl p-5 mt-4">
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Organizadora</h3>
                <div class="flex items-start gap-3 mb-4">
                  <div :class="`w-12 h-12 rounded-xl bg-gradient-to-br ${group.organizer.color} flex items-center justify-center text-sm font-extrabold shrink-0`">
                    {{ group.organizer.initials }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-white text-sm">{{ group.organizer.name }}</p>
                    <p class="text-xs text-slate-400 truncate">{{ group.organizer.role }}</p>
                    <p class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin class="w-3 h-3" /> {{ group.organizer.location }}
                    </p>
                  </div>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed mb-4">{{ group.organizer.bio }}</p>
                <div class="grid grid-cols-3 gap-2 text-center">
                  <div class="bg-white/5 rounded-xl py-2.5">
                    <div class="text-sm font-bold text-white">{{ group.organizer.groupsLed }}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">grupos liderados</div>
                  </div>
                  <div class="bg-white/5 rounded-xl py-2.5">
                    <div class="text-sm font-bold text-emerald-400">{{ group.organizer.successRate }}%</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">tasa éxito</div>
                  </div>
                  <div class="bg-white/5 rounded-xl py-2.5">
                    <div class="text-sm font-bold text-amber-400 flex items-center justify-center gap-0.5">
                      <Star class="w-3 h-3 fill-current" /> {{ group.organizer.rating }}
                    </div>
                    <div class="text-[10px] text-slate-500 mt-0.5">rating</div>
                  </div>
                </div>
              </div>

              <!-- Tags card -->
              <div class="bg-white/5 border border-white/10 rounded-2xl p-5 mt-4">
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Áreas STEM del grupo</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in group.tags"
                    :key="tag"
                    class="text-xs bg-violet-500/10 border border-violet-500/25 text-violet-300 px-3 py-1.5 rounded-full"
                  >
                    {{ tagConfig[tag]?.emoji }} {{ tagConfig[tag]?.label }}
                  </span>
                </div>
              </div>

              <!-- HU8 — Organizer invite panel -->
              <div v-if="isOrganizer && groupInviteCode" class="bg-gradient-to-b from-indigo-600/15 to-violet-600/10 border border-indigo-500/30 rounded-2xl p-5 mt-4">
                <h3 class="text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Share2 class="w-3.5 h-3.5" /> HU8 · Invitar participantes
                </h3>

                <!-- Code -->
                <div class="bg-[#070B18] border border-indigo-500/20 rounded-xl px-4 py-3 mb-3">
                  <p class="text-[10px] text-slate-500 mb-1">Código de invitación</p>
                  <div class="flex items-center justify-between">
                    <span class="font-mono text-lg font-extrabold text-indigo-300 tracking-[0.15em]">STEM-{{ groupInviteCode }}</span>
                    <button
                      @click="copyCode"
                      :class="['flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all',
                        copiedCode ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white']"
                    >
                      <Copy class="w-3 h-3" /> {{ copiedCode ? '¡Copiado!' : 'Copiar' }}
                    </button>
                  </div>
                </div>

                <!-- URL -->
                <div class="flex items-center gap-2 mb-4">
                  <div class="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 overflow-hidden">
                    <p class="text-[10px] text-slate-500 mb-0.5">Enlace de invitación</p>
                    <p class="text-xs text-slate-400 font-mono truncate">stem-trust.app/invite/STEM-{{ groupInviteCode }}</p>
                  </div>
                  <button
                    @click="copyLink"
                    :class="['flex flex-col items-center gap-1 text-xs px-3 py-2 rounded-xl border transition-all shrink-0',
                      copiedLink ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white']"
                  >
                    <Link class="w-3.5 h-3.5" />
                    <span>{{ copiedLink ? 'OK' : 'Copiar' }}</span>
                  </button>
                </div>

                <!-- Share via WhatsApp -->
                <button
                  @click="shareWhatsApp"
                  class="w-full flex items-center justify-center gap-2 bg-[#25D366]/15 border border-[#25D366]/30 hover:border-[#25D366]/50 text-[#25D366] font-semibold text-xs py-2.5 rounded-xl transition-all"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.522 5.851L0 24l6.318-1.499A11.957 11.957 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.001-1.37l-.359-.213-3.744.888.936-3.637-.234-.374A9.818 9.818 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/></svg>
                  Compartir por WhatsApp
                </button>

                <p class="text-[10px] text-slate-600 text-center mt-3">Solo mujeres con el enlace pueden solicitar unirse.</p>
              </div>

              <!-- Trust badge -->
              <div class="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mt-4">
                <Shield class="w-8 h-8 text-emerald-400 shrink-0" />
                <div>
                  <p class="text-xs font-semibold text-emerald-300">Grupo verificado</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Registros validados por OCR · Pago en bucle cerrado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── JOIN MODAL ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showJoinModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeJoin" />

          <div class="relative z-10 w-full max-w-md bg-[#0D1225] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

            <!-- Step 1: Confirm -->
            <div v-if="joinStep === 1" class="p-7">
              <div class="flex items-start justify-between mb-5">
                <div class="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <UserPlus class="w-6 h-6 text-violet-400" />
                </div>
                <button @click="closeJoin" class="text-slate-500 hover:text-white transition-colors">
                  <X class="w-5 h-5" />
                </button>
              </div>
              <h2 class="text-xl font-extrabold text-white mb-2">Unirse a {{ group?.name }}</h2>
              <p class="text-sm text-slate-400 mb-6 leading-relaxed">
                Al unirte, te comprometes a realizar aportes de
                <strong class="text-white">S/ {{ group?.aporteMensual }}/mes</strong>
                durante <strong class="text-white">{{ group?.plazoMeses }} meses</strong>.
                Cada aporte debe validarse con comprobante OCR.
              </p>

              <div class="space-y-2.5 mb-7">
                <div v-for="item in [
                  'Tu aporte será validado mediante OCR en cada ciclo',
                  'El pago final se realizará directamente al proveedor',
                  'Tu comportamiento de pago construye tu scoring crediticio',
                  'Las reglas del grupo son de cumplimiento obligatorio',
                ]" :key="item" class="flex items-start gap-2.5 text-xs text-slate-400">
                  <CheckCircle class="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                  {{ item }}
                </div>
              </div>

              <div class="flex gap-3">
                <button @click="closeJoin" class="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm transition-all">
                  Cancelar
                </button>
                <button
                  @click="confirmJoin"
                  :disabled="joinBusy"
                  class="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/20 disabled:opacity-60"
                >
                  <span v-if="joinBusy" class="flex items-center justify-center gap-2">
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    Procesando...
                  </span>
                  <span v-else>Confirmar</span>
                </button>
              </div>
            </div>

            <!-- Step 2: Success -->
            <div v-if="joinStep === 2" class="p-7 text-center">
              <div class="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                <CheckCircle class="w-8 h-8 text-emerald-400" />
              </div>
              <h2 class="text-xl font-extrabold text-white mb-2">¡Bienvenida al grupo!</h2>
              <p class="text-sm text-slate-400 mb-2">
                Te has unido a <strong class="text-white">{{ group?.name }}</strong> exitosamente.
              </p>
              <p class="text-xs text-slate-500 mb-7">
                Realiza tu primer aporte antes del próximo ciclo para mantener tu scoring.
              </p>
              <button
                @click="goToDashboard"
                class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                Ir al Dashboard
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AppLayout>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-enter-from .relative {
  transition: transform 0.25s ease;
  transform: scale(0.95);
}
.modal-enter-to .relative {
  transform: scale(1);
}
</style>
