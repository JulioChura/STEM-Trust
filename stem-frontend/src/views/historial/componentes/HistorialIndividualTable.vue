<script setup>
import { computed } from "vue";
import { ShieldCheck, AlertCircle, Clock } from "lucide-vue-next";
import HistorialEstadoBadge from "./HistorialEstadoBadge.vue";

const props = defineProps({
  aportes: { type: Array, required: true },
  /** texto del filtro activo desde el padre */
  filtroGrupo: { type: String, default: "todos" },
  filtroPeriodo: { type: String, default: "todos" },
  filtroEstado:  { type: String, default: "todos" },
});

const METODO_ICON = {
  "Transferencia bancaria": "🏦",
  Yape: "💜",
  Plin: "💙",
};

function formatFecha(iso) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("es-PE", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

/** Estadísticas de resumen sobre los aportes filtrados */
const stats = computed(() => {
  const validados = props.aportes.filter((a) => a.estado === "validado");
  const totalAportado = validados.reduce((s, a) => s + a.monto, 0);
  const puntual = validados.filter((a) => (a.diasRetraso ?? 0) === 0);
  const puntualidadPct = validados.length
    ? Math.round((puntual.length / validados.length) * 100)
    : 0;
  const ocrVerificados = validados.filter((a) => a.ocr_verificado).length;

  return { totalAportado, puntualidadPct, ocrVerificados, validados: validados.length };
});
</script>

<template>
  <div class="space-y-4">

    <!-- Mini resumen de la tabla filtrada -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div
        v-for="(item, i) in [
          { label: 'Total aportado',   value: `S/ ${stats.totalAportado.toFixed(2)}`, colorClass: 'text-violet-400' },
          { label: 'Aportes validados',value: String(stats.validados),                colorClass: 'text-emerald-400' },
          { label: 'Puntualidad',      value: `${stats.puntualidadPct}%`,              colorClass: 'text-cyan-400'   },
          { label: 'OCR verificados',  value: String(stats.ocrVerificados),            colorClass: 'text-amber-400'  },
        ]"
        :key="i"
        class="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
      >
        <p :class="`text-lg font-extrabold ${item.colorClass}`">{{ item.value }}</p>
        <p class="text-xs text-slate-500 mt-0.5">{{ item.label }}</p>
      </div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto rounded-2xl border border-white/10">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-white/5 border-b border-white/10">
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Grupo</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nota</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Monto</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Método</th>
            <th class="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
            <th class="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">OCR</th>
            <th class="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Puntualidad</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="aporte in aportes"
            :key="aporte.id"
            class="border-b border-white/5 hover:bg-white/[.03] transition-colors"
          >
            <td class="px-4 py-3 text-slate-300 whitespace-nowrap">
              {{ formatFecha(aporte.fecha ?? aporte.fechaLimite) }}
            </td>
            <td class="px-4 py-3">
              <p class="text-white font-medium leading-tight">{{ aporte.grupo }}</p>
            </td>
            <td class="px-4 py-3 text-slate-400 max-w-[160px] truncate">{{ aporte.nota }}</td>
            <td class="px-4 py-3 text-right font-bold text-white whitespace-nowrap">
              S/ {{ aporte.monto.toFixed(2) }}
            </td>
            <td class="px-4 py-3 text-slate-400 whitespace-nowrap">
              {{ METODO_ICON[aporte.metodo] ?? '' }} {{ aporte.metodo ?? '—' }}
            </td>
            <td class="px-4 py-3 text-center">
              <HistorialEstadoBadge :estado="aporte.estado" />
            </td>
            <td class="px-4 py-3 text-center">
              <ShieldCheck v-if="aporte.ocr_verificado" class="w-4 h-4 text-emerald-400 mx-auto" />
              <AlertCircle v-else-if="aporte.comprobante" class="w-4 h-4 text-cyan-400 mx-auto" />
              <span v-else class="text-slate-600 text-xs">—</span>
            </td>
            <td class="px-4 py-3 text-center">
              <span v-if="aporte.diasRetraso === null" class="text-slate-600 text-xs">—</span>
              <span v-else-if="aporte.diasRetraso === 0" class="text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1">
                <Clock class="w-3 h-3" /> A tiempo
              </span>
              <span v-else :class="`text-xs font-semibold ${aporte.diasRetraso <= 2 ? 'text-amber-400' : 'text-rose-400'}`">
                +{{ aporte.diasRetraso }}d
              </span>
            </td>
          </tr>

          <!-- Empty row -->
          <tr v-if="aportes.length === 0">
            <td colspan="8" class="px-4 py-10 text-center text-slate-500 text-sm">
              No se encontraron aportes con los filtros aplicados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
