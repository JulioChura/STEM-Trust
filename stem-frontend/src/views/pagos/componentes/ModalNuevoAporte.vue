<script setup>
import { ref, computed, watch } from "vue";
import {
  X, ChevronRight, ChevronLeft, Upload, CheckCircle,
  AlertCircle, ShieldCheck, Sparkles, BookOpen
} from "lucide-vue-next";

// ── Props & emits ─────────────────────────────────────────────────────────────
const props = defineProps({
  grupos: { type: Array, required: true },
});

const emit = defineEmits(["confirmar", "cerrar"]);

// ── Pasos del formulario ──────────────────────────────────────────────────────
const PASO_FORMULARIO   = 1;
const PASO_COMPROBANTE  = 2;
const PASO_EXITO        = 3;

const pasoActual = ref(PASO_FORMULARIO);

// ── Estado del formulario ─────────────────────────────────────────────────────
const METODOS_PAGO = ["Transferencia bancaria", "Yape", "Plin"];

const form = ref({
  grupoId: "",
  monto:   "",
  metodo:  "",
  nota:    "",
});

const errores = ref({
  grupoId: "",
  monto:   "",
  metodo:  "",
});

// ── Estado de comprobante ─────────────────────────────────────────────────────
const archivoSeleccionado = ref(null);   // { name, size, type }
const archivoRawFile      = ref(null);   // File object real
const arrastrando         = ref(false);
const simulandoOcr        = ref(false);
const ocrCompletado       = ref(false);

// Grupo seleccionado enriquecido
const grupoSeleccionado = computed(() =>
  props.grupos.find((g) => g.id === form.value.grupoId) ?? null
);

// ── Validación ────────────────────────────────────────────────────────────────
function validarFormulario() {
  const e = { grupoId: "", monto: "", metodo: "" };
  let valido = true;

  if (!form.value.grupoId) {
    e.grupoId = "Selecciona un grupo.";
    valido = false;
  }

  const montoNum = parseFloat(form.value.monto);
  if (!form.value.monto || isNaN(montoNum) || montoNum <= 0) {
    e.monto = "Ingresa un monto válido mayor a S/ 0.";
    valido = false;
  } else if (montoNum > 99_999) {
    e.monto = "El monto no puede superar S/ 99,999.";
    valido = false;
  }

  if (!form.value.metodo) {
    e.metodo = "Selecciona un método de pago.";
    valido = false;
  }

  errores.value = e;
  return valido;
}

// Limpiar error individual al editar
watch(
  () => form.value.grupoId,
  () => { errores.value.grupoId = ""; }
);
watch(
  () => form.value.monto,
  () => { errores.value.monto = ""; }
);
watch(
  () => form.value.metodo,
  () => { errores.value.metodo = ""; }
);

// ── Navegación entre pasos ────────────────────────────────────────────────────
function avanzarAComprobante() {
  if (validarFormulario()) {
    pasoActual.value = PASO_COMPROBANTE;
  }
}

function volverAFormulario() {
  pasoActual.value = PASO_FORMULARIO;
}

// ── Manejo de archivo ─────────────────────────────────────────────────────────
const TIPOS_ACEPTADOS  = ["image/jpeg", "image/png", "application/pdf"];
const TAMANO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const errorArchivo     = ref("");

function procesarArchivo(file) {
  errorArchivo.value = "";

  if (!TIPOS_ACEPTADOS.includes(file.type)) {
    errorArchivo.value = "Formato no permitido. Usa JPG, PNG o PDF.";
    return;
  }
  if (file.size > TAMANO_MAX_BYTES) {
    errorArchivo.value = "El archivo supera el límite de 5 MB.";
    return;
  }

  archivoRawFile.value = file;
  archivoSeleccionado.value = {
    nombre: file.name,
    tamano: (file.size / 1024).toFixed(1) + " KB",
    tipo:   file.type,
  };
  ocrCompletado.value = false;
}

function onFileInputChange(event) {
  const file = event.target.files?.[0];
  if (file) procesarArchivo(file);
}

function onDragOver(event) {
  event.preventDefault();
  arrastrando.value = true;
}

function onDragLeave() {
  arrastrando.value = false;
}

function onDrop(event) {
  event.preventDefault();
  arrastrando.value = false;
  const file = event.dataTransfer.files?.[0];
  if (file) procesarArchivo(file);
}

function quitarArchivo() {
  archivoSeleccionado.value = null;
  archivoRawFile.value = null;
  ocrCompletado.value = false;
  errorArchivo.value = "";
}

// ── Simulación de OCR ─────────────────────────────────────────────────────────
function simularOcr() {
  simulandoOcr.value = true;
  setTimeout(() => {
    simulandoOcr.value = false;
    ocrCompletado.value = true;
  }, 2000);
}

// ── Confirmar aporte ──────────────────────────────────────────────────────────
function confirmarAporte() {
  const grupoDatos = grupoSeleccionado.value;

  const nuevoPago = {
    id:           `pago-${Date.now()}`,
    grupo:        grupoDatos?.nombre ?? "",
    grupo_id:     form.value.grupoId,
    monto:        parseFloat(parseFloat(form.value.monto).toFixed(2)),
    moneda:       "PEN",
    fecha:        new Date().toISOString().split("T")[0],
    fechaLimite:  null,
    estado:       archivoSeleccionado.value ? "revisando" : "pendiente",
    metodo:       form.value.metodo,
    comprobante:  archivoSeleccionado.value?.nombre ?? null,
    nota:         form.value.nota || `Aporte manual · ${new Date().toLocaleDateString("es-PE")}`,
    ocr_verificado: false,
    puntualidad:  null,
  };

  pasoActual.value = PASO_EXITO;

  // Emite después de mostrar el paso de éxito
  setTimeout(() => emit("confirmar", nuevoPago), 300);
}

// ── Cerrar y limpiar ──────────────────────────────────────────────────────────
function cerrarModal() {
  emit("cerrar");
}

function reiniciarFormulario() {
  form.value    = { grupoId: "", monto: "", metodo: "", nota: "" };
  errores.value = { grupoId: "", monto: "", metodo: "" };
  archivoSeleccionado.value = null;
  archivoRawFile.value = null;
  arrastrando.value = false;
  simulandoOcr.value = false;
  ocrCompletado.value = false;
  errorArchivo.value = "";
  pasoActual.value = PASO_FORMULARIO;
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click.self="cerrarModal"
  >
    <div class="bg-[#0D1225] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

      <!-- ── Indicador de pasos ──────────────────────────────────────────── -->
      <div class="flex items-center gap-0 border-b border-white/5">
        <div
          v-for="(etiqueta, i) in ['Detalle', 'Comprobante', 'Listo']"
          :key="i"
          class="flex-1 py-3 text-center text-xs font-semibold transition-colors"
          :class="pasoActual === i + 1
            ? 'text-violet-300 bg-violet-600/10 border-b-2 border-violet-500'
            : pasoActual > i + 1
              ? 'text-emerald-400 bg-emerald-500/5'
              : 'text-slate-500'"
        >
          <span v-if="pasoActual > i + 1" class="inline-flex items-center justify-center gap-1">
            <CheckCircle class="w-3.5 h-3.5" /> {{ etiqueta }}
          </span>
          <span v-else>{{ i + 1 }}. {{ etiqueta }}</span>
        </div>
      </div>

      <!-- ── PASO 1: Formulario ──────────────────────────────────────────── -->
      <Transition name="slide-fade" mode="out-in">
        <div v-if="pasoActual === 1" key="paso1" class="p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-white">Nuevo aporte</h3>
            <button @click="cerrarModal" class="text-slate-500 hover:text-white transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Grupo -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5">Grupo *</label>
            <select
              v-model="form.grupoId"
              class="w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none transition-colors cursor-pointer"
              :class="errores.grupoId ? 'border-rose-500/60' : 'border-white/10 focus:border-violet-500/50'"
            >
              <option value="" disabled class="bg-[#0D1225]">Selecciona un grupo…</option>
              <option
                v-for="grupo in grupos"
                :key="grupo.id"
                :value="grupo.id"
                class="bg-[#0D1225]"
              >
                {{ grupo.nombre }}
              </option>
            </select>
            <!-- Info de progreso del grupo seleccionado -->
            <div v-if="grupoSeleccionado" class="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Acumulado: S/ {{ grupoSeleccionado.acumulado.toFixed(2) }}</span>
              <span>Meta: S/ {{ grupoSeleccionado.meta.toFixed(2) }}</span>
              <span class="text-violet-400 font-medium">
                {{ Math.round((grupoSeleccionado.acumulado / grupoSeleccionado.meta) * 100) }}%
              </span>
            </div>
            <p v-if="errores.grupoId" class="mt-1 text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ errores.grupoId }}
            </p>
          </div>

          <!-- Monto -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5">Monto (S/) *</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold select-none">S/</span>
              <input
                v-model="form.monto"
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                class="w-full bg-white/5 border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors [appearance:textfield]"
                :class="errores.monto ? 'border-rose-500/60' : 'border-white/10 focus:border-violet-500/50'"
              />
            </div>
            <p v-if="errores.monto" class="mt-1 text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ errores.monto }}
            </p>
          </div>

          <!-- Método de pago -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5">Método de pago *</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="metodo in METODOS_PAGO"
                :key="metodo"
                type="button"
                @click="form.metodo = metodo"
                :class="[
                  'px-4 py-2 rounded-xl text-xs font-semibold border transition-all',
                  form.metodo === metodo
                    ? 'bg-violet-600/30 text-violet-300 border-violet-500/50'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                ]"
              >
                {{ metodo === 'Transferencia bancaria' ? '🏦' : metodo === 'Yape' ? '💜' : '💙' }}
                {{ metodo }}
              </button>
            </div>
            <p v-if="errores.metodo" class="mt-1 text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ errores.metodo }}
            </p>
          </div>

          <!-- Nota adicional -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5">Nota <span class="text-slate-600">(opcional)</span></label>
            <input
              v-model="form.nota"
              type="text"
              maxlength="80"
              placeholder="Ej. Ronda 3 - Marzo"
              class="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors"
            />
            <p class="text-xs text-slate-600 mt-1 text-right">{{ form.nota.length }}/80</p>
          </div>

          <!-- Acciones -->
          <div class="flex gap-3 pt-1">
            <button
              @click="cerrarModal"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              Cancelar
            </button>
            <button
              @click="avanzarAComprobante"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 transition-all"
            >
              Continuar <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </Transition>

      <!-- ── PASO 2: Comprobante ─────────────────────────────────────────── -->
      <Transition name="slide-fade" mode="out-in">
        <div v-if="pasoActual === 2" key="paso2" class="p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-white">Subir comprobante</h3>
            <button @click="cerrarModal" class="text-slate-500 hover:text-white transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Resumen del aporte -->
          <div class="bg-white/5 border border-white/10 rounded-xl p-4 text-sm space-y-1.5">
            <div class="flex justify-between">
              <span class="text-slate-400">Grupo</span>
              <span class="text-white font-medium">{{ grupoSeleccionado?.nombre }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Monto</span>
              <span class="text-white font-bold">S/ {{ parseFloat(form.monto).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Método</span>
              <span class="text-slate-200">{{ form.metodo }}</span>
            </div>
          </div>

          <!-- Zona de arrastre -->
          <div v-if="!archivoSeleccionado">
            <label
              class="block cursor-pointer"
              @dragover="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop"
            >
              <div
                :class="[
                  'border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all',
                  arrastrando
                    ? 'border-violet-400 bg-violet-500/10'
                    : 'border-violet-500/40 hover:border-violet-400/70 hover:bg-violet-500/5'
                ]"
              >
                <Upload class="w-8 h-8 text-violet-400" />
                <p class="text-sm text-slate-300 font-medium text-center">
                  {{ arrastrando ? 'Suelta el archivo aquí' : 'Haz clic o arrastra tu comprobante' }}
                </p>
                <p class="text-xs text-slate-500">JPG, PNG o PDF · Máx 5 MB</p>
              </div>
              <input
                type="file"
                class="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                @change="onFileInputChange"
              />
            </label>
            <p v-if="errorArchivo" class="mt-2 text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" /> {{ errorArchivo }}
            </p>
          </div>

          <!-- Archivo seleccionado -->
          <div v-else class="space-y-3">
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div class="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0 text-violet-400 text-xs font-bold uppercase">
                {{ archivoSeleccionado.tipo === 'application/pdf' ? 'PDF' : 'IMG' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-white font-medium truncate">{{ archivoSeleccionado.nombre }}</p>
                <p class="text-xs text-slate-500">{{ archivoSeleccionado.tamano }}</p>
              </div>
              <button @click="quitarArchivo" class="text-slate-500 hover:text-rose-400 transition-colors shrink-0">
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Estado OCR -->
            <div v-if="!ocrCompletado && !simulandoOcr">
              <button
                @click="simularOcr"
                class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
              >
                <Sparkles class="w-4 h-4" /> Analizar con OCR
              </button>
            </div>

            <div v-else-if="simulandoOcr" class="flex items-center justify-center gap-3 py-4 text-sm text-cyan-400">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Analizando comprobante…
            </div>

            <div v-else-if="ocrCompletado" class="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
              <ShieldCheck class="w-4 h-4 shrink-0" /> Comprobante verificado por OCR
            </div>
          </div>

          <p class="text-xs text-slate-500 flex items-start gap-1.5">
            <BookOpen class="w-3.5 h-3.5 shrink-0 mt-0.5" />
            El comprobante puede omitirse. El aporte quedará en estado "pendiente" hasta que lo subas.
          </p>

          <!-- Acciones -->
          <div class="flex gap-3 pt-1">
            <button
              @click="volverAFormulario"
              class="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <ChevronLeft class="w-4 h-4" /> Volver
            </button>
            <button
              @click="confirmarAporte"
              :disabled="simulandoOcr"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirmar aporte
            </button>
          </div>
        </div>
      </Transition>

      <!-- ── PASO 3: Éxito ────────────────────────────────────────────────── -->
      <Transition name="slide-fade" mode="out-in">
        <div v-if="pasoActual === 3" key="paso3" class="p-8 flex flex-col items-center text-center gap-4">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle class="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h3 class="text-xl font-extrabold text-white mb-1">¡Aporte registrado!</h3>
            <p class="text-sm text-slate-400 max-w-xs">
              Tu aporte de
              <span class="text-white font-semibold">S/ {{ parseFloat(form.monto).toFixed(2) }}</span>
              al grupo <span class="text-violet-300 font-semibold">{{ grupoSeleccionado?.nombre }}</span>
              fue registrado exitosamente.
            </p>
          </div>
          <div class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-left space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Estado</span>
              <span :class="archivoSeleccionado ? 'text-cyan-400' : 'text-amber-400'" class="font-semibold">
                {{ archivoSeleccionado ? 'En revisión OCR' : 'Pendiente' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Método</span>
              <span class="text-slate-200">{{ form.metodo }}</span>
            </div>
          </div>
          <div class="flex gap-3 w-full pt-2">
            <button
              @click="reiniciarFormulario"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-violet-300 bg-violet-600/15 border border-violet-500/30 hover:bg-violet-600/25 transition-all"
            >
              Nuevo aporte
            </button>
            <button
              @click="cerrarModal"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
            >
              Ver mis pagos
            </button>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active { transition: all 0.2s ease-out; }
.slide-fade-leave-active { transition: all 0.15s ease-in; }
.slide-fade-enter-from  { opacity: 0; transform: translateX(12px); }
.slide-fade-leave-to    { opacity: 0; transform: translateX(-12px); }
</style>
