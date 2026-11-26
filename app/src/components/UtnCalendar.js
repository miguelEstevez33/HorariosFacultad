// Componente: Grilla horaria semanal estilo Autogestión UTN
(function (global) {
  const App = (global.App = global.App || {});
  App.components = App.components || {};

  let lastHoveredOptionId = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function highlightHoveredOption(optionId) {
    const allCards = document.querySelectorAll(".utn-class-card");
    allCards.forEach(card => {
      const cardOptId = card.getAttribute("data-option-id");
      if (!optionId) {
        card.classList.remove("is-hovered-option", "is-dimmed-preview");
      } else if (cardOptId === optionId) {
        card.classList.add("is-hovered-option");
        card.classList.remove("is-dimmed-preview");
      } else if (card.classList.contains("is-preview-card")) {
        card.classList.add("is-dimmed-preview");
        card.classList.remove("is-hovered-option");
      }
    });
  }

  function buildPreviewBlocks(enrolledBlocks) {
    const { MATERIAS_MAP } = App.data;
    const { state, getOpcionesComision } = App.store;
    const {
      CONFLICT_EDGE_TOLERANCE_MIN,
      cleanMateriaName,
      isIsiComision,
      matchesCuatFilter,
      blocksOverlap,
      getMergedBloques,
      timeToMinutes,
      doesOptionConflictWithEnrolled
    } = App.schedule;

    const activeId = state.activePreviewMateriaId;
    if (!activeId || !MATERIAS_MAP[activeId]) {
      return { previewBlocks: [], previewMateriaObj: null };
    }

    const previewMateriaObj = MATERIAS_MAP[activeId];
    const todasOpciones = getOpcionesComision(activeId);
    const isiOpts = todasOpciones.filter(isIsiComision);
    const opcionesAMostrar = state.showOnlyIsiInPreview && isiOpts.length > 0 ? isiOpts : todasOpciones;
    const plantedOptionId = state.cursosSeleccionados[activeId] || null;
    const materiaNombre = cleanMateriaName(previewMateriaObj.nombre);
    const previewBlocks = [];

    for (const opt of opcionesAMostrar) {
      if (opt.id === plantedOptionId) continue;
      if (!matchesCuatFilter(opt.periodo, state.currentCuatFilter)) continue;

      const optionConflicts = doesOptionConflictWithEnrolled(activeId, opt, enrolledBlocks);

      for (const b of getMergedBloques(opt.bloques)) {
        const bStart = timeToMinutes(b.inicio);
        const bEnd = timeToMinutes(b.fin);
        const candidate = { dia: b.dia, periodo: opt.periodo, startMin: bStart, endMin: bEnd };

        let blockConflictsWithOther = false;
        let sameStartConflict = false;
        let sameEndConflict = false;
        const conflictingNames = [];

        for (const eb of enrolledBlocks) {
          if (eb.materiaId === activeId) continue;
          if (blocksOverlap(candidate, eb)) {
            blockConflictsWithOther = true;
            if (Math.abs(bStart - eb.startMin) < CONFLICT_EDGE_TOLERANCE_MIN) sameStartConflict = true;
            if (Math.abs(bEnd - eb.endMin) < CONFLICT_EDGE_TOLERANCE_MIN) sameEndConflict = true;
            conflictingNames.push(`${eb.materiaNombre} (${eb.comision})`);
          }
        }

        previewBlocks.push({
          materiaId: activeId,
          materiaNombre,
          comision: opt.comision,
          optionId: opt.id,
          periodo: opt.periodo,
          dia: b.dia,
          inicio: b.inicio,
          fin: b.fin,
          startMin: bStart,
          endMin: bEnd,
          conflict: blockConflictsWithOther || optionConflicts,
          blockDirectConflict: blockConflictsWithOther,
          sameStartConflict,
          sameEndConflict,
          conflictingNames,
          isPreview: true
        });
      }
    }

    return { previewBlocks, previewMateriaObj };
  }

  function renderBanner(conflictBanner, conflicts, previewMateriaObj) {
    if (conflicts.length > 0) {
      const lines = conflicts.map(
        ({ dia, a, b }) =>
          `${dia}: <strong>${b.materiaNombre} (${b.comision})</strong> se superpone sobre <strong>${a.materiaNombre} (${a.comision})</strong> (${b.inicio}-${b.fin} vs ${a.inicio}-${a.fin})`
      );
      conflictBanner.style.display = "block";
      conflictBanner.className = "conflict-banner";
      conflictBanner.innerHTML = `⚠️ <strong>Superposición horaria detectada:</strong><br>${lines.join("<br>")}`;
    } else if (previewMateriaObj) {
      conflictBanner.style.display = "block";
      conflictBanner.className = "conflict-banner preview-active-banner";
      conflictBanner.innerHTML = `📍 Previsualizando dónde plantar <strong>${previewMateriaObj.nombre}</strong>: hacé clic en cualquier bloque (ej. <strong>1K1</strong>, <strong>1K2</strong>...) en la grilla para plantarla. Los bloques en <strong style="color: var(--danger);">rojo</strong> indican que ya hay otra materia en ese día y horario.`;
    } else {
      conflictBanner.className = "conflict-banner";
      conflictBanner.style.display = "none";
    }
  }

  function renderTimeColumnAndStripes(minHour, maxHour) {
    let stripesInner = "";
    let timeColSlotsHtml = "";

    for (let h = minHour; h < maxHour; h++) {
      stripesInner += `<div class="utn-stripe-band"></div>`;
      timeColSlotsHtml += `<div class="utn-time-slot"><span>${h}:00</span></div>`;
    }

    return `<div class="utn-stripes-layer">${stripesInner}</div><div class="utn-time-column">${timeColSlotsHtml}</div>`;
  }

  function renderClassCard(b, minMin, totalRangeMin) {
    const { formatShortTime, formatAulaLabel } = App.schedule;
    const topPct = ((b.startMin - minMin) / totalRangeMin) * 100;
    const heightPct = Math.max(7.5, ((b.endMin - b.startMin) / totalRangeMin) * 100);
    const timeLabel = `${formatShortTime(b.inicio)} — ${formatShortTime(b.fin)}hs`;

    const totalLanes = b.totalLanes || 1;
    const laneIndex = b.laneIndex || 0;
    const widthPct = 100 / totalLanes;
    const leftPct = laneIndex * widthPct;

    const isRedConflict = Boolean(b.conflict);
    const cardClasses = [
      "utn-class-card",
      b.isPreview ? "is-preview-card" : "is-enrolled-card",
      isRedConflict ? "has-conflict" : "",
      isRedConflict && b.sameStartConflict ? "has-same-start-conflict" : "",
      isRedConflict && b.sameEndConflict ? "has-same-end-conflict" : "",
      totalLanes === 2 ? "is-two-lanes" : "",
      totalLanes >= 3 ? "is-compact-lane" : ""
    ]
      .filter(Boolean)
      .join(" ");

    const aulaLabel = !b.isPreview && b.aula ? formatAulaLabel(b.aula) : "";
    const safeNombre = escapeHtml(b.materiaNombre);
    const safeComision = escapeHtml(b.comision);
    const safePeriodo = escapeHtml(b.periodo);
    const safeAula = escapeHtml(aulaLabel);

    const tooltipText = b.isPreview
      ? b.conflict
        ? `⚠️ Choca con ${escapeHtml(
            b.conflictingNames && b.conflictingNames.length
              ? b.conflictingNames.join(", ")
              : "otra materia plantada en otro día"
          )} — Clic para plantar igual ${safeNombre} (${safeComision} - ${safePeriodo})`
        : `Clic para plantar ${safeNombre} en comisión ${safeComision} (${safePeriodo}: ${timeLabel})`
      : `Inscripto: ${safeNombre} (${safeComision} - ${safePeriodo})${safeAula ? ` • ${safeAula}` : ""}. Clic para ver opciones o cambiar.`;

    const statusHtml = b.isPreview
      ? `<div class="utn-card-status">${b.conflict ? "(Ocupado / Choque)" : "(Plantar aquí)"}</div>`
      : aulaLabel
      ? `<div class="utn-card-aula" title="${safeAula}">${safeAula}</div>`
      : `<div class="utn-card-status">(Inscripto)</div>`;

    const topRowHtml = b.isPreview
      ? `<div class="utn-card-time">${timeLabel}</div>`
      : `<div class="utn-card-top">
           <div class="utn-card-time">${timeLabel}</div>
           <button type="button"
                   class="utn-card-edit-btn"
                   data-edit-materia="${escapeHtml(b.materiaId)}"
                   title="Editar curso y aulas"
                   aria-label="Editar ${safeNombre}">✎</button>
         </div>`;

    return `
      <div class="${cardClasses}"
           style="top: ${topPct.toFixed(2)}%; height: ${heightPct.toFixed(2)}%; left: calc(${leftPct.toFixed(2)}% + 2px); width: calc(${widthPct.toFixed(2)}% - 4px);"
           data-materia-id="${escapeHtml(b.materiaId)}"
           data-option-id="${escapeHtml(b.optionId)}"
           data-is-preview="${b.isPreview ? "1" : "0"}"
           title="${tooltipText}">
        ${topRowHtml}
        <div class="utn-card-subject">${safeNombre}</div>
        ${statusHtml}
        <div class="utn-card-comision">${safeComision}</div>
      </div>
    `;
  }

  function renderDayColumns(enrolledBlocks, previewBlocks, minMin, totalRangeMin) {
    const { DAYS_ORDER, computeColumnLanes } = App.schedule;

    return DAYS_ORDER.map(dayName => {
      const baseDayBlocks = computeColumnLanes(
        enrolledBlocks.filter(b => b.dia === dayName && !b.isConflictOverlay)
      );
      const overlayDayBlocks = computeColumnLanes([
        ...enrolledBlocks.filter(b => b.dia === dayName && b.isConflictOverlay),
        ...previewBlocks.filter(b => b.dia === dayName)
      ]);
      const cardsHtml = [...baseDayBlocks, ...overlayDayBlocks]
        .map(b => renderClassCard(b, minMin, totalRangeMin))
        .join("");

      return `<div class="utn-day-column">${cardsHtml}</div>`;
    }).join("");
  }

  function render() {
    const { state } = App.store;
    const {
      collectEnrolledSchedule,
      detectEnrolledConflicts,
      computeHourRange
    } = App.schedule;

    const calBody = document.getElementById("utn-cal-body");
    const summaryPill = document.getElementById("enrolled-summary-pill");
    const btnClear = document.getElementById("btn-clear-plan");
    const btnEditCourses = document.getElementById("btn-edit-courses");
    const btnExport = document.getElementById("btn-export-schedule");
    const conflictBanner = document.getElementById("conflict-alert-banner");

    const { blocks: rawEnrolledBlocks, totalMaterias, totalHoras } = collectEnrolledSchedule();
    const { blocks: enrolledBlocks, conflicts } = detectEnrolledConflicts(rawEnrolledBlocks);

    const hasAnySelected = Object.keys(state.cursosSeleccionados).length > 0;
    summaryPill.textContent = `${totalMaterias} ${totalMaterias === 1 ? "materia inscripta" : "materias inscriptas"} (${totalHoras} hs/sem)`;
    btnClear.disabled = !hasAnySelected;
    if (btnEditCourses) {
      btnEditCourses.disabled = !hasAnySelected;
    }
    if (btnExport) {
      btnExport.disabled = totalMaterias === 0;
    }

    const { previewBlocks, previewMateriaObj } = buildPreviewBlocks(enrolledBlocks);
    const allBlocks = [...enrolledBlocks, ...previewBlocks];

    renderBanner(conflictBanner, conflicts, previewMateriaObj);

    const { minHour, maxHour, minMin, totalRangeMin } = computeHourRange(allBlocks);
    const gridChromeHtml = renderTimeColumnAndStripes(minHour, maxHour);
    const colsHtml = renderDayColumns(enrolledBlocks, previewBlocks, minMin, totalRangeMin);

    const emptyOverlayHtml =
      allBlocks.length === 0
        ? `<div class="utn-empty-overlay">
            <div class="utn-empty-box">
              <h3>Tu grilla de horarios está vacía</h3>
              <p>Seleccioná una materia (ej. <strong>Álgebra</strong>) en la lista de <strong>Materias</strong> de la izquierda para ver en qué días y horarios se plantan sus comisiones (<strong>1K1</strong>, <strong>1K2</strong>, <strong>1K3</strong>...).</p>
            </div>
          </div>`
        : "";

    lastHoveredOptionId = null;
    calBody.innerHTML = gridChromeHtml + colsHtml + emptyOverlayHtml;
  }

  function bindCalendarDelegatedEvents() {
    const calBody = document.getElementById("utn-cal-body");
    if (!calBody) return;

    calBody.addEventListener("click", e => {
      const editBtn = e.target.closest("[data-edit-materia]");
      if (editBtn) {
        e.stopPropagation();
        if (App.components.EditCourseModal) {
          App.components.EditCourseModal.open(editBtn.getAttribute("data-edit-materia"));
        }
        return;
      }

      const card = e.target.closest(".utn-class-card");
      if (!card) return;
      const mId = card.getAttribute("data-materia-id");
      const optId = card.getAttribute("data-option-id");
      const isPrev = card.getAttribute("data-is-preview") === "1";

      if (isPrev) {
        App.store.selectComisionMateria(mId, optId);
      } else {
        App.components.CursadoPicker.togglePreviewMateria(mId);
      }
    });

    calBody.addEventListener("mouseover", e => {
      if (!App.store.state.activePreviewMateriaId) return;
      const card = e.target.closest(".utn-class-card");
      const optId = card ? card.getAttribute("data-option-id") : null;
      if (optId !== lastHoveredOptionId) {
        lastHoveredOptionId = optId;
        highlightHoveredOption(optId);
      }
    });

    calBody.addEventListener("mouseleave", () => {
      if (!App.store.state.activePreviewMateriaId) return;
      if (lastHoveredOptionId !== null) {
        lastHoveredOptionId = null;
        highlightHoveredOption(null);
      }
    });
  }

  function bindEvents() {
    bindCalendarDelegatedEvents();

    document.querySelectorAll(".cuat-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".cuat-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        App.store.state.currentCuatFilter = btn.getAttribute("data-cuat");
        render();
      });
    });

    document.getElementById("btn-clear-plan").addEventListener("click", () => {
      App.store.clearPlan();
    });

    const btnEditCourses = document.getElementById("btn-edit-courses");
    if (btnEditCourses) {
      btnEditCourses.addEventListener("click", () => {
        if (App.components.EditCourseModal) {
          App.components.EditCourseModal.open();
        }
      });
    }

    const btnExport = document.getElementById("btn-export-schedule");
    if (btnExport) {
      btnExport.addEventListener("click", () => {
        if (App.exportSchedule && typeof App.exportSchedule.exportSchedulePng === "function") {
          App.exportSchedule.exportSchedulePng();
        }
      });
    }
  }

  App.components.UtnCalendar = {
    highlightHoveredOption,
    render,
    bindEvents
  };
})(window);
