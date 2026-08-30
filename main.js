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

  ipcMain.on('restart_app', () => { autoUpdater.quitAndInstall(); });

  mainWindow.loadURL('https://call.overclock.lat/');
}

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

// ==========================================
// AVISOS DO AUTO-UPDATER PARA A TELA
// ==========================================
autoUpdater.on('checking-for-update', () => {
  if (mainWindow) mainWindow.webContents.send('updater_status', 'Procurando atualizações no servidor...');
});

autoUpdater.on('update-available', () => {
  if (mainWindow) mainWindow.webContents.send('updater_status', 'Nova versão encontrada! Baixando em segundo plano...');
});

autoUpdater.on('update-not-available', () => {
  if (mainWindow) mainWindow.webContents.send('updater_status', 'O aplicativo está na versão mais recente.');
});

autoUpdater.on('error', (err) => {
  if (mainWindow) mainWindow.webContents.send('updater_status', 'Erro ao atualizar: ' + err.message);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Baixando atualização: " + Math.round(progressObj.percent) + '%';
  if (mainWindow) mainWindow.webContents.send('updater_status', log_message);
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
      mainWindow.webContents.send('updater_status', 'Download concluído! Atualização pronta.');
      mainWindow.webContents.send('update_ready');
  }
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
