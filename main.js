const { app, BrowserWindow, screen, ipcMain } = require('electron')

const DEBUG = true;

function createWindow () {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    // width: 700,
    // height: 700,
    width: (DEBUG) ? 700 : 280,
    height: (DEBUG) ? 700 : 128,
    x: (DEBUG) ? 100 : width - 300,
    y: (DEBUG) ? 100 : height - 150,
    resizable: DEBUG,
    minimizable: false,
    frame: false,
    // titleBarStyle: 'customButtonsOnHover',
    backgroundColor: '#B2ECFF',
    alwaysOnTop: true,

    webPreferences: {
      nodeIntegration: true
    }
  })
    
    win.loadFile('index.html')
    win.setVisibleOnAllWorkspaces(true);

    ipcMain.on('resize-small', (event, arg) => {
      win.setSize(200, 100, true);
    })
    ipcMain.on('resize-large', (event, arg) => {
      win.setSize(280, 128, true);
    })
  }
  
  app.whenReady().then(createWindow)
  
  app.on('window-all-closed', () => {
    // Automatically close app on closure of all windows for convenience (even on Mac)
      app.quit()
  })
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })