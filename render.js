const { exec } = require('child_process');
const { ipcRenderer } = require('electron');

// App data
const apps = {
    browsers: [
        { id: 'Mozilla.Firefox', name: 'Firefox' },
        { id: 'Google.Chrome', name: 'Chrome' },
        { id: 'Microsoft.Edge', name: 'Edge' },
        { id: 'Brave.Brave', name: 'Brave' },
        { id: 'Opera.Opera', name: 'Opera' },
        { id: 'Vivaldi.Vivaldi', name: 'Vivaldi' },
        { id: 'TorProject.TorBrowser', name: 'Tor Browser' },
        { id: 'Epic.EpicBrowser', name: 'Epic Browser' },
        { id: 'DuckDuckGo.DuckDuckGo', name: 'DuckDuckGo Browser' },
        { id: 'Yandex.Browser', name: 'Yandex Browser' }
    ],
    dev: [
        { id: 'Microsoft.VisualStudioCode', name: 'VS Code' },
        { id: 'OpenJS.NodeJS', name: 'Node.js' },
        { id: 'Python.Python', name: 'Python' },
        { id: 'Microsoft.VisualStudio', name: 'Visual Studio' },
        { id: 'Google.AndroidStudio', name: 'Android Studio' },
        { id: 'JetBrains.PyCharm', name: 'PyCharm' },
        { id: 'JetBrains.IntelliJIDEA', name: 'IntelliJ IDEA' },
        { id: 'JetBrains.Rider', name: 'Rider' },
        { id: 'JetBrains.WebStorm', name: 'WebStorm' },
        { id: 'Git.Git', name: 'Git' },
        { id: 'Docker.DockerDesktop', name: 'Docker Desktop' },
        { id: 'Postman.Postman', name: 'Postman' },
        { id: 'MongoDB.MongoDBCompass', name: 'MongoDB Compass' },
        { id: 'MySQL.MySQLWorkbench', name: 'MySQL Workbench' },
        { id: 'Microsoft.PowerShell', name: 'PowerShell' },
        { id: 'GitHub.GitHubDesktop', name: 'GitHub Desktop' },
        { id: 'javaOracle.JavaRuntimeEnvironment', name: 'Java Development Kit (JDK)' },
        { id: 'ApacheFriends.Xampp.8.2', name: 'XAMPP' }
    ],
    media: [
        { id: 'VideoLAN.VLC', name: 'VLC Media Player' },
        { id: 'Spotify.Spotify', name: 'Spotify' },
        { id: 'Apple.iTunes', name: 'iTunes' },
        { id: 'OBSProject.OBSStudio', name: 'OBS Studio' },
        { id: 'Shotcut.Shotcut', name: 'Shotcut' },
        { id: 'GIMP.GIMP', name: 'GIMP' },
        { id: 'Inkscape.Inkscape', name: 'Inkscape' },
        { id: 'Blender.Blender', name: 'Blender' },
        { id: 'Adobe.Photoshop', name: 'Adobe Photoshop' },
        { id: 'zoom.Zoom', name: 'Zoom' },
    ],
    Messengers: [
        { id: 'WhatsApp.WhatsApp', name: 'WhatsApp' },
        { id: 'WhatsApp.WhatsApp.Beta', name: 'WhatsApp Beta' },
        { id: 'Instagram.Instagram', name: 'Instagram' },
        { id: 'Telegram.TelegramDesktop', name: 'Telegram' },
        { id: 'Discord.Discord', name: 'Discord' },
        { id: 'SlackTechnologies.Slack', name: 'Slack' },
        { id: 'Microsoft.Teams', name: 'Microsoft Teams' },
        { id: 'Skype.Skype', name: 'Skype' }
    ],

    Disk: [
        { id: 'WinDirStat.WinDirStat', name: 'WinDirStat'},
        { id: 'Rufus.Rufus', name: 'Rufus' },
        { id: 'CrystalDiskInfo.CrystalDiskInfo', name: 'CrystalDiskInfo' },
        { id: 'Balena.Etcher', name: 'Balena Etcher' }
    ],

    files: [
        { id: '7zip.7zip', name: '7-Zip' },
        { id: 'WinRAR.WinRAR', name: 'WinRAR' },
        { id: 'PeaZip.Peazip', name: 'PeaZip' },
        { id: 'Bandizip.Bandizip', name: 'Bandizip' },
        { id: 'WinZip.WinZip', name: 'WinZip' },
        { id: 'FreeCommander.FreeCommander', name: 'FreeCommander' },
        { id: 'TotalCommander.TotalCommander', name: 'Total Commander' },
        { id: 'derceg.Explorer++', name: 'Explorer++' },
        { id: 'WinZip.WinZip', name: 'WinZip' }
    ]
};


document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    document.querySelector('.btn-secondary').addEventListener('click', exitApp);
    

    document.querySelector('.btn-primary').addEventListener('click', installSelected);
    

    document.querySelectorAll('.select-all').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            toggleSelectAll(category);
        });
    });
});

// Toggle select all for a category
function toggleSelectAll(category) {
    const container = document.getElementById(`${category}-apps`);
    const checkboxes = container.querySelectorAll('.app-checkbox');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
    });
}

const progressBtn = document.getElementById('progress');
const progressModal = document.getElementById('progressModal');
const progressLog = document.getElementById('progressLog');
const closeModal = document.querySelector('.close-modal');


progressBtn.addEventListener('click', () => {
  progressModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
  progressModal.style.display = 'none';
});


window.addEventListener('click', (event) => {
  if (event.target === progressModal) {
    progressModal.style.display = 'none';
  }
});


function updateProgressLog(message) {
  const logEntry = document.createElement('div');
  logEntry.textContent = message;
  progressLog.appendChild(logEntry);
  progressLog.scrollTop = progressLog.scrollHeight;
  
 
  if (message.includes('Error')) {
    progressModal.style.display = 'block';
  }
}

function installSelected() {
    const checkboxes = document.querySelectorAll('.app-checkbox:checked');
    if (checkboxes.length === 0) {
        updateStatus('Please select at least one app to install.');
        return;
    }
    
    const appIds = Array.from(checkboxes).map(checkbox => checkbox.id);
    installApps(appIds);
}

function installApps(appIds) {
  updateProgressLog('Starting installations...');
  
  let currentIndex = 0;
  
  function installNext() {
    if (currentIndex >= appIds.length) {
      updateProgressLog('All installations completed!');
      return;
    }
    
    const appId = appIds[currentIndex];
    const appName = findAppName(appId);
    
    updateProgressLog(`Installing ${appName}... (${currentIndex + 1}/${appIds.length})`);
    
    exec(`winget install -e --id ${appId} --accept-package-agreements --accept-source-agreements`, 
      (error, stdout, stderr) => {
        if (error) {
          updateProgressLog(`ERROR installing ${appName}: ${error.message}`);
        } else {
          updateProgressLog(`Successfully installed ${appName}`);
        }
        
        currentIndex++;
        installNext();
      });
  }
  
  installNext();
}

// Find app name by ID
function findAppName(appId) {
    for (const category in apps) {
        const found = apps[category].find(app => app.id === appId);
        if (found) return found.name;
    }
    return appId;
}

// Update status message
function updateStatus(message, isError = false) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.style.color = isError ? '#ff3b30' : '#86868b';
}

// Exit the application
function exitApp() {
    ipcRenderer.send('exit-app');
}