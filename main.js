const { app, BrowserWindow, screen } = require('electron')

function createWindow () {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    width: 700,
    height: 700,
    // width: 280,
    // height: 128,
    // x: width - 300,
    // y: height - 150,
    resizable: false,
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