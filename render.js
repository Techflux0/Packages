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


// Installation states
const INSTALL_STATES = {
  WAITING: 'waiting',
  INSTALLING: 'installing',
  FINISHED: 'finished',
  SKIPPED: 'skipped',
  ERROR: 'error'
};

let installationProgress = {};
let totalAppsToInstall = 0;
let installedCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    const progressBtn = document.getElementById('progress');
    const progressModal = document.getElementById('progressModal');
    const progressLog = document.getElementById('progressLog');
    const closeModal = document.querySelector('.close-modal');
    const clearLogBtn = document.createElement('button');
    

    clearLogBtn.textContent = 'Clear Log';
    clearLogBtn.className = 'btn btn-secondary1';
    clearLogBtn.style.marginLeft = '10px';
    clearLogBtn.addEventListener('click', () => {
        progressLog.innerHTML = '';
    });
    
    const modalHeader = document.querySelector('.modal-header');
    modalHeader.appendChild(clearLogBtn);

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

    document.querySelector('.btn-secondary').addEventListener('click', exitApp);
    document.querySelector('.btn-primary').addEventListener('click', installSelected);
    
    document.querySelectorAll('.select-all').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            toggleSelectAll(category);
        });
    });
});

// Check if app is already installed
function isAppInstalled(appId, callback) {
    exec(`winget list --id ${appId}`, (error, stdout) => {
        callback(!error && stdout.includes(appId));
    });
}

function toggleSelectAll(category) {
    const container = document.getElementById(`${category}-apps`);
    const checkboxes = container.querySelectorAll('.app-checkbox');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
    });
}

function updateProgressLog(message, state = null) {
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    
    if (state) {
        logEntry.className = `log-entry ${state}`;
        
        const icon = document.createElement('span');
        icon.className = 'state-icon';
        
        switch(state) {
            case INSTALL_STATES.WAITING:
                icon.textContent = '⏳';
                break;
            case INSTALL_STATES.INSTALLING:
                icon.textContent = '🔵';
                break;
            case INSTALL_STATES.FINISHED:
                icon.textContent = '✅';
                break;
            case INSTALL_STATES.SKIPPED:
                icon.textContent = '⏭️';
                break;
            case INSTALL_STATES.ERROR:
                icon.textContent = '❌';
                break;
        }
        
        logEntry.insertBefore(icon, logEntry.firstChild);
    }
    
    progressLog.appendChild(logEntry);
    progressLog.scrollTop = progressLog.scrollHeight;
    
    if (state === INSTALL_STATES.ERROR) {
        document.getElementById('progressModal').style.display = 'block';
    }
}

function installSelected() {
    const checkboxes = document.querySelectorAll('.app-checkbox:checked');
    if (checkboxes.length === 0) {
        updateStatus('Please select at least one app to install.');
        return;
    }
    
    const appIds = Array.from(checkboxes).map(checkbox => checkbox.id);
    totalAppsToInstall = appIds.length;
    installedCount = 0;
    installationProgress = {};
    
    updateProgressLog(`Starting installation of ${totalAppsToInstall} apps...`);
    installApps(appIds);
}

function installApps(appIds) {
    let currentIndex = 0;
    
    function processNextApp() {
        if (currentIndex >= appIds.length) {
            updateProgressLog('All installations completed!', INSTALL_STATES.FINISHED);
            updateStatus('All installations completed!');
            return;
        }
        
        const appId = appIds[currentIndex];
        const appName = findAppName(appId);
        
        installationProgress[appId] = {
            name: appName,
            state: INSTALL_STATES.WAITING
        };
        
        updateProgressLog(`${appName}: Checking if already installed...`, INSTALL_STATES.WAITING);
        
        isAppInstalled(appId, (isInstalled) => {
            if (isInstalled) {
                installationProgress[appId].state = INSTALL_STATES.SKIPPED;
                updateProgressLog(`${appName}: Already installed - skipping`, INSTALL_STATES.SKIPPED);
                installedCount++;
                currentIndex++;
                updateProgressBar();
                processNextApp();
            } else {
                installationProgress[appId].state = INSTALL_STATES.INSTALLING;
                updateProgressLog(`${appName}: Installing...`, INSTALL_STATES.INSTALLING);
                
                exec(`winget install -e --id ${appId} --accept-package-agreements --accept-source-agreements --silent`, 
                    (error, stdout, stderr) => {
                        if (error) {
                            installationProgress[appId].state = INSTALL_STATES.ERROR;
                            updateProgressLog(`ERROR installing ${appName}: ${error.message}`, INSTALL_STATES.ERROR);
                        } else {
                            installationProgress[appId].state = INSTALL_STATES.FINISHED;
                            updateProgressLog(`${appName}: Successfully installed`, INSTALL_STATES.FINISHED);
                        }
                        
                        installedCount++;
                        currentIndex++;
                        updateProgressBar();
                        processNextApp();
                    });
            }
        });
    }
    
    processNextApp();
}

function updateProgressBar() {
    const progressPercent = Math.round((installedCount / totalAppsToInstall) * 100);
    const progressBar = document.getElementById('progressBar');
    
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
        progressBar.textContent = `${progressPercent}%`;
    }
    
    updateStatus(`Progress: ${installedCount} of ${totalAppsToInstall} apps completed`);
}

function findAppName(appId) {
    for (const category in apps) {
        const found = apps[category].find(app => app.id === appId);
        if (found) return found.name;
    }
    return appId;
}

function updateStatus(message, isError = false) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.style.color = isError ? '#ff3b30' : '#86868b';
}

function exitApp() {
    ipcRenderer.send('exit-app');
}