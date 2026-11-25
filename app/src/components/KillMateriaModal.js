// Componente: Modal "Matar Materia" — Ranking de impacto en correlativas futuras
(function (global) {
  const App = (global.App = global.App || {});
  App.components = App.components || {};

  function isOpen() {
    const modal = document.getElementById("kill-materia-modal");
    return Boolean(modal && modal.style.display !== "none");
  }

  function open() {
    if (App.store.getInscriptasList().length < 2) return;
    const modal = document.getElementById("kill-materia-modal");
    if (!modal) return;
    modal.style.display = "flex";
    render();
  }

  function close() {
    const modal = document.getElementById("kill-materia-modal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  function render() {
    const { state, getInscriptasList, getOpcionesComision, killMateriaInscripta } = App.store;
    const { calcularImpactoTraba } = App.correlativas;

    const listEl = document.getElementById("kill-materia-list");
    if (!listEl) return;

    const chkIncludeElectivas = document.getElementById("kill-include-electivas");
    const includeElectivas = Boolean(chkIncludeElectivas && chkIncludeElectivas.checked);

    const inscriptas = getInscriptasList();
    if (inscriptas.length < 2) {
      close();
      return;
    }

    const evaluadas = inscriptas
      .map(m => {
        const impacto = calcularImpactoTraba(m.id, includeElectivas);
        const optId = state.cursosSeleccionados[m.id];
        const opciones = getOpcionesComision(m.id);
        const comObj = opciones.find(o => o.id === optId);
        return {
          materia: m,
          comObj,
          ...impacto
        };
      })
      .sort((a, b) => {
        if (a.totalTrabadas !== b.totalTrabadas) {
          return a.totalTrabadas - b.totalTrabadas;
        }
        if (a.directas.length !== b.directas.length) {
          return a.directas.length - b.directas.length;
        }
        if (a.materia.electiva !== b.materia.electiva) {
          return a.materia.electiva ? -1 : 1;
        }
        return b.materia.nivel - a.materia.nivel;
      });

    const maxTrabas = Math.max(1, ...evaluadas.map(e => e.totalTrabadas));

    listEl.innerHTML = evaluadas
      .map((item, idx) => {
        const { materia, comObj, directas, indirectas, totalTrabadas } = item;
        const isTopCandidate = idx === 0;
        const isMostCritical = idx === evaluadas.length - 1 && totalTrabadas > 0 && evaluadas.length > 1;

        let severityClass = "severity-low";
        if (totalTrabadas >= 8) {
          severityClass = "severity-high";
        } else if (totalTrabadas >= 3) {
          severityClass = "severity-medium";
        }

        const directasPills = directas.length
          ? directas
              .map(
                d =>
                  `<span class="kill-dep-pill direct" title="Pide ${materia.nombre} como ${d.tipoReq}">
                    N°${d.materia.numero} ${d.materia.nombre} <small>(${d.tipoReq})</small>
                  </span>`
              )
              .join("")
          : `<span class="kill-no-deps">🎉 No traba ninguna materia${includeElectivas ? "" : " obligatoria"} a futuro</span>`;

        const indirectasPills = indirectas.length
          ? indirectas
              .map(
                ind =>
                  `<span class="kill-dep-pill indirect" title="Trabada en cadena (${ind.nivel}° Año)">
                    N°${ind.numero} ${ind.nombre}
                  </span>`
              )
              .join("")
          : "";

        const barPct = Math.round((totalTrabadas / maxTrabas) * 100);

        return `
          <div class="kill-item-card ${isTopCandidate ? "top-kill-candidate" : ""} ${severityClass}">
            <div class="kill-item-main">
              <div class="kill-rank-badge" title="Posición #${idx + 1} de menor a mayor impacto">
                #${idx + 1}
              </div>

              <div class="kill-item-info">
                <div class="kill-item-title-row">
                  <span class="subject-num">${materia.numero}</span>
                  <span class="kill-item-name">${materia.nombre}</span>
                  ${comObj ? `<span class="planted-badge">${comObj.comision}</span>` : ""}
                  <span class="meta-tag">${materia.nivel}° Año • ${materia.carga} hs/sem</span>
                  ${materia.electiva ? `<span class="meta-tag tag-electiva">Electiva</span>` : ""}
                  ${
                    isTopCandidate
                      ? `<span class="kill-recommend-tag">🎯 Más sacrificable (traba menos)</span>`
                      : isMostCritical
                      ? `<span class="kill-critical-tag">⚠️ Más crítica (no dejar)</span>`
                      : ""
                  }
                </div>

                <div class="kill-impact-bar-row">
                  <div class="kill-impact-track">
                    <div class="kill-impact-fill" style="width: ${barPct}%;"></div>
                  </div>
                  <span class="kill-impact-stats">
                    Traba <strong>${totalTrabadas}</strong> ${totalTrabadas === 1 ? "materia" : "materias"}
                    (${directas.length} ${directas.length === 1 ? "directa" : "directas"}${
          indirectas.length > 0 ? ` + ${indirectas.length} en cadena` : ""
        })
                  </span>
                </div>

                <div class="kill-deps-section">
                  <div class="kill-deps-group">
                    <span class="kill-deps-label">Directas (${directas.length}):</span>
                    <div class="kill-deps-pills">${directasPills}</div>
                  </div>
                  ${
                    indirectas.length > 0
                      ? `<div class="kill-deps-group">
                          <span class="kill-deps-label">En cadena (${indirectas.length}):</span>
                          <div class="kill-deps-pills">${indirectasPills}</div>
                        </div>`
                      : ""
                  }
                </div>
              </div>

              <div class="kill-item-actions">
                <button type="button" class="btn btn-kill-action btn-sm" data-kill-id="${materia.id}" title="Dar de baja ${materia.nombre} del cursado y liberar sus ${materia.carga} hs/sem">
                  💀 Matar
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    listEl.querySelectorAll("[data-kill-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const mId = btn.getAttribute("data-kill-id");
        killMateriaInscripta(mId);
        if (getInscriptasList().length < 2) {
          close();
        }
      });
    });
  }

  function bindEvents() {
    const btnKillToolbar = document.getElementById("btn-kill-materia");
    const btnKillHeader = document.getElementById("btn-kill-materia-header");
    const killModal = document.getElementById("kill-materia-modal");
    const btnCloseKill = document.getElementById("btn-close-kill-modal");
    const btnCloseKillFooter = document.getElementById("btn-close-kill-modal-footer");
    const chkIncludeElectivas = document.getElementById("kill-include-electivas");

    if (btnKillToolbar) btnKillToolbar.addEventListener("click", open);
    if (btnKillHeader) btnKillHeader.addEventListener("click", open);
    if (btnCloseKill) btnCloseKill.addEventListener("click", close);
    if (btnCloseKillFooter) btnCloseKillFooter.addEventListener("click", close);
    if (chkIncludeElectivas) chkIncludeElectivas.addEventListener("change", render);

    if (killModal) {
      killModal.addEventListener("click", e => {
        if (e.target === killModal) {
          close();
        }
      });
    }

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && isOpen()) {
        close();
      }
    });
  }

  App.components.KillMateriaModal = {
    isOpen,
    open,
    close,
    render,
    bindEvents
  };
})(window);
