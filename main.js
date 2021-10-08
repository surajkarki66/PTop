const path = require("path");
const log = require("electron-log");
const { app, BrowserWindow, Menu, ipcMain, Tray } = require("electron");

const Store = require("./Store");

// Set env
process.env.NODE_ENV = "development";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;
const isLinux = process.platform === "linux" ? true : false;

let mainWindow;
let tray;

// Init store and defaults
const store = new Store({
  configName: "user-settings",
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 5,
    },
  },
});

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "PTop",
    width: isDev ? 800 : 355,
    height: 500,
    icon: "./assets/icons/icon.png",
    resizable: isDev ? true : false,
    // show: false,
    opacity: 0.9,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile("./app/index.html");
}

app.on("ready", () => {
  createMainWindow();

  mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.send("settings:get", store.get("settings"));
  });

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on("close", (e) => {
    if (!isLinux && !app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
    return true;
  });

  const icon = path.join(__dirname, "assets", "icons", "tray_icon.png");

  // Create tray
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Quit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.on("click", () => {
    if (mainWindow.isVisible() === true) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  tray.on("right-click", () => {
    tray.popUpContextMenu(contextMenu);
  });

  tray.setToolTip("PTop");
  if (isLinux) {
    // Make a change to the context menu
    contextMenu.items[0].checked = false;

    // Call this again for Linux because we modified the context menu
    tray.setContextMenu(contextMenu);
  }

  mainWindow.on("ready", () => mainWindow == null);
});

const menu = [
  ...(isMac ? [{ role: "appMenu" }] : []),
  {
    role: "fileMenu",
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

// Set settings
ipcMain.on("settings:set", (e, value) => {
  store.set("settings", value);
  mainWindow.webContents.send("settings:get", store.get("settings"));
});

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.allowRendererProcessReuse = true;
