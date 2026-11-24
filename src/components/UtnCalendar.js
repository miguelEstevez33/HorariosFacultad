// Componente: Grilla horaria semanal estilo Autogestión UTN
(function (global) {
  const App = (global.App = global.App || {});
  App.components = App.components || {};

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

  function render() {
    const { MATERIAS_MAP } = App.data;
    const { state, getOpcionesComision, selectComisionMateria } = App.store;
    const {
      getMergedBloques,
      timeToMinutes,
      formatShortTime,
      doesOptionConflictWithEnrolled,
      computeColumnLanes
    } = App.schedule;

    const calBody = document.getElementById("utn-cal-body");
    const summaryPill = document.getElementById("enrolled-summary-pill");
    const btnClear = document.getElementById("btn-clear-plan");
    const conflictBanner = document.getElementById("conflict-alert-banner");

    const daysOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    // 1) Recolectar bloques de las comisiones inscriptas respetando el orden de selección
    for (const mId of Object.keys(state.cursosSeleccionados)) {
      if (!state.ordenCursosSeleccionados.includes(mId)) {
        state.ordenCursosSeleccionados.push(mId);
      }
    }
    state.ordenCursosSeleccionados = state.ordenCursosSeleccionados.filter(mId =>
      Boolean(state.cursosSeleccionados[mId])
    );

    const enrolledBlocks = [];
    let totalMaterias = 0;
    let totalHoras = 0;

    for (const mId of state.ordenCursosSeleccionados) {
      const optId = state.cursosSeleccionados[mId];
      const materia = MATERIAS_MAP[mId];
      if (!materia) continue;
      const opciones = getOpcionesComision(mId);
      const opt = opciones.find(o => o.id === optId);
      if (!opt) continue;

      if (state.currentCuatFilter === "1C" && opt.periodo === "2° Cuat.") continue;
      if (state.currentCuatFilter === "2C" && opt.periodo === "1° Cuat.") continue;

      totalMaterias++;
      totalHoras += materia.carga;

      for (const b of getMergedBloques(opt.bloques)) {
        enrolledBlocks.push({
          materiaId: mId,
          materiaNombre: materia.nombre.replace(/\s*\(Int\)\**/gi, ""),
          comision: opt.comision,
          optionId: opt.id,
          periodo: opt.periodo,
          dia: b.dia,
          inicio: b.inicio,
          fin: b.fin,
          startMin: timeToMinutes(b.inicio),
          endMin: timeToMinutes(b.fin),
          conflict: false,
          isConflictOverlay: false,
          sameStartConflict: false,
          sameEndConflict: false,
          isPreview: false
        });
      }
    }

    summaryPill.textContent = `${totalMaterias} ${totalMaterias === 1 ? "materia inscripta" : "materias inscriptas"} (${totalHoras} hs/sem)`;
    btnClear.disabled = Object.keys(state.cursosSeleccionados).length === 0;

    // Detectar superposiciones horarias entre materias ya inscriptas
    const conflictsList = [];
    for (let i = 0; i < enrolledBlocks.length; i++) {
      for (let j = i + 1; j < enrolledBlocks.length; j++) {
        const a = enrolledBlocks[i];
        const b = enrolledBlocks[j];
        if (a.dia === b.dia) {
          const disjointCuat =
            (a.periodo === "1° Cuat." && b.periodo === "2° Cuat.") ||
            (a.periodo === "2° Cuat." && b.periodo === "1° Cuat.");
          if (!disjointCuat && a.startMin < b.endMin && b.startMin < a.endMin) {
            b.conflict = true;
            b.isConflictOverlay = true;
            if (Math.abs(b.startMin - a.startMin) < 20) b.sameStartConflict = true;
            if (Math.abs(b.endMin - a.endMin) < 20) b.sameEndConflict = true;
            conflictsList.push(
              `${a.dia}: <strong>${b.materiaNombre} (${b.comision})</strong> se superpone sobre <strong>${a.materiaNombre} (${a.comision})</strong> (${b.inicio}-${b.fin} vs ${a.inicio}-${a.fin})`
            );
          }
        }
      }
    }

    // 2) Bloques de vista previa para la materia seleccionada en el selector
    const previewBlocks = [];
    let previewMateriaObj = null;

    if (state.activePreviewMateriaId && MATERIAS_MAP[state.activePreviewMateriaId]) {
      previewMateriaObj = MATERIAS_MAP[state.activePreviewMateriaId];
      const todasOpciones = getOpcionesComision(state.activePreviewMateriaId);
      const isIsiComision = o => /^\d+K/i.test(o.comision);
      const isiOpts = todasOpciones.filter(isIsiComision);
      const opcionesAMostrar = state.showOnlyIsiInPreview && isiOpts.length > 0 ? isiOpts : todasOpciones;
      const plantedOptionId = state.cursosSeleccionados[state.activePreviewMateriaId] || null;

      for (const opt of opcionesAMostrar) {
        if (opt.id === plantedOptionId) continue;

        if (state.currentCuatFilter === "1C" && opt.periodo === "2° Cuat.") continue;
        if (state.currentCuatFilter === "2C" && opt.periodo === "1° Cuat.") continue;

        const optionConflicts = doesOptionConflictWithEnrolled(state.activePreviewMateriaId, opt, enrolledBlocks);

        for (const b of getMergedBloques(opt.bloques)) {
          const bStart = timeToMinutes(b.inicio);
          const bEnd = timeToMinutes(b.fin);
          let blockConflictsWithOther = false;
          let sameStartConflict = false;
          let sameEndConflict = false;
          const conflictingNames = [];

          for (const eb of enrolledBlocks) {
            if (eb.materiaId === state.activePreviewMateriaId) continue;
            if (eb.dia !== b.dia) continue;
            const disjointCuat =
              (opt.periodo === "1° Cuat." && eb.periodo === "2° Cuat.") ||
              (opt.periodo === "2° Cuat." && eb.periodo === "1° Cuat.");
            if (!disjointCuat && bStart < eb.endMin && eb.startMin < bEnd) {
              blockConflictsWithOther = true;
              if (Math.abs(bStart - eb.startMin) < 20) sameStartConflict = true;
              if (Math.abs(bEnd - eb.endMin) < 20) sameEndConflict = true;
              conflictingNames.push(`${eb.materiaNombre} (${eb.comision})`);
            }
          }

          previewBlocks.push({
            materiaId: state.activePreviewMateriaId,
            materiaNombre: previewMateriaObj.nombre.replace(/\s*\(Int\)\**/gi, ""),
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
    }

    const allBlocks = [...enrolledBlocks, ...previewBlocks];

    if (conflictsList.length > 0) {
      conflictBanner.style.display = "block";
      conflictBanner.className = "conflict-banner";
      conflictBanner.innerHTML = `⚠️ <strong>Superposición horaria detectada:</strong><br>${conflictsList.join("<br>")}`;
    } else if (previewMateriaObj) {
      conflictBanner.style.display = "block";
      conflictBanner.className = "conflict-banner preview-active-banner";
      conflictBanner.innerHTML = `📍 Previsualizando dónde plantar <strong>${previewMateriaObj.nombre}</strong>: hacé clic en cualquier bloque (ej. <strong>1K1</strong>, <strong>1K2</strong>...) en la grilla para plantarla. Los bloques en <strong style="color:#fca5a5;">rojo</strong> indican que ya hay otra materia en ese día y horario.`;
    } else {
      conflictBanner.className = "conflict-banner";
      conflictBanner.style.display = "none";
    }

    // Rango horario vertical en horas enteras
    let minHour = 8;
    let maxHour = 23;

    if (allBlocks.length > 0) {
      const earliest = Math.min(...allBlocks.map(b => b.startMin));
      const latest = Math.max(...allBlocks.map(b => b.endMin));
      minHour = Math.max(7, Math.floor(earliest / 60));
      maxHour = Math.min(24, Math.ceil(latest / 60));
      if (maxHour - minHour < 8) {
        maxHour = Math.min(24, minHour + 8);
      }
    }

    const minMin = minHour * 60;
    const maxMin = maxHour * 60;
    const totalRange = maxMin - minMin;

    let stripesHtml = `<div class="utn-stripes-layer">`;
    let timeColSlotsHtml = "";

    for (let h = minHour; h < maxHour; h++) {
      const hLabel = `${h}:00`;
      stripesHtml += `<div class="utn-stripe-band"></div>`;
      timeColSlotsHtml += `<div class="utn-time-slot"><span>${hLabel}</span></div>`;
    }
    stripesHtml += `</div>`;

    const timeColHtml = `<div class="utn-time-column">${timeColSlotsHtml}</div>`;

    let colsHtml = "";
    for (const dayName of daysOrder) {
      const baseDayBlocks = computeColumnLanes(
        enrolledBlocks.filter(b => b.dia === dayName && !b.isConflictOverlay)
      );
      const overlayDayBlocks = computeColumnLanes([
        ...enrolledBlocks.filter(b => b.dia === dayName && b.isConflictOverlay),
        ...previewBlocks.filter(b => b.dia === dayName)
      ]);
      const dayBlocks = [...baseDayBlocks, ...overlayDayBlocks];

      const cardsHtml = dayBlocks
        .map(b => {
          const topPct = ((b.startMin - minMin) / totalRange) * 100;
          const heightPct = Math.max(7.5, ((b.endMin - b.startMin) / totalRange) * 100);
          const timeLabel = `${formatShortTime(b.inicio)} — ${formatShortTime(b.fin)}hs`;

          const totalLanes = b.totalLanes || 1;
          const laneIndex = b.laneIndex || 0;
          const widthPct = 100 / totalLanes;
          const leftPct = laneIndex * widthPct;
          const isTwoLanes = totalLanes === 2;
          const isCompactLane = totalLanes >= 3;

          const isRedConflict = Boolean(b.conflict);
          const cardClasses = [
            "utn-class-card",
            b.isPreview ? "is-preview-card" : "is-enrolled-card",
            isRedConflict ? "has-conflict" : "",
            isRedConflict && b.sameStartConflict ? "has-same-start-conflict" : "",
            isRedConflict && b.sameEndConflict ? "has-same-end-conflict" : "",
            isTwoLanes ? "is-two-lanes" : "",
            isCompactLane ? "is-compact-lane" : ""
          ]
            .filter(Boolean)
            .join(" ");

          const tooltipText = b.isPreview
            ? b.conflict
              ? `⚠️ Choca con ${b.conflictingNames && b.conflictingNames.length ? b.conflictingNames.join(", ") : "otra materia plantada en otro día"} — Clic para plantar igual ${b.materiaNombre} (${b.comision} - ${b.periodo})`
              : `Clic para plantar ${b.materiaNombre} en comisión ${b.comision} (${b.periodo}: ${timeLabel})`
            : `Inscripto: ${b.materiaNombre} (${b.comision} - ${b.periodo}). Clic para ver opciones o cambiar.`;

          const statusText = b.isPreview
            ? b.conflict
              ? "(Ocupado / Choque)"
              : "(Plantar aquí)"
            : "(Inscripto)";

          return `
            <div class="${cardClasses}"
                 style="top: ${topPct.toFixed(2)}%; height: ${heightPct.toFixed(2)}%; left: calc(${leftPct.toFixed(2)}% + 2px); width: calc(${widthPct.toFixed(2)}% - 4px);"
                 data-materia-id="${b.materiaId}"
                 data-option-id="${b.optionId}"
                 data-is-preview="${b.isPreview ? "1" : "0"}"
                 title="${tooltipText}">
              <div class="utn-card-time">${timeLabel}</div>
              <div class="utn-card-subject">${b.materiaNombre}</div>
              <div class="utn-card-status">${statusText}</div>
              <div class="utn-card-comision">${b.comision}</div>
            </div>
          `;
        })
        .join("");

      colsHtml += `<div class="utn-day-column">${cardsHtml}</div>`;
    }

    const emptyOverlayHtml =
      allBlocks.length === 0
        ? `<div class="utn-empty-overlay">
            <div class="utn-empty-box">
              <h3>Tu grilla de horarios está vacía</h3>
              <p>Seleccioná una materia (ej. <strong>Álgebra</strong>) en la lista de <strong>Materias</strong> de la izquierda para ver en qué días y horarios se plantan sus comisiones (<strong>1K1</strong>, <strong>1K2</strong>, <strong>1K3</strong>...).</p>
            </div>
          </div>`
        : "";

    calBody.innerHTML = stripesHtml + timeColHtml + colsHtml + emptyOverlayHtml;

    calBody.querySelectorAll(".utn-class-card").forEach(card => {
      const mId = card.getAttribute("data-materia-id");
      const optId = card.getAttribute("data-option-id");
      const isPrev = card.getAttribute("data-is-preview") === "1";

      card.addEventListener("click", () => {
        if (isPrev) {
          selectComisionMateria(mId, optId);
        } else {
          App.components.CursadoPicker.togglePreviewMateria(mId);
        }
      });

      card.addEventListener("mouseenter", () => {
        if (state.activePreviewMateriaId) {
          highlightHoveredOption(optId);
        }
      });

      card.addEventListener("mouseleave", () => {
        if (state.activePreviewMateriaId) {
          highlightHoveredOption(null);
        }
      });
    });
  }

  function bindEvents() {
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
  }

  App.components.UtnCalendar = {
    highlightHoveredOption,
    render,
    bindEvents
  };
})(window);
