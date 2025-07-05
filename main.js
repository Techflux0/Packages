const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    mainWindow.loadFile('index.html')
    // mainWindow.webContents.openDevTools() 

    Menu.setApplicationMenu(null)
}

ipcMain.on('exit-app', () => {
    app.quit()
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})