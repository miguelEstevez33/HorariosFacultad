// Utilidad: Exportar la grilla semanal de materias inscriptas como imagen PNG
// Cada materia recibe un color distinto para diferenciarla visualmente.
(function (global) {
  const App = (global.App = global.App || {});

  const FONT_STACK = "system-ui, -apple-system, 'Segoe UI', 'Inter', sans-serif";

  const SUBJECT_PALETTE = [
    { bg: "#e6f0f8", border: "#2c7bb6", text: "#163d5c" }, // Azul
    { bg: "#e8f4ec", border: "#2e7d4f", text: "#17432a" }, // Verde
    { bg: "#fdf2dc", border: "#b86e00", text: "#5c3700" }, // Ámbar
    { bg: "#f1ebfa", border: "#7048b5", text: "#382161" }, // Violeta
    { bg: "#fbe9e7", border: "#c0392b", text: "#631c15" }, // Rojo coral
    { bg: "#e4f4f3", border: "#0e7c7b", text: "#074140" }, // Turquesa
    { bg: "#fae8f0", border: "#b83b72", text: "#5d1b38" }, // Rosa
    { bg: "#eaedfb", border: "#3f51b5", text: "#1f285c" }, // Índigo
    { bg: "#eff4e4", border: "#608024", text: "#314211" }, // Oliva
    { bg: "#fdeee4", border: "#c95b16", text: "#662d0a" }, // Naranja
    { bg: "#e5f5fa", border: "#0b7ea4", text: "#053f52" }, // Cian
    { bg: "#edf0f5", border: "#52657a", text: "#27323d" }  // Gris azulado
  ];

  function drawRoundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function wrapTextLines(ctx, text, maxWidth, maxLines) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    if (!words.length) return [];

    const lines = [];
    let current = words[0];

    for (let i = 1; i < words.length; i++) {
      const candidate = current + " " + words[i];
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        lines.push(current);
        current = words[i];
      }
    }
    lines.push(current);

    if (lines.length <= maxLines) return lines;

    const trimmed = lines.slice(0, maxLines);
    let last = trimmed[maxLines - 1];
    while (last.length > 1 && ctx.measureText(last + "…").width > maxWidth) {
      last = last.slice(0, -1);
    }
    trimmed[maxLines - 1] = last.trimEnd() + "…";
    return trimmed;
  }

  function getCuatLabel(cuatFilter) {
    if (cuatFilter === "1C") return "1° Cuatrimestre";
    if (cuatFilter === "2C") return "2° Cuatrimestre";
    return "Anual Completo";
  }

  function collectExportData() {
    const { subjects: rawSubjects, blocks, totalHoras } = App.schedule.collectEnrolledSchedule();
    const colorByMateria = {};
    const subjects = rawSubjects.map((subj, idx) => {
      const palette = SUBJECT_PALETTE[idx % SUBJECT_PALETTE.length];
      colorByMateria[subj.id] = palette;
      return { ...subj, palette };
    });
    return { subjects, blocks, colorByMateria, totalHoras };
  }

  function computeLayout(subjectsCount, totalHours) {
    const { DAYS_ORDER } = App.schedule;
    const padX = 28;
    const padY = 24;
    const width = 1400;
    const titleHeight = 56;
    const headerHeight = 42;
    const hourRowHeight = 56;
    const gridHeight = totalHours * hourRowHeight;
    const timeColWidth = 72;
    const gridWidth = width - padX * 2;
    const dayColWidth = (gridWidth - timeColWidth) / DAYS_ORDER.length;

    const legendCols = Math.min(3, Math.max(1, subjectsCount));
    const legendRows = Math.ceil(subjectsCount / legendCols);
    const legendRowHeight = 28;
    const legendTopGap = 20;
    const legendHeight = 26 + legendRows * legendRowHeight;

    const gridX = padX;
    const gridY = padY + titleHeight;
    const bodyY = gridY + headerHeight;
    const legendY = bodyY + gridHeight + legendTopGap;
    const height = padY * 2 + titleHeight + headerHeight + gridHeight + legendTopGap + legendHeight;

    return {
      padX,
      padY,
      width,
      height,
      headerHeight,
      hourRowHeight,
      gridX,
      gridY,
      bodyY,
      gridWidth,
      gridHeight,
      timeColWidth,
      dayColWidth,
      legendCols,
      legendRowHeight,
      legendY
    };
  }

  function drawDocumentHeader(ctx, layout, cuatFilter, subjectsCount, totalHoras) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, layout.width, layout.height);

    ctx.fillStyle = "#1f2933";
    ctx.font = `600 20px ${FONT_STACK}`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText("Horario Semanal — ISI Plan 2023 (UTN FRC)", layout.padX, layout.padY);

    ctx.fillStyle = "#6b7785";
    ctx.font = `500 13px ${FONT_STACK}`;
    const summaryText = `${getCuatLabel(cuatFilter)}  •  ${subjectsCount} ${
      subjectsCount === 1 ? "materia" : "materias"
    }  •  ${totalHoras} hs/sem`;
    ctx.fillText(summaryText, layout.padX, layout.padY + 28);
  }

  function drawGridFrame(ctx, layout, minHour, totalHours) {
    const { DAYS_ORDER } = App.schedule;
    const { gridX, gridY, bodyY, gridWidth, gridHeight, headerHeight, timeColWidth, dayColWidth, hourRowHeight } = layout;

    // Cabecera azul sólida
    ctx.fillStyle = "#2c7bb6";
    ctx.fillRect(gridX, gridY, gridWidth, headerHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = `600 14px ${FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Hora", gridX + timeColWidth / 2, gridY + headerHeight / 2);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gridX + timeColWidth, gridY);
    ctx.lineTo(gridX + timeColWidth, gridY + headerHeight);
    ctx.stroke();

    DAYS_ORDER.forEach((day, idx) => {
      const colCenter = gridX + timeColWidth + idx * dayColWidth + dayColWidth / 2;
      ctx.fillText(day, colCenter, gridY + headerHeight / 2);
    });

    // Filas alternadas por hora
    for (let i = 0; i < totalHours; i++) {
      const y = bodyY + i * hourRowHeight;
      ctx.fillStyle = i % 2 === 1 ? "#eef1f5" : "#ffffff";
      ctx.fillRect(gridX + timeColWidth, y, gridWidth - timeColWidth, hourRowHeight);

      ctx.fillStyle = "#f4f6f8";
      ctx.fillRect(gridX, y, timeColWidth, hourRowHeight);

      ctx.strokeStyle = "#d9dee5";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gridX, y + hourRowHeight);
      ctx.lineTo(gridX + gridWidth, y + hourRowHeight);
      ctx.stroke();

      ctx.fillStyle = "#6b7785";
      ctx.font = `600 12px ${FONT_STACK}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`${minHour + i}:00`, gridX + timeColWidth / 2, y + 6);
    }

    // Divisiones verticales de columnas
    ctx.strokeStyle = "#d9dee5";
    ctx.lineWidth = 1;
    for (let i = 0; i < DAYS_ORDER.length; i++) {
      const x = gridX + timeColWidth + i * dayColWidth;
      ctx.beginPath();
      ctx.moveTo(x, bodyY);
      ctx.lineTo(x, bodyY + gridHeight);
      ctx.stroke();
    }
  }

  function drawSingleCard(ctx, block, pal, cardX, cardY, cardW, cardH, totalLanes) {
    const { formatShortTime, formatAulaLabel } = App.schedule;

    // Fondo + borde
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 4);
    ctx.fillStyle = pal.bg;
    ctx.fill();
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = pal.border;
    ctx.stroke();

    // Barra superior de color sólido y contenido recortado al borde redondeado
    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 4);
    ctx.clip();
    ctx.fillStyle = pal.border;
    ctx.fillRect(cardX, cardY, cardW, 4);

    const padCardX = totalLanes > 1 ? 5 : 8;
    const innerW = Math.max(24, cardW - padCardX * 2);

    // Horario arriba a la izquierda
    const timeLabel = `${formatShortTime(block.inicio)} — ${formatShortTime(block.fin)}hs`;
    ctx.fillStyle = pal.text;
    ctx.font = `600 ${totalLanes > 1 ? 10 : 11}px ${FONT_STACK}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(timeLabel, cardX + padCardX, cardY + 7, innerW);

    const aulaLabel = block.aula ? formatAulaLabel(block.aula) : "";
    const showSeparateAulaRow = Boolean(aulaLabel) && totalLanes < 3 && cardH >= 64;

    // Código de comisión (y aula si aplica) abajo al centro
    const comFontSize = totalLanes >= 3 ? 13 : totalLanes === 2 ? 15 : 17;
    ctx.fillStyle = pal.text;
    ctx.font = `700 ${comFontSize}px ${FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    const bottomText =
      aulaLabel && !showSeparateAulaRow ? `${block.comision} • ${aulaLabel}` : block.comision;
    ctx.fillText(bottomText, cardX + cardW / 2, cardY + cardH - 5, innerW);

    let bottomArea = cardY + cardH - (comFontSize + 10);
    if (showSeparateAulaRow) {
      const aulaFontSize = totalLanes === 2 ? 10 : 11;
      const aulaPillH = 16;
      const aulaY = cardY + cardH - comFontSize - 7 - aulaPillH;
      ctx.font = `700 ${aulaFontSize}px ${FONT_STACK}`;
      const measuredW = Math.min(innerW, Math.ceil(ctx.measureText(aulaLabel).width) + 12);
      const pillX = cardX + (cardW - measuredW) / 2;

      drawRoundedRect(ctx, pillX, aulaY, measuredW, aulaPillH, 3);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = pal.border;
      ctx.stroke();

      ctx.fillStyle = pal.text;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(aulaLabel, cardX + cardW / 2, aulaY + aulaPillH / 2 + 0.5, measuredW - 6);
      bottomArea = aulaY - 4;
    }

    // Nombre de la materia en el centro
    const topArea = cardY + 22;
    const availH = bottomArea - topArea;

    if (availH >= 12) {
      const subjFontSize = totalLanes >= 3 ? 10 : totalLanes === 2 ? 11 : 12;
      const lineHeight = subjFontSize + 3;
      const maxLines = Math.max(1, Math.min(3, Math.floor(availH / lineHeight)));
      ctx.font = `600 ${subjFontSize}px ${FONT_STACK}`;
      ctx.fillStyle = pal.text;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      const lines = wrapTextLines(ctx, block.materiaNombre, innerW, maxLines);
      const blockTextH = lines.length * lineHeight;
      let textY = topArea + Math.max(0, (availH - blockTextH) / 2);

      for (const line of lines) {
        ctx.fillText(line, cardX + cardW / 2, textY, innerW);
        textY += lineHeight;
      }
    }

    ctx.restore();
  }

  function drawClassCards(ctx, layout, blocks, colorByMateria, minMin, totalRangeMin) {
    const { DAYS_ORDER, computeColumnLanes } = App.schedule;
    const { gridX, bodyY, timeColWidth, dayColWidth, gridHeight } = layout;

    DAYS_ORDER.forEach((day, dayIdx) => {
      const dayBlocks = computeColumnLanes(blocks.filter(b => b.dia === day));
      const colX = gridX + timeColWidth + dayIdx * dayColWidth;

      for (const b of dayBlocks) {
        const pal = colorByMateria[b.materiaId] || SUBJECT_PALETTE[0];
        const totalLanes = b.totalLanes || 1;
        const laneIndex = b.laneIndex || 0;
        const laneW = dayColWidth / totalLanes;

        const cardX = colX + laneIndex * laneW + 3;
        const cardW = laneW - 6;
        const cardY = bodyY + ((b.startMin - minMin) / totalRangeMin) * gridHeight + 2;
        const rawH = ((b.endMin - b.startMin) / totalRangeMin) * gridHeight - 4;
        const cardH = Math.max(46, rawH);

        drawSingleCard(ctx, b, pal, cardX, cardY, cardW, cardH, totalLanes);
      }
    });
  }

  function drawLegend(ctx, layout, subjects) {
    const { gridX, gridWidth, legendY, legendCols, legendRowHeight } = layout;

    ctx.fillStyle = "#6b7785";
    ctx.font = `600 12px ${FONT_STACK}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Referencias de materias", gridX, legendY);

    const legendColW = gridWidth / legendCols;
    subjects.forEach((subj, idx) => {
      const col = idx % legendCols;
      const row = Math.floor(idx / legendCols);
      const lx = gridX + col * legendColW;
      const ly = legendY + 24 + row * legendRowHeight;

      drawRoundedRect(ctx, lx, ly + 1, 14, 14, 3);
      ctx.fillStyle = subj.palette.bg;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = subj.palette.border;
      ctx.stroke();

      const label = `${subj.nombre} (${subj.comision} • ${subj.periodo} • ${subj.carga} hs)`;
      ctx.fillStyle = "#1f2933";
      ctx.font = `500 12px ${FONT_STACK}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const [fitted] = wrapTextLines(ctx, label, legendColW - 28, 1);
      ctx.fillText(fitted || label, lx + 22, ly + 2);
    });
  }

  function downloadCanvasPng(canvas, cuatFilter) {
    const suffix = cuatFilter === "all" ? "" : `-${cuatFilter}`;
    const filename = `horario-isi-2023${suffix}.png`;

    function triggerDownload(url, shouldRevoke) {
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (shouldRevoke) {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    }

    if (typeof canvas.toBlob === "function") {
      canvas.toBlob(blob => {
        if (!blob) return;
        triggerDownload(URL.createObjectURL(blob), true);
      }, "image/png");
    } else {
      triggerDownload(canvas.toDataURL("image/png"), false);
    }
  }

  function exportSchedulePng() {
    const { state } = App.store;
    const { computeHourRange } = App.schedule;

    const { subjects, blocks, colorByMateria, totalHoras } = collectExportData();
    if (subjects.length === 0 || blocks.length === 0) return;

    const { minHour, totalHours, minMin, totalRangeMin } = computeHourRange(blocks);
    const layout = computeLayout(subjects.length, totalHours);
    const scale = 2;

    const canvas = document.createElement("canvas");
    canvas.width = layout.width * scale;
    canvas.height = layout.height * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    drawDocumentHeader(ctx, layout, state.currentCuatFilter, subjects.length, totalHoras);

    // Marco recortado de la grilla + tarjetas
    ctx.save();
    drawRoundedRect(ctx, layout.gridX, layout.gridY, layout.gridWidth, layout.headerHeight + layout.gridHeight, 6);
    ctx.clip();
    drawGridFrame(ctx, layout, minHour, totalHours);
    drawClassCards(ctx, layout, blocks, colorByMateria, minMin, totalRangeMin);
    ctx.restore();

    // Borde exterior de la grilla
    drawRoundedRect(ctx, layout.gridX, layout.gridY, layout.gridWidth, layout.headerHeight + layout.gridHeight, 6);
    ctx.strokeStyle = "#d9dee5";
    ctx.lineWidth = 1;
    ctx.stroke();

    drawLegend(ctx, layout, subjects);
    downloadCanvasPng(canvas, state.currentCuatFilter);
  }

  App.exportSchedule = {
    exportSchedulePng
  };
})(window);
