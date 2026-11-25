const path = require("path");
const { app, BrowserWindow, shell } = require("electron");
const { startSyncServer } = require("../server/sync-server");

const APP_ID = "com.utnfrc.horarios.isi";
const PORT = process.env.PORT ? Number(process.env.PORT) : 3456;

// Asegura que Windows agrupe y permita anclar correctamente el .exe a la barra de tareas
if (process.platform === "win32") {
  app.setAppUserModelId(APP_ID);
}

let mainWindow = null;
let syncServerHandle = null;

// Evita abrir múltiples instancias al hacer clic en la barra de tareas
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    const projectRoot = path.resolve(__dirname, "..");
    const webDir = path.join(projectRoot, "app");
    const syncDataPath = app.isPackaged
      ? path.join(app.getPath("userData"), "sync-data.json")
      : path.join(projectRoot, "sync-data.json");

    try {
      const started = await startSyncServer({
        webDir,
        syncDataPath,
        port: PORT,
        allowExisting: true,
        verbose: !app.isPackaged
      });
      syncServerHandle = started.server;
    } catch (err) {
      console.error("Error iniciando el servidor de sincronización:", err);
    }

    createMainWindow(projectRoot);

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow(projectRoot);
      }
    });
  });

  app.on("window-all-closed", () => {
    if (syncServerHandle) {
      try {
        syncServerHandle.close();
      } catch {
        // Ignorar errores al cerrar
      }
      syncServerHandle = null;
    }
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}

function createMainWindow(rootDir) {
  const iconPath = path.join(rootDir, "build", "icon.png");

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 620,
    title: "Horarios ISI — Plan 2023 (UTN FRC)",
    icon: iconPath,
    backgroundColor: "#0f172a",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.loadURL(`http://localhost:${PORT}/`);
}
