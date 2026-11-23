# Selector de Materias, Correlativas y Horarios — ISI Plan 2023 (UTN FRC)

Aplicación web estática para gestionar el avance académico, verificar correlativas y armar la grilla horaria semanal de **Ingeniería en Sistemas de Información — Plan 2023 (UTN FRC)**.

---

## Características principales

### 1. Progreso de carrera en tiempo real
- **Ingeniería en Sistemas de Información:** calcula el avance sobre las **36 materias obligatorias** y **20 créditos de electivas**.
- **Título Intermedio (Analista Universitario):** calcula el avance sobre las **24 materias obligatorias** (1° a 3° nivel + Seminario Integrador) y **4 créditos de electivas de 3° nivel**.
- **Resumen superior:** contadores de materias *Aprobadas*, *Regulares*, *Inscriptas* y *Créditos Electivas*.

### 2. Pestaña Alumno (Correlativas y Estado)
- Registro del estado de cada materia (**Sin cursar**, **Regular**, **Aprobado**, **Cursando**) organizado por nivel (1° a 5° año) e incluyendo electivas vigentes del Plan 2023.
- Visualización de correlativas requeridas (*Regulares* y *Aprobadas*) con estado de cumplimiento.
- Búsqueda por nombre o número de materia y filtros por nivel/electivas y estado.
- **Acciones rápidas por año:** permite marcar todo un nivel (1° a 4° año) como *Aprobado* o *Regular*, o reiniciar todos los estados.

### 3. Pestaña Cursado (Selector de Cursos y Grilla Horaria)
- Desbloqueo automático de materias habilitadas según las correlativas cargadas (con opción de visualizar también las materias bloqueadas).
- Selector de comisiones por materia (ej. `1K1`, `2K6`, `3K3`) con sus días, horarios y período de cursado.
- **Grilla semanal estilo Autogestión UTN** (Lunes a Sábado) con filtro de vista:
  - *Anual Completo*
  - *1° Cuatrimestre*
  - *2° Cuatrimestre*
- **Detección de superposiciones horarias:** alerta automática cuando dos comisiones elegidas se superponen en el mismo día y horario (contemplando si pertenecen a cuatrimestres distintos).
- Contador de materias inscriptas y carga horaria semanal (`hs/sem`), con acceso directo desde cada bloque de la grilla al selector de la materia.

### 4. Persistencia local
- Todos los estados y comisiones seleccionadas se guardan automáticamente en el navegador mediante `localStorage`, sin necesidad de servidor ni base de datos.

---

## Uso

No requiere instalación de dependencias ni compilación.

1. Descargá o cloná este proyecto.
2. Abrí el archivo `index.html` directamente en tu navegador (o serví la carpeta con cualquier servidor estático local, por ejemplo Live Server o `python -m http.server`).
3. En la pestaña **Alumno**, marcá tus materias *Regulares* y *Aprobadas*.
4. Pasá a la pestaña **Cursado** para elegir comisiones entre las materias habilitadas y visualizar tu horario semanal.

---

## Estructura del proyecto

```text
HorariosFacultad/
├── index.html      # Estructura de la interfaz (encabezado, pestañas y grilla)
├── styles.css      # Estilos generales y diseño de la grilla semanal
├── app.js          # Plan 2023 (materias, correlativas, créditos), lógica y renderizado
├── schedules.js    # Comisiones y bloques horarios por materia (HORARIOS_MATERIAS)
└── README.md       # Documentación del proyecto
```
