const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version') // NOVA LINHA
});
