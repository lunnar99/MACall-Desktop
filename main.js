const { app, BrowserWindow, session, desktopCapturer, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
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
    if (['media', 'display-capture', 'fullscreen'].includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  ipcMain.handle('get-desktop-sources', async () => {
    const sources = await desktopCapturer.getSources({ 
        types: ['window', 'screen'], 
        thumbnailSize: { width: 320, height: 180 }, 
        fetchWindowIcons: true 
    });
    
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      thumbnailDataUrl: source.thumbnail ? source.thumbnail.toDataURL() : '',
      appIconDataUrl: source.appIcon ? source.appIcon.toDataURL() : null
    }));
  });

  mainWindow.loadURL('https://seu-dominio-vps.com'); // Mantenha seu domínio real
}

app.whenReady().then(() => {
  createWindow();

  // Aciona o verificador de atualizações assim que o app iniciar
  autoUpdater.checkForUpdatesAndNotify();
});

// Evento: Quando o download da atualização terminar em segundo plano
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Nova Atualização Pronta',
    message: 'Uma nova versão do M.A. Call foi baixada em segundo plano. Deseja reiniciar o aplicativo para instalar agora?',
    buttons: ['Reiniciar e Atualizar', 'Mais Tarde']
  }).then((result) => {
    if (result.response === 0) {
      // Se clicou em "Reiniciar e Atualizar", fecha e instala
      autoUpdater.quitAndInstall();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});