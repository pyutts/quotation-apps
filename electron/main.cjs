const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = !app.isPackaged

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Quotation Maping Web',
    icon: path.join(__dirname, '../public/favicon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    backgroundColor: '#f8fafc',
    show: false,
  })

  // Show window when ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:3000')
    // Uncomment to open DevTools:
    // mainWindow.webContents.openDevTools()
  } else {
    // In production, load from built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// ── IPC Handlers ──

// Save PDF file using native dialog
ipcMain.handle('save-pdf', async (event, { defaultFilename, pdfBuffer }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save PDF',
    defaultPath: defaultFilename,
    filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
  })

  if (result.canceled) {
    return { canceled: true }
  }

  fs.writeFileSync(result.filePath, Buffer.from(pdfBuffer))
  return { canceled: false, filePath: result.filePath }
})

// Save JSON settings using native dialog
ipcMain.handle('save-json', async (event, { defaultFilename, jsonContent }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Settings',
    defaultPath: defaultFilename,
    filters: [{ name: 'JSON File', extensions: ['json'] }],
  })

  if (result.canceled) {
    return { canceled: true }
  }

  fs.writeFileSync(result.filePath, jsonContent, 'utf-8')
  return { canceled: false, filePath: result.filePath }
})

// Open JSON settings using native dialog
ipcMain.handle('open-json', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Load Settings',
    filters: [{ name: 'JSON File', extensions: ['json'] }],
    properties: ['openFile'],
  })

  if (result.canceled) {
    return { canceled: true }
  }

  const content = fs.readFileSync(result.filePaths[0], 'utf-8')
  return { canceled: false, content, filePath: result.filePaths[0] }
})

// ── App lifecycle ──
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
