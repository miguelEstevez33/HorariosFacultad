// Componente: Panel izquierdo de Cursado — Selector de materias y chips de comisiones
(function (global) {
  const App = (global.App = global.App || {});
  App.components = App.components || {};

  let lastHoveredChipOptionId = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function togglePreviewMateria(materiaId) {
    App.store.toggleActivePreviewMateria(materiaId);
    render();
    App.components.UtnCalendar.render();
  }

  function matchesPickerFilters(m, ev, { filterNivel, searchQuery, showLocked }) {
    if (ev.yaAprobada || ev.yaRegular) return false;
    if (!showLocked && !ev.habilitadaParaCursar) return false;

    if (filterNivel === "electivas" && !m.electiva) return false;
    if (filterNivel !== "all" && filterNivel !== "electivas" && String(m.nivel) !== filterNivel) {
      return false;
    }

    if (searchQuery) {
      const matchNombre = m.nombre.toLowerCase().includes(searchQuery);
      const matchNum = m.numero.toLowerCase().includes(searchQuery);
      if (!matchNombre && !matchNum) return false;
    }
    return true;
  }

  function renderLockedItem(m, ev) {
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

  function renderComisionesPanel(m, opciones, selectedId, selectedObj, enrolledBlocks) {
    const { state } = App.store;
    const { isIsiComision, doesOptionConflictWithEnrolled, formatBloquesResumen } = App.schedule;

    const isiOpts = opciones.filter(isIsiComision);
    const otrasOpts = opciones.filter(o => !isIsiComision(o));
    const displayedOpts = state.showOnlyIsiInPreview && isiOpts.length > 0 ? isiOpts : opciones;

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

    return `
      <div class="picker-preview-panel">
        <div class="picker-preview-hint">
          <span>Mostrando <strong>${displayedOpts.length}</strong> comisiones en la grilla (clic para plantar):</span>
          ${
            selectedId
              ? `<div class="picker-preview-actions">
                   <button type="button" class="btn-edit-picker" data-edit-course-id="${m.id}">Editar</button>
                   <button type="button" class="btn-unplant-inline" data-unplant-id="${m.id}">Quitar ${selectedObj ? escapeHtml(selectedObj.comision) : ""}</button>
                 </div>`
              : ""
          }
        </div>
        <div class="comisiones-chips-grid">
          ${pills}
        </div>
        ${toggleExtraBtn}
      </div>
    `;
  }

  function renderPickerItem(m, ev, enrolledBlocks) {
    if (!ev.habilitadaParaCursar) {
      return renderLockedItem(m, ev);
    }

    const { state, getOpcionesComision, getEffectiveComision } = App.store;
    const { formatBloquesResumen } = App.schedule;

    const opciones = getOpcionesComision(m.id);
    const selectedId = state.cursosSeleccionados[m.id] || "";
    const selectedObj = selectedId
      ? (typeof getEffectiveComision === "function"
          ? getEffectiveComision(m.id, selectedId)
          : null) || opciones.find(o => o.id === selectedId)
      : null;
    const isPreviewActive = state.activePreviewMateriaId === m.id;
    const comisionesPillsHtml = isPreviewActive
      ? renderComisionesPanel(m, opciones, selectedId, selectedObj, enrolledBlocks)
      : "";

    return `
      <div class="picker-item ${selectedId ? "enrolled" : ""} ${isPreviewActive ? "previewing" : ""}">
        <div class="picker-radio-row" data-toggle-materia="${m.id}" title="Clic para mostrar/ocultar dónde se plantan las comisiones de ${escapeHtml(m.nombre)} en la grilla">
          <div class="picker-subject-info">
            <div class="picker-title-line">
              <span class="picker-item-title">${escapeHtml(m.nombre)}</span>
              ${selectedObj ? `<span class="planted-badge">${escapeHtml(selectedObj.comision)}</span>` : ""}
              ${
                selectedObj
                  ? `<button type="button" class="btn-edit-picker" data-edit-course-id="${m.id}" title="Editar aulas y horarios de ${escapeHtml(m.nombre)}">Editar</button>`
                  : ""
              }
            </div>
            <div class="picker-submeta">
              <span>${m.nivel}° Año • ${m.carga} hs</span>
              ${m.electiva ? `<span class="meta-tag tag-electiva">Electiva</span>` : ""}
              ${selectedObj ? `<span class="planted-schedule-text">(${escapeHtml(formatBloquesResumen(selectedObj.bloques))})</span>` : ""}
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
  }

  function render() {
    const { MATERIAS, MATERIAS_MAP } = App.data;
    const { state, setActivePreviewMateria } = App.store;
    const { evaluarHabilitacion } = App.correlativas;
    const { getEnrolledBlocksList } = App.schedule;

    const listContainer = document.getElementById("cursado-picker-list");
    if (!listContainer) return;

    const filters = {
      searchQuery: document.getElementById("search-cursado").value.trim().toLowerCase(),
      filterNivel: document.getElementById("filter-nivel-cursado").value,
      showLocked: document.getElementById("toggle-show-locked").checked
    };

    // Si la materia que estaba en vista previa dejó de estar habilitada, limpiarla
    if (state.activePreviewMateriaId) {
      const matPrev = MATERIAS_MAP[state.activePreviewMateriaId];
      if (!matPrev || !evaluarHabilitacion(matPrev).habilitadaParaCursar) {
        setActivePreviewMateria(null);
      }
    }

    const entries = MATERIAS.map(m => ({ m, ev: evaluarHabilitacion(m) })).filter(({ m, ev }) =>
      matchesPickerFilters(m, ev, filters)
    );

    lastHoveredChipOptionId = null;

    if (entries.length === 0) {
      listContainer.innerHTML = `<div style="padding: 1.5rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.83rem;">
        No hay materias habilitadas para este filtro.
      </div>`;
      return;
    }

    const enrolledBlocks = getEnrolledBlocksList();
    listContainer.innerHTML = entries
      .map(({ m, ev }) => renderPickerItem(m, ev, enrolledBlocks))
      .join("");
  }

  function bindListDelegatedEvents() {
    const listContainer = document.getElementById("cursado-picker-list");
    if (!listContainer) return;

    listContainer.addEventListener("click", e => {
      const chip = e.target.closest(".comision-chip");
      if (chip) {
        e.stopPropagation();
        const mId = chip.getAttribute("data-materia-id");
        const optId = chip.getAttribute("data-option-id");
        const isSame = App.store.state.cursosSeleccionados[mId] === optId;
        App.store.selectComisionMateria(mId, isSame ? "" : optId);
        return;
      }

      const editBtn = e.target.closest("[data-edit-course-id]");
      if (editBtn) {
        e.stopPropagation();
        if (App.components.EditCourseModal) {
          App.components.EditCourseModal.open(editBtn.getAttribute("data-edit-course-id"));
        }
        return;
      }

      const unplantBtn = e.target.closest("[data-unplant-id]");
      if (unplantBtn) {
        e.stopPropagation();
        App.store.selectComisionMateria(unplantBtn.getAttribute("data-unplant-id"), "");
        return;
      }

      const toggleIsiBtn = e.target.closest('[data-action="toggle-isi"]');
      if (toggleIsiBtn) {
        e.stopPropagation();
        App.store.toggleShowOnlyIsiInPreview();
        render();
        App.components.UtnCalendar.render();
        return;
      }

      const toggleRow = e.target.closest("[data-toggle-materia]");
      if (toggleRow) {
        e.stopPropagation();
        togglePreviewMateria(toggleRow.getAttribute("data-toggle-materia"));
      }
    });

    listContainer.addEventListener("mouseover", e => {
      const chip = e.target.closest(".comision-chip");
      const optId = chip ? chip.getAttribute("data-option-id") : null;
      if (optId !== lastHoveredChipOptionId) {
        lastHoveredChipOptionId = optId;
        App.store.setHoveredPreviewOption(optId);
        App.components.UtnCalendar.highlightHoveredOption(optId);
      }
    });

    listContainer.addEventListener("mouseleave", () => {
      if (lastHoveredChipOptionId !== null) {
        lastHoveredChipOptionId = null;
        App.store.setHoveredPreviewOption(null);
        App.components.UtnCalendar.highlightHoveredOption(null);
      }
    });
  }

  function bindEvents() {
    bindListDelegatedEvents();
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
