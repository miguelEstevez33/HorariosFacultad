// Componente: Modal para editar aulas de los cursos inscriptos
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

  function blockKey(b) {
    return `${b.dia}|${b.inicio}|${b.fin}`;
  }

  function cloneBaseBloquesWithAulas(baseBloques, effectiveBloques) {
    const { getMergedBloques, sortBloquesBySchedule } = App.schedule;
    const aulaByKey = new Map();
    if (Array.isArray(effectiveBloques)) {
      for (const b of sortBloquesBySchedule(getMergedBloques(effectiveBloques))) {
        if (b.aula) {
          aulaByKey.set(blockKey(b), String(b.aula));
        }
      }
    }
    return sortBloquesBySchedule(getMergedBloques(baseBloques)).map(b => ({
      dia: b.dia,
      inicio: b.inicio,
      fin: b.fin,
      aula: aulaByKey.get(blockKey(b)) || ""
    }));
  }

  function isDraftModified(draftBloques) {
    return Array.isArray(draftBloques) && draftBloques.some(b => String(b.aula || "").trim() !== "");
  }

  function open(materiaId = null) {
    const entries = getOrderedEditableEntries();
    if (entries.length === 0) return;

    const { getEffectiveComision } = App.store;
    drafts = {};
    for (const { materia, optionId, baseOpt } of entries) {
      const effective = getEffectiveComision(materia.id, optionId) || baseOpt;
      drafts[materia.id] = cloneBaseBloquesWithAulas(baseOpt.bloques, effective.bloques);
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

  function renderEdificioBadgeHtml(aula) {
    const { resolveEdificioByAula } = App.schedule;
    const info = resolveEdificioByAula ? resolveEdificioByAula(aula) : null;
    if (!info) {
      return `<span class="edit-block-edificio is-empty" title="Escribí un número de aula para ver el edificio">—</span>`;
    }
    return `<span class="edit-block-edificio is-detected" title="${escapeHtml(info.fullLabel)}">${escapeHtml(info.shortLabel)}</span>`;
  }

  function renderBlockRow(materiaId, block, idx) {
    return `
      <div class="edit-block-row" data-materia-id="${escapeHtml(materiaId)}" data-block-index="${idx}">
        <span class="edit-block-static edit-block-dia-text">${escapeHtml(block.dia)}</span>
        <span class="edit-block-static edit-block-time-text">${escapeHtml(block.inicio)}</span>
        <span class="edit-block-static edit-block-time-text edit-block-time-end">${escapeHtml(block.fin)}</span>
        <input type="text"
               class="edit-block-aula"
               data-field="aula"
               maxlength="40"
               placeholder="Aula (ej: 205, 610, A3)"
               value="${escapeHtml(block.aula || "")}"
               aria-label="Aula del bloque ${escapeHtml(block.dia)} ${escapeHtml(block.inicio)} a ${escapeHtml(block.fin)}" />
        ${renderEdificioBadgeHtml(block.aula)}
      </div>
    `;
  }

  function renderCourseCard({ materia, baseOpt }) {
    const bloques = drafts[materia.id] || [];
    const isModified = isDraftModified(bloques);

    const rowsHtml = bloques
      .map((blk, idx) => renderBlockRow(materia.id, blk, idx))
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
                  title="Quitar aulas asignadas de ${escapeHtml(baseOpt.comision)}">
            Restaurar original
          </button>
        </div>

        <div class="edit-blocks-header" aria-hidden="true">
          <span>Día</span>
          <span>Inicio</span>
          <span>Fin</span>
          <span>Aula / Lugar</span>
          <span>Edificio</span>
        </div>

        <div class="edit-blocks-list">
          ${rowsHtml}
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

  function updateRowEdificioBadge(row, aulaValue) {
    if (!row || typeof row.querySelector !== "function") return;
    const badgeEl = row.querySelector(".edit-block-edificio");
    if (!badgeEl) return;
    const { resolveEdificioByAula } = App.schedule;
    const info = resolveEdificioByAula ? resolveEdificioByAula(aulaValue) : null;
    if (info) {
      badgeEl.textContent = info.shortLabel;
      badgeEl.title = info.fullLabel;
      badgeEl.classList.remove("is-empty");
      badgeEl.classList.add("is-detected");
    } else {
      badgeEl.textContent = "—";
      badgeEl.title = "Escribí un número de aula para ver el edificio";
      badgeEl.classList.remove("is-detected");
      badgeEl.classList.add("is-empty");
    }
  }

  function handleBlockFieldChange(target) {
    const field = target.getAttribute("data-field");
    if (field !== "aula") return;
    const row = target.closest(".edit-block-row");
    if (!row) return;
    const mId = row.getAttribute("data-materia-id");
    const idx = Number(row.getAttribute("data-block-index"));
    if (!drafts[mId] || !drafts[mId][idx]) return;

    drafts[mId][idx] = {
      ...drafts[mId][idx],
      aula: target.value
    };
    updateRowEdificioBadge(row, target.value);
    clearError();
  }

  function resetDraftCourse(materiaId) {
    const entry = getOrderedEditableEntries().find(e => e.materia.id === materiaId);
    if (!entry) return;
    drafts[materiaId] = cloneBaseBloquesWithAulas(entry.baseOpt.bloques, null);
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

        if (action === "reset-course") {
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
