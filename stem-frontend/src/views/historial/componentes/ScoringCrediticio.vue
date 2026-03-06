<script setup>
defineProps({
  /** Array of { nombre, valor, maximo, color } */
  categorias: { type: Array, required: true },
  /** Array of { mes, puntuacion } — last N months */
  evolucionMensual: { type: Array, required: true },
});

const COLOR_MAP = {
  emerald: { bar: "bg-emerald-500", text: "text-emerald-400", track: "bg-emerald-500/15" },
  cyan:    { bar: "bg-cyan-500",    text: "text-cyan-400",    track: "bg-cyan-500/15"    },
  violet:  { bar: "bg-violet-500",  text: "text-violet-400",  track: "bg-violet-500/15"  },
  amber:   { bar: "bg-amber-500",   text: "text-amber-400",   track: "bg-amber-500/15"   },
};
</script>

<template>
  <div class="space-y-6">

    <!-- Category bars -->
    <div class="space-y-4">
      <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Detalle por categoría</h4>
      <div v-for="cat in categorias" :key="cat.nombre" class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-300 font-medium">{{ cat.nombre }}</span>
          <span :class="`font-bold ${(COLOR_MAP[cat.color] ?? COLOR_MAP.violet).text}`">
            {{ cat.valor }}<span class="text-slate-600 font-normal">/{{ cat.maximo }}</span>
          </span>
        </div>
        <div :class="`w-full h-2.5 rounded-full ${(COLOR_MAP[cat.color] ?? COLOR_MAP.violet).track} overflow-hidden`">
          <div
            :class="`h-full rounded-full ${(COLOR_MAP[cat.color] ?? COLOR_MAP.violet).bar} transition-all duration-700`"
            :style="{ width: `${(cat.valor / cat.maximo) * 100}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Evolution sparkline (bar chart) -->
    <div>
      <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Evolución mensual</h4>
      <div class="flex items-end gap-1.5 h-20">
        <div
          v-for="punto in evolucionMensual"
          :key="punto.mes"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <span class="text-xs text-slate-500 font-medium" style="writing-mode:horizontal-tb">
            {{ punto.puntuacion }}
          </span>
          <div
            class="w-full rounded-t-sm bg-gradient-to-t from-violet-600 to-indigo-400 transition-all duration-700"
            :style="{ height: `${(punto.puntuacion / 100) * 52}px` }"
          />
          <span class="text-[9px] text-slate-600 text-center leading-tight">{{ punto.mes }}</span>
        </div>
      </div>
    </div>

  </div>
</template>
