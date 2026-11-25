// Componente: Pestaña 1 — Alumno (listado por nivel, tarjetas de materias y filtros)
(function (global) {
  const App = (global.App = global.App || {});
  App.components = App.components || {};

  function renderCard(m) {
    const { getEstado, getOpcionesComision, state } = App.store;
    const { formatCorrelativasPills } = App.correlativas;

    const st = getEstado(m.id);
    const comElegida = state.cursosSeleccionados[m.id];
    const opciones = getOpcionesComision(m.id);
    const objCom = opciones.find(o => o.id === comElegida);

    return `
      <div class="subject-card state-${st}">
        <div>
          <div class="subject-top">
            <span class="subject-num">${m.numero}</span>
            <span class="subject-name">${m.nombre}</span>
            <div class="subject-meta">
              ${objCom ? `<span class="meta-tag" style="background: rgba(56,189,248,0.2); color: #7dd3fc;">${objCom.comision}</span>` : ""}
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
          <button type="button" class="status-btn ${st === "none" ? "active" : ""}" data-id="${m.id}" data-state="none">
            Sin cursar
          </button>
          <button type="button" class="status-btn ${st === "cursando" ? "active" : ""}" data-id="${m.id}" data-state="cursando">
            Cursando
          </button>
          <button type="button" class="status-btn ${st === "regular" ? "active" : ""}" data-id="${m.id}" data-state="regular">
            Regular
          </button>
          <button type="button" class="status-btn ${st === "aprobado" ? "active" : ""}" data-id="${m.id}" data-state="aprobado">
            Aprobado
          </button>
        </div>
      </div>
    `;
  }

  function render() {
    const { MATERIAS } = App.data;
    const { getEstado, setEstadoMateria } = App.store;

    const container = document.getElementById("alumno-levels-container");
    const searchQuery = document.getElementById("search-alumno").value.trim().toLowerCase();
    const filterNivel = document.getElementById("filter-nivel-alumno").value;
    const filterEstado = document.getElementById("filter-estado-alumno").value;

    const niveles = [
      { key: 1, titulo: "1° Año — Primer Nivel" },
      { key: 2, titulo: "2° Año — Segundo Nivel" },
      { key: 3, titulo: "3° Año — Tercer Nivel" },
      { key: 4, titulo: "4° Año — Cuarto Nivel" },
      { key: 5, titulo: "5° Año — Quinto Nivel" }
    ];

    let html = "";

    for (const niv of niveles) {
      const materiasNivel = MATERIAS.filter(m => {
        if (m.nivel !== niv.key) return false;
        if (filterNivel === "electivas" && !m.electiva) return false;
        if (filterNivel !== "all" && filterNivel !== "electivas" && String(m.nivel) !== filterNivel) return false;

        const st = getEstado(m.id);
        if (filterEstado !== "all" && st !== filterEstado) return false;

        if (searchQuery) {
          const matchNombre = m.nombre.toLowerCase().includes(searchQuery);
          const matchNum = m.numero.toLowerCase().includes(searchQuery);
          if (!matchNombre && !matchNum) return false;
        }
        return true;
      });

      if (materiasNivel.length === 0) continue;

      html += `
        <div class="level-section">
          <div class="level-header">
            <div class="level-title">
              <span>${niv.titulo}</span>
              <span class="level-badge">${materiasNivel.length} asignaturas</span>
            </div>
          </div>
          <div class="subjects-grid">
            ${materiasNivel.map(m => renderCard(m)).join("")}
          </div>
        </div>
      `;
    }

    if (!html) {
      html = `<div class="level-section" style="padding: 2rem; text-align: center; color: var(--text-muted);">
        No se encontraron materias con los filtros seleccionados.
      </div>`;
    }

    container.innerHTML = html;

    container.querySelectorAll(".status-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const st = btn.getAttribute("data-state");
        setEstadoMateria(id, st);
      });
    });
  }

  function bindEvents() {
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
