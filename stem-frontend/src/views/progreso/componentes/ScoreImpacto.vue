<script setup>
import { TrendingUp, Zap } from "lucide-vue-next";

defineProps({
  scoringActual:     { type: Number, required: true },
  scoringProyectado: { type: Number, required: true },
  /** Array of { categoria, boost, descripcion } */
  impactoCategoria:  { type: Array,  required: true },
  /** Array of { mes, score } */
  evolucionScore:    { type: Array,  required: true },
  /** Array of cursos en progreso or no_iniciado */
  cursosRestantes:   { type: Array,  required: true },
});

const maxBarH = 56; // px — max height of sparkline bars
</script>

<template>
  <div class="space-y-6">

    <!-- Score actual vs proyectado -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0">
          <span class="text-xl font-black text-violet-300">{{ scoringActual }}</span>
        </div>
        <div>
          <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Score actual</p>
          <p class="text-lg font-black text-white mt-0.5">Confiable</p>
          <p class="text-xs text-slate-500 mt-0.5">Basado en historial y cursos completados</p>
        </div>
      </div>

      <div class="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
          <span class="text-xl font-black text-emerald-300">{{ scoringProyectado }}</span>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <p class="text-xs text-emerald-400 uppercase tracking-wider font-semibold">Score proyectado</p>
            <TrendingUp class="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p class="text-lg font-black text-white mt-0.5">Excelente</p>
          <p class="text-xs text-emerald-500 mt-0.5 flex items-center gap-1">
            <Zap class="w-3 h-3" />
            +{{ scoringProyectado - scoringActual }} pts completando cursos activos
          </p>
        </div>
      </div>
    </div>

    <!-- Evolution sparkline -->
    <div class="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Evolución del score</h4>
      <div class="flex items-end gap-2" :style="{ height: `${maxBarH + 24}px` }">
        <div
          v-for="(punto, i) in evolucionScore"
          :key="punto.mes"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <span class="text-[10px] text-slate-500">{{ punto.score }}</span>
          <div
            :class="`w-full rounded-t-md transition-all duration-700 ${
              i === evolucionScore.length - 1
                ? 'bg-gradient-to-t from-violet-600 to-violet-300'
                : 'bg-white/15'
            }`"
            :style="{ height: `${(punto.score / 100) * maxBarH}px` }"
          />
          <span class="text-[9px] text-slate-600 text-center leading-tight">{{ punto.mes }}</span>
        </div>
      </div>
    </div>

    <!-- Impact per category -->
    <div class="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Impacto por categoría STEM</h4>
      <div class="space-y-4">
        <div v-for="item in impactoCategoria" :key="item.categoria" class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="text-white font-semibold">{{ item.categoria }}</span>
            <span class="text-emerald-400 font-bold">+{{ item.boost }} pts / curso</span>
          </div>
          <p class="text-xs text-slate-500">{{ item.descripcion }}</p>
          <div class="w-full h-2 bg-white/8 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-700"
              :style="{ width: `${(item.boost / 12) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Pending courses and their potential boost -->
    <div v-if="cursosRestantes.length" class="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Cursos que mejorarán tu score</h4>
      <div class="space-y-3">
        <div
          v-for="curso in cursosRestantes"
          :key="curso.id"
          class="flex items-center justify-between gap-3 p-3 bg-white/5 rounded-xl border border-white/8"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="text-base shrink-0">{{ curso.imagen }}</span>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-white truncate">{{ curso.nombre }}</p>
              <p class="text-[10px] text-slate-500">{{ curso.plataforma }} · {{ curso.estado === 'en_progreso' ? `${curso.progreso}% completado` : 'No iniciado' }}</p>
            </div>
          </div>
          <div class="shrink-0 text-right">
            <p class="text-sm font-black text-emerald-400">+{{ curso.impactoScore }}</p>
            <p class="text-[10px] text-slate-500">pts</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
