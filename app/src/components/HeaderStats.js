// Componente: Estadísticas del encabezado y barras de progreso de carrera
(function (global) {
  const App = (global.App = global.App || {});
  App.components = App.components || {};

  function render() {
    const { MATERIAS } = App.data;
    const { getEstado, state } = App.store;
    const { evaluarHabilitacion } = App.correlativas;

    let aprobadas = 0;
    let regulares = 0;
    let cursando = 0;
    let creditos = 0;
    let creditosNivel3 = 0;
    let habilitadasCount = 0;

    let obligatoriasIngAprobadas = 0; // De las 36 obligatorias de Ingeniería (1 a 36)
    let obligatoriasAnaAprobadas = 0; // De las 24 obligatorias de Analista (1 a 23 + Seminario 99)

    for (const m of MATERIAS) {
      const st = getEstado(m.id);
      if (st === "aprobado") {
        aprobadas++;
        if (m.electiva) {
          const cr = m.creditos || m.carga;
          creditos += cr;
          if (m.nivel === 3) {
            creditosNivel3 += cr;
          }
        } else {
          if (m.id !== "99") {
            obligatoriasIngAprobadas++;
          }
          if (m.nivel <= 3) {
            obligatoriasAnaAprobadas++;
          }
        }
      } else if (st === "regular") {
        regulares++;
      } else if (st === "cursando" || state.cursosSeleccionados[m.id]) {
        cursando++;
      }

      const ev = evaluarHabilitacion(m);
      if (ev.habilitadaParaCursar) {
        habilitadasCount++;
      }
    }

    document.getElementById("stat-aprobadas").textContent = aprobadas;
    document.getElementById("stat-regulares").textContent = regulares;
    document.getElementById("stat-cursando").textContent = cursando;
    document.getElementById("stat-creditos").textContent = `${creditos} / 20`;
    document.getElementById("badge-habilitadas").textContent = habilitadasCount;

    const btnKillHeader = document.getElementById("btn-kill-materia-header");
    if (btnKillHeader) {
      btnKillHeader.style.display = cursando >= 2 ? "inline-flex" : "none";
    }

    const btnKillToolbar = document.getElementById("btn-kill-materia");
    if (btnKillToolbar) {
      btnKillToolbar.disabled = cursando < 2;
    }

    // Progreso Ingeniería en Sistemas: 36 obligatorias + 20 créditos de electivas
    const creditosIngCumplidos = Math.min(20, creditos);
    const totalUnidadesIng = 36 + 20;
    const unidadesIngActuales = obligatoriasIngAprobadas + creditosIngCumplidos;
    const pctIng = Math.min(100, Math.round((unidadesIngActuales / totalUnidadesIng) * 1000) / 10);

    document.getElementById("prog-ing-pct").textContent = `${pctIng}%`;
    document.getElementById("prog-ing-bar").style.width = `${pctIng}%`;
    document.getElementById("prog-ing-detail").textContent =
      `${obligatoriasIngAprobadas} / 36 obligatorias • ${creditosIngCumplidos} / 20 créditos electivas`;

    // Progreso Título Intermedio (Analista): 24 obligatorias (1..23 + Sem. 99) + 4 créditos 3° nivel
    const creditosAnaCumplidos = Math.min(4, creditosNivel3);
    const totalUnidadesAna = 24 + 4;
    const unidadesAnaActuales = obligatoriasAnaAprobadas + creditosAnaCumplidos;
    const pctAna = Math.min(100, Math.round((unidadesAnaActuales / totalUnidadesAna) * 1000) / 10);

    document.getElementById("prog-ana-pct").textContent = `${pctAna}%`;
    document.getElementById("prog-ana-bar").style.width = `${pctAna}%`;
    document.getElementById("prog-ana-detail").textContent =
      `${obligatoriasAnaAprobadas} / 24 obligatorias (1° a 3° + Sem.) • ${creditosAnaCumplidos} / 4 cr. 3° nivel`;
  }

  App.components.HeaderStats = {
    render
  };
})(window);
