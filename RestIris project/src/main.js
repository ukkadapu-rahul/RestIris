const { app, BrowserWindow, Tray, Menu, ipcMain, Notification, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 200,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    icon: path.join(__dirname, '../assets/icon.png'),
    skipTaskbar: false,
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
 // mainWindow.webContents.openDevTools(); // TEMP: See any renderer errors

  mainWindow.on('minimize', (event) => {
    // Default minimize behavior: stays in taskbar
    console.log('Minimize event: window minimized, stays in taskbar');
    // No preventDefault, no hide, no setSkipTaskbar
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      // Default close behavior: quit app
      console.log('Close event: quitting app');
      // No preventDefault, no hide
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const trayIconPath = path.resolve(__dirname, '../assets/icon-tray.png');
  const image = fs.existsSync(trayIconPath)
    ? nativeImage.createFromPath(trayIconPath)
    : nativeImage.createEmpty();

  tray = new Tray(image);

  tray.setToolTip('20-20-20 Eye Strain Timer');
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]));

  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

ipcMain.on('minimize-window', () => {
  console.log('🔽 Minimize button clicked');
  console.log('Main process: minimize-window IPC received');

  if (mainWindow) {
    mainWindow.minimize(); // Just minimize, stays in taskbar
    console.log('Main process: Window minimized (taskbar)');
  }
});

ipcMain.on('close-window', () => {
  console.log('❌ Close button clicked');
  if (mainWindow) {
    mainWindow.close(); // Actually close the window (quit app)
  }
});

ipcMain.on('restore-window', () => {
  console.log('🔁 restore-window IPC received');
  console.log('Main process: restore-window IPC received');
  
  if (mainWindow) {
    mainWindow.setSkipTaskbar(false);
    mainWindow.show();
    mainWindow.focus();
    console.log('Main process: mainWindow.show() called');
  }
});

ipcMain.on('show-notification', (_, title, body) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      icon: path.join(__dirname, '../assets/icon.png'),
      sound: 'default'
    });

    notification.show();

    notification.on('click', () => {
      mainWindow?.show();
      mainWindow?.focus();
    });
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // stay running in tray
});

app.on('before-quit', () => {
  isQuitting = true;
});

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}
