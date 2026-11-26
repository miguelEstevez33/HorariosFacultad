// Componente: Modal para editar cursos inscriptos (aulas por bloque y horarios)
(function (global) {
  const App = (global.App = global.App || {});
  App.components = App.components || {};

  let drafts = {};
  let filterMateriaId = "all";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isOpen() {
    const modal = document.getElementById("edit-course-modal");
    return Boolean(modal && modal.style.display !== "none");
  }

  function getOrderedEditableEntries() {
    const { MATERIAS_MAP } = App.data;
    const { state, getOpcionesComision } = App.store;
    const { getOrderedEnrolledIds } = App.schedule;

    const orderedIds = getOrderedEnrolledIds(state);
    const entries = [];

    for (const mId of orderedIds) {
      const optionId = state.cursosSeleccionados[mId];
      const materia = MATERIAS_MAP[mId];
      if (!materia || !optionId) continue;
      const baseOpt = getOpcionesComision(mId).find(o => o.id === optionId);
      if (!baseOpt) continue;
      entries.push({ materia, optionId, baseOpt });
    }
    return entries;
  }

  function clearError() {
    const errorEl = document.getElementById("edit-course-error");
    if (!errorEl) return;
    errorEl.style.display = "none";
    errorEl.textContent = "";
  }

  function showError(message) {
    const errorEl = document.getElementById("edit-course-error");
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }

  function cloneBloquesSorted(bloques) {
    const { getMergedBloques, sortBloquesBySchedule } = App.schedule;
    return sortBloquesBySchedule(getMergedBloques(bloques)).map(b => ({
      dia: b.dia,
      inicio: b.inicio,
      fin: b.fin,
      aula: b.aula ? String(b.aula) : ""
    }));
  }

  function isDraftDifferentFromBase(draftBloques, baseOpt) {
    const { getMergedBloques, sortBloquesBySchedule } = App.schedule;
    const baseList = sortBloquesBySchedule(getMergedBloques(baseOpt.bloques));
    const draftList = sortBloquesBySchedule(draftBloques);
    if (draftList.length !== baseList.length) return true;
    return draftList.some((b, idx) => {
      const base = baseList[idx];
      return (
        String(b.aula || "").trim() !== "" ||
        b.dia !== base.dia ||
        b.inicio !== base.inicio ||
        b.fin !== base.fin
      );
    });
  }

  function open(materiaId = null) {
    const entries = getOrderedEditableEntries();
    if (entries.length === 0) return;

    const { getEffectiveComision } = App.store;
    drafts = {};
    for (const { materia, optionId, baseOpt } of entries) {
      const effective = getEffectiveComision(materia.id, optionId) || baseOpt;
      drafts[materia.id] = cloneBloquesSorted(effective.bloques);
    }

    filterMateriaId = materiaId && drafts[materiaId] ? materiaId : "all";
    clearError();

    const modal = document.getElementById("edit-course-modal");
    if (!modal) return;
    modal.style.display = "flex";
    render();
  }

  function close() {
    const modal = document.getElementById("edit-course-modal");
    if (modal) {
      modal.style.display = "none";
    }
    drafts = {};
    filterMateriaId = "all";
    clearError();
  }

  function renderFilterSelect(entries) {
    const filterEl = document.getElementById("edit-course-filter");
    if (!filterEl) return;

    const optionsHtml = [
      `<option value="all">Todas las materias inscriptas (${entries.length})</option>`,
      ...entries.map(
        ({ materia, baseOpt }) =>
          `<option value="${escapeHtml(materia.id)}">${escapeHtml(materia.numero)} - ${escapeHtml(
            materia.nombre
          )} (${escapeHtml(baseOpt.comision)})</option>`
      )
    ].join("");

    filterEl.innerHTML = optionsHtml;
    filterEl.value = filterMateriaId;
  }

  function renderBlockRow(materiaId, block, idx, totalBlocks) {
    const { DAYS_ORDER } = App.schedule;
    const dayOptions = DAYS_ORDER.map(
      dia => `<option value="${dia}"${block.dia === dia ? " selected" : ""}>${dia}</option>`
    ).join("");

    return `
      <div class="edit-block-row" data-materia-id="${escapeHtml(materiaId)}" data-block-index="${idx}">
        <select class="select-control select-sm edit-block-dia" data-field="dia" aria-label="Día del bloque ${idx + 1}">
          ${dayOptions}
        </select>
        <input type="time"
               class="edit-block-time"
               data-field="inicio"
               value="${escapeHtml(block.inicio)}"
               aria-label="Hora de inicio del bloque ${idx + 1}" />
        <input type="time"
               class="edit-block-time"
               data-field="fin"
               value="${escapeHtml(block.fin)}"
               aria-label="Hora de fin del bloque ${idx + 1}" />
        <input type="text"
               class="edit-block-aula"
               data-field="aula"
               maxlength="40"
               placeholder="Aula (ej: 200, Lab 1)"
               value="${escapeHtml(block.aula || "")}"
               aria-label="Aula del bloque ${idx + 1}" />
        <button type="button"
                class="btn-remove-block"
                data-action="remove-block"
                data-materia-id="${escapeHtml(materiaId)}"
                data-block-index="${idx}"
                ${totalBlocks <= 1 ? "disabled" : ""}
                title="${totalBlocks <= 1 ? "El curso debe tener al menos un bloque" : "Eliminar bloque"}"
                aria-label="Eliminar bloque ${idx + 1}">&times;</button>
      </div>
    `;
  }

  function renderCourseCard({ materia, baseOpt }) {
    const bloques = drafts[materia.id] || [];
    const isModified = isDraftDifferentFromBase(bloques, baseOpt);

    const rowsHtml = bloques
      .map((blk, idx) => renderBlockRow(materia.id, blk, idx, bloques.length))
      .join("");

    return `
      <div class="edit-course-card" data-course-card="${escapeHtml(materia.id)}">
        <div class="edit-course-card-header">
          <div class="edit-course-card-title">
            <span class="subject-num">${escapeHtml(materia.numero)}</span>
            <span class="edit-course-name">${escapeHtml(materia.nombre)}</span>
            <span class="planted-badge">${escapeHtml(baseOpt.comision)}</span>
            <span class="meta-tag">${escapeHtml(baseOpt.periodo)}</span>
            ${isModified ? `<span class="edit-course-badge">Editado</span>` : ""}
          </div>
          <button type="button"
                  class="btn btn-secondary btn-sm"
                  data-action="reset-course"
                  data-materia-id="${escapeHtml(materia.id)}"
                  ${!isModified ? "disabled" : ""}
                  title="Restaurar horarios originales de ${escapeHtml(baseOpt.comision)} y quitar aulas">
            Restaurar original
          </button>
        </div>

        <div class="edit-blocks-header" aria-hidden="true">
          <span>Día</span>
          <span>Inicio</span>
          <span>Fin</span>
          <span>Aula / Lugar</span>
          <span></span>
        </div>

        <div class="edit-blocks-list">
          ${rowsHtml}
        </div>

        <div class="edit-course-card-footer">
          <button type="button"
                  class="btn-toggle-extra-com"
                  data-action="add-block"
                  data-materia-id="${escapeHtml(materia.id)}">
            + Agregar bloque
          </button>
        </div>
      </div>
    `;
  }

  function render() {
    const listEl = document.getElementById("edit-course-list");
    if (!listEl) return;

    const entries = getOrderedEditableEntries();
    if (entries.length === 0) {
      close();
      return;
    }

    if (filterMateriaId !== "all" && !entries.some(e => e.materia.id === filterMateriaId)) {
      filterMateriaId = "all";
    }

    renderFilterSelect(entries);

    const visibleEntries =
      filterMateriaId === "all"
        ? entries
        : entries.filter(e => e.materia.id === filterMateriaId);

    listEl.innerHTML = visibleEntries.map(renderCourseCard).join("");
  }

  function handleBlockFieldChange(target) {
    const field = target.getAttribute("data-field");
    if (!field) return;
    const row = target.closest(".edit-block-row");
    if (!row) return;
    const mId = row.getAttribute("data-materia-id");
    const idx = Number(row.getAttribute("data-block-index"));
    if (!drafts[mId] || !drafts[mId][idx]) return;

    drafts[mId][idx] = {
      ...drafts[mId][idx],
      [field]: target.value
    };
    clearError();
  }

  function addBlockToDraft(materiaId) {
    const { DAYS_ORDER } = App.schedule;
    const list = drafts[materiaId];
    if (!list) return;

    const usedDays = new Set(list.map(b => b.dia));
    const nextDay = DAYS_ORDER.find(d => !usedDays.has(d)) || (list[list.length - 1] && list[list.length - 1].dia) || "Lunes";

    drafts[materiaId] = [
      ...list,
      { dia: nextDay, inicio: "08:00", fin: "09:30", aula: "" }
    ];
    clearError();
    render();
  }

  function removeBlockFromDraft(materiaId, blockIndex) {
    const list = drafts[materiaId];
    if (!list || list.length <= 1) return;
    drafts[materiaId] = list.filter((_, i) => i !== blockIndex);
    clearError();
    render();
  }

  function resetDraftCourse(materiaId) {
    const entry = getOrderedEditableEntries().find(e => e.materia.id === materiaId);
    if (!entry) return;
    drafts[materiaId] = cloneBloquesSorted(entry.baseOpt.bloques);
    clearError();
    render();
  }

  function saveAllDrafts() {
    const { MATERIAS_MAP } = App.data;
    const result = App.store.saveCursosEditadosBatch(drafts);
    if (!result.ok) {
      const mat = result.materiaId ? MATERIAS_MAP[result.materiaId] : null;
      const prefix = mat ? `En ${mat.nombre}: ` : "";
      showError(`${prefix}${result.error}`);
      return;
    }
    close();
  }

  function bindEvents() {
    const modal = document.getElementById("edit-course-modal");
    const filterEl = document.getElementById("edit-course-filter");
    const listEl = document.getElementById("edit-course-list");
    const btnClose = document.getElementById("btn-close-edit-course");
    const btnCancel = document.getElementById("btn-cancel-edit-course");
    const btnSave = document.getElementById("btn-save-edit-course");

    if (!modal) return;

    if (filterEl) {
      filterEl.addEventListener("change", () => {
        filterMateriaId = filterEl.value || "all";
        render();
      });
    }

    if (listEl) {
      listEl.addEventListener("input", e => handleBlockFieldChange(e.target));
      listEl.addEventListener("change", e => handleBlockFieldChange(e.target));
      listEl.addEventListener("click", e => {
        const actionEl = e.target.closest("[data-action]");
        if (!actionEl) return;
        const action = actionEl.getAttribute("data-action");
        const mId = actionEl.getAttribute("data-materia-id");

        if (action === "add-block") {
          addBlockToDraft(mId);
        } else if (action === "remove-block") {
          removeBlockFromDraft(mId, Number(actionEl.getAttribute("data-block-index")));
        } else if (action === "reset-course") {
          resetDraftCourse(mId);
        }
      });
    }

    if (btnClose) btnClose.addEventListener("click", close);
    if (btnCancel) btnCancel.addEventListener("click", close);
    if (btnSave) btnSave.addEventListener("click", saveAllDrafts);

    modal.addEventListener("click", e => {
      if (e.target === modal) close();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && isOpen()) {
        close();
      }
    });
  }

  App.components.EditCourseModal = {
    isOpen,
    open,
    close,
    render,
    bindEvents
  };
})(window);
