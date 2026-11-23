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
  return bloques
    .map(b => `${b.dia.slice(0, 3)} ${formatShortTime(b.inicio)}-${formatShortTime(b.fin)}hs`)
    .join(" • ");
}

function timeToMinutes(tStr) {
  const [hh, mm] = tStr.split(":").map(Number);
  return hh * 60 + mm;
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

// =========================================================================
// PESTAÑA 2: PANEL DE SELECCIÓN DE CURSO POR MATERIA Y CALENDARIO UTN
// =========================================================================
function renderCursadoPicker() {
  const listContainer = document.getElementById("cursado-picker-list");
  const searchQuery = document.getElementById("search-cursado").value.trim().toLowerCase();
  const filterNivel = document.getElementById("filter-nivel-cursado").value;
  const showLocked = document.getElementById("toggle-show-locked").checked;

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

  listContainer.innerHTML = materiasFiltradas
    .map(m => {
      const ev = evaluarHabilitacion(m);
      const opciones = getOpcionesComision(m.id);
      const selectedId = cursosSeleccionados[m.id] || "";
      const selectedObj = opciones.find(o => o.id === selectedId);

      if (!ev.habilitadaParaCursar) {
        const faltas = [];
        if (ev.faltanRegulares.length) faltas.push(`Reg: N° ${ev.faltanRegulares.join(", ")}`);
        if (ev.faltanAprobadas.length) faltas.push(`Apr: N° ${ev.faltanAprobadas.join(", ")}`);
        return `
          <div class="picker-item locked">
            <div class="picker-item-header">
              <span class="picker-item-title">[${m.numero}] ${m.nombre}</span>
              <div class="picker-item-badges">
                <span class="meta-tag">${m.nivel}° Año</span>
              </div>
            </div>
            <div class="picker-locked-reason">🔒 Bloqueada (${faltas.join(" | ")})</div>
          </div>
        `;
      }

      const isIsiComision = o => /^\d+K/i.test(o.comision);
      const renderOption = o => {
        const resumen = formatBloquesResumen(o.bloques);
        const isSel = o.id === selectedId ? "selected" : "";
        return `<option value="${o.id}" ${isSel}>${o.comision} (${o.periodo}) — ${resumen}</option>`;
      };

      const isiOpts = opciones.filter(isIsiComision);
      const otrasOpts = opciones.filter(o => !isIsiComision(o));

      let optionsHtml = "";
      if (isiOpts.length > 0 && otrasOpts.length > 0) {
        optionsHtml = `
          <optgroup label="Comisiones Sistemas (K)">
            ${isiOpts.map(renderOption).join("")}
          </optgroup>
          <optgroup label="Otras Especialidades / Básicas">
            ${otrasOpts.map(renderOption).join("")}
          </optgroup>
        `;
      } else {
        optionsHtml = opciones.map(renderOption).join("");
      }

      return `
        <div class="picker-item ${selectedId ? "enrolled" : ""}">
          <div class="picker-item-header">
            <span class="picker-item-title">[${m.numero}] ${m.nombre}</span>
            <div class="picker-item-badges">
              ${m.electiva ? `<span class="meta-tag tag-electiva">Electiva</span>` : ""}
              <span class="meta-tag">${m.nivel}° Año</span>
              <span class="meta-tag">${m.carga} hs</span>
            </div>
          </div>

          <select class="picker-course-select ${selectedId ? "has-value" : ""}" data-materia-id="${m.id}">
            <option value="">— Seleccionar comisión (${opciones.length} disp.) —</option>
            ${optionsHtml}
          </select>

          ${
            selectedObj
              ? `<div class="picker-schedule-preview">✓ Inscripto en <strong>${selectedObj.comision}</strong> (${selectedObj.periodo}): ${formatBloquesResumen(selectedObj.bloques)}</div>`
              : ""
          }
        </div>
      `;
    })
    .join("");

  listContainer.querySelectorAll(".picker-course-select").forEach(sel => {
    sel.addEventListener("change", () => {
      const mId = sel.getAttribute("data-materia-id");
      selectComisionMateria(mId, sel.value);
    });
  });
}

function renderUtnCalendar() {
  const calBody = document.getElementById("utn-cal-body");
  const summaryPill = document.getElementById("enrolled-summary-pill");
  const btnClear = document.getElementById("btn-clear-plan");
  const conflictBanner = document.getElementById("conflict-alert-banner");

  const daysOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  // Recolectar todos los bloques de las comisiones seleccionadas
  const activeBlocks = [];
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

    for (const b of opt.bloques) {
      activeBlocks.push({
        materiaId: mId,
        materiaNombre: materia.nombre.replace(/\s*\(Int\)\**/gi, ""),
        comision: opt.comision,
        periodo: opt.periodo,
        dia: b.dia,
        inicio: b.inicio,
        fin: b.fin,
        startMin: timeToMinutes(b.inicio),
        endMin: timeToMinutes(b.fin),
        conflict: false
      });
    }
  }

  summaryPill.textContent = `${totalMaterias} ${totalMaterias === 1 ? "materia inscripta" : "materias inscriptas"} (${totalHoras} hs/sem)`;
  btnClear.disabled = Object.keys(cursosSeleccionados).length === 0;

  // Detectar superposiciones horarias en el mismo día
  const conflictsList = [];
  for (let i = 0; i < activeBlocks.length; i++) {
    for (let j = i + 1; j < activeBlocks.length; j++) {
      const a = activeBlocks[i];
      const b = activeBlocks[j];
      if (a.dia === b.dia) {
        // Si uno es 1C y el otro 2C no chocan en la realidad
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

  if (conflictsList.length > 0) {
    conflictBanner.style.display = "block";
    conflictBanner.innerHTML = `⚠️ <strong>Superposición horaria detectada:</strong><br>${conflictsList.join("<br>")}`;
  } else {
    conflictBanner.style.display = "none";
  }

  // Determinar el rango horario vertical para escalar la grilla con precisión
  let minMin = 8 * 60; // 08:00
  let maxMin = 23 * 60 + 15; // 23:15

  if (activeBlocks.length > 0) {
    const earliest = Math.min(...activeBlocks.map(b => b.startMin));
    const latest = Math.max(...activeBlocks.map(b => b.endMin));
    minMin = Math.max(7 * 60 + 30, Math.floor((earliest - 30) / 60) * 60);
    maxMin = Math.min(23 * 60 + 30, Math.ceil((latest + 30) / 60) * 60);
    if (maxMin - minMin < 360) {
      maxMin = Math.min(23 * 60 + 30, minMin + 420);
    }
  }

  const totalRange = maxMin - minMin;
  const NUM_STRIPES = 12;

  let stripesHtml = `<div class="utn-stripes-layer">`;
  for (let s = 0; s < NUM_STRIPES; s++) {
    stripesHtml += `<div class="utn-stripe-band"></div>`;
  }
  stripesHtml += `</div>`;

  let colsHtml = "";
  for (const dayName of daysOrder) {
    const dayBlocks = activeBlocks.filter(b => b.dia === dayName);
    const cardsHtml = dayBlocks
      .map(b => {
        const topPct = ((b.startMin - minMin) / totalRange) * 100;
        const heightPct = Math.max(8.5, ((b.endMin - b.startMin) / totalRange) * 100);
        const timeLabel = `${formatShortTime(b.inicio)} — ${formatShortTime(b.fin)}hs`;

        return `
          <div class="utn-class-card ${b.conflict ? "has-conflict" : ""}"
               style="top: ${topPct.toFixed(2)}%; height: ${heightPct.toFixed(2)}%;"
               data-materia-id="${b.materiaId}"
               title="Clic para cambiar o quitar ${b.materiaNombre} (${b.comision} - ${b.periodo})">
            <div class="utn-card-time">${timeLabel}</div>
            <div class="utn-card-subject">${b.materiaNombre}</div>
            <div class="utn-card-status">(Inscripto)</div>
            <div class="utn-card-comision">${b.comision}</div>
          </div>
        `;
      })
      .join("");

    colsHtml += `<div class="utn-day-column">${cardsHtml}</div>`;
  }

  const emptyOverlayHtml =
    activeBlocks.length === 0
      ? `<div class="utn-empty-overlay">
          <div class="utn-empty-box">
            <h3>Tu grilla de horarios está vacía</h3>
            <p>Elegí la comisión (ej. <strong>1K1</strong>, <strong>2K6</strong>, <strong>3K3</strong>) en la lista de <strong>Materias Disponibles</strong> de la izquierda para ver tus bloques horarios aquí.</p>
          </div>
        </div>`
      : "";

  calBody.innerHTML = stripesHtml + colsHtml + emptyOverlayHtml;

  // Al hacer clic en una tarjeta del calendario, enfocar el selector de esa materia a la izquierda
  calBody.querySelectorAll(".utn-class-card").forEach(card => {
    card.addEventListener("click", () => {
      const mId = card.getAttribute("data-materia-id");
      const selectEl = document.querySelector(`.picker-course-select[data-materia-id="${mId}"]`);
      if (selectEl) {
        selectEl.scrollIntoView({ behavior: "smooth", block: "center" });
        selectEl.focus();
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
