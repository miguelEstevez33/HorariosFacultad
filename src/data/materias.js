// Régimen de Correlativas Plan 2023 - Ingeniería en Sistemas de Información (UTN FRC)
(function (global) {
  const App = (global.App = global.App || {});

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
    { id: "E16", numero: "EL-5", nivel: 5, nombre: "Decisiones en Escenarios Complejos", modalidad: "1C-2C", regular: ["27"], aprobada: ["19"], carga: 3, creditos: 3, electiva: true },
    { id: "E17", numero: "EL-5", nivel: 5, nombre: "Testing de Software", modalidad: "2C", regular: ["25"], aprobada: ["19", "20"], carga: 3, creditos: 3, electiva: true },
    { id: "E18", numero: "EL-5", nivel: 5, nombre: "Integración de Aplicaciones en Entorno Web", modalidad: "2C", regular: ["26"], aprobada: ["19", "20"], carga: 3, creditos: 3, electiva: true },
    { id: "E19", numero: "EL-5", nivel: 5, nombre: "Ingeniería de Software de Fuentes Abiertas/Libres", modalidad: "1C", regular: ["19", "20", "26"], aprobada: ["13", "14"], carga: 3, creditos: 3, electiva: true }
  ];

  const MATERIAS_MAP = Object.fromEntries(MATERIAS.map(m => [m.id, m]));

  App.data = {
    MATERIAS,
    MATERIAS_MAP
  };
})(window);
