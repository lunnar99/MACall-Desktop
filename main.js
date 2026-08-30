const { app, BrowserWindow, session, desktopCapturer, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1280, height: 720,
    title: "M.A. Call",
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), 
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false
    }
  });

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (['media', 'display-capture', 'fullscreen'].includes(permission)) callback(true);
    else callback(false);
  });

  ipcMain.handle('get-desktop-sources', async () => {
    const sources = await desktopCapturer.getSources({ types: ['window', 'screen'], thumbnailSize: { width: 320, height: 180 }, fetchWindowIcons: true });
    return sources.map(source => ({
      id: source.id, name: source.name,
      thumbnailDataUrl: source.thumbnail ? source.thumbnail.toDataURL() : '',
      appIconDataUrl: source.appIcon ? source.appIcon.toDataURL() : null
    }));
  });

  ipcMain.handle('get-app-version', () => app.getVersion());

  // Ação de Reiniciar forçada pelo Frontend (Botão verde)
  ipcMain.on('restart_app', () => { autoUpdater.quitAndInstall(); });

  mainWindow.loadURL('https://call.overclock.lat/');
}

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

// AVISO SILENCIOSO: Quando baixar, não dá pop-up nativo, apenas avisa o Front-end.
autoUpdater.on('update-downloaded', () => {
  if (mainWindow) mainWindow.webContents.send('update_ready');
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
