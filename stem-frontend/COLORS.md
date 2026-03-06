# STEM-Trust — Paleta de colores

## Fondos base

| Nombre | HEX | Uso |
|---|---|---|
| Deep Navy | `#070B18` | Fondo principal de la app (body, páginas) |
| Surface | `#0D1225` | Cards, sidebar, headers, paneles elevados |

---

## Gradientes principales (from → to)

| Nombre | HEX inicio | HEX fin | Uso |
|---|---|---|---|
| Brand / CTA | `#7c3aed` (violet-600) | `#4f46e5` (indigo-600) | Gauge global, botones primarios, logo |
| Score Individual | `#10b981` (emerald-500) | `#06b6d4` (cyan-500) | Mini gauge score personal |
| Score Grupal | `#a855f7` (violet-500) | `#6366f1` (indigo-500) | Mini gauge score grupal |
| Hero / Login BG | `violet-900/80` | `#070B18` | Panel izquierdo login/register |
| Register BG | `indigo-900/80` | `#070B18` | Panel izquierdo register |

---

## Colores semánticos (Tailwind)

### Violeta / Índigo — Color marca

| Token Tailwind | HEX | Uso |
|---|---|---|
| `violet-400` | `#a78bfa` | Texto acento, nivel inicial, score inicial |
| `violet-500` | `#8b5cf6` | Barras, gradientes, tags |
| `violet-600` | `#7c3aed` | Botones primarios, gauge SVG |
| `indigo-400` | `#818cf8` | Acento secundario |
| `indigo-500` | `#6366f1` | Gradientes, gauge brand |
| `indigo-600` | `#4f46e5` | Gauge brand (end) |

### Esmeralda / Teal — Éxito / Puntualidad

| Token Tailwind | HEX | Uso |
|---|---|---|
| `emerald-400` | `#34d399` | Score ≥85, email verificado, hitos completos, ScoreGauge alto |
| `emerald-500` | `#10b981` | Barras puntualidad, gradiente score individual |
| `teal-400` | `#2dd4bf` | Fin de gradientes éxito |

### Cian / Azul — Información / OCR

| Token Tailwind | HEX | Uso |
|---|---|---|
| `cyan-400` | `#22d3ee` | Score tier media, dimensión OCR, activos Hardware |
| `cyan-500` | `#06b6d4` | Gradiente score individual (end), barras OCR |
| `blue-400` | `#60a5fa` | ScoreGauge medio (65–84), fin gradientes info |

### Fucsia / Rosa — Roles / Liderazgo

| Token Tailwind | HEX | Uso |
|---|---|---|
| `fuchsia-400` | `#e879f9` | Score grupal "Líder", organizadoras |
| `fuchsia-500` | `#d946ef` | Barras líder |
| `pink-400` | `#f472b6` | Categoría Diseño (activos STEM) |

### Ámbar / Amarillo — Elite / Advertencia

| Token Tailwind | HEX | Uso |
|---|---|---|
| `amber-400` | `#fbbf24` | Score Elite, nivel máximo, ScoreGauge medio-bajo, badge "Org." |
| `amber-500` | `#f59e0b` | Contraseña, advertencias |
| `yellow-300` | `#fde047` | Fin gradiente Elite |

### Rosa / Rojo — Error / Tardíos

| Token Tailwind | HEX | Uso |
|---|---|---|
| `rose-400` | `#fb7185` | Pagos tardíos, zona peligrosa (settings) |
| `rose-500` | `#f43f5e` | Borde zona peligrosa |
| `red-400` | `#f87171` | ScoreGauge bajo (<45) |

### Slate — Texto neutro / UI

| Token Tailwind | HEX aprox. | Uso |
|---|---|---|
| `slate-300` | `#cbd5e1` | Texto inputs, labels secundarios |
| `slate-400` | `#94a3b8` | Texto nav inactivo, valores secundarios |
| `slate-500` | `#64748b` | Subtítulos, metadatos |
| `slate-600` | `#475569` | Texto muy suave, fechas, íconos inactivos |
| `slate-700` | `#334155` | Badges bloqueados, texto deshabilitado |

---

## Colores de terceros

| Nombre | HEX | Uso |
|---|---|---|
| WhatsApp Green | `#25D366` | Botón "Compartir por WhatsApp" en GroupDetail |

---

## Opacidades de superposición (white/)

| Clase | Valor | Uso |
|---|---|---|
| `white/4` | 4% blanco | Fondo hover sutil de cards |
| `white/5` | 5% blanco | Bordes del sidebar, separadores |
| `white/6` | 6% blanco | Separadores internos, barras vacías |
| `white/7` | 7% blanco | Hover en items de lista |
| `white/8` | 8% blanco | Bordes de cards en perfil y settings |
| `white/10` | 10% blanco | Bordes en grupos, inputs |

---

## Resumen rápido para diseño

```
Fondo app:     #070B18
Cards/UI:      #0D1225
Marca (brand): #7c3aed → #4f46e5  (violet-indigo)
Éxito/OK:      #10b981 → #06b6d4  (emerald-cyan)
Grupal:        #a855f7 → #6366f1  (violet-indigo)
Elite:         #fbbf24 → #fde047  (amber-yellow)
Error:         #f43f5e             (rose)
Texto:         white → slate-300 → slate-400 → slate-600
```
