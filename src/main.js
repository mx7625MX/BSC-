const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, 'gui/index.html'));

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Communication handlers
const BotController = require('./core/BotController');
const botController = new BotController();

ipcMain.handle('start-bot', async () => {
  try {
    await botController.start();
    return { success: true, message: 'Bot started successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('stop-bot', async () => {
  try {
    await botController.stop();
    return { success: true, message: 'Bot stopped successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-status', async () => {
  return botController.getStatus();
});

ipcMain.handle('get-config', async () => {
  return botController.getConfig();
});

ipcMain.handle('update-config', async (event, config) => {
  try {
    await botController.updateConfig(config);
    return { success: true, message: 'Configuration updated' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-transactions', async () => {
  return botController.getTransactions();
});

ipcMain.handle('get-logs', async (event, limit) => {
  return botController.getLogs(limit);
});

ipcMain.handle('add-whitelist', async (event, address) => {
  try {
    await botController.addToWhitelist(address);
    return { success: true, message: 'Address added to whitelist' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('add-blacklist', async (event, address) => {
  try {
    await botController.addToBlacklist(address);
    return { success: true, message: 'Address added to blacklist' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('remove-whitelist', async (event, address) => {
  try {
    await botController.removeFromWhitelist(address);
    return { success: true, message: 'Address removed from whitelist' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('remove-blacklist', async (event, address) => {
  try {
    await botController.removeFromBlacklist(address);
    return { success: true, message: 'Address removed from blacklist' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
