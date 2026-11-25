// Lógica de correlativas: habilitación, impacto de baja y cadenas previas/futuras
(function (global) {
  const App = (global.App = global.App || {});

  function cumpleRegular(reqId) {
    const st = App.store.getEstado(reqId);
    return st === "regular" || st === "aprobado";
  }

  function cumpleAprobada(reqId) {
    return App.store.getEstado(reqId) === "aprobado";
  }

  function evaluarHabilitacion(materia) {
    const estadoActual = App.store.getEstado(materia.id);
    const yaAprobada = estadoActual === "aprobado";
    const yaRegular = estadoActual === "regular";
    const yaCursando = estadoActual === "cursando";

    const faltanRegulares = materia.regular.filter(reqId => !cumpleRegular(reqId));
    const faltanAprobadas = materia.aprobada.filter(reqId => !cumpleAprobada(reqId));

    const cumpleCorrelativas = faltanRegulares.length === 0 && faltanAprobadas.length === 0;
    const habilitadaParaCursar = !yaAprobada && !yaRegular && cumpleCorrelativas;

    return {
      estadoActual,
      yaAprobada,
      yaRegular,
      yaCursando,
      faltanRegulares,
      faltanAprobadas,
      cumpleCorrelativas,
      habilitadaParaCursar
    };
  }

  function formatCorrelativasPills(materia) {
    const { MATERIAS_MAP } = App.data;
    if (materia.regular.length === 0 && materia.aprobada.length === 0) {
      return `<span class="corr-pill ok">Sin correlativas previas</span>`;
    }

    const pills = [];
    for (const reqId of materia.regular) {
      const ok = cumpleRegular(reqId);
      const reqMat = MATERIAS_MAP[reqId];
      pills.push(
        `<span class="corr-pill ${ok ? "ok" : "missing"}" title="Requiere Regular: ${reqMat.nombre}">
          ${ok ? "✓" : "✗"} Reg. N°${reqId}
        </span>`
      );
    }
    for (const reqId of materia.aprobada) {
      const ok = cumpleAprobada(reqId);
      const reqMat = MATERIAS_MAP[reqId];
      pills.push(
        `<span class="corr-pill ${ok ? "ok" : "missing"}" title="Requiere Aprobada: ${reqMat.nombre}">
          ${ok ? "✓" : "✗"} Apr. N°${reqId}
        </span>`
      );
    }
    return pills.join("");
  }

  function getEstadoLabelAndClass(st) {
    switch (st) {
      case "aprobado":
        return { label: "Aprobada", cls: "state-badge-aprobado" };
      case "regular":
        return { label: "Regular", cls: "state-badge-regular" };
      case "cursando":
        return { label: "Cursando", cls: "state-badge-cursando" };
      default:
        return { label: "Sin cursar", cls: "state-badge-none" };
    }
  }

  // Calcula qué materias (aún no aprobadas ni regularizadas) dependen directa o indirectamente de `materiaId`
  function calcularImpactoTraba(materiaId, includeElectivas = false) {
    const { MATERIAS, MATERIAS_MAP } = App.data;
    const directas = [];
    const directasIds = new Set();

    for (const m of MATERIAS) {
      if (m.id === materiaId) continue;
      if (!includeElectivas && m.electiva) continue;
      const st = App.store.getEstado(m.id);
      if (st === "aprobado" || st === "regular") continue;

      const pideReg = m.regular.includes(materiaId);
      const pideApr = m.aprobada.includes(materiaId);
      if (pideReg || pideApr) {
        directas.push({
          materia: m,
          tipoReq: pideReg && pideApr ? "Reg. y Apr." : pideReg ? "Regular" : "Aprobada"
        });
        directasIds.add(m.id);
      }
    }

    // BFS para encontrar toda la cadena de correlativas que se traba directa o indirectamente
    const visitadas = new Set();
    const cola = [materiaId];

    while (cola.length > 0) {
      const currId = cola.shift();
      for (const m of MATERIAS) {
        if (m.id === materiaId || visitadas.has(m.id)) continue;
        if (!includeElectivas && m.electiva) continue;
        const st = App.store.getEstado(m.id);
        if (st === "aprobado" || st === "regular") continue;

        if (m.regular.includes(currId) || m.aprobada.includes(currId)) {
          visitadas.add(m.id);
          cola.push(m.id);
        }
      }
    }

    const indirectas = [];
    for (const id of visitadas) {
      if (!directasIds.has(id)) {
        const mat = MATERIAS_MAP[id];
        if (mat) indirectas.push(mat);
      }
    }

    return {
      directas,
      indirectas,
      totalTrabadas: directas.length + indirectas.length
    };
  }

  // Encuentra correlativas previas indirectas (anteriores en la cadena que no son requisito directo)
  function obtenerPreviasIndirectas(materia) {
    const { MATERIAS_MAP } = App.data;
    const directIds = new Set([...materia.regular, ...materia.aprobada]);
    const visitadas = new Set();
    const cola = [...directIds];

    while (cola.length > 0) {
      const currId = cola.shift();
      const currMat = MATERIAS_MAP[currId];
      if (!currMat) continue;

      for (const prevId of [...currMat.regular, ...currMat.aprobada]) {
        if (!visitadas.has(prevId)) {
          visitadas.add(prevId);
          cola.push(prevId);
        }
      }
    }

    const indirectas = [];
    for (const id of visitadas) {
      if (!directIds.has(id) && MATERIAS_MAP[id]) {
        indirectas.push(MATERIAS_MAP[id]);
      }
    }
    return indirectas.sort(
      (a, b) => a.nivel - b.nivel || String(a.numero).localeCompare(String(b.numero), undefined, { numeric: true })
    );
  }

  // Encuentra correlativas a futuro (directas que piden esta materia, e indirectas en cadena)
  function obtenerCorrelativasFuturo(materiaId, includeElectivas = true) {
    const { MATERIAS, MATERIAS_MAP } = App.data;
    const directas = [];
    const directasIds = new Set();

    for (const m of MATERIAS) {
      if (m.id === materiaId) continue;
      if (!includeElectivas && m.electiva) continue;

      const pideReg = m.regular.includes(materiaId);
      const pideApr = m.aprobada.includes(materiaId);
      if (pideReg || pideApr) {
        directas.push({
          materia: m,
          pideReg,
          pideApr,
          reqTexto: pideReg && pideApr ? "Pide Regular y Aprobada" : pideReg ? "Pide tenerla REGULAR" : "Pide tenerla APROBADA",
          reqType: pideApr ? "aprobada" : "regular"
        });
        directasIds.add(m.id);
      }
    }

    // BFS para toda la cadena futura
    const visitadas = new Set();
    const cola = [materiaId];

    while (cola.length > 0) {
      const currId = cola.shift();
      for (const m of MATERIAS) {
        if (m.id === materiaId || visitadas.has(m.id)) continue;
        if (!includeElectivas && m.electiva) continue;

        if (m.regular.includes(currId) || m.aprobada.includes(currId)) {
          visitadas.add(m.id);
          cola.push(m.id);
        }
      }
    }

    const indirectas = [];
    for (const id of visitadas) {
      if (!directasIds.has(id) && MATERIAS_MAP[id]) {
        indirectas.push(MATERIAS_MAP[id]);
      }
    }

    directas.sort(
      (a, b) =>
        a.materia.nivel - b.materia.nivel ||
        String(a.materia.numero).localeCompare(String(b.materia.numero), undefined, { numeric: true })
    );
    indirectas.sort(
      (a, b) => a.nivel - b.nivel || String(a.numero).localeCompare(String(b.numero), undefined, { numeric: true })
    );

    return { directas, indirectas };
  }

  App.correlativas = {
    cumpleRegular,
    cumpleAprobada,
    evaluarHabilitacion,
    formatCorrelativasPills,
    getEstadoLabelAndClass,
    calcularImpactoTraba,
    obtenerPreviasIndirectas,
    obtenerCorrelativasFuturo
  };
})(window);
