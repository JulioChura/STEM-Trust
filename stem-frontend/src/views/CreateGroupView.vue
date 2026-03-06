<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  ChevronRight, ChevronLeft, CheckCircle, Sparkles,
  Copy, Share2, Plus, X, Users, Info
} from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";

const router = useRouter();

// ── Step control ──
const step = ref(1);
const TOTAL_STEPS = 3;
const stepLabels = ["Objetivo", "Detalles", "Finanzas"];

// ── Form state ──
const form = ref({
  objetivo: "",
  nombre: "",
  descripcion: "",
  pais: "Perú",
  ciudad: "",
  nivel: "social",
  montoObjetivo: "",
  aporteMensual: "",
  plazoMeses: 6,
  maxParticipantes: 4,
  frecuencia: "mensual",
  reglas: [
    "Aportes antes del día 5 de cada mes.",
    "Comprobante OCR obligatorio por aporte.",
  ],
});

const newRule = ref("");

// ── Invite code ──
const inviteCode = ref("");
const copied     = ref(false);

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── Objetivo cards ──
const objetivoCards = [
  { value: "laptop",        label: "Laptop",         emoji: "💻", desc: "Computadora de alto rendimiento" },
  { value: "tablet",        label: "Tablet",         emoji: "📱", desc: "Tablet para estudio y trabajo móvil" },
  { value: "curso",         label: "Curso / Cert.",  emoji: "🎓", desc: "Certificación o curso especializado" },
  { value: "equipo-lab",    label: "Equipo de lab",  emoji: "🔬", desc: "Instrumentos o equipos de laboratorio" },
  { value: "impresora-3d",  label: "Impresora 3D",   emoji: "🖨️", desc: "Prototipado rápido y manufactura digital" },
  { value: "proyecto-stem", label: "Proyecto STEM",  emoji: "🚀", desc: "Financiar innovación y desarrollo STEM" },
  { value: "otro",          label: "Otro activo",    emoji: "✨", desc: "Otro activo tecnológico personalizado" },
];

const paisOptions = ["Perú", "Colombia", "México", "Chile", "Argentina", "Bolivia", "Ecuador", "Venezuela", "Otro"];

// ── Validation per step ──
const canNext = computed(() => {
  if (step.value === 1) return Boolean(form.value.objetivo);
  if (step.value === 2) return form.value.nombre.length >= 4 && form.value.ciudad.length >= 2 && form.value.descripcion.length >= 20;
  if (step.value === 3) return Number(form.value.montoObjetivo) >= 100 && Number(form.value.aporteMensual) >= 20;
  return true;
});

function next() {
  if (!canNext.value) return;
  if (step.value === TOTAL_STEPS) { submitGroup(); return; }
  step.value++;
}
function prev() {
  if (step.value > 1) step.value--;
}

function addRule() {
  if (newRule.value.trim() && form.value.reglas.length < 6) {
    form.value.reglas.push(newRule.value.trim());
    newRule.value = "";
  }
}
function removeRule(i) { form.value.reglas.splice(i, 1); }

function slugify(t) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function submitGroup() {
  const code = generateCode();
  inviteCode.value = code;

  const slug = slugify(form.value.nombre) + "-" + code.toLowerCase();
  const newGroup = {
    id: Date.now(),
    slug,
    name: form.value.nombre,
    description: form.value.descripcion,
    objetivo: form.value.objetivo,
    pais: form.value.pais,
    ubicacion: `${form.value.ciudad}, ${form.value.pais}`,
    nivel: form.value.nivel,
    montoObjetivo: Number(form.value.montoObjetivo),
    montoActual: 0,
    aporteMensual: Number(form.value.aporteMensual),
    plazoMeses: Number(form.value.plazoMeses),
    maxParticipantes: Number(form.value.maxParticipantes),
    participantes: 1,
    frecuencia: form.value.frecuencia,
    status: "open",
    reglas: form.value.reglas,
    tags: [],
    inviteCode: `STEM-${code}`,
    createdAt: new Date().toISOString(),
    matchScore: 90,
    organizer: {
      id: 0, initials: "YO", color: "from-violet-500 to-indigo-600",
      name: "Tú", role: "Organizadora", location: `${form.value.ciudad}, ${form.value.pais}`,
      groupsLed: 1, successRate: 100, rating: 5.0, bio: "",
    },
    members: [{ id: 0, name: "Tú", initials: "YO", color: "from-violet-500 to-indigo-600", aportado: 0, puntualidad: 100 }],
    recentActivity: [{ user: "Tú", initials: "YO", color: "from-violet-500 to-indigo-600", action: "creó el grupo", time: "ahora" }],
  };

  try {
    const existing = JSON.parse(localStorage.getItem("my_groups") || "[]");
    localStorage.setItem("my_groups", JSON.stringify([...existing, newGroup]));
  } catch (_) {}

  try {
    const existing = JSON.parse(localStorage.getItem("joined_groups") || "[]");
    const snapshot = {
      id: newGroup.id, slug: newGroup.slug, name: newGroup.name,
      objetivo: newGroup.objetivo, montoObjetivo: newGroup.montoObjetivo,
      montoActual: 0, aporteMensual: newGroup.aporteMensual,
      plazoMeses: newGroup.plazoMeses, participantes: 1,
      maxParticipantes: newGroup.maxParticipantes, status: "open",
      pais: newGroup.pais, ubicacion: newGroup.ubicacion,
      organizer: newGroup.organizer, joinedAt: Date.now(), isOrganizer: true,
    };
    localStorage.setItem("joined_groups", JSON.stringify([...existing, snapshot]));
  } catch (_) {}

  step.value = 4;
}

function copyInvite() {
  navigator.clipboard.writeText(`https://stem-trust.app/invite/STEM-${inviteCode.value}`).catch(() => {});
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}

const estimatedTotal = computed(() => {
  const monto = Number(form.value.montoObjetivo);
  const aporte = Number(form.value.aporteMensual);
  const participantes = Number(form.value.maxParticipantes);
  if (!monto || !aporte || !participantes) return null;
  const meses = Math.ceil(monto / (aporte * participantes));
  return { meses, totalAporte: aporte * meses };
});
</script>

<template>
  <AppLayout title="Crear grupo" subtitle="STEM-Trust · HU7 · Nuevo grupo de ahorro colaborativo">
    <template #topbar-actions>
      <button
        v-if="step < 4"
        @click="step > 1 ? prev() : router.push('/groups')"
        class="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
      >
        <ChevronLeft class="w-4 h-4" /> {{ step > 1 ? "Anterior" : "Cancelar" }}
      </button>
    </template>

    <div class="p-5 sm:p-8">
      <div class="max-w-2xl mx-auto">

        <!-- ── Step indicator ── -->
        <div v-if="step <= TOTAL_STEPS" class="flex items-center justify-center gap-3 mb-10">
          <template v-for="(label, i) in stepLabels" :key="i">
            <div class="flex items-center gap-2">
              <div :class="['w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                step > i + 1  ? 'bg-violet-500 text-white' :
                step === i + 1 ? 'bg-violet-600 text-white ring-4 ring-violet-500/20' :
                'bg-white/10 text-slate-500']">
                <CheckCircle v-if="step > i + 1" class="w-4 h-4" />
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span :class="['text-xs hidden sm:block transition-all', step === i + 1 ? 'text-white font-semibold' : 'text-slate-500']">{{ label }}</span>
            </div>
            <div v-if="i < stepLabels.length - 1" class="w-10 h-px bg-white/10"></div>
          </template>
        </div>

        <Transition name="step-slide" mode="out-in">

          <!-- ── STEP 1: Objetivo ── -->
          <div v-if="step === 1" key="s1">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-extrabold text-white mb-2">¿Qué van a financiar?</h2>
              <p class="text-slate-400 text-sm">Selecciona el activo tecnológico que el grupo quiere obtener de forma colaborativa.</p>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              <button
                v-for="card in objetivoCards"
                :key="card.value"
                @click="form.objetivo = card.value"
                :class="['relative flex flex-col items-center gap-2.5 p-5 rounded-2xl border transition-all text-center',
                  form.objetivo === card.value
                    ? 'bg-violet-500/20 border-violet-500/50 -translate-y-0.5 shadow-lg shadow-violet-500/20'
                    : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/8']"
              >
                <div v-if="form.objetivo === card.value" class="absolute top-2.5 right-2.5">
                  <CheckCircle class="w-4 h-4 text-violet-400" />
                </div>
                <span class="text-3xl">{{ card.emoji }}</span>
                <span :class="['text-xs font-bold', form.objetivo === card.value ? 'text-violet-300' : 'text-slate-200']">{{ card.label }}</span>
                <span class="text-[11px] text-slate-500 leading-tight">{{ card.desc }}</span>
              </button>
            </div>
            <button
              @click="next"
              :disabled="!canNext"
              class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:-translate-y-0.5"
            >
              Continuar <ChevronRight class="w-4 h-4" />
            </button>
          </div>

          <!-- ── STEP 2: Info básica ── -->
          <div v-else-if="step === 2" key="s2">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-extrabold text-white mb-2">Información del grupo</h2>
              <p class="text-slate-400 text-sm">Dale identidad a tu comunidad de ahorro STEM.</p>
            </div>
            <div class="space-y-5 mb-8">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Nombre del grupo *</label>
                <input
                  v-model="form.nombre"
                  type="text"
                  placeholder="Ej. TechLatinas Lima 2026"
                  maxlength="60"
                  class="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                />
                <span class="text-xs text-slate-600">{{ form.nombre.length }}/60</span>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Descripción * <span class="normal-case font-normal">(mín. 20 caracteres)</span></label>
                <textarea
                  v-model="form.descripcion"
                  placeholder="Describe el propósito del grupo, quiénes son bienvenidas y el objetivo compartido..."
                  rows="3"
                  maxlength="300"
                  class="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                ></textarea>
                <span class="text-xs" :class="form.descripcion.length < 20 ? 'text-amber-500' : 'text-slate-600'">
                  {{ form.descripcion.length }}/300
                </span>
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-widest">País *</label>
                  <select
                    v-model="form.pais"
                    class="w-full bg-[#0D1225] border border-white/10 focus:border-violet-500/60 text-slate-300 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  >
                    <option v-for="p in paisOptions" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Ciudad *</label>
                  <input
                    v-model="form.ciudad"
                    type="text"
                    placeholder="Lima"
                    class="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  />
                </div>
              </div>
              <!-- Plan selector -->
              <div class="space-y-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Plan del grupo</label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="n in [
                      { v:'social', l:'🆓 Social', d:'Gratuito · Hasta 4 integrantes · Funciones básicas de ahorro' },
                      { v:'pro',    l:'⚡ Pro',    d:'5% comisión al completar · Hasta 8 personas · OCR + IA scoring' }
                    ]"
                    :key="n.v"
                    @click="form.nivel = n.v"
                    :class="['flex flex-col items-start gap-1.5 p-4 rounded-xl border text-left transition-all',
                      form.nivel === n.v
                        ? 'bg-violet-500/20 border-violet-500/40'
                        : 'bg-white/5 border-white/10 hover:border-white/20']"
                  >
                    <span :class="['text-sm font-bold', form.nivel === n.v ? 'text-white' : 'text-slate-300']">{{ n.l }}</span>
                    <span class="text-[11px] text-slate-500 leading-relaxed">{{ n.d }}</span>
                  </button>
                </div>
              </div>
            </div>
            <button
              @click="next"
              :disabled="!canNext"
              class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:-translate-y-0.5"
            >
              Continuar <ChevronRight class="w-4 h-4" />
            </button>
          </div>

          <!-- ── STEP 3: Finanzas + Reglas ── -->
          <div v-else-if="step === 3" key="s3">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-extrabold text-white mb-2">Configuración financiera</h2>
              <p class="text-slate-400 text-sm">Define los parámetros del fondo colectivo y las reglas de convivencia.</p>
            </div>
            <div class="space-y-5 mb-8">
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Monto objetivo *</label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">S/</span>
                    <input
                      v-model="form.montoObjetivo"
                      type="number" min="100"
                      placeholder="3500"
                      class="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-600 rounded-xl px-4 py-3 pl-10 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Aporte mensual *</label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">S/</span>
                    <input
                      v-model="form.aporteMensual"
                      type="number" min="20"
                      placeholder="700"
                      class="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-600 rounded-xl px-4 py-3 pl-10 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div class="grid sm:grid-cols-3 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Plazo</label>
                  <select v-model="form.plazoMeses" class="w-full bg-[#0D1225] border border-white/10 text-slate-300 rounded-xl px-4 py-3 text-sm outline-none">
                    <option v-for="m in [3,4,5,6,8,10,12]" :key="m" :value="m">{{ m }} meses</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Integrantes</label>
                  <select v-model="form.maxParticipantes" class="w-full bg-[#0D1225] border border-white/10 text-slate-300 rounded-xl px-4 py-3 text-sm outline-none">
                    <option v-for="n in [2,3,4,5,6,7,8]" :key="n" :value="n">{{ n }} personas</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Frecuencia</label>
                  <select v-model="form.frecuencia" class="w-full bg-[#0D1225] border border-white/10 text-slate-300 rounded-xl px-4 py-3 text-sm outline-none">
                    <option value="mensual">Mensual</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="semanal">Semanal</option>
                  </select>
                </div>
              </div>

              <!-- Financial summary -->
              <div v-if="estimatedTotal" class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p class="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 mb-3">
                  <Info class="w-3.5 h-3.5" /> Resumen del fondo
                </p>
                <div class="grid grid-cols-3 gap-3 text-xs text-slate-400">
                  <div class="text-center">
                    <div class="text-base font-extrabold text-white">S/ {{ Number(form.montoObjetivo).toLocaleString() }}</div>
                    <div>objetivo total</div>
                  </div>
                  <div class="text-center">
                    <div class="text-base font-extrabold text-white">{{ estimatedTotal.meses }}m</div>
                    <div>plazo estimado</div>
                  </div>
                  <div class="text-center">
                    <div class="text-base font-extrabold text-white">S/ {{ estimatedTotal.totalAporte }}/p.</div>
                    <div>total por persona</div>
                  </div>
                </div>
              </div>

              <!-- Rules -->
              <div class="space-y-3">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Reglas del grupo <span class="normal-case font-normal">(máx. 6)</span></label>
                <div class="space-y-2">
                  <div v-for="(r, i) in form.reglas" :key="i" class="flex items-center gap-2.5 text-sm bg-white/5 rounded-xl px-3 py-2.5">
                    <span class="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] flex items-center justify-center shrink-0 font-bold">{{ i + 1 }}</span>
                    <span class="flex-1 text-slate-300 text-xs">{{ r }}</span>
                    <button @click="removeRule(i)" class="text-slate-600 hover:text-rose-400 transition-colors shrink-0">
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div v-if="form.reglas.length < 6" class="flex gap-2">
                  <input
                    v-model="newRule"
                    @keyup.enter="addRule"
                    type="text"
                    placeholder="Escribe una regla y presiona Enter..."
                    class="flex-1 bg-white/5 border border-white/10 focus:border-violet-500/60 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-xs outline-none transition-all"
                  />
                  <button @click="addRule" class="px-3 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:text-violet-300 transition-colors">
                    <Plus class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <button
              @click="next"
              :disabled="!canNext"
              class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:-translate-y-0.5"
            >
              <Sparkles class="w-4 h-4" /> Crear grupo
            </button>
          </div>

          <!-- ── STEP 4: Éxito + Invitación HU8 ── -->
          <div v-else-if="step === 4" key="s4" class="text-center py-4">
            <!-- Confetti ring -->
            <div class="relative w-24 h-24 mx-auto mb-6">
              <div class="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping"></div>
              <div class="relative w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
                <CheckCircle class="w-12 h-12 text-emerald-400" />
              </div>
            </div>
            <h2 class="text-3xl font-extrabold text-white mb-2">¡Grupo creado!</h2>
            <p class="text-slate-400 text-sm mb-1">
              <span class="text-violet-300 font-semibold">{{ form.nombre }}</span> ya está registrado en STEM-Trust.
            </p>
            <p class="text-slate-500 text-xs mb-8">Ya eres parte del grupo como organizadora.</p>

            <!-- HU8 Invite section -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5 text-left">
              <p class="text-xs font-semibold text-violet-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Share2 class="w-3.5 h-3.5" /> HU8 · Invitar participantes
              </p>
              <p class="text-xs text-slate-400 mb-4 leading-relaxed">
                Comparte el código o el enlace con otras mujeres STEM para que soliciten unirse a tu grupo.
              </p>
              <!-- Code display -->
              <div class="flex items-center gap-3 bg-[#070B18] border border-violet-500/30 rounded-xl px-4 py-3.5 mb-3">
                <div>
                  <p class="text-[10px] text-slate-500 mb-0.5">Código de invitación</p>
                  <span class="font-mono text-xl font-extrabold text-violet-300 tracking-[0.2em]">STEM-{{ inviteCode }}</span>
                </div>
                <button
                  @click="copyInvite"
                  class="ml-auto flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all"
                  :class="copied ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'"
                >
                  <Copy class="w-3.5 h-3.5" />
                  {{ copied ? "¡Copiado!" : "Copiar enlace" }}
                </button>
              </div>
              <p class="text-xs text-slate-600 text-center font-mono">stem-trust.app/invite/STEM-{{ inviteCode }}</p>
            </div>

            <!-- Group summary -->
            <div class="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 mb-6 text-left">
              <div class="grid grid-cols-3 gap-4 text-xs text-center">
                <div>
                  <div class="text-lg font-extrabold text-white">S/ {{ Number(form.montoObjetivo).toLocaleString() }}</div>
                  <div class="text-slate-500 mt-0.5">objetivo</div>
                </div>
                <div>
                  <div class="text-lg font-extrabold text-white">{{ form.plazoMeses }}m</div>
                  <div class="text-slate-500 mt-0.5">plazo</div>
                </div>
                <div>
                  <div class="text-lg font-extrabold text-white">{{ form.maxParticipantes }}</div>
                  <div class="text-slate-500 mt-0.5">integrantes</div>
                </div>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                @click="router.push('/groups')"
                class="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition-all"
              >
                Explorar grupos
              </button>
              <button
                @click="router.push('/dashboard')"
                class="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                Ir al Dashboard
              </button>
            </div>
          </div>

        </Transition>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.step-slide-enter-active,
.step-slide-leave-active { transition: all 0.25s ease; }
.step-slide-enter-from  { opacity: 0; transform: translateX(24px); }
.step-slide-leave-to    { opacity: 0; transform: translateX(-24px); }
</style>
