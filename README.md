# Selector de Materias, Correlativas y Horarios — ISI Plan 2023 (UTN FRC)

Aplicación multiplataforma (**App de escritorio `.exe` con Electron**, **APK Android con Capacitor** y **versión Web**) para gestionar el avance académico, verificar correlativas y armar la grilla horaria semanal de **Ingeniería en Sistemas de Información — Plan 2023 (UTN FRC)**.

---

## Características principales

### 1. Progreso de carrera y personalización visual
- **Ingeniería en Sistemas de Información:** calcula el avance sobre las **36 materias obligatorias** y **20 créditos de electivas**.
- **Título Intermedio (Analista Universitario):** calcula el avance sobre las **24 materias obligatorias** (1° a 3° nivel + Seminario Integrador) y **4 créditos de electivas de 3° nivel**.
- **Resumen superior:** contadores de materias *Aprobadas*, *Regulares*, *Inscriptas* y *Créditos Electivas*.
- **Selector de 6 temas visuales:** cambio instantáneo de paleta con persistencia en `localStorage`.

### 2. Pestaña Alumno (Correlativas y Estado)
- Registro del estado de cada materia (**Sin cursar**, **Regular**, **Aprobado**, **Cursando**) organizado por nivel (1° a 5° año) e incluyendo electivas vigentes del Plan 2023.
- Visualización de correlativas requeridas (*Regulares* y *Aprobadas*) con estado de cumplimiento.
- Búsqueda por nombre o número de materia y filtros por nivel/electivas y estado.
- **Acciones rápidas por año:** permite marcar todo un nivel (1° a 4° año) como *Aprobado* o *Regular*, o reiniciar todos los estados.

### 3. Pestaña Cursado (Selector de Cursos y Grilla Horaria)
- Desbloqueo automático de materias habilitadas según las correlativas cargadas (con opción de visualizar también las materias bloqueadas).
- Selector de comisiones por materia (ej. `1K1`, `2K6`, `3K3`) con previsualización en la grilla y filtro entre comisiones de Sistemas (`K`) u otras especialidades.
- **Grilla semanal estilo Autogestión UTN** (Lunes a Sábado) con filtro de vista:
  - *Anual Completo*
  - *1° Cuatrimestre*
  - *2° Cuatrimestre*
- **Detección de superposiciones horarias:** alerta automática cuando dos comisiones elegidas se superponen en el mismo día y horario (contemplando si pertenecen a cuatrimestres distintos).
- **Exportar horario (`.png`):** genera y descarga una imagen PNG en alta resolución de la grilla semanal con un color distinto por materia y tabla de referencias.
- **Modal "Matar Materia":** ordena las materias inscriptas de menor a mayor impacto según cuántas materias futuras traban directa o indirectamente si decidís dar de baja alguna.

### 4. Pestaña Correlativas (Previas y a Futuro)
- Selector por **`N° - Materia`** (1° a 5° año y electivas) para consultar qué materias necesitás tener **Regulares** y **Aprobadas** para cursarla, qué materias destraba **a futuro** (directas y en cadena), y navegar haciendo clic sobre cualquier materia.

### 5. Persistencia local, App de Escritorio (`.exe`), APK Android y Sincronización PC ↔ Celular
- Todos los estados y comisiones seleccionadas se guardan automáticamente mediante `localStorage`.
- **App de escritorio Windows (`.exe` con Electron):** inicia automáticamente el servidor local de sincronización en segundo plano al abrir la ventana, sin necesidad de usar la terminal.
- **App Android (`.apk` con Capacitor):** paquete nativo instalable en Android que comparte la misma base de código (`app/`).
- **Sincronización bidireccional PC ↔ Celular (Wi-Fi local):** mediante el botón **`🔄 Sincronizar`** en el encabezado, podés:
  - **PC → Celular:** enviar tus materias, estados, comisiones y los horarios actualizados (`schedules.js`) a la app del celular.
  - **Celular → PC:** enviar los cambios que hiciste en el celular de vuelta a tu PC.

---

## Uso en PC

### Opción A: App de escritorio (`.exe` con Electron — recomendado)
La aplicación de escritorio **levanta el servidor de sincronización (`puerto 3456`) automáticamente** al abrirse:

1. Instalá dependencias:
   ```bash
   npm install
   ```
2. Para abrirla directamente en modo desarrollo:
   ```bash
   npm run electron
   ```
3. Para compilar el instalador y el ejecutable `.exe` de Windows:
   ```bash
   npm run build:exe
   ```
   Esto genera:
   - `dist/Horarios ISI Setup 1.0.0.exe`: instalador de Windows (crea acceso directo en Escritorio y Menú Inicio, listo para anclar a la barra de tareas).
   - `dist/win-unpacked/Horarios ISI.exe`: ejecutable portable sin instalación.

### Opción B: Uso desde el navegador web
Si preferís abrirla en tu navegador sin usar Electron:
- Ejecutá `npm run sync` y abrí `http://localhost:3456` (habilita también la sincronización con el celular), o abrí `app/index.html` directamente.

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

1. Asegurate de que tu **PC y tu celular estén conectados a la misma red Wi-Fi**.
2. **Abrí la app en la PC:**
   - Si usás la **App de escritorio (`Horarios ISI.exe` o `npm run electron`)**, **el servidor ya se inicia solo** automáticamente al abrir la ventana.
   - *(Solo si la usás desde un navegador web sin Electron, corré `npm run sync` en la terminal y entrá a `http://localhost:3456`).*
3. **Abrí el APK en tu celular** y en ambos dispositivos tocá **`🔄 Sincronizar`** en la barra superior:
   - El modal de la PC te mostrará directamente la IP local a ingresar en el celular (ej. `http://192.168.1.45:3456`).
   - En el celular, ingresá esa IP y tocá **Probar conexión**.
   - **De PC a Celular:** en la PC tocá **⬆️ Enviar de la PC → Celular**; luego en el celular tocá **⬇️ Traer de la PC → Celular** (también actualiza `schedules.js` sin recompilar el APK).
   - **De Celular a PC:** en el celular tocá **⬆️ Enviar del Celular → PC**; luego en la PC tocá **⬇️ Traer del Celular → PC**.

---

## Tests automatizados

El proyecto cuenta con una suite de tests unitarios y de integración usando el runner nativo de Node (`node:test`), sin dependencias adicionales:

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

---

## Estructura del proyecto

```text
HorariosFacultad/
├── app/                          # Fuente única de la interfaz web (usada por Web, Electron y Android)
│   ├── index.html                # Estructura HTML (encabezado, pestañas, grilla y modales)
│   └── src/
│       ├── main.js               # Punto de entrada: navegación por pestañas, temas y renderizado global
│       ├── data/
│       │   ├── materias.js       # Plan 2023: materias, correlativas, niveles y opciones de estado
│       │   └── schedules.js      # Comisiones y bloques horarios por materia (HORARIOS_MATERIAS)
│       ├── state/
│       │   └── store.js          # Estado global inmutable, acciones y persistencia en localStorage
│       ├── services/
│       │   └── syncClient.js     # Cliente HTTP y detección de plataforma para sincronización
│       ├── utils/
│       │   ├── correlativas.js   # Lógica de habilitación, cadenas previas/futuras e impacto
│       │   ├── exportSchedule.js # Exportación de la grilla horaria a imagen PNG en Canvas
│       │   └── schedule.js       # Formateo, fusión de bloques, conflictos y carriles de grilla
│       ├── components/
│       │   ├── HeaderStats.js    # Contadores superiores y barras de progreso de carrera
│       │   ├── AlumnoTab.js      # Pestaña Alumno (listado por nivel, tarjetas y filtros)
│       │   ├── CursadoPicker.js  # Panel selector de materias y chips de comisiones
│       │   ├── UtnCalendar.js    # Grilla horaria semanal estilo Autogestión UTN
│       │   ├── CorrelativasTab.js# Pestaña Correlativas (previas y a futuro)
│       │   ├── KillMateriaModal.js# Modal "Matar Materia" (ranking de impacto)
│       │   └── SyncModal.js      # Controlador UI del modal de sincronización PC ↔ Celular
│       └── styles/               # Estilos CSS modulares y variables de los 6 temas
├── server/
│   └── sync-server.js            # Servidor local Node.js para sincronización bidireccional Wi-Fi
├── electron/
│   └── main.js                   # Proceso principal de Electron (inicia sync-server automáticamente)
├── tests/                        # Suite de tests automatizados con node:test
│   ├── helpers/loadAppScript.js  # Sandbox VM para cargar módulos IIFE del cliente
│   ├── schedule.test.js          # Tests de utilidades de horarios, bloques y conflictos
│   ├── correlativas.test.js      # Tests de correlativas y reglas del store
│   ├── components.test.js        # Tests de inmutabilidad, HeaderStats, KillMateriaModal y XSS
│   └── sync-server.test.js       # Tests de rutas estáticas seguras, syncClient y API HTTP
├── android/                      # Proyecto nativo Android generado por Capacitor (apunta a app/)
├── build/                        # Íconos (icon.png, icon.ico) para el ejecutable de Windows
├── scripts/
│   └── generate-icon.js          # Generador de íconos para la app de escritorio
├── data/                         # Archivo fuente del régimen de correlativas (.pdf)
├── capacitor.config.json         # Configuración de Capacitor (webDir: "app")
├── package.json                  # Scripts de tests, escritorio (.exe), sincronización y Android (.apk)
└── README.md                     # Documentación del proyecto
```
