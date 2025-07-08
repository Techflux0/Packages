@echo on
set LOGFILE=%TEMP%\yt_audio_downloader.log
call :log "Starting YouTube Audio Downloader script..."
setlocal EnableDelayedExpansion

:: Configuration
set DOWNLOAD_DIR=%USERPROFILE%\Music\YouTubeAudio
set PYTHON_VERSION=3.10
set GIT_BASH_URL=https://github.com/git-for-windows/git/releases/download/v2.41.0.windows.3/Git-2.41.0.3-64-bit.exe

:: Colors
set RED=31
set GREEN=32
set YELLOW=33
set BLUE=34
set CYAN=36

:: Helper function for colored text
:colorPrint
powershell -Command Write-Host '%~2' -ForegroundColor %1
goto :EOF

:: Main execution
cls
call :colorPrint %BLUE% "┌────────────────────────────────────┐"
call :colorPrint %BLUE% "│    Windows starter setups          │"
call :colorPrint %BLUE% "└────────────────────────────────────┘"

:: Check admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    call :colorPrint %RED% "Please run as Administrator"
    pause
    exit /b 1
)

:: Install dependencies
call :installDependencies

:: Create download directory
if not exist "%DOWNLOAD_DIR%" (
    mkdir "%DOWNLOAD_DIR%"
    call :colorPrint %GREEN% "Created download directory at %DOWNLOAD_DIR%"
)

:: Run Python audio downloader
call :colorPrint %CYAN% "Starting YouTube Audio Downloader..."
python -c "import os; os.chdir(os.path.expanduser('~')); from audio_downloader import download_audio; download_audio()"

pause
exit /b

:installDependencies
:: Check and install Git Bash
where bash >nul 2>&1
if %errorLevel% neq 0 (
    call :colorPrint %YELLOW% "Installing Git Bash..."
    curl -L %GIT_BASH_URL% -o git_install.exe
    start /wait git_install.exe /SILENT /NORESTART
    del git_install.exe
    setx PATH "%PATH%;C:\Program Files\Git\bin"
    call :colorPrint %GREEN% "Git Bash installed"
)

:: Check and install Python
where python >nul 2>&1
if %errorLevel% neq 0 (
    call :colorPrint %YELLOW% "Installing Python..."
    winget install --id Python.Python.%PYTHON_VERSION% -e
    setx PATH "%PATH%;%LOCALAPPDATA%\Programs\Python\Python%PYTHON_VERSION%\Scripts;%LOCALAPPDATA%\Programs\Python\Python%PYTHON_VERSION%"
    call :colorPrint %GREEN% "Python installed"
)

:: Check and install FFmpeg
where ffmpeg >nul 2>&1
if %errorLevel% neq 0 (
    call :colorPrint %YELLOW% "Installing FFmpeg..."
    winget install --id Gyan.FFmpeg -e
    setx PATH "%PATH%;C:\Program Files\FFmpeg\bin"
    call :colorPrint %GREEN% "FFmpeg installed"
)

:: Check and install yt-dlp
python -c "import yt_dlp" 2>nul
if %errorLevel% neq 0 (
    call :colorPrint %YELLOW% "Installing yt-dlp..."
    pip install yt-dlp
    call :colorPrint %GREEN% "yt-dlp installed"
)
goto :EOF