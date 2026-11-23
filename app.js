// Régimen de Correlativas Plan 2023 - Ingeniería en Sistemas de Información (UTN FRC)
const MATERIAS = [
  // NIVEL 1
  { id: "1", numero: "1", nivel: 1, nombre: "Análisis Matemático I", modalidad: "A", regular: [], aprobada: [], carga: 5, electiva: false },
  { id: "2", numero: "2", nivel: 1, nombre: "Álgebra y Geometría Analítica", modalidad: "A", regular: [], aprobada: [], carga: 5, electiva: false },
  { id: "3", numero: "3", nivel: 1, nombre: "Física I", modalidad: "A", regular: [], aprobada: [], carga: 5, electiva: false },
  { id: "4", numero: "4", nivel: 1, nombre: "Inglés I", modalidad: "A", regular: [], aprobada: [], carga: 2, electiva: false },
  { id: "5", numero: "5", nivel: 1, nombre: "Lógica y Estructuras Discretas", modalidad: "1C-2C", regular: [], aprobada: [], carga: 3, electiva: false },
  { id: "6", numero: "6", nivel: 1, nombre: "Algoritmo y Estructura de Datos", modalidad: "A", regular: [], aprobada: [], carga: 5, electiva: false },
  { id: "7", numero: "7", nivel: 1, nombre: "Arquitectura de Computadoras", modalidad: "2C-1C", regular: [], aprobada: [], carga: 4, electiva: false },
  { id: "8", numero: "8", nivel: 1, nombre: "Sistemas y Proceso de Negocios", modalidad: "1C-2C", regular: [], aprobada: [], carga: 3, electiva: false },
  { id: "11", numero: "11", nivel: 1, nombre: "Ingeniería y Sociedad", modalidad: "2C-1C", regular: [], aprobada: [], carga: 2, electiva: false },

  // NIVEL 2
  { id: "9", numero: "9", nivel: 2, nombre: "Análisis Matemático II", modalidad: "A", regular: ["1", "2"], aprobada: [], carga: 5, electiva: false },
  { id: "10", numero: "10", nivel: 2, nombre: "Física II", modalidad: "A", regular: ["1", "3"], aprobada: [], carga: 5, electiva: false },
  { id: "12", numero: "12", nivel: 2, nombre: "Inglés II", modalidad: "A", regular: ["4"], aprobada: [], carga: 2, electiva: false },
  { id: "13", numero: "13", nivel: 2, nombre: "Sintaxis y Semántica de los Lenguajes", modalidad: "1C-2C", regular: ["5", "6"], aprobada: [], carga: 4, electiva: false },
  { id: "14", numero: "14", nivel: 2, nombre: "Paradigmas de Programación", modalidad: "1C-2C", regular: ["5", "6"], aprobada: [], carga: 4, electiva: false },
  { id: "15", numero: "15", nivel: 2, nombre: "Sistemas Operativos", modalidad: "A", regular: ["7"], aprobada: [], carga: 4, electiva: false },
  { id: "16", numero: "16", nivel: 2, nombre: "Análisis de Sistemas de Información (Int)", modalidad: "A", regular: ["6", "8"], aprobada: [], carga: 6, electiva: false },
  { id: "17", numero: "17", nivel: 2, nombre: "Probabilidad y Estadística", modalidad: "1C-2C", regular: ["1", "2"], aprobada: [], carga: 3, electiva: false },

  // NIVEL 3
  { id: "18", numero: "18", nivel: 3, nombre: "Economía", modalidad: "2C-1C", regular: [], aprobada: ["1", "2"], carga: 3, electiva: false },
  { id: "19", numero: "19", nivel: 3, nombre: "Base de Datos", modalidad: "1C-2C", regular: ["13", "16"], aprobada: ["5", "6"], carga: 4, electiva: false },
  { id: "20", numero: "20", nivel: 3, nombre: "Desarrollo de Software", modalidad: "1C-2C", regular: ["14", "16"], aprobada: ["5", "6"], carga: 4, electiva: false },
  { id: "21", numero: "21", nivel: 3, nombre: "Comunicación de Datos", modalidad: "A", regular: [], aprobada: ["3", "7"], carga: 4, electiva: false },
  { id: "22", numero: "22", nivel: 3, nombre: "Análisis Numérico", modalidad: "2C-1C", regular: ["9"], aprobada: ["1", "2"], carga: 3, electiva: false },
  { id: "23", numero: "23", nivel: 3, nombre: "Diseño de Sistemas de Información (Int)", modalidad: "A", regular: ["14", "16"], aprobada: ["4", "6", "8"], carga: 6, electiva: false },
  { id: "99", numero: "99", nivel: 3, nombre: "Seminario Integrador (Analista)", modalidad: "2C", regular: ["16"], aprobada: ["6", "8", "13", "14"], carga: 4, electiva: false },

  // NIVEL 4
  { id: "24", numero: "24", nivel: 4, nombre: "Legislación", modalidad: "2C-1C", regular: ["11"], aprobada: [], carga: 2, electiva: false },
  { id: "25", numero: "25", nivel: 4, nombre: "Ingeniería y Calidad de Software", modalidad: "2C-1C", regular: ["19", "20", "23"], aprobada: ["13", "14"], carga: 3, electiva: false },
  { id: "26", numero: "26", nivel: 4, nombre: "Redes de Datos", modalidad: "A", regular: ["15", "21"], aprobada: [], carga: 4, electiva: false },
  { id: "27", numero: "27", nivel: 4, nombre: "Investigación Operativa", modalidad: "A", regular: ["17", "22"], aprobada: [], carga: 4, electiva: false },
  { id: "28", numero: "28", nivel: 4, nombre: "Simulación", modalidad: "1C-2C", regular: ["17"], aprobada: ["9"], carga: 3, electiva: false },
  { id: "29", numero: "29", nivel: 4, nombre: "Tecnologías Para la Automatización", modalidad: "2C-1C", regular: ["10", "22"], aprobada: ["9"], carga: 3, electiva: false },
  { id: "30", numero: "30", nivel: 4, nombre: "Administración de Sistemas de Información (Int)", modalidad: "A", regular: ["18", "23"], aprobada: ["16"], carga: 6, electiva: false },

  // NIVEL 5
  { id: "31", numero: "31", nivel: 5, nombre: "Inteligencia Artificial", modalidad: "2C-1C", regular: ["28"], aprobada: ["17", "22"], carga: 3, electiva: false },
  { id: "32", numero: "32", nivel: 5, nombre: "Ciencia de Datos", modalidad: "2C-1C", regular: ["28"], aprobada: ["17", "19"], carga: 3, electiva: false },
  { id: "33", numero: "33", nivel: 5, nombre: "Sistemas de Gestión", modalidad: "1C-2C", regular: ["18", "27"], aprobada: ["23"], carga: 4, electiva: false },
  { id: "34", numero: "34", nivel: 5, nombre: "Gestión Gerencial", modalidad: "1C-2C", regular: ["24", "30"], aprobada: ["18"], carga: 3, electiva: false },
  { id: "35", numero: "35", nivel: 5, nombre: "Seguridad en los Sistemas de Información", modalidad: "1C-2C", regular: ["26", "30"], aprobada: ["20", "21"], carga: 3, electiva: false },
  { id: "36", numero: "36", nivel: 5, nombre: "Proyecto Final (Int)", modalidad: "A", regular: ["25", "26", "30"], aprobada: ["12", "20", "23"], carga: 6, electiva: false },

  // ELECTIVAS VIGENTES PLAN 2023
  { id: "E1", numero: "EL-3", nivel: 3, nombre: "Backend de Aplicaciones", modalidad: "2C", regular: ["14", "13"], aprobada: ["6"], carga: 4, creditos: 4, electiva: true },

  { id: "E2", numero: "EL-4", nivel: 4, nombre: "Green Software", modalidad: "1C-2C", regular: ["30"], aprobada: ["20"], carga: 3, creditos: 3, electiva: true },
  { id: "E3", numero: "EL-4", nivel: 4, nombre: "Gestión Industrial de la Producción", modalidad: "1C", regular: ["19"], aprobada: ["8", "16"], carga: 3, creditos: 3, electiva: true },
  { id: "E4", numero: "EL-4", nivel: 4, nombre: "Gestión de la Mejora de los Procesos", modalidad: "1C-2C", regular: ["19"], aprobada: ["8", "16"], carga: 3, creditos: 3, electiva: true },
  { id: "E5", numero: "EL-4", nivel: 4, nombre: "Desarrollo y Operaciones devOPS", modalidad: "2C", regular: ["19", "20", "23"], aprobada: ["13", "14"], carga: 3, creditos: 3, electiva: true },
  { id: "E6", numero: "EL-4", nivel: 4, nombre: "Desarrollo de Aplicaciones Con Objetos", modalidad: "2C", regular: ["13"], aprobada: ["6"], carga: 2, creditos: 2, electiva: true },
  { id: "E7", numero: "EL-4", nivel: 4, nombre: "Comunicación Multimedial en el Desarrollo de SI", modalidad: "2C", regular: ["19"], aprobada: ["8", "16"], carga: 3, creditos: 3, electiva: true },
  { id: "E8", numero: "EL-4", nivel: 4, nombre: "Seguridad en el Desarrollo de Software", modalidad: "1C", regular: ["19", "20", "23"], aprobada: ["8", "15"], carga: 3, creditos: 3, electiva: true },
  { id: "E9", numero: "EL-4", nivel: 4, nombre: "Experiencia e Interfaces de Usuario", modalidad: "1C", regular: ["23"], aprobada: [], carga: 3, creditos: 3, electiva: true },

  { id: "E10", numero: "EL-5", nivel: 5, nombre: "Desarrollo de Tecnología Blockchain", modalidad: "2C", regular: ["19", "26"], aprobada: ["14", "20"], carga: 3, creditos: 3, electiva: true },
  { id: "E11", numero: "EL-5", nivel: 5, nombre: "Gerenciamiento Estratégico", modalidad: "1C", regular: ["30"], aprobada: ["20"], carga: 3, creditos: 3, electiva: true },
  { id: "E12", numero: "EL-5", nivel: 5, nombre: "Creatividad y Desarrollos en Entornos Virtuales", modalidad: "2C", regular: ["23"], aprobada: ["20"], carga: 3, creditos: 3, electiva: true },
  { id: "E13", numero: "EL-5", nivel: 5, nombre: "Consultoría en Negocios Digitales", modalidad: "2C", regular: ["30"], aprobada: ["20"], carga: 3, creditos: 3, electiva: true },
  { id: "E14", numero: "EL-5", nivel: 5, nombre: "Emprendimientos Tecnológicos", modalidad: "1C-2C", regular: ["30"], aprobada: ["16", "19"], carga: 3, creditos: 3, electiva: true },
  { id: "E15", numero: "EL-5", nivel: 5, nombre: "Habilidades Blandas", modalidad: "2C", regular: ["30"], aprobada: [], carga: 3, creditos: 3, electiva: true },
  { id: "E16", numero: "EL-5", nivel: 5, nombre: "Decisiones en Escenarios Complejos", modalidad: "1C-2C", regular: ["27"], aprobada: [], carga: 3, creditos: 3, electiva: true },
  { id: "E17", numero: "EL-5", nivel: 5, nombre: "Testing de Software", modalidad: "2C", regular: ["25"], aprobada: ["19", "20"], carga: 3, creditos: 3, electiva: true },
  { id: "E18", numero: "EL-5", nivel: 5, nombre: "Integración de Aplicaciones en Entorno Web", modalidad: "2C", regular: ["26"], aprobada: ["19", "20"], carga: 3, creditos: 3, electiva: true },
  { id: "E19", numero: "EL-5", nivel: 5, nombre: "Ingeniería de Software de Fuentes Abiertas/Libres", modalidad: "1C", regular: ["19", "20", "26"], aprobada: ["13", "14"], carga: 3, creditos: 3, electiva: true }
];

const STORAGE_KEY_ESTADOS = "isi2023_estados_alumno";
const STORAGE_KEY_CURSOS = "isi2023_cursos_seleccionados";

const MATERIAS_MAP = Object.fromEntries(MATERIAS.map(m => [m.id, m]));

// Estados de cada materia ("none" | "regular" | "aprobado" | "cursando")
let estadosAlumno = loadFromStorage(STORAGE_KEY_ESTADOS, {});
// Mapa materiaId -> comisionOptionId (ej. { "17": "2K6-1C", "21": "3K3-A", "15": "2K9-A", "19": "3K5-1C" })
let cursosSeleccionados = loadFromStorage(STORAGE_KEY_CURSOS, {});
if (Array.isArray(cursosSeleccionados)) {
  cursosSeleccionados = {};
}

let currentCuatFilter = "all"; // "all" | "1C" | "2C"
// Materia activa en el selector para previsualizar dónde se pueden plantar sus comisiones
let activePreviewMateriaId = null;
// Comisión sobre la que se está pasando el mouse (hover) para resaltar todos sus bloques
let hoveredPreviewOptionId = null;
// Filtro para mostrar solo comisiones de Sistemas (K) o también Básicas de otras carreras en la vista previa
let showOnlyIsiInPreview = true;

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY_ESTADOS, JSON.stringify(estadosAlumno));
  localStorage.setItem(STORAGE_KEY_CURSOS, JSON.stringify(cursosSeleccionados));
}

function getEstado(id) {
  return estadosAlumno[id] || "none";
}

function cumpleRegular(reqId) {
  const st = getEstado(reqId);
  return st === "regular" || st === "aprobado";
}

function cumpleAprobada(reqId) {
  return getEstado(reqId) === "aprobado";
}

function evaluarHabilitacion(materia) {
  const estadoActual = getEstado(materia.id);
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

function setEstadoMateria(id, nuevoEstado) {
  if (nuevoEstado === "none") {
    delete estadosAlumno[id];
  } else {
    estadosAlumno[id] = nuevoEstado;
  }

  if (nuevoEstado === "aprobado" || nuevoEstado === "regular") {
    delete cursosSeleccionados[id];
  }

  // Limpiar cualquier materia seleccionada en el horario que haya dejado de estar habilitada
  for (const mId of Object.keys(cursosSeleccionados)) {
    const mat = MATERIAS_MAP[mId];
    if (mat && !evaluarHabilitacion(mat).habilitadaParaCursar) {
      delete cursosSeleccionados[mId];
    }
  }

  saveToStorage();
  renderAll();
}

function selectComisionMateria(materiaId, optionId) {
  if (!optionId) {
    delete cursosSeleccionados[materiaId];
    if (estadosAlumno[materiaId] === "cursando") {
      delete estadosAlumno[materiaId];
    }
  } else {
    cursosSeleccionados[materiaId] = optionId;
    estadosAlumno[materiaId] = "cursando";
  }
  saveToStorage();
  renderAll();
}

function getOpcionesComision(materiaId) {
  if (typeof HORARIOS_MATERIAS !== "undefined" && HORARIOS_MATERIAS[materiaId]) {
    return HORARIOS_MATERIAS[materiaId];
  }
  return [];
}

function formatShortTime(tStr) {
  // Convierte "14:00" -> "14" y "13:15" -> "13:15" como en el calendario de la imagen
  const [hh, mm] = tStr.split(":");
  const hNum = parseInt(hh, 10);
  return mm === "00" ? `${hNum}` : `${hNum}:${mm}`;
}

function formatBloquesResumen(bloques) {
  return getMergedBloques(bloques)
    .map(b => `${b.dia.slice(0, 3)} ${formatShortTime(b.inicio)}-${formatShortTime(b.fin)}hs`)
    .join(" • ");
}

function timeToMinutes(tStr) {
  const [hh, mm] = tStr.split(":").map(Number);
  return hh * 60 + mm;
}

// Une bloques de la misma comisión en el mismo día que solo están separados por un recreo corto (<= 30 min, ej. 12:05-12:50 y 13:15-14:45 -> 12:05-14:45)
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
      // Si se tocan o están separados por un recreo de hasta 30 minutos, los unificamos en un solo bloque visual
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

// Renderizado general
function renderAll() {
  updateHeaderStats();
  renderAlumnoTab();
  renderCursadoPicker();
  renderUtnCalendar();
}

function updateHeaderStats() {
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
        // Es obligatoria
        if (m.id !== "99") {
          obligatoriasIngAprobadas++;
        }
        if (m.nivel <= 3) {
          obligatoriasAnaAprobadas++;
        }
      }
    } else if (st === "regular") {
      regulares++;
    } else if (st === "cursando" || cursosSeleccionados[m.id]) {
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

  // Cálculo de porcentaje Ingeniería en Sistemas:
  // Requisitos: 36 materias obligatorias (N° 1 a 36) + 20 créditos de electivas = 56 unidades ponderadas
  const creditosIngCumplidos = Math.min(20, creditos);
  const totalUnidadesIng = 36 + 20;
  const unidadesIngActuales = obligatoriasIngAprobadas + creditosIngCumplidos;
  const pctIng = Math.min(100, Math.round((unidadesIngActuales / totalUnidadesIng) * 1000) / 10);

  document.getElementById("prog-ing-pct").textContent = `${pctIng}%`;
  document.getElementById("prog-ing-bar").style.width = `${pctIng}%`;
  document.getElementById("prog-ing-detail").textContent =
    `${obligatoriasIngAprobadas} / 36 obligatorias • ${creditosIngCumplidos} / 20 créditos electivas`;

  // Cálculo de porcentaje Título Intermedio (Analista Desarrollador Universitario):
  // Requisitos según PDF: aprobar materias 1 a 23 + Seminario Integrador (99) [24 materias] + 4 créditos electivas de 3° nivel
  const creditosAnaCumplidos = Math.min(4, creditosNivel3);
  const totalUnidadesAna = 24 + 4;
  const unidadesAnaActuales = obligatoriasAnaAprobadas + creditosAnaCumplidos;
  const pctAna = Math.min(100, Math.round((unidadesAnaActuales / totalUnidadesAna) * 1000) / 10);

  document.getElementById("prog-ana-pct").textContent = `${pctAna}%`;
  document.getElementById("prog-ana-bar").style.width = `${pctAna}%`;
  document.getElementById("prog-ana-detail").textContent =
    `${obligatoriasAnaAprobadas} / 24 obligatorias (1° a 3° + Sem.) • ${creditosAnaCumplidos} / 4 cr. 3° nivel`;
}

function formatCorrelativasPills(materia) {
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

function renderAlumnoTab() {
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
          ${materiasNivel.map(m => renderAlumnoCard(m)).join("")}
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

function renderAlumnoCard(m) {
  const st = getEstado(m.id);
  const comElegida = cursosSeleccionados[m.id];
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

function togglePreviewMateria(materiaId) {
  if (activePreviewMateriaId === materiaId) {
    activePreviewMateriaId = null;
  } else {
    activePreviewMateriaId = materiaId;
  }
  hoveredPreviewOptionId = null;
  renderCursadoPicker();
  renderUtnCalendar();
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
  const list = [];
  for (const [mId, optId] of Object.entries(cursosSeleccionados)) {
    const materia = MATERIAS_MAP[mId];
    if (!materia) continue;
    const opciones = getOpcionesComision(mId);
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

// =========================================================================
// PESTAÑA 2: PANEL DE SELECCIÓN DE CURSO POR MATERIA Y CALENDARIO UTN
// =========================================================================
function renderCursadoPicker() {
  const listContainer = document.getElementById("cursado-picker-list");
  const searchQuery = document.getElementById("search-cursado").value.trim().toLowerCase();
  const filterNivel = document.getElementById("filter-nivel-cursado").value;
  const showLocked = document.getElementById("toggle-show-locked").checked;

  // Si la materia que estaba en vista previa dejó de estar habilitada, limpiarla
  if (activePreviewMateriaId) {
    const matPrev = MATERIAS_MAP[activePreviewMateriaId];
    if (!matPrev || !evaluarHabilitacion(matPrev).habilitadaParaCursar) {
      activePreviewMateriaId = null;
    }
  }

  const materiasFiltradas = MATERIAS.filter(m => {
    const ev = evaluarHabilitacion(m);
    if (ev.yaAprobada || ev.yaRegular) return false;
    if (!showLocked && !ev.habilitadaParaCursar) return false;

    if (filterNivel === "electivas" && !m.electiva) return false;
    if (filterNivel !== "all" && filterNivel !== "electivas" && String(m.nivel) !== filterNivel) return false;

    if (searchQuery) {
      const matchNombre = m.nombre.toLowerCase().includes(searchQuery);
      const matchNum = m.numero.toLowerCase().includes(searchQuery);
      if (!matchNombre && !matchNum) return false;
    }
    return true;
  });

  if (materiasFiltradas.length === 0) {
    listContainer.innerHTML = `<div style="padding: 1.5rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.83rem;">
      No hay materias habilitadas para este filtro.
    </div>`;
    return;
  }

  const enrolledBlocks = getEnrolledBlocksList();

  listContainer.innerHTML = materiasFiltradas
    .map(m => {
      const ev = evaluarHabilitacion(m);
      const opciones = getOpcionesComision(m.id);
      const selectedId = cursosSeleccionados[m.id] || "";
      const selectedObj = opciones.find(o => o.id === selectedId);
      const isPreviewActive = activePreviewMateriaId === m.id;

      if (!ev.habilitadaParaCursar) {
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

      const isIsiComision = o => /^\d+K/i.test(o.comision);
      const isiOpts = opciones.filter(isIsiComision);
      const otrasOpts = opciones.filter(o => !isIsiComision(o));
      const displayedOpts = showOnlyIsiInPreview && isiOpts.length > 0 ? isiOpts : opciones;

      let comisionesPillsHtml = "";
      if (isPreviewActive) {
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
                ${showOnlyIsiInPreview ? `+ Ver otras especialidades (${otrasOpts.length})` : `Ver solo Sistemas K (${isiOpts.length})`}
              </button>`
            : "";

        comisionesPillsHtml = `
          <div class="picker-preview-panel">
            <div class="picker-preview-hint">
              <span>Mostrando <strong>${displayedOpts.length}</strong> comisiones en la grilla (clic para plantar):</span>
              ${selectedId ? `<button type="button" class="btn-unplant-inline" data-unplant-id="${m.id}">Quitar ${selectedObj ? selectedObj.comision : ""}</button>` : ""}
            </div>
            <div class="comisiones-chips-grid">
              ${pills}
            </div>
            ${toggleExtraBtn}
          </div>
        `;
      }

      return `
        <div class="picker-item ${selectedId ? "enrolled" : ""} ${isPreviewActive ? "previewing" : ""}">
          <div class="picker-radio-row" data-toggle-materia="${m.id}" title="Clic para mostrar/ocultar dónde se plantan las comisiones de ${m.nombre} en la grilla">
            <div class="picker-subject-info">
              <div class="picker-title-line">
                <span class="picker-item-title">${m.nombre}</span>
                ${selectedObj ? `<span class="planted-badge">${selectedObj.comision}</span>` : ""}
              </div>
              <div class="picker-submeta">
                <span>${m.nivel}° Año • ${m.carga} hs</span>
                ${m.electiva ? `<span class="meta-tag tag-electiva">Electiva</span>` : ""}
                ${selectedObj ? `<span class="planted-schedule-text">(${formatBloquesResumen(selectedObj.bloques)})</span>` : ""}
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
    })
    .join("");

  // Evento al hacer clic en la fila o el botón redondo de la materia (como en el boceto: "Algebra (•)")
  listContainer.querySelectorAll("[data-toggle-materia]").forEach(el => {
    el.addEventListener("click", e => {
      e.stopPropagation();
      const mId = el.getAttribute("data-toggle-materia");
      togglePreviewMateria(mId);
    });
  });

  // Evento al hacer clic o pasar el mouse sobre un chip de comisión (1K1, 1K2, etc.)
  listContainer.querySelectorAll(".comision-chip").forEach(chip => {
    chip.addEventListener("click", e => {
      e.stopPropagation();
      const mId = chip.getAttribute("data-materia-id");
      const optId = chip.getAttribute("data-option-id");
      if (cursosSeleccionados[mId] === optId) {
        selectComisionMateria(mId, "");
      } else {
        selectComisionMateria(mId, optId);
      }
    });

    chip.addEventListener("mouseenter", () => {
      hoveredPreviewOptionId = chip.getAttribute("data-option-id");
      highlightHoveredOptionInCalendar(hoveredPreviewOptionId);
    });

    chip.addEventListener("mouseleave", () => {
      hoveredPreviewOptionId = null;
      highlightHoveredOptionInCalendar(null);
    });
  });

  // Botón para quitar comisión plantada
  listContainer.querySelectorAll("[data-unplant-id]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const mId = btn.getAttribute("data-unplant-id");
      selectComisionMateria(mId, "");
    });
  });

  // Botón para alternar entre solo comisiones K o todas las básicas
  listContainer.querySelectorAll('[data-action="toggle-isi"]').forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      showOnlyIsiInPreview = !showOnlyIsiInPreview;
      renderCursadoPicker();
      renderUtnCalendar();
    });
  });
}

function highlightHoveredOptionInCalendar(optionId) {
  const allCards = document.querySelectorAll(".utn-class-card");
  allCards.forEach(card => {
    const cardOptId = card.getAttribute("data-option-id");
    if (!optionId) {
      card.classList.remove("is-hovered-option", "is-dimmed-preview");
    } else if (cardOptId === optionId) {
      card.classList.add("is-hovered-option");
      card.classList.remove("is-dimmed-preview");
    } else if (card.classList.contains("is-preview-card")) {
      card.classList.add("is-dimmed-preview");
      card.classList.remove("is-hovered-option");
    }
  });
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

  // Para cada cluster, asignar carriles (lanes) para que todas las opciones ("1K1", "1K2", etc.) se vean sin taparse
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

function renderUtnCalendar() {
  const calBody = document.getElementById("utn-cal-body");
  const summaryPill = document.getElementById("enrolled-summary-pill");
  const btnClear = document.getElementById("btn-clear-plan");
  const conflictBanner = document.getElementById("conflict-alert-banner");

  const daysOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  // 1) Recolectar todos los bloques de las comisiones ya plantadas (inscriptas)
  const enrolledBlocks = [];
  let totalMaterias = 0;
  let totalHoras = 0;

  for (const [mId, optId] of Object.entries(cursosSeleccionados)) {
    const materia = MATERIAS_MAP[mId];
    if (!materia) continue;
    const opciones = getOpcionesComision(mId);
    const opt = opciones.find(o => o.id === optId);
    if (!opt) continue;

    // Filtrar por cuatrimestre si el usuario eligió 1C o 2C
    if (currentCuatFilter === "1C" && opt.periodo === "2° Cuat.") continue;
    if (currentCuatFilter === "2C" && opt.periodo === "1° Cuat.") continue;

    totalMaterias++;
    totalHoras += materia.carga;

    for (const b of getMergedBloques(opt.bloques)) {
      enrolledBlocks.push({
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

  summaryPill.textContent = `${totalMaterias} ${totalMaterias === 1 ? "materia inscripta" : "materias inscriptas"} (${totalHoras} hs/sem)`;
  btnClear.disabled = Object.keys(cursosSeleccionados).length === 0;

  // Detectar superposiciones horarias entre materias ya inscriptas
  const conflictsList = [];
  for (let i = 0; i < enrolledBlocks.length; i++) {
    for (let j = i + 1; j < enrolledBlocks.length; j++) {
      const a = enrolledBlocks[i];
      const b = enrolledBlocks[j];
      if (a.dia === b.dia) {
        const disjointCuat =
          (a.periodo === "1° Cuat." && b.periodo === "2° Cuat.") ||
          (a.periodo === "2° Cuat." && b.periodo === "1° Cuat.");
        if (!disjointCuat && a.startMin < b.endMin && b.startMin < a.endMin) {
          a.conflict = true;
          b.conflict = true;
          conflictsList.push(
            `${a.dia}: <strong>${a.materiaNombre} (${a.comision})</strong> se superpone con <strong>${b.materiaNombre} (${b.comision})</strong> (${a.inicio}-${a.fin} vs ${b.inicio}-${b.fin})`
          );
        }
      }
    }
  }

  // 2) Si hay una materia seleccionada en el selector de la izquierda (activePreviewMateriaId),
  // generar los bloques de vista previa ("dónde se va a plantar") para sus comisiones.
  // Si una comisión choca con otra materia ya plantada en ese día y horario, se marca en ROJO (conflict = true).
  const previewBlocks = [];
  let previewMateriaObj = null;

  if (activePreviewMateriaId && MATERIAS_MAP[activePreviewMateriaId]) {
    previewMateriaObj = MATERIAS_MAP[activePreviewMateriaId];
    const todasOpciones = getOpcionesComision(activePreviewMateriaId);
    const isIsiComision = o => /^\d+K/i.test(o.comision);
    const isiOpts = todasOpciones.filter(isIsiComision);
    const opcionesAMostrar = showOnlyIsiInPreview && isiOpts.length > 0 ? isiOpts : todasOpciones;
    const plantedOptionId = cursosSeleccionados[activePreviewMateriaId] || null;

    for (const opt of opcionesAMostrar) {
      // Si esta comisión ya está plantada como inscripta, ya está en enrolledBlocks
      if (opt.id === plantedOptionId) continue;

      if (currentCuatFilter === "1C" && opt.periodo === "2° Cuat.") continue;
      if (currentCuatFilter === "2C" && opt.periodo === "1° Cuat.") continue;

      // Verificar si la comisión entera o cada bloque tiene choque con otra materia ya plantada
      const optionConflicts = doesOptionConflictWithEnrolled(activePreviewMateriaId, opt, enrolledBlocks);

      for (const b of getMergedBloques(opt.bloques)) {
        const bStart = timeToMinutes(b.inicio);
        const bEnd = timeToMinutes(b.fin);
        let blockConflictsWithOther = false;
        const conflictingNames = [];

        for (const eb of enrolledBlocks) {
          if (eb.materiaId === activePreviewMateriaId) continue;
          if (eb.dia !== b.dia) continue;
          const disjointCuat =
            (opt.periodo === "1° Cuat." && eb.periodo === "2° Cuat.") ||
            (opt.periodo === "2° Cuat." && eb.periodo === "1° Cuat.");
          if (!disjointCuat && bStart < eb.endMin && eb.startMin < bEnd) {
            blockConflictsWithOther = true;
            conflictingNames.push(`${eb.materiaNombre} (${eb.comision})`);
            // También marcamos en rojo el bloque plantado en ese horario y día para que resalte el choque
            eb.conflictWithPreview = true;
          }
        }

        previewBlocks.push({
          materiaId: activePreviewMateriaId,
          materiaNombre: previewMateriaObj.nombre.replace(/\s*\(Int\)\**/gi, ""),
          comision: opt.comision,
          optionId: opt.id,
          periodo: opt.periodo,
          dia: b.dia,
          inicio: b.inicio,
          fin: b.fin,
          startMin: bStart,
          endMin: bEnd,
          conflict: blockConflictsWithOther || optionConflicts,
          blockDirectConflict: blockConflictsWithOther,
          conflictingNames,
          isPreview: true
        });
      }
    }
  }

  const allBlocks = [...enrolledBlocks, ...previewBlocks];

  if (conflictsList.length > 0) {
    conflictBanner.style.display = "block";
    conflictBanner.innerHTML = `⚠️ <strong>Superposición horaria detectada:</strong><br>${conflictsList.join("<br>")}`;
  } else if (previewMateriaObj) {
    conflictBanner.style.display = "block";
    conflictBanner.className = "conflict-banner preview-active-banner";
    conflictBanner.innerHTML = `📍 Previsualizando dónde plantar <strong>${previewMateriaObj.nombre}</strong>: hacé clic en cualquier bloque (ej. <strong>1K1</strong>, <strong>1K2</strong>...) en la grilla para plantarla. Los bloques en <strong style="color:#fca5a5;">rojo</strong> indican que ya hay otra materia en ese día y horario.`;
  } else {
    conflictBanner.className = "conflict-banner";
    conflictBanner.style.display = "none";
  }

  if (conflictsList.length > 0) {
    conflictBanner.className = "conflict-banner";
  }

  // Determinar el rango horario vertical en horas enteras para que la columna de horas (08:00, 09:00, 10:00...) y las franjas coincidan con precisión
  let minHour = 8; // 08:00
  let maxHour = 23; // 23:00

  if (allBlocks.length > 0) {
    const earliest = Math.min(...allBlocks.map(b => b.startMin));
    const latest = Math.max(...allBlocks.map(b => b.endMin));
    minHour = Math.max(7, Math.floor(earliest / 60));
    maxHour = Math.min(24, Math.ceil(latest / 60));
    if (maxHour - minHour < 8) {
      maxHour = Math.min(24, minHour + 8);
    }
  }

  const minMin = minHour * 60;
  const maxMin = maxHour * 60;
  const totalRange = maxMin - minMin;
  const numHours = maxHour - minHour;

  let stripesHtml = `<div class="utn-stripes-layer">`;
  let timeColSlotsHtml = "";

  for (let h = minHour; h < maxHour; h++) {
    const hLabel = `${h}:00`;
    stripesHtml += `<div class="utn-stripe-band"></div>`;
    timeColSlotsHtml += `<div class="utn-time-slot"><span>${hLabel}</span></div>`;
  }
  stripesHtml += `</div>`;

  const timeColHtml = `<div class="utn-time-column">${timeColSlotsHtml}</div>`;

  let colsHtml = "";
  for (const dayName of daysOrder) {
    const dayBlocks = computeColumnLanes(allBlocks.filter(b => b.dia === dayName));
    const cardsHtml = dayBlocks
      .map(b => {
        const topPct = ((b.startMin - minMin) / totalRange) * 100;
        const heightPct = Math.max(7.5, ((b.endMin - b.startMin) / totalRange) * 100);
        const timeLabel = `${formatShortTime(b.inicio)} — ${formatShortTime(b.fin)}hs`;

        const totalLanes = b.totalLanes || 1;
        const laneIndex = b.laneIndex || 0;
        const widthPct = 100 / totalLanes;
        const leftPct = laneIndex * widthPct;
        const isTwoLanes = totalLanes === 2;
        const isCompactLane = totalLanes >= 3;

        const isRedConflict = b.conflict || b.conflictWithPreview;
        const cardClasses = [
          "utn-class-card",
          b.isPreview ? "is-preview-card" : "is-enrolled-card",
          isRedConflict ? "has-conflict" : "",
          isTwoLanes ? "is-two-lanes" : "",
          isCompactLane ? "is-compact-lane" : ""
        ]
          .filter(Boolean)
          .join(" ");

        const tooltipText = b.isPreview
          ? b.conflict
            ? `⚠️ Choca con ${b.conflictingNames && b.conflictingNames.length ? b.conflictingNames.join(", ") : "otra materia plantada en otro día"} — Clic para plantar igual ${b.materiaNombre} (${b.comision} - ${b.periodo})`
            : `Clic para plantar ${b.materiaNombre} en comisión ${b.comision} (${b.periodo}: ${timeLabel})`
          : `Inscripto: ${b.materiaNombre} (${b.comision} - ${b.periodo}). Clic para ver opciones o cambiar.`;

        const statusText = b.isPreview
          ? b.conflict
            ? "(Ocupado / Choque)"
            : "(Plantar aquí)"
          : "(Inscripto)";

        return `
          <div class="${cardClasses}"
               style="top: ${topPct.toFixed(2)}%; height: ${heightPct.toFixed(2)}%; left: calc(${leftPct.toFixed(2)}% + 2px); width: calc(${widthPct.toFixed(2)}% - 4px);"
               data-materia-id="${b.materiaId}"
               data-option-id="${b.optionId}"
               data-is-preview="${b.isPreview ? "1" : "0"}"
               title="${tooltipText}">
            <div class="utn-card-time">${timeLabel}</div>
            <div class="utn-card-subject">${b.materiaNombre}</div>
            <div class="utn-card-status">${statusText}</div>
            <div class="utn-card-comision">${b.comision}</div>
          </div>
        `;
      })
      .join("");

    colsHtml += `<div class="utn-day-column">${cardsHtml}</div>`;
  }

  const emptyOverlayHtml =
    allBlocks.length === 0
      ? `<div class="utn-empty-overlay">
          <div class="utn-empty-box">
            <h3>Tu grilla de horarios está vacía</h3>
            <p>Seleccioná una materia (ej. <strong>Álgebra</strong>) en la lista de <strong>Materias</strong> de la izquierda para ver en qué días y horarios se plantan sus comisiones (<strong>1K1</strong>, <strong>1K2</strong>, <strong>1K3</strong>...).</p>
          </div>
        </div>`
      : "";

  calBody.innerHTML = stripesHtml + timeColHtml + colsHtml + emptyOverlayHtml;

  // Eventos en las tarjetas del calendario:
  // - Si es una tarjeta de vista previa (is-preview-card): al hacer clic se planta directamente esa comisión!
  // - Si es una tarjeta ya plantada (is-enrolled-card): al hacer clic abre/alterna la vista previa de esa materia.
  calBody.querySelectorAll(".utn-class-card").forEach(card => {
    const mId = card.getAttribute("data-materia-id");
    const optId = card.getAttribute("data-option-id");
    const isPrev = card.getAttribute("data-is-preview") === "1";

    card.addEventListener("click", () => {
      if (isPrev) {
        selectComisionMateria(mId, optId);
      } else {
        togglePreviewMateria(mId);
      }
    });

    card.addEventListener("mouseenter", () => {
      if (activePreviewMateriaId) {
        highlightHoveredOptionInCalendar(optId);
      }
    });

    card.addEventListener("mouseleave", () => {
      if (activePreviewMateriaId) {
        highlightHoveredOptionInCalendar(null);
      }
    });
  });
}

// Eventos
function setupEvents() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      switchTab(target);
    });
  });

  document.getElementById("btn-go-cursado").addEventListener("click", () => {
    switchTab("cursado");
  });

  // Filtros Alumno
  document.getElementById("search-alumno").addEventListener("input", renderAlumnoTab);
  document.getElementById("filter-nivel-alumno").addEventListener("change", renderAlumnoTab);
  document.getElementById("filter-estado-alumno").addEventListener("change", renderAlumnoTab);

  // Acciones rápidas por año
  document.getElementById("quick-year-select").addEventListener("change", e => {
    const val = e.target.value;
    if (!val) return;
    const [nivelStr, estado] = val.split(":");
    const nivel = Number(nivelStr);

    MATERIAS.forEach(m => {
      if (m.nivel === nivel && !m.electiva) {
        estadosAlumno[m.id] = estado;
        delete cursosSeleccionados[m.id];
      }
    });

    e.target.value = "";
    saveToStorage();
    renderAll();
  });

  document.getElementById("btn-reset-all").addEventListener("click", () => {
    if (confirm("¿Seguro que querés reiniciar todas las materias y vaciar el horario?")) {
      estadosAlumno = {};
      cursosSeleccionados = {};
      saveToStorage();
      renderAll();
    }
  });

  // Filtros Cursado
  document.getElementById("search-cursado").addEventListener("input", renderCursadoPicker);
  document.getElementById("filter-nivel-cursado").addEventListener("change", renderCursadoPicker);
  document.getElementById("toggle-show-locked").addEventListener("change", renderCursadoPicker);

  // Filtro de cuatrimestre en el calendario
  document.querySelectorAll(".cuat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cuat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCuatFilter = btn.getAttribute("data-cuat");
      renderUtnCalendar();
    });
  });

  // Vaciar horario
  document.getElementById("btn-clear-plan").addEventListener("click", () => {
    for (const mId of Object.keys(cursosSeleccionados)) {
      if (estadosAlumno[mId] === "cursando") {
        delete estadosAlumno[mId];
      }
    }
    cursosSeleccionados = {};
    saveToStorage();
    renderAll();
  });
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-tab") === tabName);
  });
  document.getElementById("tab-alumno").classList.toggle("active", tabName === "alumno");
  document.getElementById("tab-cursado").classList.toggle("active", tabName === "cursado");
}

document.addEventListener("DOMContentLoaded", () => {
  setupEvents();
  renderAll();
});
