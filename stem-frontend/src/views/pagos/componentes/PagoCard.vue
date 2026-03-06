<script setup>
import { computed } from "vue";
import {
  CheckCircle, Clock, AlertCircle, Upload,
  Shield, ShieldCheck, Calendar
} from "lucide-vue-next";
import PagoEstadoBadge from "./PagoEstadoBadge.vue";

const props = defineProps({
  pago: { type: Object, required: true },
});

const emit = defineEmits(["subir"]);

const metodoIcon = {
  "Transferencia bancaria": "🏦",
  Yape: "💜",
  Plin: "💙",
};

const puntualidadLabel = computed(() => {
  const p = props.pago.puntualidad;
  if (p === null) return null;
  if (p <= 0) return { text: "A tiempo", color: "text-emerald-400" };
  if (p <= 2) return { text: `${p}d de retraso`, color: "text-amber-400" };
  return { text: `${p}d de retraso`, color: "text-rose-400" };
});

const fechaFormateada = computed(() => {
  const d = props.pago.fecha ?? props.pago.fechaLimite;
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("es-PE", {
    day: "2-digit", month: "short", year: "numeric",
  });
});

const limiteFormateado = computed(() => {
  if (!props.pago.fechaLimite) return "—";
  return new Date(props.pago.fechaLimite + "T00:00:00").toLocaleDateString("es-PE", {
    day: "2-digit", month: "short", year: "numeric",
  });
});
</script>

<template>
  <div class="bg-white/5 hover:bg-white/[.07] border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all group">

    <!-- Header row -->
    <div class="flex items-start justify-between gap-3 mb-4">
      <div class="min-w-0">
        <p class="text-xs text-slate-500 mb-0.5">{{ pago.grupo }}</p>
        <p class="text-sm font-semibold text-white truncate">{{ pago.nota }}</p>
      </div>
      <PagoEstadoBadge :estado="pago.estado" />
    </div>

    <!-- Amount -->
    <div class="mb-4">
      <span class="text-2xl font-extrabold text-white">
        S/ {{ pago.monto.toFixed(2) }}
      </span>
    </div>

    <!-- Meta row -->
    <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 mb-4">
      <!-- Fecha de pago/límite -->
      <span class="flex items-center gap-1">
        <Calendar class="w-3.5 h-3.5 shrink-0" />
        <span v-if="pago.fecha">Pagado: {{ fechaFormateada }}</span>
        <span v-else>Límite: {{ limiteFormateado }}</span>
      </span>

      <!-- Metodo -->
      <span v-if="pago.metodo" class="flex items-center gap-1">
        {{ metodoIcon[pago.metodo] ?? "💳" }} {{ pago.metodo }}
      </span>

      <!-- Puntualidad -->
      <span v-if="puntualidadLabel" :class="`flex items-center gap-1 font-medium ${puntualidadLabel.color}`">
        <Clock class="w-3.5 h-3.5 shrink-0" />
        {{ puntualidadLabel.text }}
      </span>
    </div>

    <!-- OCR / Comprobante -->
    <div class="flex items-center justify-between">
      <span v-if="pago.ocr_verificado" class="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
        <ShieldCheck class="w-4 h-4" /> Comprobante OCR verificado
      </span>
      <span v-else-if="pago.comprobante" class="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
        <Shield class="w-4 h-4" /> En revisión por OCR
      </span>
      <span v-else class="inline-flex items-center gap-1.5 text-xs text-slate-500">
        <AlertCircle class="w-4 h-4" /> Sin comprobante
      </span>

      <!-- Upload button for pending -->
      <button
        v-if="pago.estado === 'pendiente'"
        @click="emit('subir', pago)"
        class="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-violet-500/20 hover:-translate-y-0.5"
      >
        <Upload class="w-3.5 h-3.5" /> Subir comprobante
      </button>
    </div>
  </div>
</template>
