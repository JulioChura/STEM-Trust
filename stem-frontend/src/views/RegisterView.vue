<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, User, AlertCircle, CheckCircle } from "lucide-vue-next";
import { authService } from "../services/authService";

const router = useRouter();
const busy = ref(false);
const showPassword = ref(false);
const showConfirm = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const form = reactive({
  first_name: "",
  last_name: "",
  email: "",
  password1: "",
  password2: "",
});

const passwordStrength = ref(0);
function checkStrength(val) {
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  passwordStrength.value = score;
}

const strengthLabel = {
  0: "", 1: "Muy débil", 2: "Débil", 3: "Buena", 4: "Fuerte"
};
const strengthColor = {
  0: "", 1: "bg-rose-500", 2: "bg-amber-500", 3: "bg-emerald-400", 4: "bg-emerald-500"
};

async function onRegister() {
  errorMessage.value = "";
  if (!form.first_name || !form.last_name || !form.email || !form.password1 || !form.password2) {
    errorMessage.value = "Completa todos los campos.";
    return;
  }
  if (form.password1 !== form.password2) {
    errorMessage.value = "Las contraseñas no coinciden.";
    return;
  }
  busy.value = true;
  try {
    const data = await authService.register({ ...form });
    await authService.saveSessionFromAuthResponse(data);
    router.push("/dashboard");
  } catch (err) {
    const d = err?.data;
    if (d) {
      const firstKey = Object.keys(d)[0];
      errorMessage.value = Array.isArray(d[firstKey]) ? d[firstKey][0] : d[firstKey];
    } else {
      errorMessage.value = err?.message || "Error al registrarse. Intenta de nuevo.";
    }
  } finally {
    busy.value = false;
  }
}

function handleGoogleResponse(response) {
  busy.value = true;
  errorMessage.value = "";
  authService.loginWithGoogle(response.credential)
    .then(async (data) => {
      await authService.saveSessionFromAuthResponse(data);
      router.push("/dashboard");
    })
    .catch((err) => {
      errorMessage.value = err?.data?.detail || "Error con Google. Intenta de nuevo.";
    })
    .finally(() => { busy.value = false; });
}

onMounted(() => {
  if (!window.google) {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true; script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "162579955895-228eu5kjl865lm9cv6q83chlr0pts6e2.apps.googleusercontent.com",
          callback: handleGoogleResponse,
          auto_prompt: false,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-btn-register"),
          { theme: "filled_black", size: "large", shape: "pill", width: 320 }
        );
      }
    };
    document.head.appendChild(script);
  } else {
    window.google.accounts.id.renderButton(
      document.getElementById("google-btn-register"),
      { theme: "filled_black", size: "large", shape: "pill", width: 320 }
    );
  }
});
</script>

<template>
  <div class="min-h-screen bg-[#070B18] flex">

    <!-- ── LEFT PANEL ── -->
    <div class="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-violet-900/60 to-[#070B18]"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      <div class="absolute top-1/3 left-1/3 w-72 h-72 bg-indigo-600/20 rounded-full blur-[80px]"></div>
      <div class="absolute bottom-1/4 right-0 w-56 h-56 bg-violet-500/15 rounded-full blur-[60px]"></div>

      <!-- Logo -->
      <div class="relative z-10 flex items-center gap-2">
        <router-link to="/" class="flex items-center gap-2 no-underline">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/40">
            <Sparkles class="w-5 h-5 text-white" />
          </div>
          <span class="font-bold text-lg text-white tracking-tight">STEM<span class="text-violet-300">-Trust</span></span>
        </router-link>
      </div>

      <!-- Main copy -->
      <div class="relative z-10 space-y-6">
        <h2 class="text-4xl font-extrabold text-white leading-tight">
          Tu primer paso<br />
          hacia la <span class="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">libertad STEM</span>
        </h2>
        <p class="text-slate-400 text-sm leading-relaxed max-w-xs">
          Registrarte es gratis y toma menos de 2 minutos. Empieza a construir tu historial financiero hoy.
        </p>
        <div class="space-y-3 pt-2">
          <div v-for="item in [
            { emoji: '🔒', text: 'Tus datos están seguros y encriptados' },
            { emoji: '🚀', text: 'Crea o únete a un grupo en minutos' },
            { emoji: '📱', text: 'Carga comprobantes desde el celular' },
            { emoji: '🎓', text: 'Conecta tu progreso STEM para aumentar tu score' },
          ]" :key="item.text" class="flex items-center gap-3 text-sm text-slate-400">
            <span class="text-base">{{ item.emoji }}</span>
            {{ item.text }}
          </div>
        </div>
      </div>

      <!-- Trust badges -->
      <div class="relative z-10 flex flex-wrap gap-2">
        <span class="inline-flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 text-slate-400 px-3 py-1.5 rounded-full">
          <CheckCircle class="w-3 h-3 text-emerald-400" /> WIE IEEE 2026
        </span>
        <span class="inline-flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 text-slate-400 px-3 py-1.5 rounded-full">
          <CheckCircle class="w-3 h-3 text-emerald-400" /> 100% Seguro
        </span>
        <span class="inline-flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 text-slate-400 px-3 py-1.5 rounded-full">
          <CheckCircle class="w-3 h-3 text-emerald-400" /> Powered by AI
        </span>
      </div>
    </div>

    <!-- ── RIGHT PANEL (form) ── -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
      <!-- Mobile logo -->
      <div class="lg:hidden mb-8 flex items-center gap-2">
        <router-link to="/" class="flex items-center gap-2 no-underline">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles class="w-4 h-4 text-white" />
          </div>
          <span class="font-bold text-lg text-white tracking-tight">STEM<span class="text-violet-400">-Trust</span></span>
        </router-link>
      </div>

      <div class="w-full max-w-md">
        <div class="mb-7">
          <h1 class="text-3xl font-extrabold text-white mb-2">Crear cuenta</h1>
          <p class="text-slate-400 text-sm">Únete al ecosistema de confianza STEM</p>
        </div>

        <!-- Google -->
        <div id="google-btn-register" class="mb-5 flex justify-start"></div>

        <div class="flex items-center gap-3 mb-5">
          <div class="flex-1 h-px bg-white/10"></div>
          <span class="text-xs text-slate-500">o regístrate con correo</span>
          <div class="flex-1 h-px bg-white/10"></div>
        </div>

        <!-- Error / success -->
        <div v-if="errorMessage" class="mb-4 flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm px-4 py-3 rounded-xl">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="mb-4 flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm px-4 py-3 rounded-xl">
          <CheckCircle class="w-4 h-4 shrink-0 mt-0.5" />
          {{ successMessage }}
        </div>

        <form @submit.prevent="onRegister" class="space-y-4">
          <!-- Name row -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400">Nombre</label>
              <div class="relative">
                <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  v-model="form.first_name"
                  type="text"
                  placeholder="Ana"
                  autocomplete="given-name"
                  class="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-600 rounded-xl px-4 py-3 pl-10 text-sm outline-none transition-all"
                />
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-400">Apellido</label>
              <div class="relative">
                <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  v-model="form.last_name"
                  type="text"
                  placeholder="López"
                  autocomplete="family-name"
                  class="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-600 rounded-xl px-4 py-3 pl-10 text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Email -->
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-400">Correo electrónico</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                v-model="form.email"
                type="email"
                placeholder="tu@correo.com"
                autocomplete="email"
                class="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-600 rounded-xl px-4 py-3 pl-10 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-400">Contraseña</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                v-model="form.password1"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mínimo 8 caracteres"
                autocomplete="new-password"
                class="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-600 rounded-xl px-4 py-3 pl-10 pr-10 text-sm outline-none transition-all"
                @input="checkStrength(form.password1)"
              />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <!-- Strength bar -->
            <div v-if="form.password1" class="flex gap-1 mt-1">
              <div v-for="i in 4" :key="i" :class="['h-1 flex-1 rounded-full transition-all', i <= passwordStrength ? strengthColor[passwordStrength] : 'bg-white/10']"></div>
            </div>
            <p v-if="form.password1 && passwordStrength" class="text-xs" :class="passwordStrength >= 3 ? 'text-emerald-400' : 'text-slate-500'">
              {{ strengthLabel[passwordStrength] }}
            </p>
          </div>

          <!-- Confirm password -->
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-400">Confirmar contraseña</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                v-model="form.password2"
                :type="showConfirm ? 'text' : 'password'"
                placeholder="Repite tu contraseña"
                autocomplete="new-password"
                class="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-600 rounded-xl px-4 py-3 pl-10 pr-10 text-sm outline-none transition-all"
                :class="form.password2 && form.password1 !== form.password2 ? 'border-rose-500/50' : ''"
              />
              <button type="button" @click="showConfirm = !showConfirm" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                <EyeOff v-if="showConfirm" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="form.password2 && form.password1 !== form.password2" class="text-xs text-rose-400">
              Las contraseñas no coinciden
            </p>
          </div>

          <button
            type="submit"
            :disabled="busy"
            class="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 mt-1"
          >
            <span v-if="busy">Creando cuenta...</span>
            <span v-else class="flex items-center gap-2">
              Crear cuenta
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="text-violet-400 hover:text-violet-300 font-medium transition-colors no-underline ml-1">
            Iniciar sesión
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
