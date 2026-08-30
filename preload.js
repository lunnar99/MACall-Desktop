const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    onUpdateReady: (callback) => ipcRenderer.on('update_ready', () => callback()),
    onUpdaterStatus: (callback) => ipcRenderer.on('updater_status', (_event, msg) => callback(msg)), // NOVA LINHA
    restartApp: () => ipcRenderer.send('restart_app')
});
