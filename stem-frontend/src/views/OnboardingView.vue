<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-vue-next";
import { authStore } from "../stores/authStore";

const router = useRouter();

const firstName = computed(
  () => authStore.user?.first_name || authStore.user?.email?.split("@")[0] || "tú"
);

const selected = ref(new Set());

function toggle(id) {
  if (selected.value.has(id)) selected.value.delete(id);
  else selected.value.add(id);
  // trigger reactivity
  selected.value = new Set(selected.value);
}

const topics = [
  { id: "programacion", label: "Programación", emoji: "💻", desc: "Python, JS, web, apps" },
  { id: "ia-ml", label: "IA & Machine Learning", emoji: "🤖", desc: "Modelos, datos, algoritmos" },
  { id: "ciberseguridad", label: "Ciberseguridad", emoji: "🔐", desc: "Redes, ethical hacking" },
  { id: "electronica", label: "Electrónica & Hardware", emoji: "⚡", desc: "Arduino, IoT, circuitos" },
  { id: "diseño-ux", label: "Diseño UX/UI", emoji: "🎨", desc: "Figma, prototipado, producto" },
  { id: "emprendimiento", label: "Emprendimiento Tech", emoji: "🚀", desc: "Startups, fintech, negocios" },
  { id: "matematicas", label: "Matemáticas & Ciencia", emoji: "📐", desc: "Estadística, física, cálculo" },
  { id: "robotica", label: "Robótica", emoji: "🦾", desc: "Automatización, manufact." },
  { id: "datos", label: "Ciencia de Datos", emoji: "📊", desc: "Análisis, visualización, SQL" },
  { id: "bioinformatica", label: "Bioinformática", emoji: "🧬", desc: "Salud, genómica, biotech" },
  { id: "energia", label: "Energías Renovables", emoji: "🌱", desc: "Solar, eólica, sostenibilidad" },
  { id: "educacion", label: "EdTech & Educación", emoji: "📚", desc: "Plataformas, e-learning" },
];

const objetivos = [
  { id: "laptop", label: "Laptop / Computadora", emoji: "💻" },
  { id: "tablet", label: "Tablet", emoji: "📱" },
  { id: "curso", label: "Curso certificado", emoji: "🎓" },
  { id: "equipo-lab", label: "Equipo de laboratorio", emoji: "🔬" },
  { id: "impresora-3d", label: "Impresora 3D", emoji: "🖨️" },
  { id: "otro", label: "Otro activo STEM", emoji: "✨" },
];

const selectedTopics = ref(new Set());
const selectedObjetivo = ref(null);
const step = ref(1); // 1 = intereses, 2 = objetivo

function toggleTopic(id) {
  if (selectedTopics.value.has(id)) selectedTopics.value.delete(id);
  else selectedTopics.value.add(id);
  selectedTopics.value = new Set(selectedTopics.value);
}

function goToStep2() {
  if (selectedTopics.value.size === 0) return;
  step.value = 2;
}

function finish() {
  // Persist interests locally (backend integration pending)
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("onboarding_topics", JSON.stringify([...selectedTopics.value]));
    localStorage.setItem("onboarding_objetivo", selectedObjetivo.value || "");
    localStorage.setItem("onboarding_done", "1");
  }
  router.push("/dashboard");
}

function skip() {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("onboarding_done", "1");
  }
  router.push("/dashboard");
}
</script>

<template>
  <div class="min-h-screen bg-[#070B18] text-white flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
    <!-- Background orbs -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
    <div class="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
    <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>

    <!-- Card -->
    <div class="relative z-10 w-full max-w-2xl">

      <!-- Logo -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/40">
          <Sparkles class="w-5 h-5 text-white" />
        </div>
        <span class="font-bold text-lg text-white tracking-tight">STEM<span class="text-violet-400">-Trust</span></span>
      </div>

      <!-- Progress dots -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <div
          v-for="s in 2" :key="s"
          :class="['h-1.5 rounded-full transition-all duration-300', s === step ? 'w-8 bg-violet-500' : s < step ? 'w-4 bg-emerald-500' : 'w-4 bg-white/15']"
        ></div>
      </div>

      <!-- ── STEP 1: Intereses ── -->
      <Transition name="fade-slide" mode="out-in">
        <div v-if="step === 1" key="step1">
          <div class="text-center mb-8">
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              ¡Hola, <span class="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{{ firstName }}</span>! 👋
            </h1>
            <p class="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
              Marca los temas que te interesan. Usaremos esto para conectarte con el grupo ideal y mejorar tu scoring.
            </p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            <button
              v-for="topic in topics"
              :key="topic.id"
              type="button"
              @click="toggleTopic(topic.id)"
              :class="[
                'group relative flex flex-col items-start gap-1.5 px-4 py-4 rounded-2xl border text-left transition-all duration-200',
                selectedTopics.has(topic.id)
                  ? 'bg-violet-500/20 border-violet-500/60 ring-1 ring-violet-500/40 shadow-lg shadow-violet-500/10'
                  : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
              ]"
            >
              <div class="flex items-center justify-between w-full">
                <span class="text-xl">{{ topic.emoji }}</span>
                <div v-if="selectedTopics.has(topic.id)"
                  class="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 class="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <span class="text-sm font-semibold text-white leading-tight">{{ topic.label }}</span>
              <span class="text-xs text-slate-500 leading-tight">{{ topic.desc }}</span>
            </button>
          </div>

          <div class="flex items-center justify-between">
            <button
              @click="skip"
              class="text-sm text-slate-500 hover:text-slate-300 transition-colors px-4 py-2"
            >
              Saltar por ahora
            </button>
            <button
              @click="goToStep2"
              :disabled="selectedTopics.size === 0"
              class="group flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 text-sm"
            >
              Continuar
              <span class="text-xs bg-white/20 px-1.5 py-0.5 rounded-md">{{ selectedTopics.size }}</span>
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </Transition>

      <!-- ── STEP 2: Objetivo ── -->
      <Transition name="fade-slide" mode="out-in">
        <div v-if="step === 2" key="step2">
          <div class="text-center mb-8">
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              ¿Qué activo STEM quieres <span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">obtener</span>?
            </h1>
            <p class="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
              Esto nos ayuda a agruparse con mujeres que comparten tu objetivo. Puedes cambiarlo después.
            </p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            <button
              v-for="obj in objetivos"
              :key="obj.id"
              type="button"
              @click="selectedObjetivo = obj.id"
              :class="[
                'flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-2xl border text-center transition-all duration-200',
                selectedObjetivo === obj.id
                  ? 'bg-emerald-500/20 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
              ]"
            >
              <span class="text-3xl">{{ obj.emoji }}</span>
              <span class="text-sm font-semibold text-white leading-tight">{{ obj.label }}</span>
              <div v-if="selectedObjetivo === obj.id"
                class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 class="w-3.5 h-3.5 text-white" />
              </div>
            </button>
          </div>

          <div class="flex items-center justify-between">
            <button
              @click="step = 1"
              class="text-sm text-slate-500 hover:text-slate-300 transition-colors px-4 py-2 flex items-center gap-1"
            >
              ← Atrás
            </button>
            <button
              @click="finish"
              :disabled="!selectedObjetivo"
              class="group flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:-translate-y-0.5 text-sm"
            >
              ¡Ir al Dashboard!
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
