<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Bell, Shield, User, Palette, Globe, LogOut, ChevronRight,
  Moon, Sun, Smartphone, Mail, Lock, Eye, EyeOff, Trash2,
  CheckCircle, AlertCircle, ToggleLeft, ToggleRight, Languages,
  BellOff, BellRing, CreditCard, Link, Sparkles, Save, RefreshCw,
} from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";
import { authStore } from "../stores/authStore";
import { authService } from "../services/authService";

const router = useRouter();

// ── Active section ─────────────────────────────────────────
const activeSection = ref("cuenta");

const sections = [
  { id: "cuenta",          label: "Cuenta",           icon: User,        desc: "Datos personales y email" },
  { id: "notificaciones",  label: "Notificaciones",   icon: Bell,        desc: "Alertas y recordatorios" },
  { id: "privacidad",      label: "Privacidad",        icon: Shield,      desc: "Seguridad y contraseña" },
  { id: "apariencia",      label: "Apariencia",       icon: Palette,     desc: "Tema y visualización" },
  { id: "idioma",          label: "Idioma y región",  icon: Globe,       desc: "Localización" },
  { id: "integraciones",   label: "Integraciones",    icon: Link,        desc: "Cuentas vinculadas" },
  { id: "pagos",           label: "Pagos y límites",  icon: CreditCard,  desc: "Métodos y montos" },
  { id: "cuenta-peligro",  label: "Zona peligrosa",   icon: Trash2,      desc: "Eliminar cuenta" },
];

// ── Cuenta ─────────────────────────────────────────────────
const user = computed(() => authStore.user);
const firstName = ref(user.value?.first_name || "");
const lastName  = ref(user.value?.last_name  || "");
const email     = ref(user.value?.email      || "");
const savedAccount = ref(false);
function saveAccount() {
  savedAccount.value = true;
  setTimeout(() => savedAccount.value = false, 2500);
}

// ── Notificaciones ─────────────────────────────────────────
const notifs = ref({
  aporteRecordatorio:  true,
  aportePendiente:     true,
  aportePagado:        true,
  nuevoMiembro:        false,
  mensajeGrupo:        true,
  invitacion:          true,
  progresoFondo:       true,
  scoreAlert:          false,
  emailResumen:        true,
  emailSemanal:        false,
  pushMovil:           true,
});

// ── Privacidad ─────────────────────────────────────────────
const showCurrentPwd   = ref(false);
const showNewPwd       = ref(false);
const showConfirmPwd   = ref(false);
const currentPwd       = ref("");
const newPwd           = ref("");
const confirmPwd       = ref("");
const pwdError         = ref("");
const pwdSuccess       = ref(false);

const pwdStrength = computed(() => {
  const p = newPwd.value;
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8)           s++;
  if (/[A-Z]/.test(p))         s++;
  if (/[0-9]/.test(p))         s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
});
const pwdStrengthLabel = computed(() => ["", "Débil", "Regular", "Buena", "Fuerte"][pwdStrength.value]);
const pwdStrengthColor = computed(() => ["", "bg-rose-500", "bg-amber-500", "bg-cyan-500", "bg-emerald-500"][pwdStrength.value]);

function changePassword() {
  pwdError.value = "";
  if (!currentPwd.value) { pwdError.value = "Ingresa tu contraseña actual."; return; }
  if (newPwd.value.length < 8) { pwdError.value = "La nueva contraseña debe tener al menos 8 caracteres."; return; }
  if (newPwd.value !== confirmPwd.value) { pwdError.value = "Las contraseñas no coinciden."; return; }
  pwdSuccess.value = true;
  currentPwd.value = ""; newPwd.value = ""; confirmPwd.value = "";
  setTimeout(() => pwdSuccess.value = false, 3000);
}

const privacy = ref({
  perfilPublico:      true,
  mostrarGrupos:      true,
  mostrarScore:       true,
  mostrarActividad:   false,
  sesionesActivas:    [
    { device: "Chrome · Windows",    location: "Lima, PE",   current: true,  date: "Ahora" },
    { device: "Safari · iPhone",     location: "Lima, PE",   current: false, date: "hace 2 días" },
    { device: "Firefox · MacBook",   location: "Arequipa, PE", current: false, date: "hace 5 días" },
  ],
});

// ── Apariencia ─────────────────────────────────────────────
const theme      = ref("dark");   // dark | light | auto
const accentColor = ref("violet"); // violet | cyan | emerald | amber
const compactMode = ref(false);
const animations  = ref(true);

const themes = [
  { id: "dark",  label: "Oscuro",    icon: Moon  },
  { id: "light", label: "Claro",     icon: Sun   },
  { id: "auto",  label: "Automático",icon: Smartphone },
];
const accents = [
  { id: "violet",  label: "Violeta",  cls: "bg-violet-500"  },
  { id: "cyan",    label: "Cyan",     cls: "bg-cyan-500"    },
  { id: "emerald", label: "Esmeralda",cls: "bg-emerald-500" },
  { id: "amber",   label: "Ámbar",    cls: "bg-amber-500"   },
  { id: "rose",    label: "Rosa",     cls: "bg-rose-500"    },
];

// ── Idioma ─────────────────────────────────────────────────
const idioma  = ref("es");
const moneda  = ref("PEN");
const zona    = ref("America/Lima");
const idiomas = [
  { id: "es", label: "Español" },
  { id: "en", label: "English" },
  { id: "pt", label: "Português" },
];
const monedas = [
  { id: "PEN", label: "Sol peruano (S/)" },
  { id: "COP", label: "Peso colombiano ($)" },
  { id: "MXN", label: "Peso mexicano ($)" },
  { id: "USD", label: "Dólar estadounidense ($)" },
];

// ── Integraciones ──────────────────────────────────────────
const integrations = ref([
  { id: "google",   label: "Google",   icon: "G", connected: true,  email: user.value?.email, color: "from-red-500 to-orange-500" },
  { id: "yape",     label: "Yape",     icon: "Y", connected: false, email: null,              color: "from-violet-500 to-purple-500" },
  { id: "plin",     label: "Plin",     icon: "P", connected: false, email: null,              color: "from-cyan-500 to-teal-500" },
  { id: "bcp",      label: "BCP",      icon: "B", connected: false, email: null,              color: "from-blue-500 to-indigo-500" },
]);

function toggleIntegration(id) {
  const i = integrations.value.find(x => x.id === id);
  if (i) i.connected = !i.connected;
}

// ── Pagos/límites ──────────────────────────────────────────
const limiteAporte    = ref(500);
const autoRecordatorio = ref(true);
const diasAnticipacion = ref(3);

// ── Zona peligrosa ─────────────────────────────────────────
const showDeleteConfirm = ref(false);
const deleteConfirmText = ref("");
const canDelete = computed(() => deleteConfirmText.value === "ELIMINAR");

async function logout() {
  try { await authService.logout(); } catch (_) {}
  authService.clearSession();
  router.push("/");
}

// ── Toggle helper component ────────────────────────────────
function toggle(obj, key) { obj[key] = !obj[key]; }
</script>

<template>
  <AppLayout title="Configuración" subtitle="Gestiona tu cuenta y preferencias">
    <div class="max-w-5xl mx-auto pb-16">
      <div class="flex gap-6 items-start">

        <!-- ── Sidebar de secciones ── -->
        <aside class="w-56 shrink-0 sticky top-24">
          <nav class="space-y-1">
            <button
              v-for="s in sections"
              :key="s.id"
              @click="activeSection = s.id"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group',
                activeSection === s.id
                  ? 'bg-violet-500/15 border border-violet-500/30 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent',
                s.id === 'cuenta-peligro' ? '!text-rose-400 hover:!text-rose-300 hover:!bg-rose-500/8' : '',
              ]"
            >
              <component
                :is="s.icon"
                :class="['w-4 h-4 shrink-0', activeSection === s.id ? 'text-violet-400' : 'text-slate-600 group-hover:text-slate-400', s.id === 'cuenta-peligro' ? '!text-rose-400' : '']"
              />
              <span class="text-sm font-medium truncate">{{ s.label }}</span>
            </button>
          </nav>

          <!-- Cerrar sesión -->
          <div class="mt-4 pt-4 border-t border-white/8">
            <button
              @click="logout"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/8 border border-transparent transition-all"
            >
              <LogOut class="w-4 h-4 shrink-0" />
              <span class="text-sm font-medium">Cerrar sesión</span>
            </button>
          </div>
        </aside>

        <!-- ── Panel principal ── -->
        <div class="flex-1 min-w-0 space-y-6">

          <!-- ══════════════════════════════ CUENTA -->
          <div v-if="activeSection === 'cuenta'" class="space-y-5">
            <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
              <h2 class="text-base font-bold text-white mb-1">Información personal</h2>
              <p class="text-xs text-slate-500 mb-6">Así te verán otros miembros de la plataforma</p>

              <!-- Avatar row -->
              <div class="flex items-center gap-5 mb-7">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xl font-extrabold text-white shadow-lg shadow-violet-500/20 shrink-0">
                  {{ (firstName[0] || email[0] || "U").toUpperCase() }}{{ (lastName[0] || "").toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-white mb-1">{{ firstName || email || "Usuaria" }}</p>
                  <p class="text-xs text-slate-500">El avatar se generara automaticamente con tus iniciales</p>
                </div>
              </div>

              <div class="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="text-xs font-semibold text-slate-400 mb-2 block">Nombre</label>
                  <input
                    v-model="firstName"
                    type="text"
                    placeholder="Tu nombre"
                    class="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label class="text-xs font-semibold text-slate-400 mb-2 block">Apellido</label>
                  <input
                    v-model="lastName"
                    type="text"
                    placeholder="Tu apellido"
                    class="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div class="mb-6">
                <label class="text-xs font-semibold text-slate-400 mb-2 block">Correo electrónico</label>
                <div class="relative">
                  <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    v-model="email"
                    type="email"
                    class="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
                <p class="text-xs text-slate-600 mt-1.5">Cambiar el email requiere reverificación</p>
              </div>

              <div class="flex items-center gap-3">
                <button
                  @click="saveAccount"
                  class="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                >
                  <Save class="w-4 h-4" /> Guardar cambios
                </button>
                <Transition enter-active-class="transition-opacity duration-300" leave-active-class="transition-opacity duration-300" enter-from-class="opacity-0" leave-to-class="opacity-0">
                  <span v-if="savedAccount" class="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle class="w-3.5 h-3.5" /> Guardado
                  </span>
                </Transition>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════ NOTIFICACIONES -->
          <div v-if="activeSection === 'notificaciones'" class="space-y-5">
            <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
              <h2 class="text-base font-bold text-white mb-1">Notificaciones</h2>
              <p class="text-xs text-slate-500 mb-6">Controla qué alertas recibes y cómo</p>

              <div class="space-y-1 mb-7">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Aportes y pagos</p>
                <SettingsToggle label="Recordatorio de aporte próximo"   desc="3 días antes de la fecha límite"         v-model="notifs.aporteRecordatorio" />
                <SettingsToggle label="Aporte pendiente"                 desc="El día que vence tu pago"                v-model="notifs.aportePendiente" />
                <SettingsToggle label="Aporte confirmado"                desc="Cuando tu comprobante es validado"       v-model="notifs.aportePagado" />
              </div>

              <div class="space-y-1 mb-7">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Grupos</p>
                <SettingsToggle label="Nuevo miembro en mi grupo"        desc="Cuando alguien se une a uno de tus grupos" v-model="notifs.nuevoMiembro" />
                <SettingsToggle label="Mensajes del grupo"               desc="Actividad y actualizaciones del grupo"   v-model="notifs.mensajeGrupo" />
                <SettingsToggle label="Invitaciones a grupos"            desc="Cuando alguien te invite a unirte"       v-model="notifs.invitacion" />
                <SettingsToggle label="Progreso del fondo"               desc="Hitos del fondo (25%, 50%, 75%, 100%)"  v-model="notifs.progresoFondo" />
              </div>

              <div class="space-y-1 mb-7">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Score y reputación</p>
                <SettingsToggle label="Cambios en mi score"              desc="Cuando tu score suba o baje"             v-model="notifs.scoreAlert" />
              </div>

              <div class="space-y-1">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Canales</p>
                <SettingsToggle label="Resumen por email"                desc="Digest mensual de tu actividad"          v-model="notifs.emailResumen" />
                <SettingsToggle label="Newsletter semanal STEM-Trust"    desc="Noticias y tips del ecosistema"          v-model="notifs.emailSemanal" />
                <SettingsToggle label="Notificaciones push (móvil)"      desc="Alertas en tiempo real en tu celular"    v-model="notifs.pushMovil" />
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════ PRIVACIDAD -->
          <div v-if="activeSection === 'privacidad'" class="space-y-5">

            <!-- Contraseña -->
            <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
              <h2 class="text-base font-bold text-white mb-1">Cambiar contraseña</h2>
              <p class="text-xs text-slate-500 mb-6">Usa una contraseña segura que no uses en otros sitios</p>

              <div class="space-y-4 max-w-md">
                <PasswordField label="Contraseña actual"   v-model="currentPwd" :show="showCurrentPwd" @toggle="showCurrentPwd = !showCurrentPwd" />
                <div>
                  <PasswordField label="Nueva contraseña"  v-model="newPwd"     :show="showNewPwd"     @toggle="showNewPwd = !showNewPwd" />
                  <div v-if="newPwd" class="mt-2 flex items-center gap-2">
                    <div class="flex gap-1 flex-1">
                      <div v-for="i in 4" :key="i" :class="['h-1.5 flex-1 rounded-full transition-all', i <= pwdStrength ? pwdStrengthColor : 'bg-white/10']"></div>
                    </div>
                    <span :class="['text-xs', pwdStrength >= 3 ? 'text-emerald-400' : pwdStrength >= 2 ? 'text-amber-400' : 'text-rose-400']">{{ pwdStrengthLabel }}</span>
                  </div>
                </div>
                <PasswordField label="Confirmar contraseña" v-model="confirmPwd" :show="showConfirmPwd" @toggle="showConfirmPwd = !showConfirmPwd" />

                <p v-if="pwdError" class="text-xs text-rose-400 flex items-center gap-1.5"><AlertCircle class="w-3.5 h-3.5" />{{ pwdError }}</p>
                <p v-if="pwdSuccess" class="text-xs text-emerald-400 flex items-center gap-1.5"><CheckCircle class="w-3.5 h-3.5" /> Contraseña actualizada correctamente</p>

                <button
                  @click="changePassword"
                  class="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                >
                  <Lock class="w-4 h-4" /> Actualizar contraseña
                </button>
              </div>
            </div>

            <!-- Visibilidad del perfil -->
            <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
              <h2 class="text-base font-bold text-white mb-1">Visibilidad del perfil</h2>
              <p class="text-xs text-slate-500 mb-5">Controla qué información es visible para otros usuarios</p>
              <div class="space-y-1">
                <SettingsToggle label="Perfil público"           desc="Otros usuarios pueden ver tu perfil"        v-model="privacy.perfilPublico" />
                <SettingsToggle label="Mostrar grupos activos"   desc="Visible en tu perfil público"               v-model="privacy.mostrarGrupos" />
                <SettingsToggle label="Mostrar score de confianza" desc="Tu reputación visible para organizadoras" v-model="privacy.mostrarScore" />
                <SettingsToggle label="Mostrar actividad reciente" desc="Timeline de pagos y grupos"               v-model="privacy.mostrarActividad" />
              </div>
            </div>

            <!-- Sesiones activas -->
            <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
              <h2 class="text-base font-bold text-white mb-1">Sesiones activas</h2>
              <p class="text-xs text-slate-500 mb-5">Dispositivos donde tienes sesión abierta</p>
              <div class="space-y-3">
                <div v-for="s in privacy.sesionesActivas" :key="s.device" class="flex items-center gap-4 bg-white/4 border border-white/8 rounded-xl p-4">
                  <Smartphone class="w-5 h-5 text-slate-500 shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-white">{{ s.device }}</p>
                    <p class="text-xs text-slate-500">{{ s.location }} · {{ s.date }}</p>
                  </div>
                  <span v-if="s.current" class="text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-full">Actual</span>
                  <button v-else class="text-xs text-rose-400 hover:text-rose-300 transition-colors">Cerrar</button>
                </div>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════ APARIENCIA -->
          <div v-if="activeSection === 'apariencia'" class="space-y-5">
            <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
              <h2 class="text-base font-bold text-white mb-1">Tema de la interfaz</h2>
              <p class="text-xs text-slate-500 mb-6">Elige cómo se ve STEM-Trust en tu pantalla</p>

              <div class="grid grid-cols-3 gap-3 mb-8">
                <button
                  v-for="t in themes"
                  :key="t.id"
                  @click="theme = t.id"
                  :class="[
                    'flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all',
                    theme === t.id ? 'border-violet-500 bg-violet-500/15' : 'border-white/10 bg-white/4 hover:border-white/20',
                  ]"
                >
                  <component :is="t.icon" :class="['w-6 h-6', theme === t.id ? 'text-violet-400' : 'text-slate-500']" />
                  <span :class="['text-sm font-semibold', theme === t.id ? 'text-white' : 'text-slate-400']">{{ t.label }}</span>
                </button>
              </div>

              <h3 class="text-sm font-bold text-white mb-4">Color de acento</h3>
              <div class="flex flex-wrap gap-3 mb-8">
                <button
                  v-for="a in accents"
                  :key="a.id"
                  @click="accentColor = a.id"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all"
                  :class="accentColor === a.id ? 'border-white/40 bg-white/8' : 'border-white/8 hover:border-white/20'"
                >
                  <span :class="[`w-3.5 h-3.5 rounded-full`, a.cls]"></span>
                  <span class="text-sm text-slate-300">{{ a.label }}</span>
                </button>
              </div>

              <div class="space-y-1">
                <SettingsToggle label="Modo compacto"   desc="Reduce el espaciado para ver más contenido"   v-model="compactMode" />
                <SettingsToggle label="Animaciones"     desc="Transiciones y efectos de movimiento"          v-model="animations" />
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════ IDIOMA -->
          <div v-if="activeSection === 'idioma'" class="space-y-5">
            <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
              <h2 class="text-base font-bold text-white mb-1">Idioma y región</h2>
              <p class="text-xs text-slate-500 mb-6">Personaliza el idioma y la moneda de la plataforma</p>

              <div class="space-y-5 max-w-sm">
                <div>
                  <label class="text-xs font-semibold text-slate-400 mb-2 block">Idioma de la interfaz</label>
                  <select v-model="idioma" class="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none">
                    <option v-for="i in idiomas" :key="i.id" :value="i.id" class="bg-[#0D1225]">{{ i.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-semibold text-slate-400 mb-2 block">Moneda principal</label>
                  <select v-model="moneda" class="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none">
                    <option v-for="m in monedas" :key="m.id" :value="m.id" class="bg-[#0D1225]">{{ m.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-semibold text-slate-400 mb-2 block">Zona horaria</label>
                  <select v-model="zona" class="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none">
                    <option value="America/Lima"        class="bg-[#0D1225]">América/Lima (GMT-5)</option>
                    <option value="America/Bogota"      class="bg-[#0D1225]">América/Bogotá (GMT-5)</option>
                    <option value="America/Mexico_City" class="bg-[#0D1225]">América/Ciudad de México (GMT-6)</option>
                    <option value="America/Santiago"    class="bg-[#0D1225]">América/Santiago (GMT-3)</option>
                    <option value="America/Buenos_Aires"class="bg-[#0D1225]">América/Buenos Aires (GMT-3)</option>
                  </select>
                </div>

                <button class="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
                  <Save class="w-4 h-4" /> Guardar preferencias
                </button>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════ INTEGRACIONES -->
          <div v-if="activeSection === 'integraciones'" class="space-y-5">
            <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
              <h2 class="text-base font-bold text-white mb-1">Cuentas vinculadas</h2>
              <p class="text-xs text-slate-500 mb-6">Conecta tus métodos de pago y servicios externos</p>

              <div class="space-y-3">
                <div
                  v-for="intg in integrations"
                  :key="intg.id"
                  class="flex items-center gap-4 bg-white/4 border border-white/8 rounded-2xl p-5"
                >
                  <div :class="`w-11 h-11 rounded-xl bg-gradient-to-br ${intg.color} flex items-center justify-center text-lg font-extrabold text-white shrink-0`">
                    {{ intg.icon }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-white">{{ intg.label }}</p>
                    <p class="text-xs text-slate-500 truncate">{{ intg.connected ? intg.email || "Conectado" : "No vinculado" }}</p>
                  </div>
                  <button
                    @click="toggleIntegration(intg.id)"
                    :class="[
                      'text-xs font-semibold px-4 py-2 rounded-xl border transition-all',
                      intg.connected
                        ? 'text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15'
                        : 'text-violet-300 border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/15'
                    ]"
                  >
                    {{ intg.connected ? "Desvincular" : "Vincular" }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════ PAGOS Y LÍMITES -->
          <div v-if="activeSection === 'pagos'" class="space-y-5">
            <div class="bg-[#0D1225] border border-white/8 rounded-3xl p-7">
              <h2 class="text-base font-bold text-white mb-1">Pagos y límites</h2>
              <p class="text-xs text-slate-500 mb-6">Configura tus preferencias de aporte</p>

              <div class="space-y-6 max-w-sm">
                <div>
                  <label class="text-xs font-semibold text-slate-400 mb-2 block">
                    Límite de aporte mensual máximo
                    <span class="text-white font-bold ml-2">S/ {{ limiteAporte }}</span>
                  </label>
                  <input
                    type="range" v-model="limiteAporte"
                    min="100" max="2000" step="50"
                    class="w-full accent-violet-500"
                  />
                  <div class="flex justify-between text-xs text-slate-600 mt-1">
                    <span>S/ 100</span><span>S/ 2,000</span>
                  </div>
                </div>

                <div class="h-px bg-white/8"></div>

                <SettingsToggle
                  label="Recordatorio automático de aportes"
                  desc="Recibe alertas antes de la fecha límite"
                  v-model="autoRecordatorio"
                />

                <div v-if="autoRecordatorio">
                  <label class="text-xs font-semibold text-slate-400 mb-2 block">
                    Días de anticipación: <span class="text-white">{{ diasAnticipacion }}</span>
                  </label>
                  <input type="range" v-model="diasAnticipacion" min="1" max="7" step="1" class="w-full accent-violet-500" />
                  <div class="flex justify-between text-xs text-slate-600 mt-1">
                    <span>1 día</span><span>7 días</span>
                  </div>
                </div>

                <div class="bg-violet-500/8 border border-violet-500/20 rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
                  <Sparkles class="w-3.5 h-3.5 text-violet-400 inline mr-1.5" />
                  Los pagos en STEM-Trust siempre se dirigen directamente al proveedor del activo — nunca a personas individuales.
                </div>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════ ZONA PELIGROSA -->
          <div v-if="activeSection === 'cuenta-peligro'" class="space-y-5">
            <div class="bg-[#0D1225] border border-rose-500/20 rounded-3xl p-7">
              <h2 class="text-base font-bold text-rose-400 mb-1 flex items-center gap-2">
                <AlertCircle class="w-5 h-5" /> Zona peligrosa
              </h2>
              <p class="text-xs text-slate-500 mb-6">Acciones irreversibles — procede con cuidado</p>

              <div class="space-y-4">
                <!-- Export data -->
                <div class="flex items-center justify-between bg-white/4 border border-white/8 rounded-2xl p-5">
                  <div>
                    <p class="text-sm font-semibold text-white">Exportar mis datos</p>
                    <p class="text-xs text-slate-500 mt-0.5">Descarga toda tu información en formato JSON</p>
                  </div>
                  <button class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/15 px-4 py-2.5 rounded-xl transition-all">
                    <RefreshCw class="w-4 h-4" /> Exportar
                  </button>
                </div>

                <!-- Freeze account -->
                <div class="flex items-center justify-between bg-white/4 border border-white/8 rounded-2xl p-5">
                  <div>
                    <p class="text-sm font-semibold text-white">Pausar cuenta</p>
                    <p class="text-xs text-slate-500 mt-0.5">Suspende temporalmente tu participación en grupos</p>
                  </div>
                  <button class="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 px-4 py-2.5 rounded-xl transition-all">
                    <AlertCircle class="w-4 h-4" /> Pausar
                  </button>
                </div>

                <!-- Delete account -->
                <div class="bg-rose-500/8 border border-rose-500/25 rounded-2xl p-5">
                  <p class="text-sm font-semibold text-rose-400 mb-1">Eliminar cuenta permanentemente</p>
                  <p class="text-xs text-slate-500 mb-4 leading-relaxed">
                    Esta acción es irreversible. Se eliminarán tu historial de pagos, score, grupos y todos tus datos. Si tienes aportes pendientes debes resolverlos primero.
                  </p>

                  <button
                    v-if="!showDeleteConfirm"
                    @click="showDeleteConfirm = true"
                    class="text-sm text-rose-400 hover:text-rose-300 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15 px-5 py-2.5 rounded-xl transition-all flex items-center gap-2"
                  >
                    <Trash2 class="w-4 h-4" /> Quiero eliminar mi cuenta
                  </button>

                  <div v-else class="space-y-3">
                    <p class="text-xs text-rose-300">Escribe <strong>ELIMINAR</strong> para confirmar:</p>
                    <input
                      v-model="deleteConfirmText"
                      type="text"
                      placeholder="ELIMINAR"
                      class="w-full max-w-xs bg-white/5 border border-rose-500/30 focus:border-rose-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none"
                    />
                    <div class="flex gap-3">
                      <button
                        :disabled="!canDelete"
                        class="text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        :class="canDelete ? 'bg-rose-600 hover:bg-rose-500' : 'bg-rose-600/40'"
                      >
                        <Trash2 class="w-4 h-4" /> Eliminar definitivamente
                      </button>
                      <button
                        @click="showDeleteConfirm = false; deleteConfirmText = ''"
                        class="text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-xl transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </AppLayout>
</template>

<!-- ── Inline sub-components ────────────────────────────── -->
<script>
import { h, defineComponent } from "vue";
import { ToggleLeft, ToggleRight, Eye, EyeOff } from "lucide-vue-next";

// Toggle row
const SettingsToggle = defineComponent({
  name: "SettingsToggle",
  props: { label: String, desc: String, modelValue: Boolean },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => h("div", { class: "flex items-center justify-between py-3 border-b border-white/5 last:border-0" }, [
      h("div", {}, [
        h("p", { class: "text-sm font-medium text-white" }, props.label),
        props.desc && h("p", { class: "text-xs text-slate-500 mt-0.5" }, props.desc),
      ]),
      h("button", {
        onClick: () => emit("update:modelValue", !props.modelValue),
        class: "shrink-0 ml-4",
      }, [
        props.modelValue
          ? h(ToggleRight, { class: "w-9 h-9 text-violet-400" })
          : h(ToggleLeft,  { class: "w-9 h-9 text-slate-600" }),
      ]),
    ]);
  },
});

// Password field
const PasswordField = defineComponent({
  name: "PasswordField",
  props: { label: String, modelValue: String, show: Boolean },
  emits: ["update:modelValue", "toggle"],
  setup(props, { emit }) {
    return () => h("div", {}, [
      h("label", { class: "text-xs font-semibold text-slate-400 mb-2 block" }, props.label),
      h("div", { class: "relative" }, [
        h("input", {
          type: props.show ? "text" : "password",
          value: props.modelValue,
          onInput: (e) => emit("update:modelValue", e.target.value),
          placeholder: "••••••••",
          class: "w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-4 pr-11 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors",
        }),
        h("button", {
          type: "button",
          onClick: () => emit("toggle"),
          class: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors",
        }, [props.show ? h(EyeOff, { class: "w-4 h-4" }) : h(Eye, { class: "w-4 h-4" })]),
      ]),
    ]);
  },
});

export default { components: { SettingsToggle, PasswordField } };
</script>
