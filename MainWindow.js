const { BrowserWindow } = require("electron");

class MainWindow extends BrowserWindow {
  constructor(file, isDev) {
    super({
      title: "PTop",
      width: isDev ? 800 : 339,
      height: 500,
      icon: "./assets/icons/icon.png",
      resizable: isDev ? true : false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    this.loadFile(file);
    if (isDev) {
      this.webContents.openDevTools();
    }
  }
}

module.exports = MainWindow;
