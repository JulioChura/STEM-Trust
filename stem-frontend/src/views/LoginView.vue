<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Zap, AlertCircle } from "lucide-vue-next";
import { authService } from "../services/authService";

const router = useRouter();
const route = useRoute();

const busy = ref(false);
const showPassword = ref(false);
const errorMessage = ref("");

const form = reactive({ email: "", password: "" });

function goAfterLogin() {
  const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/dashboard";
  router.push(redirect);
}

async function onLogin() {
  if (!form.email || !form.password) {
    errorMessage.value = "Completa todos los campos.";
    return;
  }
  busy.value = true;
  errorMessage.value = "";
  try {
    const data = await authService.login({ ...form });
    await authService.saveSessionFromAuthResponse(data);
    goAfterLogin();
  } catch (err) {
    errorMessage.value = err?.data?.non_field_errors?.[0] || err?.data?.detail || err?.message || "Credenciales incorrectas.";
  } finally {
    busy.value = false;
  }
}

// Google OAuth
function handleGoogleResponse(response) {
  busy.value = true;
  errorMessage.value = "";
  authService.loginWithGoogle(response.credential)
    .then(async (data) => {
      await authService.saveSessionFromAuthResponse(data);
      goAfterLogin();
    })
    .catch((err) => {
      errorMessage.value = err?.data?.detail || "Error con Google. Intenta de nuevo.";
    })
    .finally(() => { busy.value = false; });
}

import { onMounted } from "vue";
onMounted(() => {
  if (!window.google) {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "162579955895-228eu5kjl865lm9cv6q83chlr0pts6e2.apps.googleusercontent.com",
          callback: handleGoogleResponse,
          auto_prompt: false,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-btn-login"),
          { theme: "filled_black", size: "large", shape: "pill", width: 320 }
        );
      }
    };
    document.head.appendChild(script);
  } else {
    window.google.accounts.id.renderButton(
      document.getElementById("google-btn-login"),
      { theme: "filled_black", size: "large", shape: "pill", width: 320 }
    );
  }
});
</script>

<template>
  <div class="min-h-screen bg-[#070B18] flex">

    <!-- ── LEFT PANEL (branding) ── -->
    <div class="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-violet-900/80 via-indigo-900/60 to-[#070B18]"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      <div class="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-[80px]"></div>
      <div class="absolute bottom-1/3 right-1/4 w-60 h-60 bg-cyan-500/15 rounded-full blur-[60px]"></div>

      <!-- Logo -->
      <div class="relative z-10 flex items-center gap-2">
        <router-link to="/" class="flex items-center gap-2 no-underline">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/40">
            <Sparkles class="w-5 h-5 text-white" />
          </div>
          <span class="font-bold text-lg text-white tracking-tight">STEM<span class="text-violet-300">-Trust</span></span>
        </router-link>
      </div>

      <!-- Center content -->
      <div class="relative z-10 space-y-6">
        <div class="text-5xl font-extrabold text-white leading-tight">
          Tu comunidad<br />
          es tu <span class="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">garantía</span>
        </div>
        <p class="text-slate-400 text-base leading-relaxed max-w-sm">
          STEM-Trust convierte el ahorro grupal en acceso real a tecnología educativa. Sin historial crediticio, sin barreras.
        </p>
        <div class="flex flex-col gap-3 mt-6">
          <div class="flex items-center gap-3 text-sm text-slate-300">
            <div class="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Zap class="w-4 h-4 text-violet-400" />
            </div>
            Validación OCR en tiempo real
          </div>
          <div class="flex items-center gap-3 text-sm text-slate-300">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Sparkles class="w-4 h-4 text-cyan-400" />
            </div>
            Scoring de comportamiento con IA
          </div>
          <div class="flex items-center gap-3 text-sm text-slate-300">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Lock class="w-4 h-4 text-emerald-400" />
            </div>
            Pago directo en bucle cerrado
          </div>
        </div>
      </div>

      <!-- Bottom quote -->
      <div class="relative z-10 border-l-2 border-violet-500/40 pl-4">
        <p class="text-sm text-slate-400 italic">"La tecnología que necesitas para crecer no debe estar fuera de tu alcance."</p>
        <p class="text-xs text-violet-400 mt-1">— STEM-Trust · WIE IEEE 2026</p>
      </div>
    </div>

    <!-- ── RIGHT PANEL (form) ── -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
      <!-- Mobile logo -->
      <div class="lg:hidden mb-10 flex items-center gap-2">
        <router-link to="/" class="flex items-center gap-2 no-underline">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles class="w-4 h-4 text-white" />
          </div>
          <span class="font-bold text-lg text-white tracking-tight">STEM<span class="text-violet-400">-Trust</span></span>
        </router-link>
      </div>

      <div class="w-full max-w-md">
        <div class="mb-8">
          <h1 class="text-3xl font-extrabold text-white mb-2">Bienvenida de vuelta</h1>
          <p class="text-slate-400 text-sm">Inicia sesión para acceder a tu cuenta</p>
        </div>

        <!-- Google button -->
        <div id="google-btn-login" class="mb-5 flex justify-start"></div>

        <!-- Divider -->
        <div class="flex items-center gap-3 mb-5">
          <div class="flex-1 h-px bg-white/10"></div>
          <span class="text-xs text-slate-500">o continúa con correo</span>
          <div class="flex-1 h-px bg-white/10"></div>
        </div>

        <!-- Error -->
        <div v-if="errorMessage" class="mb-4 flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm px-4 py-3 rounded-xl">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form @submit.prevent="onLogin" class="space-y-4">
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

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-400">Contraseña</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                class="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-600 rounded-xl px-4 py-3 pl-10 pr-10 text-sm outline-none transition-all"
              />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <div class="flex justify-end">
              <router-link to="/forgot-password" class="text-xs text-violet-400 hover:text-violet-300 transition-colors no-underline">
                ¿Olvidaste tu contraseña?
              </router-link>
            </div>
          </div>

          <button
            type="submit"
            :disabled="busy"
            class="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
          >
            <span v-if="busy">Iniciando sesión...</span>
            <span v-else class="flex items-center gap-2">
              Iniciar sesión
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-500">
          ¿No tienes cuenta?
          <router-link to="/register" class="text-violet-400 hover:text-violet-300 font-medium transition-colors no-underline ml-1">
            Registrarse gratis
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
