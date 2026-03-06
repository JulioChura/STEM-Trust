<script setup>
import { CircleDollarSign, CheckCircle, Clock, BarChart2 } from "lucide-vue-next";

defineProps({
  resumen: { type: Object, required: true },
});

const stats = (r) => [
  {
    label: "Total aportado",
    value: `S/ ${r.totalAportado.toFixed(2)}`,
    icon: CircleDollarSign,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    label: "Validado por OCR",
    value: `S/ ${r.totalValidado.toFixed(2)}`,
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    label: "Pendiente",
    value: `S/ ${r.totalPendiente.toFixed(2)}`,
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    label: "Scoring actual",
    value: `${r.scoring} pts`,
    icon: BarChart2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
];
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="stat in stats(resumen)"
      :key="stat.label"
      :class="`${stat.bg} border rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-all cursor-default`"
    >
      <component :is="stat.icon" :class="`w-5 h-5 ${stat.color}`" />
      <div>
        <div class="text-2xl font-extrabold text-white">{{ stat.value }}</div>
        <div class="text-xs text-slate-400 mt-0.5">{{ stat.label }}</div>
      </div>
    </div>
  </div>
</template>
