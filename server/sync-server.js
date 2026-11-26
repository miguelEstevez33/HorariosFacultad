const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const vm = require("vm");

const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 3456;
const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

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

const EMPTY_SYNC_DATA = {
  estadosAlumno: {},
  cursosSeleccionados: {},
  ordenCursosSeleccionados: [],
  updatedAt: null,
  source: null
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
    ...CORS_HEADERS
  });
  res.end(body);
}

function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
      if (body.length > MAX_PAYLOAD_BYTES) {
        reject(new Error("Payload demasiado grande"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function resolveSafeStaticPath(webDir, urlPath) {
  const safeFile = urlPath === "/" ? "/index.html" : urlPath;
  const resolvedBase = path.resolve(webDir);
  const candidate = path.resolve(resolvedBase, "." + path.posix.normalize("/" + safeFile));
  const rel = path.relative(resolvedBase, candidate);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return null;
  }
  return candidate;
}

function createSyncServer(options = {}) {
  const port = options.port || DEFAULT_PORT;
  const projectRoot = path.resolve(__dirname, "..");
  const webDir = path.resolve(options.webDir || path.join(projectRoot, "app"));
  const syncDataPath = options.syncDataPath || path.join(projectRoot, "sync-data.json");

  let schedulesCache = { mtimeMs: null, data: null };

  function readSyncData() {
    try {
      if (fs.existsSync(syncDataPath)) {
        const raw = fs.readFileSync(syncDataPath, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error("Error leyendo sync-data.json:", err.message);
    }
    return { ...EMPTY_SYNC_DATA };
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
      const stat = fs.statSync(schedulesPath);
      if (schedulesCache.mtimeMs === stat.mtimeMs && schedulesCache.data) {
        return schedulesCache.data;
      }

      const code = fs.readFileSync(schedulesPath, "utf-8");
      const sandbox = {};
      vm.createContext(sandbox);
      vm.runInContext(
        code + "\nthis.__HORARIOS__ = typeof HORARIOS_MATERIAS !== 'undefined' ? HORARIOS_MATERIAS : null;",
        sandbox
      );
      schedulesCache = { mtimeMs: stat.mtimeMs, data: sandbox.__HORARIOS__ || null };
      return schedulesCache.data;
    } catch (err) {
      console.error("Error leyendo schedules.js:", err.message);
      return null;
    }
  }

  function handleApiInfo(res) {
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
  }

  function handleApiSyncGet(res) {
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
  }

  async function handleApiSyncPost(req, res) {
    try {
      const rawBody = await collectRequestBody(req);
      const parsed = JSON.parse(rawBody || "{}");
      const estadosAlumno =
        parsed.estadosAlumno && typeof parsed.estadosAlumno === "object" && !Array.isArray(parsed.estadosAlumno)
          ? parsed.estadosAlumno
          : {};
      const cursosSeleccionados =
        parsed.cursosSeleccionados &&
        typeof parsed.cursosSeleccionados === "object" &&
        !Array.isArray(parsed.cursosSeleccionados)
          ? parsed.cursosSeleccionados
          : {};
      const payload = {
        estadosAlumno,
        cursosSeleccionados,
        ordenCursosSeleccionados: Array.isArray(parsed.ordenCursosSeleccionados)
          ? parsed.ordenCursosSeleccionados
          : Object.keys(cursosSeleccionados),
        source: parsed.source || "unknown",
        updatedAt: new Date().toISOString()
      };
      writeSyncData(payload);
      console.log(
        `[SYNC] Datos recibidos desde ${payload.source.toUpperCase()} (${Object.keys(payload.estadosAlumno).length} estados, ${Object.keys(payload.cursosSeleccionados).length} cursos) - ${payload.updatedAt}`
      );
      sendJson(res, 200, {
        ok: true,
        updatedAt: payload.updatedAt,
        source: payload.source
      });
    } catch (err) {
      sendJson(res, 400, { ok: false, error: err.message });
    }
  }

  function handleStaticFile(res, urlPath) {
    const fullPath = resolveSafeStaticPath(webDir, urlPath);
    if (!fullPath || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
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
  }

  return http.createServer(async (req, res) => {
    const urlPath = (req.url || "/").split("?")[0];

    // CORS preflight para peticiones desde la APK (Capacitor) o file://
    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    if (urlPath === "/api/info" && req.method === "GET") {
      handleApiInfo(res);
      return;
    }

    if (urlPath === "/api/sync" && req.method === "GET") {
      handleApiSyncGet(res);
      return;
    }

    if (urlPath === "/api/sync" && req.method === "POST") {
      await handleApiSyncPost(req, res);
      return;
    }

    handleStaticFile(res, urlPath);
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

module.exports = { createSyncServer, startSyncServer, getLocalIPs, resolveSafeStaticPath };

if (require.main === module) {
  startSyncServer({ verbose: true }).catch(err => {
    console.error("No se pudo iniciar el servidor de sincronización:", err.message);
    process.exit(1);
  });
}
