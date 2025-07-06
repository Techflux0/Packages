const { app, BrowserWindow, ipcMain, Menu } = require('electron')

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        maximizable: false,
        fullscreenable: false,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    mainWindow.loadFile('index.html')
    Menu.setApplicationMenu(null)
    mainWindow.setMenu(null)
}

ipcMain.on('exit-app', () => {
    app.quit()
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    app.quit()
})