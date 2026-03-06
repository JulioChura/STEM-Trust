<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authService } from "../services/authService";
import { authStore } from "../stores/authStore";

const route = useRoute();
const router = useRouter();

const busy = ref(false);
const message = ref("Listo para probar endpoints de autenticacion.");
const responseData = ref(null);

const registerForm = reactive({
  username: "",
  email: "",
  password1: "",
  password2: "",
});

const loginForm = reactive({
  email: "",
  password: "",
});

const changePasswordForm = reactive({
  old_password: "",
  new_password1: "",
  new_password2: "",
});

const resetRequestForm = reactive({
  email: "",
});

const resetConfirmForm = reactive({
  uid: "",
  token: "",
  new_password1: "",
  new_password2: "",
});

const googleForm = reactive({
  credential: "",
});

const hasSession = computed(() => Boolean(authStore.accessToken));

function goAfterLogin() {
  const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/dashboard";
  router.push(redirect);
}

async function runAction(action) {
  busy.value = true;
  message.value = "Procesando...";

  try {
    const data = await action();
    responseData.value = data;
    message.value = "Operacion exitosa.";
    return data;
  } catch (error) {
    responseData.value = error.data || null;
    message.value = error.message || "Ocurrio un error";
    throw error;
  } finally {
    busy.value = false;
  }
}

function onRegister() {
  runAction(async () => {
    const data = await authService.register({ ...registerForm });
    await authService.saveSessionFromAuthResponse(data);
    goAfterLogin();
    return data;
  });
}

function onLogin() {
  runAction(async () => {
    const data = await authService.login({ ...loginForm });
    await authService.saveSessionFromAuthResponse(data);
    goAfterLogin();
    return data;
  });
}

function onGoogleLogin() {
  runAction(async () => {
    const data = await authService.loginWithGoogle(googleForm.credential.trim());
    await authService.saveSessionFromAuthResponse(data);
    goAfterLogin();
    return data;
  });
}

async function handleCredentialResponse(response) {
  console.log("Token de Google recibido:", response.credential);
  runAction(async () => {
    const data = await authService.loginWithGoogle(response.credential);
    await authService.saveSessionFromAuthResponse(data);
    goAfterLogin();
    return data;
  });
}

function onLogout() {
  runAction(async () => {
    const data = await authService.logout();
    authService.clearSession();
    return data;
  });
}

function onMe() {
  runAction(() => authService.me());
}

function onChangePassword() {
  runAction(() => authService.changePassword({ ...changePasswordForm }));
}

function onResetRequest() {
  runAction(() => authService.resetPassword({ ...resetRequestForm }));
}

function onResetConfirm() {
  runAction(() => authService.confirmResetPassword({ ...resetConfirmForm }));
}

onMounted(() => {
  // Cargar Google Identity Services script
  if (!window.google) {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: "162579955895-228eu5kjl865lm9cv6q83chlr0pts6e2.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          auto_prompt: false,
        });
        // Renderizar botón de Google
        window.google.accounts.id.renderButton(
          document.getElementById("google-sign-in-button"),
          { theme: "outline", size: "large", type: "standard" }
        );
      }
    };
    document.head.appendChild(script);
  }
});
</script>

<template>
  <main class="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-8">
    <section class="mx-auto max-w-6xl">
      <header class="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <h1 class="text-2xl font-bold">STEM Trust Auth Base</h1>
        <p class="mt-1 text-sm text-slate-600">
          Estructura base para registro, login, cambio de contrasena y recuperacion.
        </p>
        <p class="mt-2 text-xs text-slate-500">
          Token activo:
          <span class="font-mono">{{ hasSession ? authStore.accessToken.slice(0, 30) + "..." : "sin sesion" }}</span>
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article class="rounded-2xl bg-white p-4 shadow-sm">
          <h2 class="mb-3 font-semibold">Registro</h2>
          <div class="space-y-2">
            <input v-model="registerForm.username" class="field" placeholder="username" />
            <input v-model="registerForm.email" class="field" placeholder="email" type="email" />
            <input v-model="registerForm.password1" class="field" placeholder="password" type="password" />
            <input v-model="registerForm.password2" class="field" placeholder="confirm password" type="password" />
            <button class="btn" :disabled="busy" @click="onRegister">Registrar</button>
          </div>
        </article>

        <article class="rounded-2xl bg-white p-4 shadow-sm">
          <h2 class="mb-3 font-semibold">Login</h2>
          <div class="space-y-2">
            <input v-model="loginForm.email" class="field" placeholder="email" type="email" />
            <input v-model="loginForm.password" class="field" placeholder="password" type="password" />
            <div class="flex gap-2">
              <button class="btn" :disabled="busy" @click="onLogin">Login</button>
              <button class="btn-secondary" :disabled="busy || !hasSession" @click="onLogout">Logout</button>
              <button class="btn-secondary" :disabled="busy || !hasSession" @click="onMe">/auth/user</button>
            </div>
          </div>
        </article>

        <article class="rounded-2xl bg-white p-4 shadow-sm">
          <h2 class="mb-3 font-semibold">Login Google</h2>
          <div class="space-y-2">
            <div id="google-sign-in-button" class="flex justify-center mb-3"></div>
            <p class="text-xs text-slate-500 text-center">O pega credential manualmente:</p>
            <textarea v-model="googleForm.credential" class="field min-h-20" placeholder="response.credential"></textarea>
            <button class="btn" :disabled="busy" @click="onGoogleLogin">Enviar credential</button>
          </div>
        </article>

        <article class="rounded-2xl bg-white p-4 shadow-sm">
          <h2 class="mb-3 font-semibold">Cambiar contrasena</h2>
          <div class="space-y-2">
            <input v-model="changePasswordForm.old_password" class="field" type="password" placeholder="old_password" />
            <input v-model="changePasswordForm.new_password1" class="field" type="password" placeholder="new_password1" />
            <input v-model="changePasswordForm.new_password2" class="field" type="password" placeholder="new_password2" />
            <button class="btn" :disabled="busy || !hasSession" @click="onChangePassword">Cambiar</button>
          </div>
        </article>

        <article class="rounded-2xl bg-white p-4 shadow-sm">
          <h2 class="mb-3 font-semibold">Reset password (solicitud)</h2>
          <div class="space-y-2">
            <input v-model="resetRequestForm.email" class="field" type="email" placeholder="email" />
            <button class="btn" :disabled="busy" @click="onResetRequest">Enviar correo</button>
          </div>
        </article>

        <article class="rounded-2xl bg-white p-4 shadow-sm">
          <h2 class="mb-3 font-semibold">Reset confirmacion</h2>
          <div class="space-y-2">
            <input v-model="resetConfirmForm.uid" class="field" placeholder="uid" />
            <input v-model="resetConfirmForm.token" class="field" placeholder="token" />
            <input v-model="resetConfirmForm.new_password1" class="field" type="password" placeholder="new_password1" />
            <input v-model="resetConfirmForm.new_password2" class="field" type="password" placeholder="new_password2" />
            <button class="btn" :disabled="busy" @click="onResetConfirm">Confirmar reset</button>
          </div>
        </article>
      </div>

      <section class="mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <p class="text-sm font-medium">Estado: {{ message }}</p>
        <pre class="mt-3 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">{{ responseData ? JSON.stringify(responseData, null, 2) : "Sin respuesta aun" }}</pre>
      </section>
    </section>
  </main>
</template>

<style scoped>
.field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(203 213 225);
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
}

.field:focus {
  outline: 2px solid rgb(16 185 129 / 0.3);
  outline-offset: 1px;
}

.btn {
  width: 100%;
  border-radius: 0.75rem;
  border: none;
  background: linear-gradient(90deg, rgb(15 118 110), rgb(5 150 105));
  color: white;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.btn-secondary {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(148 163 184);
  background: white;
  color: rgb(15 23 42);
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.btn:disabled,
.btn-secondary:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
