<script setup>
import { ref, computed, watch } from "vue";
import { X, Upload, CheckCircle, Zap, BookOpen, Link } from "lucide-vue-next";

const props = defineProps({
  show:         { type: Boolean, required: true },
  cursoInicial: { type: Object,  default: null  },
  plataformas:  { type: Array,   default: () => [] },
  categorias:   { type: Array,   default: () => [] },
  niveles:      { type: Array,   default: () => [] },
});

const emit = defineEmits(["close", "guardar"]);

// ── Step management ──────────────────────────────────────────────────────────
const paso = ref(1); // 1: info curso, 2: progreso, 3: éxito

// ── Form state ────────────────────────────────────────────────────────────────
const form = ref({
  nombre:         "",
  plataforma:     "",
  categoria:      "",
  nivel:          "",
  progreso:       0,
  horasTotal:     0,
  horasCompletadas: 0,
  tieneCertificado: false,
  certificadoNombre: "",
  nota:           "",
  url:            "",
});

const errorMsg = ref("");

// Pre-fill if editing an existing course
watch(() => props.cursoInicial, (curso) => {
  if (curso) {
    form.value = {
      nombre:           curso.nombre,
      plataforma:       curso.plataforma,
      categoria:        curso.categoria,
      nivel:            curso.nivel,
      progreso:         curso.progreso,
      horasTotal:       curso.horasTotal,
      horasCompletadas: curso.horasCompletadas,
      tieneCertificado: curso.certificado,
      certificadoNombre:"",
      nota:             "",
      url:              "",
    };
    paso.value = 1;
  }
}, { immediate: true });

watch(() => props.show, (v) => { if (!v) { paso.value = 1; errorMsg.value = ""; } });

// ── Computed ─────────────────────────────────────────────────────────────────
const scoringBoost = computed(() => {
  const cat = props.categorias.find((c) => c.nombre === form.value.categoria);
  if (!cat) return 0;
  const BASE_BOOST = { Programación: 9, Electrónica: 8, Matemáticas: 7, "Ciencia de Datos": 10, Robótica: 5, Física: 6 };
  const baseBoost = BASE_BOOST[cat.nombre] ?? 6;
  return form.value.progreso === 100 ? baseBoost : Math.round((form.value.progreso / 100) * baseBoost);
});

const esNuevoCurso = computed(() => !props.cursoInicial);

// ── Validation ───────────────────────────────────────────────────────────────
function validarPaso1() {
  if (!form.value.nombre.trim())    { errorMsg.value = "Ingresa el nombre del curso."; return false; }
  if (!form.value.plataforma)       { errorMsg.value = "Selecciona la plataforma.";   return false; }
  if (!form.value.categoria)        { errorMsg.value = "Selecciona la categoría.";    return false; }
  errorMsg.value = "";
  return true;
}

function avanzar() {
  if (paso.value === 1 && !validarPaso1()) return;
  paso.value++;
}

function guardar() {
  emit("guardar", { ...form.value, scoringBoost: scoringBoost.value });
  paso.value = 3;
}

function cerrar() {
  emit("close");
  setTimeout(() => { paso.value = 1; }, 300);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="cerrar" />

        <!-- Panel -->
        <div class="relative bg-[#0D1225] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <div>
              <h3 class="text-base font-black text-white">
                {{ esNuevoCurso ? "Vincular nuevo curso" : "Actualizar progreso" }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Paso {{ Math.min(paso, 2) }} de 2</p>
            </div>
            <button @click="cerrar" class="p-2 rounded-xl hover:bg-white/8 text-slate-400 transition-colors">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Step indicator -->
          <div v-if="paso < 3" class="flex gap-1 px-6 pt-4">
            <div
              v-for="n in 2"
              :key="n"
              :class="`h-1 rounded-full flex-1 transition-all duration-300 ${paso >= n ? 'bg-violet-500' : 'bg-white/10'}`"
            />
          </div>

          <!-- ── PASO 1: Información del curso ── -->
          <div v-if="paso === 1" class="px-6 py-5 space-y-4">
            <p class="text-xs text-slate-400 flex items-center gap-2">
              <BookOpen class="w-3.5 h-3.5 text-violet-400" />
              Información del curso
            </p>

            <!-- Nombre -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-400">Nombre del curso *</label>
              <input
                v-model="form.nombre"
                type="text"
                placeholder="Ej: Python para Ciencia de Datos"
                :disabled="!esNuevoCurso"
                class="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                  placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60
                  disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <!-- Plataforma + Categoría (2 cols) -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-400">Plataforma *</label>
                <select
                  v-model="form.plataforma"
                  :disabled="!esNuevoCurso"
                  class="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300
                    focus:outline-none focus:ring-2 focus:ring-violet-500/60
                    disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>Seleccionar</option>
                  <option v-for="p in plataformas" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-400">Categoría *</label>
                <select
                  v-model="form.categoria"
                  :disabled="!esNuevoCurso"
                  class="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300
                    focus:outline-none focus:ring-2 focus:ring-violet-500/60
                    disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>Seleccionar</option>
                  <option v-for="cat in categorias" :key="cat.nombre" :value="cat.nombre">
                    {{ cat.icono }} {{ cat.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Nivel + Horas totales -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-400">Nivel</label>
                <select
                  v-model="form.nivel"
                  class="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300
                    focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                >
                  <option value="" disabled>Seleccionar</option>
                  <option v-for="n in niveles" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-400">Horas totales</label>
                <input
                  v-model.number="form.horasTotal"
                  type="number" min="1" max="500"
                  placeholder="Ej: 24"
                  class="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                    placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                />
              </div>
            </div>

            <!-- URL (optional) -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Link class="w-3 h-3" /> URL del curso <span class="text-slate-600">(opcional)</span>
              </label>
              <input
                v-model="form.url"
                type="url"
                placeholder="https://coursera.org/..."
                class="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                  placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
              />
            </div>

            <!-- Error -->
            <p v-if="errorMsg" class="text-xs text-rose-400 font-semibold">{{ errorMsg }}</p>
          </div>

          <!-- ── PASO 2: Progreso y certificado ── -->
          <div v-else-if="paso === 2" class="px-6 py-5 space-y-5">
            <p class="text-xs text-slate-400 flex items-center gap-2">
              <Zap class="w-3.5 h-3.5 text-violet-400" />
              Progreso actual y evidencia
            </p>

            <!-- Progress slider -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-slate-400">Progreso del curso</label>
                <span class="text-lg font-black text-violet-300">{{ form.progreso }}%</span>
              </div>
              <input
                v-model.number="form.progreso"
                type="range" min="0" max="100" step="5"
                class="w-full accent-violet-500"
              />
              <div class="w-full h-2.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-400 transition-all"
                  :style="{ width: `${form.progreso}%` }"
                />
              </div>
            </div>

            <!-- Horas completadas -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-400">Horas completadas</label>
              <input
                v-model.number="form.horasCompletadas"
                type="number" min="0" :max="form.horasTotal || 9999"
                class="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                  focus:outline-none focus:ring-2 focus:ring-violet-500/60"
              />
            </div>

            <!-- Certificado -->
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <button
                  :class="`w-10 h-6 rounded-full transition-colors relative ${form.tieneCertificado ? 'bg-violet-600' : 'bg-white/15'}`"
                  @click="form.tieneCertificado = !form.tieneCertificado"
                >
                  <span
                    :class="`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.tieneCertificado ? 'left-5' : 'left-1'}`"
                  />
                </button>
                <label class="text-sm text-slate-300 font-medium cursor-pointer" @click="form.tieneCertificado = !form.tieneCertificado">
                  Tengo certificado de este curso
                </label>
              </div>

              <div v-if="form.tieneCertificado" class="border-2 border-dashed border-white/15 rounded-xl p-4
                flex flex-col items-center gap-2 cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all">
                <Upload class="w-6 h-6 text-slate-500" />
                <p class="text-xs text-slate-500 text-center">
                  Arrastra tu certificado aquí o <span class="text-violet-400 font-semibold">haz clic para seleccionar</span>
                </p>
                <p class="text-[10px] text-slate-600">PDF, PNG o JPG · máx. 5 MB</p>
              </div>
            </div>

            <!-- Nota -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-400">Nota personal <span class="text-slate-600">(opcional)</span></label>
              <textarea
                v-model="form.nota"
                rows="2"
                placeholder="¿Qué aprendiste? ¿Cómo lo usarás?"
                class="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                  placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 resize-none"
              />
            </div>

            <!-- Score boost preview -->
            <div class="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 flex items-center gap-3">
              <Zap class="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p class="text-sm font-black text-emerald-300">+{{ scoringBoost }} pts al score STEM</p>
                <p class="text-xs text-slate-500">
                  {{ form.progreso === 100 ? "Puntaje completo por curso finalizado 🎉" : `Puntaje parcial por ${form.progreso}% completado` }}
                </p>
              </div>
            </div>
          </div>

          <!-- ── PASO 3: Éxito ── -->
          <div v-else class="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div class="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle class="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h4 class="text-base font-black text-white">¡Progreso registrado!</h4>
              <p class="text-sm text-slate-400 mt-1">
                Tu score STEM se ha actualizado con
                <span class="text-emerald-400 font-bold">+{{ scoringBoost }} pts</span>
              </p>
            </div>
            <p class="text-xs text-slate-500 max-w-xs">
              Continúa aprendiendo para alcanzar el nivel "Excelente" y acceder a activos STEM de mayor valor.
            </p>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/8">
            <button
              v-if="paso < 3"
              class="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-semibold transition-colors"
              @click="paso > 1 ? paso-- : cerrar()"
            >
              {{ paso === 1 ? "Cancelar" : "Atrás" }}
            </button>
            <div v-else class="flex-1" />

            <button
              v-if="paso === 1 || paso === 2"
              class="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500
                text-white text-sm font-bold transition-all ml-auto"
              @click="paso === 1 ? avanzar() : guardar()"
            >
              {{ paso === 1 ? "Siguiente →" : "Guardar progreso" }}
            </button>
            <button
              v-else
              class="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500
                text-white text-sm font-bold transition-all ml-auto"
              @click="cerrar"
            >
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.96) translateY(8px); }
</style>
