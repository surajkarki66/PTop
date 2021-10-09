const { BrowserWindow } = require("electron");

class AboutWindow extends BrowserWindow {
  constructor(file) {
    super({
      title: "About PTop",
      width: 300,
      height: 300,
      icon: "./assets/icon/icon_256x256.png",
      resizable: false,
      backgroundColor: "black",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    this.loadFile(file);
  }
}

module.exports = AboutWindow;
