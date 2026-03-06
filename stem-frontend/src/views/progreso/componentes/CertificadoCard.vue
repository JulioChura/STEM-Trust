<script setup>
import { Award, Download, ExternalLink } from "lucide-vue-next";

defineProps({
  curso: { type: Object, required: true },
});

const COLOR_MAP = {
  violet:  "from-violet-600  to-indigo-700",
  cyan:    "from-cyan-600    to-teal-700",
  emerald: "from-emerald-600 to-green-700",
  amber:   "from-amber-500   to-orange-600",
  rose:    "from-rose-600    to-pink-700",
  blue:    "from-blue-600    to-indigo-700",
  slate:   "from-slate-600   to-slate-700",
};

function formatFecha(iso) {
  if(!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("es-PE", {
    day: "2-digit", month: "long", year: "numeric",
  });
}
</script>

<template>
  <div class="bg-[#0D1225] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group">
    <!-- Gradient header -->
    <div :class="`bg-gradient-to-br ${COLOR_MAP[curso.categoriaColor] ?? COLOR_MAP.violet} p-5`">
      <div class="flex items-start justify-between">
        <div class="text-3xl">{{ curso.imagen }}</div>
        <Award class="w-7 h-7 text-white/80" />
      </div>
      <p class="text-white font-black text-sm leading-tight mt-3">{{ curso.nombre }}</p>
      <p class="text-white/70 text-xs mt-1">{{ curso.plataforma }}</p>
    </div>

    <!-- Body -->
    <div class="p-4 space-y-3">
      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-500">Completado</span>
        <span class="text-white font-semibold">{{ formatFecha(curso.fechaFin) }}</span>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-500">Duración total</span>
        <span class="text-white font-semibold">{{ curso.horasTotal }}h</span>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-500">Impacto en score</span>
        <span class="text-emerald-400 font-bold">+{{ curso.impactoScore }} pts</span>
      </div>

      <div class="flex gap-2 pt-1">
        <button class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
          bg-white/8 hover:bg-white/12 text-slate-300 text-xs font-semibold
          border border-white/10 transition-all">
          <Download class="w-3.5 h-3.5" />
          Descargar
        </button>
        <button class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
          bg-white/5 hover:bg-white/10 text-slate-400 text-xs
          border border-white/8 transition-all">
          <ExternalLink class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
