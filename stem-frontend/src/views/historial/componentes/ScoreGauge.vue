<script setup>
import { computed } from "vue";

const props = defineProps({
  /** 0-100 */
  puntuacion: { type: Number, required: true },
  /** display label below score */
  nivel: { type: String, default: "" },
  /** px size of the SVG */
  size: { type: Number, default: 160 },
});

// Arc math — semi-circle gauge (180°)
const RADIUS   = 54;
const CX       = 80;
const CY       = 80;
const DASH_MAX = Math.PI * RADIUS; // circumference of half circle

const dashOffset = computed(() =>
  DASH_MAX - (props.puntuacion / 100) * DASH_MAX
);

// Color thresholds
const arcColor = computed(() => {
  if (props.puntuacion >= 85) return "#34d399"; // emerald-400
  if (props.puntuacion >= 65) return "#60a5fa"; // blue-400
  if (props.puntuacion >= 45) return "#fbbf24"; // amber-400
  return "#f87171";                             // red-400
});
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <svg
      :width="size"
      :height="size * 0.6"
      viewBox="0 0 160 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Track -->
      <path
        :d="`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`"
        stroke="rgba(255,255,255,0.08)"
        stroke-width="12"
        stroke-linecap="round"
        fill="none"
      />
      <!-- Fill arc -->
      <path
        :d="`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`"
        :stroke="arcColor"
        stroke-width="12"
        stroke-linecap="round"
        fill="none"
        :stroke-dasharray="DASH_MAX"
        :stroke-dashoffset="dashOffset"
        style="transition: stroke-dashoffset 0.8s ease, stroke 0.4s ease;"
      />
      <!-- Score label -->
      <text x="80" y="74" text-anchor="middle" fill="white" font-size="26" font-weight="800" font-family="sans-serif">
        {{ puntuacion }}
      </text>
    </svg>
    <p v-if="nivel" class="text-xs font-semibold" :style="{ color: arcColor }">{{ nivel }}</p>
  </div>
</template>
