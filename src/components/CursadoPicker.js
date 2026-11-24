// Componente: Panel izquierdo de Cursado — Selector de materias y chips de comisiones
(function (global) {
  const App = (global.App = global.App || {});
  App.components = App.components || {};

  function togglePreviewMateria(materiaId) {
    const { state } = App.store;
    if (state.activePreviewMateriaId === materiaId) {
      state.activePreviewMateriaId = null;
    } else {
      state.activePreviewMateriaId = materiaId;
    }
    state.hoveredPreviewOptionId = null;
    render();
    App.components.UtnCalendar.render();
  }

  function render() {
    const { MATERIAS, MATERIAS_MAP } = App.data;
    const { state, getOpcionesComision, selectComisionMateria } = App.store;
    const { evaluarHabilitacion } = App.correlativas;
    const { getEnrolledBlocksList, doesOptionConflictWithEnrolled, formatBloquesResumen } = App.schedule;

    const listContainer = document.getElementById("cursado-picker-list");
    const searchQuery = document.getElementById("search-cursado").value.trim().toLowerCase();
    const filterNivel = document.getElementById("filter-nivel-cursado").value;
    const showLocked = document.getElementById("toggle-show-locked").checked;

    // Si la materia que estaba en vista previa dejó de estar habilitada, limpiarla
    if (state.activePreviewMateriaId) {
      const matPrev = MATERIAS_MAP[state.activePreviewMateriaId];
      if (!matPrev || !evaluarHabilitacion(matPrev).habilitadaParaCursar) {
        state.activePreviewMateriaId = null;
      }
    }

    const materiasFiltradas = MATERIAS.filter(m => {
      const ev = evaluarHabilitacion(m);
      if (ev.yaAprobada || ev.yaRegular) return false;
      if (!showLocked && !ev.habilitadaParaCursar) return false;

      if (filterNivel === "electivas" && !m.electiva) return false;
      if (filterNivel !== "all" && filterNivel !== "electivas" && String(m.nivel) !== filterNivel) return false;

      if (searchQuery) {
        const matchNombre = m.nombre.toLowerCase().includes(searchQuery);
        const matchNum = m.numero.toLowerCase().includes(searchQuery);
        if (!matchNombre && !matchNum) return false;
      }
      return true;
    });

    if (materiasFiltradas.length === 0) {
      listContainer.innerHTML = `<div style="padding: 1.5rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.83rem;">
        No hay materias habilitadas para este filtro.
      </div>`;
      return;
    }

    const enrolledBlocks = getEnrolledBlocksList();

    listContainer.innerHTML = materiasFiltradas
      .map(m => {
        const ev = evaluarHabilitacion(m);
        const opciones = getOpcionesComision(m.id);
        const selectedId = state.cursosSeleccionados[m.id] || "";
        const selectedObj = opciones.find(o => o.id === selectedId);
        const isPreviewActive = state.activePreviewMateriaId === m.id;

        if (!ev.habilitadaParaCursar) {
          const faltas = [];
          if (ev.faltanRegulares.length) faltas.push(`Reg: N° ${ev.faltanRegulares.join(", ")}`);
          if (ev.faltanAprobadas.length) faltas.push(`Apr: N° ${ev.faltanAprobadas.join(", ")}`);
          return `
            <div class="picker-item locked">
              <div class="picker-radio-row">
                <div class="picker-subject-info">
                  <span class="picker-item-title">${m.nombre}</span>
                  <span class="picker-locked-reason">🔒 Bloqueada (${faltas.join(" | ")})</span>
                </div>
                <span class="picker-radio-circle disabled"></span>
              </div>
            </div>
          `;
        }

        const isIsiComision = o => /^\d+K/i.test(o.comision);
        const isiOpts = opciones.filter(isIsiComision);
        const otrasOpts = opciones.filter(o => !isIsiComision(o));
        const displayedOpts = state.showOnlyIsiInPreview && isiOpts.length > 0 ? isiOpts : opciones;

        let comisionesPillsHtml = "";
        if (isPreviewActive) {
          const pills = displayedOpts
            .map(o => {
              const hasConflict = doesOptionConflictWithEnrolled(m.id, o, enrolledBlocks);
              const isSelected = o.id === selectedId;
              const resumen = formatBloquesResumen(o.bloques);
              return `
                <button type="button"
                        class="comision-chip ${isSelected ? "chip-selected" : ""} ${hasConflict ? "chip-conflict" : ""}"
                        data-materia-id="${m.id}"
                        data-option-id="${o.id}"
                        title="${o.comision} (${o.periodo}): ${resumen}${hasConflict ? " — ⚠️ Superposición de horario" : ""}">
                  <span class="chip-code">${o.comision}</span>
                  <span class="chip-period">${o.periodo === "Anual" ? "A" : o.periodo.replace("° Cuat.", "C")}</span>
                </button>
              `;
            })
            .join("");

          const toggleExtraBtn =
            otrasOpts.length > 0 && isiOpts.length > 0
              ? `<button type="button" class="btn-toggle-extra-com" data-action="toggle-isi">
                  ${state.showOnlyIsiInPreview ? `+ Ver otras especialidades (${otrasOpts.length})` : `Ver solo Sistemas K (${isiOpts.length})`}
                </button>`
              : "";

          comisionesPillsHtml = `
            <div class="picker-preview-panel">
              <div class="picker-preview-hint">
                <span>Mostrando <strong>${displayedOpts.length}</strong> comisiones en la grilla (clic para plantar):</span>
                ${selectedId ? `<button type="button" class="btn-unplant-inline" data-unplant-id="${m.id}">Quitar ${selectedObj ? selectedObj.comision : ""}</button>` : ""}
              </div>
              <div class="comisiones-chips-grid">
                ${pills}
              </div>
              ${toggleExtraBtn}
            </div>
          `;
        }

        return `
          <div class="picker-item ${selectedId ? "enrolled" : ""} ${isPreviewActive ? "previewing" : ""}">
            <div class="picker-radio-row" data-toggle-materia="${m.id}" title="Clic para mostrar/ocultar dónde se plantan las comisiones de ${m.nombre} en la grilla">
              <div class="picker-subject-info">
                <div class="picker-title-line">
                  <span class="picker-item-title">${m.nombre}</span>
                  ${selectedObj ? `<span class="planted-badge">${selectedObj.comision}</span>` : ""}
                </div>
                <div class="picker-submeta">
                  <span>${m.nivel}° Año • ${m.carga} hs</span>
                  ${m.electiva ? `<span class="meta-tag tag-electiva">Electiva</span>` : ""}
                  ${selectedObj ? `<span class="planted-schedule-text">(${formatBloquesResumen(selectedObj.bloques)})</span>` : ""}
                </div>
              </div>

              <button type="button"
                      class="picker-radio-btn ${isPreviewActive ? "active" : ""} ${selectedId ? "has-planted" : ""}"
                      aria-label="Seleccionar ${m.nombre}"
                      data-toggle-materia="${m.id}">
                <span class="picker-radio-dot"></span>
              </button>
            </div>

            ${comisionesPillsHtml}
          </div>
        `;
      })
      .join("");

    // Clic en fila o botón circular de la materia
    listContainer.querySelectorAll("[data-toggle-materia]").forEach(el => {
      el.addEventListener("click", e => {
        e.stopPropagation();
        const mId = el.getAttribute("data-toggle-materia");
        togglePreviewMateria(mId);
      });
    });

    // Clic y hover en chips de comisión
    listContainer.querySelectorAll(".comision-chip").forEach(chip => {
      chip.addEventListener("click", e => {
        e.stopPropagation();
        const mId = chip.getAttribute("data-materia-id");
        const optId = chip.getAttribute("data-option-id");
        if (state.cursosSeleccionados[mId] === optId) {
          selectComisionMateria(mId, "");
        } else {
          selectComisionMateria(mId, optId);
        }
      });

      chip.addEventListener("mouseenter", () => {
        state.hoveredPreviewOptionId = chip.getAttribute("data-option-id");
        App.components.UtnCalendar.highlightHoveredOption(state.hoveredPreviewOptionId);
      });

      chip.addEventListener("mouseleave", () => {
        state.hoveredPreviewOptionId = null;
        App.components.UtnCalendar.highlightHoveredOption(null);
      });
    });

    // Quitar comisión plantada
    listContainer.querySelectorAll("[data-unplant-id]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const mId = btn.getAttribute("data-unplant-id");
        selectComisionMateria(mId, "");
      });
    });

    // Alternar entre solo comisiones K o todas las especialidades
    listContainer.querySelectorAll('[data-action="toggle-isi"]').forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        state.showOnlyIsiInPreview = !state.showOnlyIsiInPreview;
        render();
        App.components.UtnCalendar.render();
      });
    });
  }

  function bindEvents() {
    document.getElementById("search-cursado").addEventListener("input", render);
    document.getElementById("filter-nivel-cursado").addEventListener("change", render);
    document.getElementById("toggle-show-locked").addEventListener("change", render);
  }

  App.components.CursadoPicker = {
    togglePreviewMateria,
    render,
    bindEvents
  };
})(window);
