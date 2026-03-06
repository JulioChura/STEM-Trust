<script setup>
import { ref } from "vue";
import { ChevronDown, ChevronUp, Users } from "lucide-vue-next";

defineProps({
  grupos: { type: Array, required: true },
});

const grupoExpandido = ref(null);

function toggleGrupo(id) {
  grupoExpandido.value = grupoExpandido.value === id ? null : id;
}

function formatFecha(iso) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("es-PE", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

const ESTADO_CLASSES = {
  activo:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  completado:"bg-violet-500/15  text-violet-400  border-violet-500/30",
  pausado:   "bg-amber-500/15   text-amber-400   border-amber-500/30",
};

function scoringColor(s) {
  if (s >= 85) return "text-emerald-400";
  if (s >= 65) return "text-cyan-400";
  if (s >= 45) return "text-amber-400";
  return "text-rose-400";
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="grupo in grupos"
      :key="grupo.grupo_id"
      class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all"
    >
      <!-- Header row (clickable) -->
      <button
        class="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[.04] transition-colors text-left"
        @click="toggleGrupo(grupo.grupo_id)"
      >
        <div class="flex items-center gap-4 min-w-0">
          <!-- Objetivo emoji + nombre -->
          <div class="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-xl shrink-0">
            {{ grupo.objetivo.split(' ')[0] }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-bold text-white truncate">{{ grupo.nombre }}</p>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ grupo.rolUsuario }} · {{ grupo.participantes }} participantes · desde {{ formatFecha(grupo.fechaInicio) }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-5 shrink-0 ml-4">
          <!-- Progress pill -->
          <div class="hidden sm:flex flex-col items-end gap-0.5">
            <p class="text-xs text-slate-400">
              S/ {{ grupo.acumulado.toLocaleString() }}
              <span class="text-slate-600">/ S/ {{ grupo.meta.toLocaleString() }}</span>
            </p>
            <div class="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-700"
                :style="{ width: `${Math.min((grupo.acumulado / grupo.meta) * 100, 100)}%` }"
              />
            </div>
          </div>
          <!-- Scoring grupal -->
          <div class="text-center hidden md:block">
            <p :class="`text-lg font-extrabold ${scoringColor(grupo.scoringGrupal)}`">{{ grupo.scoringGrupal }}</p>
            <p class="text-[10px] text-slate-500">Score grupal</p>
          </div>
          <!-- Estado badge -->
          <span :class="`text-xs px-2.5 py-1 rounded-lg border font-semibold ${ESTADO_CLASSES[grupo.estado] ?? ESTADO_CLASSES.activo}`">
            {{ grupo.estado }}
          </span>
          <!-- Chevron -->
          <component :is="grupoExpandido === grupo.grupo_id ? ChevronUp : ChevronDown" class="w-4 h-4 text-slate-500 shrink-0" />
        </div>
      </button>

      <!-- Expanded detail -->
      <Transition name="expand">
        <div v-if="grupoExpandido === grupo.grupo_id" class="border-t border-white/8 px-5 py-5 space-y-5">

          <!-- KPIs row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              v-for="kpi in [
                { label: 'Aportes realizados', value: `${grupo.aportesRealizados}/${grupo.aportesTotalesEsperados}`, color: 'text-violet-400'  },
                { label: 'Puntualidad grupal', value: `${grupo.puntualidadGrupal}%`,                                  color: 'text-emerald-400' },
                { label: 'Aporte mensual',     value: `S/ ${grupo.aporteMensual.toFixed(2)}`,                         color: 'text-cyan-400'   },
                { label: 'Próxima ronda',      value: formatFecha(grupo.proximaRonda),                               color: 'text-amber-400'  },
              ]"
              :key="kpi.label"
              class="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
            >
              <p :class="`text-base font-extrabold ${kpi.color}`">{{ kpi.value }}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{ kpi.label }}</p>
            </div>
          </div>

          <!-- Members table -->
          <div>
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users class="w-3.5 h-3.5" /> Miembros del grupo
            </h4>
            <div class="overflow-x-auto rounded-xl border border-white/10">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-white/5 border-b border-white/10">
                    <th class="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Nombre</th>
                    <th class="text-center px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Scoring</th>
                    <th class="text-center px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Aportes</th>
                    <th class="text-center px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Puntualidad</th>
                    <th class="text-right px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Barra</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="miembro in grupo.miembros"
                    :key="miembro.nombre"
                    class="border-b border-white/5 hover:bg-white/[.03] transition-colors"
                  >
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {{ miembro.nombre[0] }}
                        </div>
                        <span class="text-white font-medium text-sm">{{ miembro.nombre }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span :class="`font-bold text-sm ${scoringColor(miembro.scoring)}`">{{ miembro.scoring }}</span>
                    </td>
                    <td class="px-4 py-3 text-center text-slate-300 text-sm">{{ miembro.aportes }}</td>
                    <td class="px-4 py-3 text-center">
                      <span :class="`text-sm font-semibold ${miembro.puntualidad >= 90 ? 'text-emerald-400' : miembro.puntualidad >= 70 ? 'text-amber-400' : 'text-rose-400'}`">
                        {{ miembro.puntualidad }}%
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center justify-end gap-2 w-full min-w-[80px]">
                        <div class="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            class="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-700"
                            :style="{ width: `${miembro.scoring}%` }"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active { transition: all 0.25s ease-out; overflow: hidden; }
.expand-leave-active { transition: all 0.18s ease-in;  overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 800px; }
</style>
