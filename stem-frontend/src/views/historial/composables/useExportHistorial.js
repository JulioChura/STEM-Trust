/**
 * useExportHistorial
 * Zero-dependency PDF (print dialog) and CSV (Excel-compatible) export
 */

export function useExportHistorial(perfilRef, aportesRef, grupalRef) {
  // ─── PDF ─────────────────────────────────────────────────────────────────

  function exportarPDF() {
    const perfil  = perfilRef.value;
    const aportes = aportesRef.value;
    const grupos  = grupalRef.value;

    const filas = aportes
      .map(
        (a) => `
        <tr>
          <td>${a.fecha ?? a.fechaLimite ?? ""}</td>
          <td>${a.grupo}</td>
          <td>${a.nota ?? ""}</td>
          <td style="text-align:right">S/ ${a.monto.toFixed(2)}</td>
          <td>${a.metodo ?? "—"}</td>
          <td style="font-weight:600;color:${a.estado === "validado" ? "#22c55e" : a.estado === "rechazado" ? "#f43f5e" : "#f59e0b"}">${a.estado}</td>
          <td style="text-align:center">${a.ocr_verificado ? "✔" : "—"}</td>
          <td style="text-align:center">${a.diasRetraso === null ? "—" : a.diasRetraso === 0 ? "A tiempo" : `+${a.diasRetraso}d`}</td>
        </tr>`
      )
      .join("");

    const filasGrupal = grupos
      .map(
        (g) => `
        <tr>
          <td>${g.nombre}</td>
          <td>${g.rolUsuario}</td>
          <td style="text-align:right">S/ ${g.acumulado.toLocaleString()} / S/ ${g.meta.toLocaleString()}</td>
          <td style="text-align:center;font-weight:700;color:#a78bfa">${g.scoringGrupal}</td>
          <td style="text-align:center">${g.puntualidadGrupal}%</td>
          <td>${g.estado}</td>
        </tr>`
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Historial Financiero — ${perfil.nombre}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #111; font-size: 12px; }
    h1   { color: #5b21b6; font-size: 18px; margin-bottom: 4px; }
    h2   { color: #4c1d95; font-size: 14px; margin: 24px 0 8px; border-bottom: 2px solid #ede9fe; padding-bottom: 4px; }
    .meta { color: #666; font-size: 11px; margin-bottom: 24px; }
    .score-box { display: inline-block; background: #f5f3ff; border: 2px solid #c4b5fd; border-radius: 10px; padding: 12px 24px; margin-bottom: 16px; text-align: center; }
    .score-box .num { font-size: 36px; font-weight: 900; color: #5b21b6; }
    .score-box .lbl { font-size: 12px; color: #7c3aed; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
    th { background: #ede9fe; color: #4c1d95; text-align: left; padding: 6px 8px; font-size: 11px; text-transform: uppercase; }
    td { padding: 5px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
    tr:nth-child(even) td { background: #fafafa; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>Historial Financiero STEM Trust</h1>
  <p class="meta">Generado el ${new Date().toLocaleDateString("es-PE")} · ${perfil.nombre} · ${perfil.email}</p>

  <div class="score-box">
    <div class="num">${perfil.scoring.puntuacion}</div>
    <div class="lbl">Score crediticio · ${perfil.scoring.nivel}</div>
  </div>

  <h2>Historial Individual de Aportes</h2>
  <table>
    <thead><tr>
      <th>Fecha</th><th>Grupo</th><th>Nota</th><th style="text-align:right">Monto</th>
      <th>Método</th><th>Estado</th><th style="text-align:center">OCR</th><th style="text-align:center">Puntualidad</th>
    </tr></thead>
    <tbody>${filas}</tbody>
  </table>

  <h2>Historial Grupal</h2>
  <table>
    <thead><tr>
      <th>Grupo</th><th>Rol</th><th style="text-align:right">Acumulado / Meta</th>
      <th style="text-align:center">Score</th><th style="text-align:center">Puntualidad</th><th>Estado</th>
    </tr></thead>
    <tbody>${filasGrupal}</tbody>
  </table>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (!w) { alert("Activa las ventanas emergentes para exportar el PDF."); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.onload = () => w.print();
  }

  // ─── Excel (HTML-as-XLS con diseño) ─────────────────────────────────────

  function exportarCSV() {
    const perfil  = perfilRef.value;
    const aportes = aportesRef.value;
    const grupos  = grupalRef.value;

    const ESTADO_COLOR = {
      validado:  { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
      pendiente: { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
      revisando: { bg: "#cffafe", color: "#155e75", border: "#67e8f9" },
      rechazado: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
    };

    function estadoBadge(estado) {
      const c = ESTADO_COLOR[estado] ?? { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
      return `<span style="background:${c.bg};color:${c.color};border:1px solid ${c.border};
        padding:2px 10px;border-radius:6px;font-size:11px;font-weight:700;">${estado}</span>`;
    }

    function puntualidadCell(dias) {
      if (dias === null || dias === undefined) return `<span style="color:#9ca3af">—</span>`;
      if (dias === 0) return `<span style="color:#059669;font-weight:700">✔ A tiempo</span>`;
      if (dias <= 2)  return `<span style="color:#d97706;font-weight:700">+${dias}d</span>`;
      return `<span style="color:#ef4444;font-weight:700">+${dias}d</span>`;
    }

    function scoringCell(s) {
      const color = s >= 85 ? "#059669" : s >= 65 ? "#2563eb" : s >= 45 ? "#d97706" : "#ef4444";
      return `<span style="color:${color};font-weight:800;font-size:13px">${s}</span>`;
    }

    // ── Filas individuales ──────────────────────────────────────────────────
    const filasInd = aportes.map((a, i) => `
      <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f9fafb"}">
        <td style="color:#6b7280;font-size:11px">${a.fecha ?? a.fechaLimite ?? "—"}</td>
        <td style="font-weight:600;color:#111827">${a.grupo}</td>
        <td style="color:#6b7280;font-size:11px;max-width:160px">${a.nota ?? "—"}</td>
        <td style="text-align:right;font-weight:700;color:#111827">S/ ${a.monto.toFixed(2)}</td>
        <td style="color:#6b7280">${a.metodo ?? "—"}</td>
        <td>${estadoBadge(a.estado)}</td>
        <td style="text-align:center">${a.ocr_verificado ? `<span style="color:#059669;font-weight:700">✔ Sí</span>` : `<span style="color:#9ca3af">—</span>`}</td>
        <td style="text-align:center">${puntualidadCell(a.diasRetraso)}</td>
      </tr>`).join("");

    // ── Filas grupales ──────────────────────────────────────────────────────
    const filasGrp = grupos.map((g, i) => `
      <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f9fafb"}">
        <td style="font-weight:700;color:#111827">${g.nombre}</td>
        <td style="color:#6b7280">${g.objetivo}</td>
        <td style="color:#7c3aed;font-weight:600">${g.rolUsuario}</td>
        <td style="text-align:right;color:#374151">S/ ${g.meta.toLocaleString()}</td>
        <td style="text-align:right;font-weight:700;color:#111827">S/ ${g.acumulado.toLocaleString()}</td>
        <td style="text-align:center">${scoringCell(g.scoringGrupal)}</td>
        <td style="text-align:center;font-weight:700;color:${g.puntualidadGrupal >= 90 ? "#059669" : g.puntualidadGrupal >= 70 ? "#d97706" : "#ef4444"}">${g.puntualidadGrupal}%</td>
        <td style="text-align:center;color:#374151">${g.aportesRealizados} / ${g.aportesTotalesEsperados}</td>
        <td>${estadoBadge(g.estado)}</td>
      </tr>`).join("");

    const scoreColor = perfil.scoring.puntuacion >= 85 ? "#059669"
      : perfil.scoring.puntuacion >= 65 ? "#2563eb"
      : perfil.scoring.puntuacion >= 45 ? "#d97706" : "#ef4444";

    const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8"/>
  <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>
    <x:ExcelWorksheet><x:Name>Historial</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
  </x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
  <style>
    body  { font-family: Calibri, Arial, sans-serif; font-size: 12px; color: #111827; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 28px; }
    th    { background: #5b21b6; color: #ffffff; padding: 8px 12px; font-size: 11px;
            text-transform: uppercase; letter-spacing: .05em; text-align: left; white-space: nowrap; }
    td    { padding: 6px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; font-size: 12px; }
    .header-box { background: linear-gradient(135deg,#5b21b6,#4f46e5); color:#fff; padding: 20px 28px;
                  border-radius: 10px; margin-bottom: 24px; }
    .score-chip  { display:inline-block; padding: 6px 20px; background:#f5f3ff; border: 2px solid #c4b5fd;
                   border-radius: 20px; font-size: 28px; font-weight: 900; color: ${scoreColor}; }
    .section-title { font-size: 14px; font-weight: 800; color: #4c1d95; margin: 20px 0 6px;
                     border-left: 4px solid #7c3aed; padding-left: 10px; }
    .meta  { font-size: 11px; color: #d8b4fe; margin-top: 4px; }
    .kpi-row td { background: #f5f3ff; font-weight: 700; color: #5b21b6; text-align:center;
                  border: 1px solid #e9d5ff; font-size: 13px; padding: 10px; }
  </style>
</head>
<body>

<!-- Header -->
<table style="margin-bottom:16px;border:none">
  <tr>
    <td style="border:none;padding:0">
      <div class="header-box">
        <div style="font-size:20px;font-weight:900;letter-spacing:-.5px">STEM<span style="color:#c4b5fd">Trust</span> — Historial Financiero</div>
        <div class="meta">${perfil.nombre} &nbsp;·&nbsp; ${perfil.email} &nbsp;·&nbsp; Generado el ${new Date().toLocaleDateString("es-PE")}</div>
      </div>
    </td>
  </tr>
</table>

<!-- Score KPIs -->
<div class="section-title">Scoring Crediticio Personal</div>
<table style="width:auto;margin-bottom:24px">
  <tr class="kpi-row">
    <td style="background:#f5f3ff;border:1px solid #ddd8fe;padding:14px 20px">
      <div style="font-size:11px;color:#7c3aed;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Score</div>
      <div style="font-size:30px;font-weight:900;color:${scoreColor}">${perfil.scoring.puntuacion}</div>
      <div style="font-size:11px;color:#6b7280">${perfil.scoring.nivel}</div>
    </td>
    ${perfil.scoring.categorias.map((c) => `
    <td style="background:#faf5ff;border:1px solid #ddd8fe;padding:14px 20px">
      <div style="font-size:11px;color:#7c3aed;font-weight:600;text-transform:uppercase;letter-spacing:.05em">${c.nombre}</div>
      <div style="font-size:22px;font-weight:800;color:#4c1d95">${c.valor}<span style="font-size:13px;color:#9ca3af">/${c.maximo}</span></div>
      <div style="height:6px;background:#e9d5ff;border-radius:4px;margin-top:6px;width:120px">
        <div style="height:6px;background:#7c3aed;border-radius:4px;width:${(c.valor / c.maximo) * 120}px"></div>
      </div>
    </td>`).join("")}
  </tr>
</table>

<!-- Historial Individual -->
<div class="section-title">Historial Individual de Aportes</div>
<table>
  <thead>
    <tr>
      <th>Fecha</th><th>Grupo</th><th>Nota</th><th style="text-align:right">Monto</th>
      <th>Método</th><th>Estado</th><th style="text-align:center">OCR</th><th style="text-align:center">Puntualidad</th>
    </tr>
  </thead>
  <tbody>${filasInd}</tbody>
</table>

<!-- Historial Grupal -->
<div class="section-title">Historial Grupal</div>
<table>
  <thead>
    <tr>
      <th>Grupo</th><th>Objetivo</th><th>Rol</th><th style="text-align:right">Meta</th>
      <th style="text-align:right">Acumulado</th><th style="text-align:center">Score</th>
      <th style="text-align:center">Puntualidad</th><th style="text-align:center">Aportes</th><th>Estado</th>
    </tr>
  </thead>
  <tbody>${filasGrp}</tbody>
</table>

</body></html>`;

    const blob = new Blob(["\uFEFF" + html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `historial-stemtrust-${Date.now()}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return { exportarPDF, exportarCSV };
}
