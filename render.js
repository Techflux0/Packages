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
        { id: 'GitHub.Atom', name: 'Atom' },
        { id: 'Anaconda.Anaconda3', name: 'Anaconda' },
        { id: 'Microsoft.VisualStudioCode', name: 'VS Code' },
        { id: 'OpenJS.NodeJS', name: 'Node.js' },
        { id: '9PNRBTZXMB4Z', name: 'Python' },
        { id: 'Microsoft.VisualStudio', name: 'Visual Studio' },
        { id: 'Google.AndroidStudio', name: 'Android Studio' },
        { id: 'JetBrains.PyCharm', name: 'PyCharm' },
        { id: 'JetBrains.IntelliJIDEA', name: 'IntelliJ IDEA' },
        { id: 'JetBrains.Rider', name: 'Rider' },
        { id: 'JetBrains.WebStorm', name: 'WebStorm' },
        { id: 'Git.Git', name: 'Git' },
        { id: 'Docker.DockerDesktop', name: 'Docker Desktop' },
        { id: 'Postman.Postman', name: 'Postman' },
        { id: 'MongoDB.Compass.Full', name: 'MongoDB Compass' },
        { id: 'Oracle.MySQLWorkbench', name: 'MySQL Workbench' },
        { id: 'Microsoft.PowerShell', name: 'PowerShell' },
        { id: 'GitHub.GitHubDesktop', name: 'GitHub Desktop' },
        { id: 'javaOracle.JavaRuntimeEnvironment', name: 'Java Development Kit (JDK)' },
        { id: 'ApacheFriends.Xampp.8.2', name: 'XAMPP' }
    ],
    media: [
        { id: 'VideoLAN.VLC', name: 'VLC Media Player' },
        { id: 'Spotify.Spotify', name: 'Spotify' },
        { id: 'Shabinder.SpotiFlyer', name: 'SpotiFlyer' },
        { id: 'Apple.iTunes', name: 'iTunes' },
        { id: 'OBSProject.OBSStudio', name: 'OBS Studio' },
        { id: 'Shotcut.Shotcut', name: 'Shotcut' },
        { id: 'GIMP.GIMP.3', name: 'GIMP' },
        { id: 'Inkscape.Inkscape', name: 'Inkscape' },
        { id: 'BlenderFoundation.Blender', name: 'Blender' },
        { id: 'XPFD4T9N395QN6', name: 'Adobe Photoshop' },
        { id: 'zoom.Zoom', name: 'Zoom' },
    ],
    Messengers: [
        { id: '9NKSQGP7F2NH', name: 'WhatsApp' },
        { id: '9NBDXK71NK08', name: 'WhatsApp Beta' },
        { id: '9NBLGGH5L9XT', name: 'Instagram' },
        { id: 'Telegram.TelegramDesktop', name: 'Telegram' },
        { id: 'Telegram.Unigram', name: 'Unigram' },
        { id: '9WZDNCRFJ140', name: 'Twitter' },
        { id: '9WZDNCRFJ2WL', name: 'Facebook' },
        { id: '9NH2GPH4JZS4', name: 'TikTok' },
        { id: 'Discord.Discord', name: 'Discord' },
        { id: 'SlackTechnologies.Slack', name: 'Slack' },
        { id: 'Microsoft.Teams.Free', name: 'Microsoft Teams' },
        { id: 'Microsoft.Skype', name: 'Skype' }
    ],

    Disk: [
        { id: 'WinDirStat.WinDirStat', name: 'WinDirStat'},
        { id: 'Rufus.Rufus', name: 'Rufus' },
        { id: 'CrystalDewWorld.CrystalDiskInfo', name: 'CrystalDiskInfo' },
        { id: 'Balena.Etcher', name: 'Balena Etcher' }
    ],

    files: [
        { id: '7zip.7zip', name: '7-Zip' },
        { id: 'RARLab.WinRAR', name: 'WinRAR' },
        { id: 'Giorgiotani.Peazip', name: 'PeaZip' },
        { id: 'Bandisoft.Bandizip', name: 'Bandizip' },
        { id: 'Corel.WinZip', name: 'WinZip' },
        { id: 'derceg.Explorer++', name: 'Explorer++' }
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