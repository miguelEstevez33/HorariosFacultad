// Componente: Pestaña 1 — Alumno (listado por nivel, tarjetas de materias y filtros)
(function (global) {
  const App = (global.App = global.App || {});
  App.components = App.components || {};

  function matchesFilters(m, { filterNivel, filterEstado, searchQuery }) {
    if (filterNivel === "electivas" && !m.electiva) return false;
    if (filterNivel !== "all" && filterNivel !== "electivas" && String(m.nivel) !== filterNivel) {
      return false;
    }

    const st = App.store.getEstado(m.id);
    if (filterEstado !== "all" && st !== filterEstado) return false;

    if (searchQuery) {
      const matchNombre = m.nombre.toLowerCase().includes(searchQuery);
      const matchNum = m.numero.toLowerCase().includes(searchQuery);
      if (!matchNombre && !matchNum) return false;
    }
    return true;
  }

  function renderCard(m) {
    const { ESTADOS_OPCIONES } = App.data;
    const { getEstado, getOpcionesComision, state } = App.store;
    const { formatCorrelativasPills } = App.correlativas;

    const st = getEstado(m.id);
    const comElegida = state.cursosSeleccionados[m.id];
    const objCom = comElegida ? getOpcionesComision(m.id).find(o => o.id === comElegida) : null;

    const statusButtonsHtml = ESTADOS_OPCIONES.map(
      opt => `
        <button type="button" class="status-btn ${st === opt.value ? "active" : ""}" data-id="${m.id}" data-state="${opt.value}">
          ${opt.label}
        </button>
      `
    ).join("");

    return `
      <div class="subject-card state-${st}">
        <div>
          <div class="subject-top">
            <span class="subject-num">${m.numero}</span>
            <span class="subject-name">${m.nombre}</span>
            <div class="subject-meta">
              ${objCom ? `<span class="meta-tag tag-comision" style="background: var(--primary-soft); color: var(--primary-text);">${objCom.comision}</span>` : ""}
              ${m.electiva ? `<span class="meta-tag tag-electiva">Electiva (${m.creditos} cr.)</span>` : ""}
              <span class="meta-tag" title="Modalidad">${m.modalidad}</span>
              <span class="meta-tag" title="Carga horaria semanal">${m.carga} hs</span>
            </div>
          </div>
        </div>

        <div class="correlativas-info">
          ${formatCorrelativasPills(m)}
        </div>

        <div class="status-selector" role="group" aria-label="Estado de ${m.nombre}">
          ${statusButtonsHtml}
        </div>
      </div>
    `;
  }

  function renderLevelSection(niv, materiasNivel) {
    return `
      <div class="level-section">
        <div class="level-header">
          <div class="level-title">
            <span>${niv.label}</span>
            <span class="level-badge">${materiasNivel.length} asignaturas</span>
          </div>
        </div>
        <div class="subjects-grid">
          ${materiasNivel.map(renderCard).join("")}
        </div>
      </div>
    `;
  }

  function render() {
    const { MATERIAS, NIVELES } = App.data;
    const container = document.getElementById("alumno-levels-container");
    if (!container) return;

    const filters = {
      searchQuery: document.getElementById("search-alumno").value.trim().toLowerCase(),
      filterNivel: document.getElementById("filter-nivel-alumno").value,
      filterEstado: document.getElementById("filter-estado-alumno").value
    };

    const html = NIVELES.map(niv => {
      const materiasNivel = MATERIAS.filter(m => m.nivel === niv.nivel && matchesFilters(m, filters));
      return materiasNivel.length > 0 ? renderLevelSection(niv, materiasNivel) : "";
    }).join("");

    container.innerHTML =
      html ||
      `<div class="level-section" style="padding: 2rem; text-align: center; color: var(--text-muted);">
        No se encontraron materias con los filtros seleccionados.
      </div>`;
  }

  function bindEvents() {
    const container = document.getElementById("alumno-levels-container");
    if (container) {
      container.addEventListener("click", e => {
        const btn = e.target.closest(".status-btn");
        if (!btn) return;
        const id = btn.getAttribute("data-id");
        const st = btn.getAttribute("data-state");
        if (id && st) {
          App.store.setEstadoMateria(id, st);
        }
      });
    }

    document.getElementById("btn-go-cursado").addEventListener("click", () => {
      App.switchTab("cursado");
    });

    document.getElementById("search-alumno").addEventListener("input", render);
    document.getElementById("filter-nivel-alumno").addEventListener("change", render);
    document.getElementById("filter-estado-alumno").addEventListener("change", render);

    document.getElementById("quick-year-select").addEventListener("change", e => {
      const val = e.target.value;
      if (!val) return;
      const [nivelStr, estado] = val.split(":");
      App.store.markNivelEstado(Number(nivelStr), estado);
      e.target.value = "";
    });

    document.getElementById("btn-reset-all").addEventListener("click", () => {
      if (confirm("¿Seguro que querés reiniciar todas las materias y vaciar el horario?")) {
        App.store.resetAll();
      }
    });
  }

  App.components.AlumnoTab = {
    render,
    bindEvents
  };
})(window);
