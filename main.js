const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const { electron } = require('process')
const shell = require('electron').shell
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

let win = null;

var settingsWin = null;
function createWindow () {
  win = new BrowserWindow({
    frame: false,
    width: 1250,
    height: 750,
    backgroundColor: '#262626',
    icon: path.join(__dirname, "src/res/orange.png"),
    //icon: 'http://dcrft.pl/uploads/60507a7abea3c2456d59f979/dcrft_shadow_fixed.ico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  settingsWin = new BrowserWindow({
    frame: false,
    width: 625,
    height: 375,
    show: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
 });

 settingsWin.loadFile('src/settings/settings.html');
 ipcMain.on('settings', function () {
  if (settingsWin.isVisible())
    settingsWin.hide()
  else
    settingsWin.show()
})

  win.loadFile('src/index.html');
  // win.maximize();
  // win.webContents.openDevTools()

}

app.whenReady().then(createWindow);
/*var request = new XMLHttpRequest();
request.open('GET', 'http://site12079.web1.titanaxe.com/dcrftlauncher.php?action=joined');
request.send();*/

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('close-app', (event) => {
    app.quit();
});

ipcMain.on('close-settings', (event) => {
  win.webContents.send("close-settings");
  settingsWin.hide();
});

ipcMain.on('minimize-app', (event) => {
  win.minimize();
});

ipcMain.on('maximize-app', (event) => {
  if ( win.isMaximized() ) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

ipcMain.on('devtools', (event) => {
  win.webContents.openDevTools()
});

ipcMain.on('devtools1', (event) => {
  settingsWin.webContents.openDevTools()
});

ipcMain.on('reload-app', (event) => {
  app.relaunch();
  app.quit();
});

ipcMain.on('hideLauncher', (event) => {
  win.hide();
});

ipcMain.on('showLauncher', (event) => {
  win.show();
});
