const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const APP_ID = "com.ayushydv1805.typequest";
const INDEX_PATH = path.join(app.getAppPath(), "dist", "index.html");
const LOCAL_ENTRY_URL = pathToFileURL(INDEX_PATH).href;

let mainWindow = null;

function openExternalHttps(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      shell.openExternal(parsed.href).catch(() => {});
    }
  } catch {
    // Ignore invalid or unsupported external URLs.
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "TypeQuest — Typing RPG",
    width: 1180,
    height: 820,
    minWidth: 820,
    minHeight: 620,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#0b0f19",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: !app.isPackaged,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternalHttps(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url === LOCAL_ENTRY_URL || url.startsWith(LOCAL_ENTRY_URL + "#")) return;

    event.preventDefault();
    openExternalHttps(url);
  });

  mainWindow.once("ready-to-show", () => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.loadFile(INDEX_PATH).catch(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.loadURL("about:blank").catch(() => {});
    }
  });
}

app.setAppUserModelId(APP_ID);

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
