const { describe, it, after } = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createBrowserSandbox, loadAppScript, PROJECT_ROOT } = require("./helpers/loadAppScript");
const { createSyncServer, resolveSafeStaticPath } = require("../server/sync-server");

function invokeServer(server, method, urlPath, bodyObj) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = urlPath;
    req.destroy = () => {};

    let statusCode = 200;
    let headers = {};
    let body = "";

    const res = {
      writeHead(code, hdrs = {}) {
        statusCode = code;
        headers = Object.fromEntries(
          Object.entries(hdrs).map(([k, v]) => [k.toLowerCase(), v])
        );
      },
      write(chunk) {
        body += chunk.toString();
      },
      end(chunk) {
        if (chunk) body += chunk.toString();
        resolve({ status: statusCode, headers, body });
      },
      on() {},
      once() {},
      emit() {}
    };

    try {
      server.emit("request", req, res);
      if (bodyObj !== undefined) {
        req.emit("data", Buffer.from(JSON.stringify(bodyObj), "utf-8"));
      }
      req.emit("end");
    } catch (err) {
      reject(err);
    }
  });
}

describe("App.syncClient — normalización de URLs", () => {
  it("normaliza URLs con o sin protocolo y elimina barras finales", () => {
    const { sandbox } = createBrowserSandbox();
    sandbox.App = { store: { getSyncUrl: () => "" } };
    loadAppScript(sandbox, "app/src/services/syncClient.js");

    const { normalizeSyncUrl } = sandbox.App.syncClient;
    assert.equal(normalizeSyncUrl("192.168.1.40:3456/"), "http://192.168.1.40:3456");
    assert.equal(normalizeSyncUrl("https://mi-pc.local:3456///"), "https://mi-pc.local:3456");
    assert.equal(normalizeSyncUrl("   "), "");
  });
});

describe("server/sync-server.js — seguridad de rutas y API HTTP", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "horarios-sync-test-"));
  const syncDataPath = path.join(tmpDir, "sync-data.json");
  const webDir = path.join(PROJECT_ROOT, "app");

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("resuelve rutas estáticas seguras y bloquea path traversal", () => {
    assert.equal(resolveSafeStaticPath(webDir, "/"), path.join(webDir, "index.html"));
    assert.equal(resolveSafeStaticPath(webDir, "/src/main.js"), path.join(webDir, "src", "main.js"));

    const resolved = resolveSafeStaticPath(webDir, "/../../package.json");
    assert.ok(resolved === null || resolved.startsWith(webDir + path.sep));
  });

  it("responde /api/info, guarda con POST /api/sync y recupera con GET /api/sync", async () => {
    const server = createSyncServer({ port: 3456, webDir, syncDataPath });

    const infoRes = await invokeServer(server, "GET", "/api/info");
    assert.equal(infoRes.status, 200);
    const infoJson = JSON.parse(infoRes.body);
    assert.equal(infoJson.ok, true);
    assert.equal(infoJson.lastSync.updatedAt, null);

    const postRes = await invokeServer(server, "POST", "/api/sync", {
      estadosAlumno: { "1": "aprobado" },
      cursosSeleccionados: { "2": "1K2-A" },
      ordenCursosSeleccionados: ["2"],
      source: "pc"
    });
    assert.equal(postRes.status, 200);
    assert.equal(JSON.parse(postRes.body).ok, true);

    const getRes = await invokeServer(server, "GET", "/api/sync");
    assert.equal(getRes.status, 200);
    const syncJson = JSON.parse(getRes.body);
    assert.equal(syncJson.ok, true);
    assert.deepEqual(syncJson.estadosAlumno, { "1": "aprobado" });
    assert.deepEqual(syncJson.cursosSeleccionados, { "2": "1K2-A" });
    assert.ok(syncJson.horariosMaterias && typeof syncJson.horariosMaterias === "object");

    const optRes = await invokeServer(server, "OPTIONS", "/api/sync");
    assert.equal(optRes.status, 204);
    assert.equal(optRes.headers["access-control-allow-origin"], "*");

    const missingRes = await invokeServer(server, "GET", "/no-existe.txt");
    assert.equal(missingRes.status, 404);
  });
});
