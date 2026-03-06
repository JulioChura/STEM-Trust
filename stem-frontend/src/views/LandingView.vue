<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  Users, Shield, Laptop, TrendingUp, CheckCircle, ArrowRight, Zap,
  BarChart2, FileCheck, GraduationCap, Globe, ChevronRight, Star,
  BookOpen, Lock, Cpu, CircleDollarSign, HeartHandshake, Sparkles,
  Menu, X
} from "lucide-vue-next";

const router = useRouter();
const mobileMenuOpen = ref(false);
const scrollY = ref(0);

function onScroll() { scrollY.value = window.scrollY; }
onMounted(() => window.addEventListener("scroll", onScroll));
onUnmounted(() => window.removeEventListener("scroll", onScroll));

function goDemo() { router.push("/dashboard?demo=true"); }
function goLogin() { router.push("/login"); }
function goRegister() { router.push("/register"); }

const stats = [
  { value: "73%", label: "Mujeres excluidas del crédito formal en Latinoamérica" },
  { value: "5x", label: "Mayor probabilidad de pago en garantía solidaria" },
  { value: "3-5", label: "Integrantes por grupo de ahorro" },
  { value: "0%", label: "Comisión en el nivel social gratuito" },
];

const steps = [
  {
    icon: Users,
    number: "01",
    title: "Forma tu grupo",
    desc: "Agrúpate con 3 a 5 mujeres que comparten tu objetivo tecnológico. La IA de STEM-Trust analiza la afinidad del grupo para maximizar el éxito.",
    color: "from-violet-500 to-indigo-600",
  },
  {
    icon: FileCheck,
    number: "02",
    title: "Valida tus aportes con OCR",
    desc: "Carga tus comprobantes de pago. Nuestro motor OCR (powered by Gemini) los verifica en segundos, eliminando fraudes y errores manuales.",
    color: "from-cyan-500 to-teal-600",
  },
  {
    icon: Laptop,
    number: "03",
    title: "Obtén tu activo STEM",
    desc: "El algoritmo asigna el beneficio según tu Scoring de Comportamiento. El pago se realiza directamente al proveedor — sin efectivo, sin riesgo.",
    color: "from-emerald-500 to-green-600",
  },
];

const features = [
  {
    icon: BarChart2,
    title: "Behavioral Scoring",
    desc: "Tu historial de puntualidad, consistencia y progreso STEM construye una identidad crediticia alternativa — sin necesitar Infocorp.",
    accent: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: FileCheck,
    title: "Validación OCR Anti-Fraude",
    desc: "Visión artificial analiza cada comprobante de transferencia. Detecta duplicados y falsificaciones en tiempo real.",
    accent: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: Users,
    title: "Grupos Inteligentes (AI)",
    desc: "Algoritmo de clustering agrupa mujeres con objetivos productivos similares. Grupos afines tienen menor morosidad.",
    accent: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: Lock,
    title: "Pago en Bucle Cerrado",
    desc: "El capital nunca se entrega en efectivo. La plataforma paga directamente al proveedor — garantía de uso productivo.",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: GraduationCap,
    title: "Capital Humano STEM",
    desc: "Integración con plataformas educativas. Tu progreso en cursos STEM refuerza tu scoring — el conocimiento es tu garantía.",
    accent: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Globe,
    title: "Datos para Instituciones",
    desc: "Exportamos Scoring Crediticio Alternativo a Cajas Rurales y bancos. Tu historial te abre puertas al sistema formal.",
    accent: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
];

const tiers = [
  {
    name: "Social",
    price: "Gratis",
    desc: "Micro-colectas para gastos cotidianos. Empieza a construir tu identidad financiera.",
    features: ["Grupos de ahorro básicos", "Validación de comprobantes", "Historial de comportamiento", "Acceso a comunidad"],
    cta: "Empezar gratis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "Comisión",
    priceDetail: "sobre el activo",
    desc: "Financiamiento de activos tecnológicos STEM de alto valor con pago en bucle cerrado.",
    features: ["Todo lo del plan Social", "Scoring avanzado con IA", "Pago directo a proveedor", "Certificado de confianza", "Acceso a instituciones financieras"],
    cta: "Unirse al programa",
    highlight: true,
  },
];
</script>

<template>
  <div class="landing-root bg-[#070B18] text-white font-sans">

    <!-- ───────── NAVBAR ───────── -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      :class="scrollY > 40 ? 'bg-[#070B18]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-transparent'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-8">
        <!-- Logo -->
        <a href="#" class="flex items-center gap-2 no-underline">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles class="w-4 h-4 text-white" />
          </div>
          <span class="font-bold text-lg tracking-tight text-white">STEM<span class="text-violet-400">-Trust</span></span>
        </a>

        <!-- Desktop links -->
        <div class="hidden md:flex items-center gap-6 ml-4 text-sm text-slate-400">
          <a href="#como-funciona" class="hover:text-white transition-colors">Cómo funciona</a>
          <a href="#caracteristicas" class="hover:text-white transition-colors">Características</a>
          <a href="#planes" class="hover:text-white transition-colors">Planes</a>
        </div>

        <div class="hidden md:flex items-center gap-3 ml-auto">
          <button @click="goLogin" class="text-sm text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">
            Iniciar sesión
          </button>
          <button
            @click="goRegister"
            class="text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            Registrarse
          </button>
        </div>

        <!-- Mobile menu button -->
        <button class="md:hidden ml-auto text-slate-400 hover:text-white" @click="mobileMenuOpen = !mobileMenuOpen">
          <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-[#0D1225] border-t border-white/5 px-4 py-4 flex flex-col gap-3">
        <a href="#como-funciona" class="text-slate-300 hover:text-white py-2" @click="mobileMenuOpen = false">Cómo funciona</a>
        <a href="#caracteristicas" class="text-slate-300 hover:text-white py-2" @click="mobileMenuOpen = false">Características</a>
        <a href="#planes" class="text-slate-300 hover:text-white py-2" @click="mobileMenuOpen = false">Planes</a>
        <button @click="goLogin" class="text-left text-slate-300 hover:text-white py-2">Iniciar sesión</button>
        <button @click="goRegister" class="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium mt-1">
          Registrarse
        </button>
      </div>
    </nav>

    <!-- ───────── HERO ───────── -->
    <section class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      <!-- Animated gradient bg -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="hero-orb-1 absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]"></div>
        <div class="hero-orb-2 absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[100px]"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-[80px]"></div>
        <!-- Grid pattern -->
        <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto text-center pt-24 pb-16">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-medium px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Powered by AI &amp; Behavioral Data · WIE IEEE Hackathon 2026</span>
        </div>

        <h1 class="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
          Cierra la brecha<br />
          <span class="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            de género en STEM
          </span>
        </h1>

        <p class="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          STEM-Trust transforma el ahorro grupal informal en un <strong class="text-slate-200">historial crediticio verificable</strong>.
          Mujeres sin acceso al sistema financiero obtienen activos tecnológicos a través de la validación de su propia comunidad.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <button
            @click="goDemo"
            class="group flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 text-base"
          >
            <Zap class="w-5 h-5" />
            Acceso Demo
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            @click="goRegister"
            class="flex items-center gap-2 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-all hover:bg-white/5 text-base"
          >
            Crear cuenta gratis
          </button>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div
            v-for="s in stats"
            :key="s.value"
            class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-5 hover:bg-white/8 transition-all hover:-translate-y-0.5"
          >
            <div class="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{{ s.value }}</div>
            <div class="text-xs text-slate-400 mt-1 leading-snug">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-xs animate-bounce">
        <span>Descubre más</span>
        <ChevronRight class="w-4 h-4 rotate-90" />
      </div>
    </section>

    <!-- ───────── PROBLEMA ───────── -->
    <section class="py-24 px-4 relative">
      <div class="max-w-6xl mx-auto">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span class="text-xs font-semibold text-rose-400 uppercase tracking-widest mb-3 block">El Problema</span>
            <h2 class="text-4xl font-bold text-white leading-tight mb-6">
              El sistema financiero <span class="text-rose-400">excluye</span> a millones de mujeres STEM
            </h2>
            <p class="text-slate-400 leading-relaxed mb-6">
              Las mujeres en zonas rurales y periurbanas de Latinoamérica no tienen acceso a crédito
              porque el sistema bancario exige un historial crediticio que <strong class="text-slate-200">nunca pudieron construir</strong>.
              Un círculo vicioso que perpetúa la brecha de género.
            </p>
            <p class="text-slate-400 leading-relaxed">
              STEM-Trust rompe ese ciclo usando <strong class="text-slate-200">datos de comportamiento</strong> — puntualidad, consistencia de aportes
              y avance académico — como sustituto del historial crediticio tradicional.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="problem-card bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6">
              <div class="text-3xl font-extrabold text-rose-400 mb-2">73%</div>
              <p class="text-sm text-slate-400 leading-snug">de mujeres de bajos recursos sin acceso a crédito formal</p>
            </div>
            <div class="problem-card bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
              <div class="text-3xl font-extrabold text-amber-400 mb-2">2.4B</div>
              <p class="text-sm text-slate-400 leading-snug">personas excluidas del sistema financiero a nivel global</p>
            </div>
            <div class="problem-card bg-violet-500/10 border border-violet-500/20 rounded-2xl p-6">
              <div class="text-3xl font-extrabold text-violet-400 mb-2">18%</div>
              <p class="text-sm text-slate-400 leading-snug">de mujeres en roles técnicos STEM en la región</p>
            </div>
            <div class="problem-card bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-6">
              <div class="text-3xl font-extrabold text-cyan-400 mb-2">5x</div>
              <p class="text-sm text-slate-400 leading-snug">mayor tasa de pago con garantía solidaria vs. crédito individual</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── CÓMO FUNCIONA ───────── -->
    <section id="como-funciona" class="py-24 px-4 relative">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px]"></div>
      </div>
      <div class="max-w-6xl mx-auto relative z-10">
        <div class="text-center mb-16">
          <span class="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3 block">Proceso</span>
          <h2 class="text-4xl font-bold text-white mb-4">Cómo funciona STEM-Trust</h2>
          <p class="text-slate-400 max-w-xl mx-auto">Tres pasos simples para transformar el ahorro grupal en tu primer activo tecnológico</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="step in steps"
            :key="step.number"
            class="relative group"
          >
            <div class="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/8 hover:border-white/20 transition-all hover:-translate-y-1 h-full">
              <div class="flex items-start gap-4 mb-5">
                <div :class="`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0 shadow-lg`">
                  <component :is="step.icon" class="w-6 h-6 text-white" />
                </div>
                <span class="text-5xl font-black text-white/5 leading-none select-none">{{ step.number }}</span>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">{{ step.title }}</h3>
              <p class="text-slate-400 leading-relaxed text-sm">{{ step.desc }}</p>
            </div>

            <!-- Connector arrow (desktop) -->
            <div v-if="step.number !== '03'" class="hidden md:flex absolute top-1/2 -right-4 z-10 items-center justify-center">
              <div class="w-8 h-8 rounded-full bg-[#0D1225] border border-white/10 flex items-center justify-center">
                <ChevronRight class="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── CARACTERÍSTICAS ───────── -->
    <section id="caracteristicas" class="py-24 px-4">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <span class="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3 block">Tecnología</span>
          <h2 class="text-4xl font-bold text-white mb-4">El Trust Engine</h2>
          <p class="text-slate-400 max-w-xl mx-auto">Infraestructura de validación de confianza que convierte comportamiento en acceso financiero</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="f in features"
            :key="f.title"
            :class="`${f.bg} border rounded-2xl p-6 hover:-translate-y-1 transition-all group cursor-default`"
          >
            <div :class="`${f.accent} mb-4`">
              <component :is="f.icon" class="w-7 h-7" />
            </div>
            <h3 class="text-base font-bold text-white mb-2">{{ f.title }}</h3>
            <p class="text-sm text-slate-400 leading-relaxed">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── PLANES ───────── -->
    <section id="planes" class="py-24 px-4 relative">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]"></div>
      </div>
      <div class="max-w-5xl mx-auto relative z-10">
        <div class="text-center mb-16">
          <span class="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3 block">Modelo</span>
          <h2 class="text-4xl font-bold text-white mb-4">Dos niveles, un objetivo</h2>
          <p class="text-slate-400 max-w-xl mx-auto">Empieza gratis, escala a activos STEM de alto valor</p>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div
            v-for="tier in tiers"
            :key="tier.name"
            :class="[
              'rounded-2xl p-8 border flex flex-col',
              tier.highlight
                ? 'bg-gradient-to-b from-violet-600/20 to-indigo-600/10 border-violet-500/40 ring-1 ring-violet-500/30'
                : 'bg-white/5 border-white/10'
            ]"
          >
            <div v-if="tier.highlight" class="inline-flex items-center gap-1 text-xs font-semibold text-violet-300 bg-violet-500/20 border border-violet-500/30 px-3 py-1 rounded-full mb-4 self-start">
              <Star class="w-3 h-3" /> Recomendado
            </div>
            <div class="mb-6">
              <div class="text-xs text-slate-500 font-medium uppercase tracking-widest mb-1">{{ tier.name }}</div>
              <div class="text-4xl font-black text-white">{{ tier.price }} <span v-if="tier.priceDetail" class="text-base font-normal text-slate-400">{{ tier.priceDetail }}</span></div>
              <p class="text-slate-400 text-sm mt-2">{{ tier.desc }}</p>
            </div>
            <ul class="space-y-3 mb-8 flex-1">
              <li v-for="feat in tier.features" :key="feat" class="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle class="w-4 h-4 text-emerald-400 shrink-0" />
                {{ feat }}
              </li>
            </ul>
            <button
              @click="goRegister"
              :class="[
                'w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 group',
                tier.highlight
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 hover:-translate-y-0.5'
                  : 'border border-white/15 hover:border-white/30 text-slate-300 hover:text-white hover:bg-white/5'
              ]"
            >
              {{ tier.cta }}
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── CTA FINAL ───────── -->
    <section class="py-24 px-4">
      <div class="max-w-3xl mx-auto text-center">
        <div class="relative bg-gradient-to-br from-violet-600/20 via-indigo-600/15 to-cyan-600/10 border border-violet-500/30 rounded-3xl p-12 overflow-hidden">
          <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
            <div class="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
          </div>
          <div class="relative z-10">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/40">
              <HeartHandshake class="w-8 h-8 text-white" />
            </div>
            <h2 class="text-4xl font-extrabold text-white mb-4">Empodera tu futuro STEM hoy</h2>
            <p class="text-slate-400 leading-relaxed mb-8 max-w-lg mx-auto">
              Únete a la red de mujeres que están construyendo su historial financiero a través del ahorro solidario y la tecnología.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                @click="goRegister"
                class="group flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5"
              >
                Crear cuenta gratis
                <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                @click="goDemo"
                class="flex items-center gap-2 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-all hover:bg-white/5"
              >
                <Zap class="w-4 h-4" />
                Ver demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── FOOTER ───────── -->
    <footer class="border-t border-white/5 py-10 px-4">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles class="w-3 h-3 text-white" />
          </div>
          <span class="font-bold text-sm text-slate-300">STEM<span class="text-violet-400">-Trust</span></span>
        </div>
        <p class="text-xs text-slate-600 text-center">
          © 2026 STEM-Trust · WIE IEEE Hackathon · Cerrando la brecha de género en STEM
        </p>
        <div class="flex items-center gap-4 text-xs text-slate-500">
          <button @click="goLogin" class="hover:text-slate-300 transition-colors">Iniciar sesión</button>
          <button @click="goRegister" class="hover:text-slate-300 transition-colors">Registrarse</button>
        </div>
      </div>
    </footer>

  </div>
</template>

<style scoped>
.landing-root {
  overflow-x: hidden;
}

.hero-orb-1 {
  animation: float-orb 8s ease-in-out infinite;
}
.hero-orb-2 {
  animation: float-orb 10s ease-in-out infinite reverse;
}

@keyframes float-orb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 15px) scale(0.97); }
}

.problem-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.problem-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}
</style>
