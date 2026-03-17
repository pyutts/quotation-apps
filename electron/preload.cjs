const { contextBridge, ipcRenderer } = require('electron')

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Save PDF file using native dialog
  savePDF: (options) => ipcRenderer.invoke('save-pdf', options),

  // Save JSON settings using native dialog
  saveJSON: (options) => ipcRenderer.invoke('save-json', options),

  // Open JSON file using native dialog
  openJSON: () => ipcRenderer.invoke('open-json'),

  // Check if running in Electron
  isElectron: true,
})
