const { ipcRenderer } = require("electron");
const path = require("path");
const osu = require("node-os-utils");
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverload;
let ramOverload;
let alertFrequency;

// Get settings and values
ipcRenderer.on("settings:get", (e, settings) => {
  cpuOverload = +settings.cpuOverload;
  ramOverload = +settings.ramOverload;
  alertFrequency = +settings.alertFrequency;
});

// Run every 2 seconds
setInterval(() => {
  // CPU Usage
  cpu.usage().then((info) => {
    document.getElementById("cpu-usage").innerText = info + "%";
    document.getElementById("cpu-progress").style.width = info + "%";

    // Make the progress bar red if overload
    if (info >= cpuOverload) {
      document.getElementById("cpu-progress").style.background = "red";
    } else {
      document.getElementById("cpu-progress").style.background = "#67c5eb";
    }

    // Check overloading
    if (info >= cpuOverload && runNotify(alertFrequency)) {
      notifyUser({
        title: "CPU Overload",
        body: `CPU is over ${cpuOverload}%`,
        icon: path.join(__dirname, "img", "icon.png"),
      });
      localStorage.setItem("lastNotified", +new Date());
    }
  });

  // CPU free
  cpu.free().then((info) => {
    document.getElementById("cpu-free").innerText = info + "%";
  });

  // RAM usage
  mem.info().then((info) => {
    const memInPer = (info.usedMemMb / info.totalMemMb) * 100;
    document.getElementById("ram-progress").style.width = memInPer + "%";

    // Make the progress bar red if overload
    if (memInPer >= ramOverload) {
      document.getElementById("ram-progress").style.background = "red";
    } else {
      document.getElementById("ram-progress").style.background = "#67c5eb";
    }

    // Check overloading
    if (memInPer >= ramOverload && runNotify(alertFrequency)) {
      notifyUser({
        title: "RAM is nearly Out of storage",
        body: `${info.usedMemMb} MB RAM is used`,
        icon: path.join(__dirname, "img", "icon.png"),
      });
      localStorage.setItem("lastNotified", +new Date());
    }
    document.getElementById("ram-usage").innerText = info.usedMemMb + " MB";
    document.getElementById("ram-free").innerText = info.freeMemMb + " MB";
    document.getElementById("ram-total").innerText = info.totalMemMb + " MB";
  });

  // Uptime
  document.getElementById("sys-uptime").innerText = secondsToDhms(os.uptime());
}, 2000);

// Set model
document.getElementById("cpu-model").innerText = cpu.model();

// Computer Name
document.getElementById("comp-name").innerText = os.hostname();

// OS
document.getElementById("os").innerText = `${os.type()} ${os.arch()}`;

// Shows days, hours, mins, seconds
function secondsToDhms(seconds) {
  seconds = +seconds;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d, ${h}h, ${m}m, ${s}s`;
}

// Send notification
function notifyUser(options) {
  new Notification(options.title, options);
}

// Check how much time has since notification
function runNotify(frequency) {
  if (localStorage.getItem("lastNotified") === null) {
    // Store timestamps
    localStorage.setItem("lastNotified", +new Date());
    return true;
  }
  const notifyTime = new Date(parseInt(localStorage.getItem("lastNotified")));
  const now = new Date();
  const diffTime = Math.abs(now - notifyTime);
  const minutesPassed = Math.ceil(diffTime / (1000 * 60));

  if (minutesPassed > frequency) {
    return true;
  } else {
    return false;
  }
}
