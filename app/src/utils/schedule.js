// Utilidades de horarios: formato, fusión de recreos, conflictos y carriles de grilla
(function (global) {
  const App = (global.App = global.App || {});

  function formatShortTime(tStr) {
    // Convierte "14:00" -> "14" y "13:15" -> "13:15"
    const [hh, mm] = tStr.split(":");
    const hNum = parseInt(hh, 10);
    return mm === "00" ? `${hNum}` : `${hNum}:${mm}`;
  }

  function timeToMinutes(tStr) {
    const [hh, mm] = tStr.split(":").map(Number);
    return hh * 60 + mm;
  }

  // Une bloques de la misma comisión en el mismo día separados por un recreo corto (<= 30 min)
  function getMergedBloques(bloques) {
    if (!bloques || bloques.length <= 1) return bloques || [];
    const byDay = {};
    for (const b of bloques) {
      if (!byDay[b.dia]) byDay[b.dia] = [];
      byDay[b.dia].push({ ...b, _s: timeToMinutes(b.inicio), _e: timeToMinutes(b.fin) });
    }
    const result = [];
    for (const dia of Object.keys(byDay)) {
      const list = byDay[dia].sort((a, b) => a._s - b._s);
      let curr = list[0];
      for (let i = 1; i < list.length; i++) {
        const nxt = list[i];
        if (nxt._s - curr._e <= 30) {
          if (nxt._e > curr._e) {
            curr.fin = nxt.fin;
            curr._e = nxt._e;
          }
        } else {
          result.push({ dia: curr.dia, inicio: curr.inicio, fin: curr.fin });
          curr = nxt;
        }
      }
      result.push({ dia: curr.dia, inicio: curr.inicio, fin: curr.fin });
    }
    return result;
  }

  function formatBloquesResumen(bloques) {
    return getMergedBloques(bloques)
      .map(b => `${b.dia.slice(0, 3)} ${formatShortTime(b.inicio)}-${formatShortTime(b.fin)}hs`)
      .join(" • ");
  }

  function doesOptionConflictWithEnrolled(materiaId, option, enrolledBlocks) {
    for (const b of getMergedBloques(option.bloques)) {
      const bStart = timeToMinutes(b.inicio);
      const bEnd = timeToMinutes(b.fin);
      for (const eb of enrolledBlocks) {
        if (eb.materiaId === materiaId) continue;
        if (eb.dia !== b.dia) continue;
        const disjointCuat =
          (option.periodo === "1° Cuat." && eb.periodo === "2° Cuat.") ||
          (option.periodo === "2° Cuat." && eb.periodo === "1° Cuat.");
        if (!disjointCuat && bStart < eb.endMin && eb.startMin < bEnd) {
          return true;
        }
      }
    }
    return false;
  }

  function getEnrolledBlocksList() {
    const { MATERIAS_MAP } = App.data;
    const { cursosSeleccionados, currentCuatFilter } = App.store.state;
    const list = [];

    for (const [mId, optId] of Object.entries(cursosSeleccionados)) {
      const materia = MATERIAS_MAP[mId];
      if (!materia) continue;
      const opciones = App.store.getOpcionesComision(mId);
      const opt = opciones.find(o => o.id === optId);
      if (!opt) continue;

      if (currentCuatFilter === "1C" && opt.periodo === "2° Cuat.") continue;
      if (currentCuatFilter === "2C" && opt.periodo === "1° Cuat.") continue;

      for (const b of getMergedBloques(opt.bloques)) {
        list.push({
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
          isPreview: false
        });
      }
    }
    return list;
  }

  function computeColumnLanes(dayBlocks) {
    if (dayBlocks.length === 0) return [];
    const sorted = [...dayBlocks].sort((a, b) => {
      if (a.startMin !== b.startMin) return a.startMin - b.startMin;
      if (a.isPreview !== b.isPreview) return a.isPreview ? 1 : -1;
      return b.endMin - a.endMin;
    });

    // Agrupar bloques que se solapan temporalmente en clusters
    const clusters = [];
    let currentCluster = [];
    let clusterEnd = -1;

    for (const blk of sorted) {
      if (currentCluster.length === 0 || blk.startMin < clusterEnd) {
        currentCluster.push(blk);
        clusterEnd = Math.max(clusterEnd, blk.endMin);
      } else {
        clusters.push(currentCluster);
        currentCluster = [blk];
        clusterEnd = blk.endMin;
      }
    }
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    // Asignar carriles (lanes) dentro de cada cluster para evitar superposiciones
    for (const cluster of clusters) {
      const laneEnds = [];
      for (const blk of cluster) {
        let assignedLane = -1;
        for (let l = 0; l < laneEnds.length; l++) {
          if (laneEnds[l] <= blk.startMin) {
            assignedLane = l;
            laneEnds[l] = blk.endMin;
            break;
          }
        }
        if (assignedLane === -1) {
          assignedLane = laneEnds.length;
          laneEnds.push(blk.endMin);
        }
        blk.laneIndex = assignedLane;
      }
      const totalLanes = laneEnds.length;
      for (const blk of cluster) {
        blk.totalLanes = totalLanes;
      }
    }

    return sorted;
  }

  App.schedule = {
    formatShortTime,
    timeToMinutes,
    getMergedBloques,
    formatBloquesResumen,
    doesOptionConflictWithEnrolled,
    getEnrolledBlocksList,
    computeColumnLanes
  };
})(window);
