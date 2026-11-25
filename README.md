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

### 4. Pestaña Correlativas (Previas y a Futuro)
- Selector por **`N° - Materia`** (1° a 5° año y electivas) para consultar qué materias necesitás tener **Regulares** y **Aprobadas** para cursarla, qué materias destraba **a futuro** (directas y en cadena), y navegar haciendo clic sobre cualquier materia.

### 5. Persistencia local, APK Android (Capacitor) y Sincronización PC ↔ Celular
- Todos los estados y comisiones seleccionadas se guardan automáticamente mediante `localStorage`.
- **App Android (.apk con Capacitor):** el proyecto está empaquetado con **Capacitor** para generar un `.apk` nativo instalable en Android.
- **Sincronización bidireccional PC ↔ Celular (Wi-Fi local):** mediante el servidor incluido (`sync-server.js`) y el botón **`🔄 Sincronizar`** en el encabezado, podés:
  - **PC → Celular:** enviar tus materias, estados, comisiones y los horarios actualizados (`schedules.js`) a la app del celular.
  - **Celular → PC:** enviar los cambios que hiciste en el celular de vuelta a tu PC.

---

## Uso en PC

1. Descargá o cloná este proyecto.
2. **App de escritorio (`.exe` para Windows):**
   Podés compilar el ejecutable nativo con Electron (incluye el servidor de sincronización integrado, sin necesidad de abrir terminales):
   ```bash
   npm install
   npm run build:exe
   ```
   Esto genera:
   - `dist/Horarios ISI Setup 1.0.0.exe`: instalador de Windows (crea acceso directo en Escritorio y Menú Inicio, listo para anclar a la barra de tareas).
   - `dist/win-unpacked/Horarios ISI.exe`: ejecutable directo sin instalación (clic derecho → **Anclar a la barra de tareas**).
   También podés abrirla en modo desarrollo con `npm run electron`.
3. **Uso desde navegador:** si solo querés usarla sin compilar el `.exe`, podés abrir `app/index.html` directamente en tu navegador, o ejecutar `npm run sync` y abrir `http://localhost:3456` para sincronizar con el celular.

---

## App para Android (.apk)

Tenés dos formas de instalar la aplicación en tu celular:

### Opción A: Descargar el APK listo (recomendado)
1. Entrá a la sección **Releases** del repositorio en GitHub.
2. Descargá el archivo `.apk` de la última versión directamente en tu celular.
3. Abrilo desde tu gestor de archivos (ej. *Mis Archivos* / *Descargas*) y aceptá *"Instalar apps desconocidas"* si Android lo solicita.

### Opción B: Compilar el APK manualmente (Capacitor)

#### Requisitos
- **Node.js** instalado.
- **Android Studio** (o Android SDK + Gradle) para compilar el `.apk`.

#### Pasos
1. Instalá las dependencias del proyecto (una sola vez):
   ```bash
   npm install
   ```
2. Copiá los archivos web y sincronizá el proyecto Android:
   ```bash
   npm run cap:sync
   ```
3. Generá el APK:
   - **Desde Android Studio (recomendado):**
     ```bash
     npm run android:open
     ```
     Luego en Android Studio: menú **≡ → Build → Build Bundle(s) / APK(s) → Build APK(s)**.
   - **Desde terminal (si tenés `ANDROID_HOME` configurado):**
     ```bash
     npm run android:apk
     ```
     El APK quedará generado en `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## Cómo sincronizar PC ↔ Celular

1. Asegurate de que tu **PC y tu celular estén en el mismo Wi-Fi**.
2. En la PC, ejecutá:
   ```bash
   npm run sync
   ```
3. Abrí la app en la PC (`http://localhost:3456`) y en tu celular (el APK instalado).
4. En ambos dispositivos tocá **`🔄 Sincronizar`** en la barra superior:
   - En el celular, ingresá la IP que muestra la PC (ej. `http://192.168.1.45:3456`) y tocá **Conectar**.
   - **De PC a Celular:** en la PC tocá **⬆️ Enviar de la PC → Celular**; luego en el celular tocá **⬇️ Traer de la PC → Celular** (también actualiza `schedules.js` sin recompilar el APK).
   - **De Celular a PC:** en el celular tocá **⬆️ Enviar del Celular → PC**; luego en la PC tocá **⬇️ Traer del Celular → PC**.

---

## Estructura del proyecto

```text
HorariosFacultad/
├── app/                          # Fuente única de la interfaz web (usada por Web, Electron y Android)
│   ├── index.html                # Estructura HTML (encabezado, pestañas, grilla y modales)
│   └── src/
│       ├── main.js               # Punto de entrada: navegación por pestañas y renderizado global
│       ├── data/
│       │   ├── materias.js       # Plan 2023: definición de materias y correlativas (MATERIAS)
│       │   └── schedules.js      # Comisiones y bloques horarios por materia (HORARIOS_MATERIAS)
│       ├── state/
│       │   └── store.js          # Estado global, persistencia en localStorage y mutaciones
│       ├── utils/
│       │   ├── correlativas.js   # Lógica de habilitación, cadenas previas/futuras e impacto
│       │   ├── exportSchedule.js # Exportación de la grilla horaria
│       │   └── schedule.js       # Formateo, fusión de bloques, conflictos y carriles de grilla
│       ├── components/
│       │   ├── HeaderStats.js    # Contadores superiores y barras de progreso de carrera
│       │   ├── AlumnoTab.js      # Pestaña Alumno (listado por nivel, tarjetas y filtros)
│       │   ├── CursadoPicker.js  # Panel selector de materias y chips de comisiones
│       │   ├── UtnCalendar.js    # Grilla horaria semanal estilo Autogestión UTN
│       │   ├── CorrelativasTab.js# Pestaña Correlativas (previas y a futuro)
│       │   ├── KillMateriaModal.js# Modal "Matar Materia" (ranking de impacto)
│       │   └── SyncModal.js      # Modal y cliente de sincronización PC ↔ Celular
│       └── styles/               # Estilos CSS modulares
├── server/
│   └── sync-server.js            # Servidor local Node.js para sincronización bidireccional Wi-Fi
├── electron/
│   └── main.js                   # Proceso principal de la app de escritorio (.exe)
├── android/                      # Proyecto nativo Android generado por Capacitor (apunta a app/)
├── build/                        # Íconos (icon.png, icon.ico) para el ejecutable de Windows
├── scripts/
│   └── generate-icon.js          # Generador de íconos para la app de escritorio
├── data/                         # Archivo fuente del régimen de correlativas (.pdf)
├── capacitor.config.json         # Configuración de Capacitor (webDir: "app")
├── package.json                  # Scripts de escritorio (.exe), sincronización y Android (.apk)
└── README.md                     # Documentación del proyecto
```
