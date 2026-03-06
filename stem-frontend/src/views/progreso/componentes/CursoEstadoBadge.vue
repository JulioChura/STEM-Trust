<script setup>
defineProps({ estado: { type: String, required: true } });

const CONFIG = {
  completado:  { label: "Completado",    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  en_progreso: { label: "En progreso",   classes: "bg-violet-500/15  text-violet-400  border-violet-500/30"  },
  no_iniciado: { label: "No iniciado",   classes: "bg-white/8        text-slate-400   border-white/15"        },
};
</script>

<template>
  <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-lg border text-xs font-semibold
    ${(CONFIG[estado] ?? CONFIG.no_iniciado).classes}`">
    {{ (CONFIG[estado] ?? CONFIG.no_iniciado).label }}
  </span>
</template>
