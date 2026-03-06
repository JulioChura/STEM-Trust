<template>
  <section class="rounded-2xl bg-white p-6 shadow-sm">
    <h1 class="text-2xl font-bold text-slate-900">Dashboard (Privado)</h1>
    <p class="mt-2 text-sm text-slate-600">
      Esta vista solo es accesible con sesion activa (meta.requiresAuth = true).
    </p>
    <p class="mt-4 text-xs text-slate-500">
      Si intentas acceder sin token, el router guard te redirige a /auth automaticamente.
    </p>
  </section>
</template>
