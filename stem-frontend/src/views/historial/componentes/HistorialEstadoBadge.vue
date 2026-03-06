<script setup>
const props = defineProps({
  estado: { type: String, required: true },
});

const CONFIG = {
  validado:  { label: "Validado",    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  pendiente: { label: "Pendiente",   classes: "bg-amber-500/15  text-amber-400  border-amber-500/30"   },
  revisando: { label: "En revisión", classes: "bg-cyan-500/15   text-cyan-400   border-cyan-500/30"   },
  rechazado: { label: "Rechazado",   classes: "bg-rose-500/15   text-rose-400   border-rose-500/30"   },
};

const badge = CONFIG[props.estado]
  ?? { label: props.estado, classes: "bg-white/10 text-slate-400 border-white/20" };
</script>

<template>
  <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-lg border text-xs font-semibold capitalize ${badge.classes}`">
    {{ badge.label }}
  </span>
</template>
