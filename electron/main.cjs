const { app, BrowserWindow, net, protocol, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const APP_ID = "com.ayushydv1805.typequest";
const APP_SCHEME = "app";
const APP_HOST = "typequest";
const AUTH_SCHEME = "typequest";
const DIST_DIR = path.resolve(app.getAppPath(), "dist");
const APP_ORIGIN = APP_SCHEME + "://" + APP_HOST;

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

let mainWindow = null;
let pendingAuthHash = "";

function extractAuthHash(deepLink) {
  try {
    const parsed = new URL(deepLink);
    if (parsed.protocol !== AUTH_SCHEME + ":" || parsed.hostname !== "auth") return "";
    if (!parsed.hash || !parsed.hash.includes("access_token=")) return "";
    return parsed.hash;
  } catch {
    return "";
  }
}

function openAuthLink(deepLink) {
  const hash = extractAuthHash(deepLink);
  if (!hash) return;

  pendingAuthHash = hash;
  if (mainWindow && !mainWindow.isDestroyed()) {
    const target = APP_ORIGIN + "/" + pendingAuthHash;
    pendingAuthHash = "";
    mainWindow.loadURL(target).catch(() => {});
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  } else if (app.isReady()) {
    createWindow();
  }
}

const initialAuthLink = process.argv.find((argument) =>
  argument.toLowerCase().startsWith(AUTH_SCHEME + "://auth")
);
if (initialAuthLink) pendingAuthHash = extractAuthHash(initialAuthLink);

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) app.quit();

app.on("open-url", (event, url) => {
  event.preventDefault();
  openAuthLink(url);
});

app.on("second-instance", (_event, commandLine) => {
  const deepLink = commandLine.find((argument) =>
    argument.toLowerCase().startsWith(AUTH_SCHEME + "://auth")
  );
  if (deepLink) openAuthLink(deepLink);
  else if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

async function serveAppFile(request) {
  let requestUrl;
  try {
    requestUrl = new URL(request.url);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  if (requestUrl.protocol !== APP_SCHEME + ":" || requestUrl.hostname !== APP_HOST) {
    return new Response("Not found", { status: 404 });
  }

  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "");
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.resolve(DIST_DIR, pathname || "index.html");
  if (filePath !== DIST_DIR && !filePath.startsWith(DIST_DIR + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) return new Response("Not found", { status: 404 });
    return await net.fetch(pathToFileURL(filePath).href);
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

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
    if (url === APP_ORIGIN || url.startsWith(APP_ORIGIN + "/") || url.startsWith(APP_ORIGIN + "#")) {
      return;
    }

    event.preventDefault();
    openExternalHttps(url);
  });

  mainWindow.once("ready-to-show", () => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const target = APP_ORIGIN + "/" + pendingAuthHash;
  pendingAuthHash = "";
  mainWindow.loadURL(target).catch(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.loadURL("about:blank").catch(() => {});
    }
  });
}

app.setAppUserModelId(APP_ID);
if (app.isPackaged) app.setAsDefaultProtocolClient(AUTH_SCHEME);

app.whenReady().then(() => {
  protocol.handle(APP_SCHEME, serveAppFile);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
