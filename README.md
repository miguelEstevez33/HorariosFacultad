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

### 4. Persistencia local y Modo App (PWA Offline)
- Todos los estados y comisiones seleccionadas se guardan automáticamente en el navegador mediante `localStorage`, sin necesidad de servidor ni base de datos.
- **Progressive Web App (PWA):** incluye `manifest.json`, íconos y Service Worker (`sw.js`) para **instalarse en Android, iOS o PC** como aplicación independiente y funcionar **100% sin conexión a internet**.

---

## Uso en PC

No requiere instalación de dependencias ni compilación.

1. Descargá o cloná este proyecto.
2. Abrí el archivo `index.html` directamente en tu navegador (o serví la carpeta con cualquier servidor estático local, por ejemplo Live Server o `python -m http.server 8080`).
3. En la pestaña **Alumno**, marcá tus materias *Regulares* y *Aprobadas*.
4. Pasá a la pestaña **Cursado** para elegir comisiones entre las materias habilitadas y visualizar tu horario semanal.

---

## Cómo instalarla en el celular (PWA)

Para que Chrome (Android) o Safari (iOS) permitan instalar una PWA y activar el modo offline, la página debe abrirse mediante **HTTPS** (o en red local). La forma más fácil y gratuita es:

### Opción A: Subirla gratis a internet (recomendado)
1. **Netlify Drop (sin cuenta de Git):** entrá a [app.netlify.com/drop](https://app.netlify.com/drop) y arrastrá la carpeta `HorariosFacultad`. Te dará un link `https://...netlify.app` al instante.
2. **GitHub Pages:** subí el repositorio a GitHub y en *Settings → Pages* activá el despliegue desde la rama `main`.

Una vez que abras ese link `https://...` en tu celular:
- **En Android (Chrome):** tocá el botón **"📲 Instalar App"** que aparece arriba en la barra de estadísticas (o en el menú `⋮` de Chrome → *"Instalar aplicación"* / *"Agregar a la pantalla principal"*).
- **En iPhone / iPad (Safari):** tocá el botón **Compartir** (cuadrado con flecha hacia arriba) → **"Agregar a inicio"**.

La app quedará en tu cajón de aplicaciones con el ícono **ISI 2023**, se abrirá a pantalla completa sin barra de direcciones y guardará todo tu progreso en el teléfono incluso **sin internet**.

---

## Estructura del proyecto

```text
HorariosFacultad/
├── index.html      # Estructura de la interfaz (encabezado, pestañas y grilla)
├── styles.css      # Estilos generales, diseño de la grilla semanal y adaptación móvil
├── app.js          # Plan 2023 (materias, correlativas, créditos), lógica, renderizado y registro PWA
├── schedules.js    # Comisiones y bloques horarios por materia (HORARIOS_MATERIAS)
├── manifest.json   # Metadatos de instalación PWA (nombre, colores, íconos)
├── sw.js           # Service Worker para funcionamiento 100% offline
├── icon.svg        # Ícono vectorial de la aplicación
├── icon-192.png    # Ícono PWA 192x192 (Android / Apple Touch Icon)
├── icon-512.png    # Ícono PWA 512x512 (Splash Screen Android)
└── README.md       # Documentación del proyecto
```
