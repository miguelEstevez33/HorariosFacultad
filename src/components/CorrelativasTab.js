// Componente: Pestaña 3 — Consulta de Correlativas (Previas y a Futuro)
(function (global) {
  const App = (global.App = global.App || {});
  App.components = App.components || {};

  function populateSelect() {
    const { MATERIAS } = App.data;
    const { state } = App.store;
    const selectEl = document.getElementById("select-materia-correlativas");
    if (!selectEl) return;

    const gruposObligatorias = [
      { nivel: 1, label: "1° Año — Primer Nivel" },
      { nivel: 2, label: "2° Año — Segundo Nivel" },
      { nivel: 3, label: "3° Año — Tercer Nivel" },
      { nivel: 4, label: "4° Año — Cuarto Nivel" },
      { nivel: 5, label: "5° Año — Quinto Nivel" }
    ];

    let html = "";

    for (const grp of gruposObligatorias) {
      const lista = MATERIAS.filter(m => m.nivel === grp.nivel && !m.electiva);
      if (!lista.length) continue;
      html += `<optgroup label="${grp.label}">`;
      for (const m of lista) {
        html += `<option value="${m.id}">${m.numero} - ${m.nombre}</option>`;
      }
      html += `</optgroup>`;
    }

    const electivas = MATERIAS.filter(m => m.electiva);
    if (electivas.length) {
      html += `<optgroup label="Materias Electivas (3° a 5° Año)">`;
      for (const m of electivas) {
        html += `<option value="${m.id}">${m.numero} - ${m.nombre} (${m.nivel}° Año)</option>`;
      }
      html += `</optgroup>`;
    }

    selectEl.innerHTML = html;
    selectEl.value = state.selectedCorrelativaMateriaId;
  }

  function renderFutureDepCard(futMat, reqLabel, reqTagClass, requisitoActualCumplido) {
    const { getEstado } = App.store;
    const { evaluarHabilitacion, getEstadoLabelAndClass } = App.correlativas;

    const futEv = evaluarHabilitacion(futMat);
    const futSt = getEstado(futMat.id);
    const futStInfo = getEstadoLabelAndClass(futSt);

    let destrabeText = "";
    let destrabeClass = "";
    if (futEv.yaAprobada) {
      destrabeText = "✓ Ya aprobada";
      destrabeClass = "status-ok";
    } else if (futEv.yaRegular) {
      destrabeText = "✓ Ya regular";
      destrabeClass = "status-ok";
    } else if (futEv.habilitadaParaCursar) {
      destrabeText = "✅ Ya habilitada para cursar";
      destrabeClass = "status-ok";
    } else {
      const faltanTotal = futEv.faltanRegulares.length + futEv.faltanAprobadas.length;
      destrabeText = `🔒 Le ${faltanTotal === 1 ? "falta 1 correlativa" : `faltan ${faltanTotal} correlativas`}`;
      destrabeClass = "status-missing";
    }

    return `
      <div class="corr-dep-card ${requisitoActualCumplido ? "dep-ok" : "dep-future"}" data-jump-materia="${futMat.id}" title="Clic para ver las correlativas de ${futMat.numero} - ${futMat.nombre}">
        <div class="corr-dep-top">
          <div class="corr-dep-name-group">
            <span class="subject-num">${futMat.numero}</span>
            <span class="corr-dep-name">${futMat.nombre}</span>
          </div>
          <span class="corr-req-tag ${reqTagClass}">${reqLabel}</span>
        </div>
        <div class="corr-dep-bottom">
          <div class="corr-dep-meta">
            <span class="meta-tag">${futMat.nivel}° Año</span>
            ${futMat.electiva ? `<span class="meta-tag tag-electiva">Electiva</span>` : ""}
            <span class="corr-user-state ${futStInfo.cls}">${futStInfo.label}</span>
          </div>
          <span class="corr-check-status ${destrabeClass}">${destrabeText}</span>
        </div>
      </div>
    `;
  }

  function render() {
    const { MATERIAS, MATERIAS_MAP } = App.data;
    const { state, getEstado, setEstadoMateria } = App.store;
    const {
      evaluarHabilitacion,
      cumpleRegular,
      cumpleAprobada,
      getEstadoLabelAndClass,
      obtenerPreviasIndirectas,
      obtenerCorrelativasFuturo
    } = App.correlativas;

    const selectEl = document.getElementById("select-materia-correlativas");
    const headerEl = document.getElementById("corr-selected-header");
    const previasEl = document.getElementById("corr-previas-content");
    const futuroEl = document.getElementById("corr-futuro-content");
    const previasBadge = document.getElementById("corr-previas-count-badge");
    const futuroBadge = document.getElementById("corr-futuro-count-badge");
    const chkElectivas = document.getElementById("corr-include-electivas");

    if (!headerEl || !previasEl || !futuroEl) return;

    if (selectEl && !selectEl.options.length) {
      populateSelect();
    }
    if (selectEl && selectEl.value !== state.selectedCorrelativaMateriaId) {
      selectEl.value = state.selectedCorrelativaMateriaId;
    }

    const materia = MATERIAS_MAP[state.selectedCorrelativaMateriaId] || MATERIAS[0];
    const includeElectivas = chkElectivas ? chkElectivas.checked : true;
    const ev = evaluarHabilitacion(materia);
    const st = getEstado(materia.id);

    let habStatusHtml = "";
    if (ev.yaAprobada) {
      habStatusHtml = `<span class="corr-hab-pill hab-aprobada">🎉 Ya tenés esta materia Aprobada</span>`;
    } else if (ev.yaRegular) {
      habStatusHtml = `<span class="corr-hab-pill hab-regular">📘 Ya tenés esta materia Regular (falta final)</span>`;
    } else if (ev.yaCursando) {
      habStatusHtml = `<span class="corr-hab-pill hab-cursando">📅 Estás cursando esta materia actualmente</span>`;
    } else if (ev.habilitadaParaCursar) {
      habStatusHtml = `<span class="corr-hab-pill hab-ok">✅ Cumplís todo para cursarla</span>`;
    } else {
      const totalFaltan = ev.faltanRegulares.length + ev.faltanAprobadas.length;
      habStatusHtml = `<span class="corr-hab-pill hab-locked">🔒 Te ${totalFaltan === 1 ? "falta 1 correlativa" : `faltan ${totalFaltan} correlativas`} para poder cursarla</span>`;
    }

    headerEl.innerHTML = `
      <div class="corr-selected-card state-${st}">
        <div class="corr-selected-main">
          <div class="corr-selected-title-row">
            <span class="corr-big-num">N° ${materia.numero}</span>
            <h2 class="corr-big-title">${materia.nombre}</h2>
            <span class="meta-tag">${materia.nivel}° Año</span>
            <span class="meta-tag">Modalidad: ${materia.modalidad}</span>
            <span class="meta-tag">${materia.carga} hs/sem</span>
            ${materia.electiva ? `<span class="meta-tag tag-electiva">Electiva (${materia.creditos} créditos)</span>` : `<span class="meta-tag">Obligatoria</span>`}
          </div>
          <div class="corr-selected-status-row">
            ${habStatusHtml}
          </div>
        </div>

        <div class="corr-selected-actions">
          <span class="corr-state-label">Tu estado en esta materia:</span>
          <div class="status-selector corr-inline-status">
            <button type="button" class="status-btn ${st === "none" ? "active" : ""}" data-corr-state-id="${materia.id}" data-state="none">Sin cursar</button>
            <button type="button" class="status-btn ${st === "cursando" ? "active" : ""}" data-corr-state-id="${materia.id}" data-state="cursando">Cursando</button>
            <button type="button" class="status-btn ${st === "regular" ? "active" : ""}" data-corr-state-id="${materia.id}" data-state="regular">Regular</button>
            <button type="button" class="status-btn ${st === "aprobado" ? "active" : ""}" data-corr-state-id="${materia.id}" data-state="aprobado">Aprobado</button>
          </div>
        </div>
      </div>
    `;

    headerEl.querySelectorAll("[data-corr-state-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const mId = btn.getAttribute("data-corr-state-id");
        const newSt = btn.getAttribute("data-state");
        setEstadoMateria(mId, newSt);
      });
    });

    // 1) Columna izquierda: Qué necesitás para cursarla
    const totalDirectasPrevias = materia.regular.length + materia.aprobada.length;
    const previasIndirectas = obtenerPreviasIndirectas(materia);
    if (previasBadge) {
      previasBadge.textContent = `${totalDirectasPrevias} ${totalDirectasPrevias === 1 ? "directa" : "directas"}`;
    }

    if (totalDirectasPrevias === 0) {
      previasEl.innerHTML = `
        <div class="corr-empty-state corr-empty-ok">
          <div class="corr-empty-icon">🎉</div>
          <h3>Sin correlativas previas</h3>
          <p><strong>${materia.numero} - ${materia.nombre}</strong> no exige ninguna materia previa para cursarse.</p>
        </div>
      `;
    } else {
      let prevHtml = "";

      if (materia.regular.length > 0) {
        prevHtml += `
          <div class="corr-group-block">
            <div class="corr-group-title">
              <span class="corr-req-dot dot-regular"></span>
              <span>Tener REGULARIZADAS para cursar (${materia.regular.length})</span>
            </div>
            <div class="corr-cards-list">
              ${materia.regular
                .map(reqId => {
                  const reqMat = MATERIAS_MAP[reqId];
                  if (!reqMat) return "";
                  const cumple = cumpleRegular(reqId);
                  const reqSt = getEstado(reqId);
                  const reqStInfo = getEstadoLabelAndClass(reqSt);
                  return `
                    <div class="corr-dep-card ${cumple ? "dep-ok" : "dep-missing"}" data-jump-materia="${reqMat.id}" title="Clic para ver las correlativas de ${reqMat.numero} - ${reqMat.nombre}">
                      <div class="corr-dep-top">
                        <div class="corr-dep-name-group">
                          <span class="subject-num">${reqMat.numero}</span>
                          <span class="corr-dep-name">${reqMat.nombre}</span>
                        </div>
                        <span class="corr-req-tag tag-req-regular">Pide Regular</span>
                      </div>
                      <div class="corr-dep-bottom">
                        <div class="corr-dep-meta">
                          <span class="meta-tag">${reqMat.nivel}° Año</span>
                          <span class="corr-user-state ${reqStInfo.cls}">Tu estado: ${reqStInfo.label}</span>
                        </div>
                        <span class="corr-check-status ${cumple ? "status-ok" : "status-missing"}">
                          ${cumple ? "✓ Cumplida" : "✗ Te falta regularizar"}
                        </span>
                      </div>
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>
        `;
      }

      if (materia.aprobada.length > 0) {
        prevHtml += `
          <div class="corr-group-block">
            <div class="corr-group-title">
              <span class="corr-req-dot dot-aprobada"></span>
              <span>Tener APROBADAS (con final) para cursar (${materia.aprobada.length})</span>
            </div>
            <div class="corr-cards-list">
              ${materia.aprobada
                .map(reqId => {
                  const reqMat = MATERIAS_MAP[reqId];
                  if (!reqMat) return "";
                  const cumple = cumpleAprobada(reqId);
                  const reqSt = getEstado(reqId);
                  const reqStInfo = getEstadoLabelAndClass(reqSt);
                  return `
                    <div class="corr-dep-card ${cumple ? "dep-ok" : "dep-missing"}" data-jump-materia="${reqMat.id}" title="Clic para ver las correlativas de ${reqMat.numero} - ${reqMat.nombre}">
                      <div class="corr-dep-top">
                        <div class="corr-dep-name-group">
                          <span class="subject-num">${reqMat.numero}</span>
                          <span class="corr-dep-name">${reqMat.nombre}</span>
                        </div>
                        <span class="corr-req-tag tag-req-aprobada">Pide Aprobada</span>
                      </div>
                      <div class="corr-dep-bottom">
                        <div class="corr-dep-meta">
                          <span class="meta-tag">${reqMat.nivel}° Año</span>
                          <span class="corr-user-state ${reqStInfo.cls}">Tu estado: ${reqStInfo.label}</span>
                        </div>
                        <span class="corr-check-status ${cumple ? "status-ok" : "status-missing"}">
                          ${cumple ? "✓ Cumplida" : "✗ Te falta aprobar"}
                        </span>
                      </div>
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>
        `;
      }

      if (previasIndirectas.length > 0) {
        prevHtml += `
          <div class="corr-group-block corr-chain-block">
            <div class="corr-group-title">
              <span class="corr-req-dot dot-chain"></span>
              <span>Anteriores en cadena (${previasIndirectas.length} previas de sus correlativas)</span>
            </div>
            <div class="corr-chain-pills">
              ${previasIndirectas
                .map(ind => {
                  const indSt = getEstado(ind.id);
                  const isOk = indSt === "aprobado" || indSt === "regular";
                  return `
                    <button type="button" class="corr-chain-pill ${isOk ? "chain-ok" : ""}" data-jump-materia="${ind.id}" title="Clic para inspeccionar ${ind.numero} - ${ind.nombre} (${ind.nivel}° Año)">
                      <strong>N° ${ind.numero}</strong> ${ind.nombre} <small>(${ind.nivel}°)</small>
                    </button>
                  `;
                })
                .join("")}
            </div>
          </div>
        `;
      }

      previasEl.innerHTML = prevHtml;
    }

    // 2) Columna derecha: Correlativas a futuro (qué destraba)
    const { directas, indirectas } = obtenerCorrelativasFuturo(materia.id, includeElectivas);
    if (futuroBadge) {
      futuroBadge.textContent = `${directas.length} ${directas.length === 1 ? "directa" : "directas"}${indirectas.length > 0 ? ` • ${indirectas.length} en cadena` : ""}`;
    }

    if (directas.length === 0) {
      futuroEl.innerHTML = `
        <div class="corr-empty-state">
          <div class="corr-empty-icon">🏁</div>
          <h3>No traba ninguna materia a futuro</h3>
          <p><strong>${materia.numero} - ${materia.nombre}</strong> es terminal y ninguna otra materia${includeElectivas ? "" : " obligatoria"} la pide como correlativa.</p>
        </div>
      `;
    } else {
      const pidenRegular = directas.filter(d => d.pideReg);
      const pidenAprobada = directas.filter(d => d.pideApr);

      let futHtml = "";

      if (pidenRegular.length > 0) {
        futHtml += `
          <div class="corr-group-block">
            <div class="corr-group-title">
              <span class="corr-req-dot dot-regular"></span>
              <span>Te la piden REGULAR para poder cursarlas (${pidenRegular.length})</span>
            </div>
            <div class="corr-cards-list">
              ${pidenRegular.map(item => renderFutureDepCard(item.materia, "Pide Regular", "tag-req-regular", cumpleRegular(materia.id))).join("")}
            </div>
          </div>
        `;
      }

      if (pidenAprobada.length > 0) {
        futHtml += `
          <div class="corr-group-block">
            <div class="corr-group-title">
              <span class="corr-req-dot dot-aprobada"></span>
              <span>Te la piden APROBADA (final) para poder cursarlas (${pidenAprobada.length})</span>
            </div>
            <div class="corr-cards-list">
              ${pidenAprobada.map(item => renderFutureDepCard(item.materia, "Pide Aprobada", "tag-req-aprobada", cumpleAprobada(materia.id))).join("")}
            </div>
          </div>
        `;
      }

      if (indirectas.length > 0) {
        futHtml += `
          <div class="corr-group-block corr-chain-block">
            <div class="corr-group-title">
              <span class="corr-req-dot dot-chain"></span>
              <span>Más adelante en cadena (${indirectas.length} materias que dependen indirectamente)</span>
            </div>
            <div class="corr-chain-pills">
              ${indirectas
                .map(
                  ind => `
                    <button type="button" class="corr-chain-pill" data-jump-materia="${ind.id}" title="Clic para inspeccionar ${ind.numero} - ${ind.nombre} (${ind.nivel}° Año)">
                      <strong>N° ${ind.numero}</strong> ${ind.nombre} <small>(${ind.nivel}°${ind.electiva ? " • Electiva" : ""})</small>
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>
        `;
      }

      futuroEl.innerHTML = futHtml;
    }

    // Permitir saltar a cualquier materia haciendo clic en su tarjeta o píldora
    document.querySelectorAll("#tab-correlativas [data-jump-materia]").forEach(el => {
      el.addEventListener("click", () => {
        const targetId = el.getAttribute("data-jump-materia");
        if (targetId && MATERIAS_MAP[targetId]) {
          state.selectedCorrelativaMateriaId = targetId;
          render();
        }
      });
    });
  }

  function bindEvents() {
    const selectCorr = document.getElementById("select-materia-correlativas");
    const chkCorrElectivas = document.getElementById("corr-include-electivas");

    if (selectCorr) {
      populateSelect();
      selectCorr.addEventListener("change", e => {
        App.store.state.selectedCorrelativaMateriaId = e.target.value;
        render();
      });
    }
    if (chkCorrElectivas) {
      chkCorrElectivas.addEventListener("change", render);
    }
  }

  App.components.CorrelativasTab = {
    populateSelect,
    render,
    bindEvents
  };
})(window);
