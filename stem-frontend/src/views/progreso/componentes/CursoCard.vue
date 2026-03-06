<script setup>
import { Award, Clock, ExternalLink } from "lucide-vue-next";
import CursoEstadoBadge from "./CursoEstadoBadge.vue";

defineProps({
  curso: { type: Object, required: true },
});

const emit = defineEmits(["registrar", "ver-certificado"]);

const COLOR_MAP = {
  violet:  { bar: "bg-violet-500",  text: "text-violet-400",  ring: "ring-violet-500/30",  bg: "bg-violet-500/10"  },
  cyan:    { bar: "bg-cyan-500",    text: "text-cyan-400",    ring: "ring-cyan-500/30",    bg: "bg-cyan-500/10"    },
  emerald: { bar: "bg-emerald-500", text: "text-emerald-400", ring: "ring-emerald-500/30", bg: "bg-emerald-500/10" },
  amber:   { bar: "bg-amber-500",   text: "text-amber-400",   ring: "ring-amber-500/30",   bg: "bg-amber-500/10"   },
  rose:    { bar: "bg-rose-500",    text: "text-rose-400",    ring: "ring-rose-500/30",    bg: "bg-rose-500/10"    },
  blue:    { bar: "bg-blue-500",    text: "text-blue-400",    ring: "ring-blue-500/30",    bg: "bg-blue-500/10"    },
  slate:   { bar: "bg-slate-500",   text: "text-slate-400",   ring: "ring-slate-500/30",   bg: "bg-slate-500/10"   },
};

function getColors(color) {
  return COLOR_MAP[color] ?? COLOR_MAP.violet;
}
</script>

<template>
  <div class="bg-[#0D1225] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/20 transition-all group">

    <!-- Top row -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <!-- Category icon -->
        <div :class="`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0
          ${getColors(curso.categoriaColor).bg} ring-1 ${getColors(curso.categoriaColor).ring}`">
          {{ curso.imagen }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-bold text-white leading-tight truncate">{{ curso.nombre }}</p>
          <p class="text-xs text-slate-500 mt-0.5">{{ curso.plataforma }} · {{ curso.nivel }}</p>
        </div>
      </div>
      <CursoEstadoBadge :estado="curso.estado" class="shrink-0 mt-0.5" />
    </div>

    <!-- Description -->
    <p class="text-xs text-slate-400 leading-relaxed line-clamp-2">{{ curso.descripcion }}</p>

    <!-- Progress bar -->
    <div class="space-y-1.5">
      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-500">Progreso</span>
        <span :class="`font-bold ${getColors(curso.categoriaColor).text}`">{{ curso.progreso }}%</span>
      </div>
      <div class="w-full h-2 bg-white/8 rounded-full overflow-hidden">
        <div
          :class="`h-full rounded-full ${getColors(curso.categoriaColor).bar} transition-all duration-700`"
          :style="{ width: `${curso.progreso}%` }"
        />
      </div>
      <div class="flex items-center justify-between text-xs text-slate-500">
        <span class="flex items-center gap-1">
          <Clock class="w-3 h-3" />
          {{ curso.horasCompletadas }}h / {{ curso.horasTotal }}h
        </span>
        <span :class="`flex items-center gap-1 font-semibold ${getColors(curso.categoriaColor).text}`">
          +{{ curso.impactoScore }} pts score
        </span>
      </div>
    </div>

    <!-- Footer actions -->
    <div class="flex items-center gap-2 pt-1 border-t border-white/8">
      <button
        v-if="curso.estado !== 'completado'"
        class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
          bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 text-xs font-semibold
          border border-violet-500/30 transition-all"
        @click="emit('registrar', curso)"
      >
        Actualizar progreso
      </button>

      <button
        v-if="curso.certificado"
        class="flex items-center gap-1.5 px-3 py-2 rounded-xl
          bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold
          border border-emerald-500/30 transition-all"
        @click="emit('ver-certificado', curso)"
      >
        <Award class="w-3.5 h-3.5" />
        Certificado
      </button>

      <button
        v-if="curso.estado === 'no_iniciado'"
        class="flex items-center gap-1.5 px-3 py-2 rounded-xl
          bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold
          border border-white/10 transition-all"
        @click="emit('registrar', curso)"
      >
        <ExternalLink class="w-3.5 h-3.5" />
        Vincular
      </button>
    </div>
  </div>
</template>
