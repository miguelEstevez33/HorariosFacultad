const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const vm = require("vm");

const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 3456;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

function sendJson(res, statusCode, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error("Payload demasiado grande"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function createSyncServer(options = {}) {
  const port = options.port || DEFAULT_PORT;
  const projectRoot = path.resolve(__dirname, "..");
  const webDir = options.webDir || path.join(projectRoot, "app");
  const syncDataPath = options.syncDataPath || path.join(projectRoot, "sync-data.json");

  function readSyncData() {
    try {
      if (fs.existsSync(syncDataPath)) {
        const raw = fs.readFileSync(syncDataPath, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error("Error leyendo sync-data.json:", err.message);
    }
    return {
      estadosAlumno: {},
      cursosSeleccionados: {},
      ordenCursosSeleccionados: [],
      updatedAt: null,
      source: null
    };
  }

  function writeSyncData(data) {
    const dir = path.dirname(syncDataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(syncDataPath, JSON.stringify(data, null, 2), "utf-8");
  }

  function loadHorariosFromSchedulesJs() {
    const schedulesPath = path.join(webDir, "src", "data", "schedules.js");
    try {
      if (!fs.existsSync(schedulesPath)) return null;
      const code = fs.readFileSync(schedulesPath, "utf-8");
      const sandbox = {};
      vm.createContext(sandbox);
      vm.runInContext(
        code + "\nthis.__HORARIOS__ = typeof HORARIOS_MATERIAS !== 'undefined' ? HORARIOS_MATERIAS : null;",
        sandbox
      );
      return sandbox.__HORARIOS__ || null;
    } catch (err) {
      console.error("Error leyendo schedules.js:", err.message);
      return null;
    }
  }

  return http.createServer(async (req, res) => {
    const urlPath = (req.url || "/").split("?")[0];

    // CORS preflight para peticiones desde la APK (Capacitor) o file://
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      res.end();
      return;
    }

    // API: Información del servidor e IPs locales
    if (urlPath === "/api/info" && req.method === "GET") {
      const current = readSyncData();
      sendJson(res, 200, {
        ok: true,
        port,
        ips: getLocalIPs(),
        serverTime: new Date().toISOString(),
        lastSync: {
          updatedAt: current.updatedAt || null,
          source: current.source || null,
          estadosCount: Object.keys(current.estadosAlumno || {}).length,
          cursosCount: Object.keys(current.cursosSeleccionados || {}).length
        }
      });
      return;
    }

    // API: Obtener datos sincronizados (estados + comisiones + horarios actualizados de schedules.js)
    if (urlPath === "/api/sync" && req.method === "GET") {
      const current = readSyncData();
      const horariosMaterias = loadHorariosFromSchedulesJs();
      sendJson(res, 200, {
        ok: true,
        estadosAlumno: current.estadosAlumno || {},
        cursosSeleccionados: current.cursosSeleccionados || {},
        ordenCursosSeleccionados: current.ordenCursosSeleccionados || [],
        horariosMaterias,
        updatedAt: current.updatedAt || null,
        source: current.source || null
      });
      return;
    }

    // API: Guardar datos sincronizados enviados desde PC o Celular
    if (urlPath === "/api/sync" && req.method === "POST") {
      try {
        const rawBody = await collectRequestBody(req);
        const parsed = JSON.parse(rawBody || "{}");
        const payload = {
          estadosAlumno: parsed.estadosAlumno && typeof parsed.estadosAlumno === "object" ? parsed.estadosAlumno : {},
          cursosSeleccionados: parsed.cursosSeleccionados && typeof parsed.cursosSeleccionados === "object" ? parsed.cursosSeleccionados : {},
          ordenCursosSeleccionados: Array.isArray(parsed.ordenCursosSeleccionados) ? parsed.ordenCursosSeleccionados : Object.keys(parsed.cursosSeleccionados || {}),
          source: parsed.source || "unknown",
          updatedAt: new Date().toISOString()
        };
        writeSyncData(payload);
        console.log(`[SYNC] Datos recibidos desde ${payload.source.toUpperCase()} (${Object.keys(payload.estadosAlumno).length} estados, ${Object.keys(payload.cursosSeleccionados).length} cursos) - ${payload.updatedAt}`);
        sendJson(res, 200, {
          ok: true,
          updatedAt: payload.updatedAt,
          source: payload.source
        });
      } catch (err) {
        sendJson(res, 400, { ok: false, error: err.message });
      }
      return;
    }

    // Servir archivos estáticos de la app web en la PC
    let safeFile = urlPath === "/" ? "/index.html" : urlPath;
    const fullPath = path.join(webDir, path.normalize(safeFile).replace(/^(\.\.[/\\])+/, ""));

    if (!fullPath.startsWith(webDir) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Archivo no encontrado");
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache"
    });
    fs.createReadStream(fullPath).pipe(res);
  });
}

function startSyncServer(options = {}) {
  const port = options.port || DEFAULT_PORT;
  const allowExisting = Boolean(options.allowExisting);
  const verbose = options.verbose !== false;
  const server = createSyncServer({ ...options, port });

  return new Promise((resolve, reject) => {
    server.once("error", err => {
      if (allowExisting && err && err.code === "EADDRINUSE") {
        resolve({ server: null, port, ips: getLocalIPs(), alreadyRunning: true });
        return;
      }
      reject(err);
    });

    server.listen(port, "0.0.0.0", () => {
      const ips = getLocalIPs();
      if (verbose) {
        console.log("\n========================================================");
        console.log("  Servidor de Sincronización — Horarios ISI (UTN FRC)");
        console.log("========================================================");
        console.log(`  En esta PC:      http://localhost:${port}`);
        if (ips.length > 0) {
          ips.forEach(ip => {
            console.log(`  En el Celular:   http://${ip}:${port}`);
          });
        } else {
          console.log("  No se detectó IP Wi-Fi local. Verificá tu conexión de red.");
        }
        console.log("========================================================\n");
      }
      resolve({ server, port, ips, alreadyRunning: false });
    });
  });
}

module.exports = { createSyncServer, startSyncServer, getLocalIPs };

if (require.main === module) {
  startSyncServer({ verbose: true }).catch(err => {
    console.error("No se pudo iniciar el servidor de sincronización:", err.message);
    process.exit(1);
  });
}
