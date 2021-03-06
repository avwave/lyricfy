'use strict';
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow = null;

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 600
  });
  mainWindow.loadURL('file://' + __dirname + '/app/index.html');
  mainWindow.webContents.openDevTools()
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

require('electron-reload')(__dirname, {
});
