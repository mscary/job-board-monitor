@echo off
setlocal EnableDelayedExpansion
title Job Board Monitor

:: Always run from the folder this script lives in
cd /d "%~dp0"

cls
echo.
echo   ==========================================
echo     Job Board Monitor
echo   ==========================================
echo.

:: ── Windows version info ──────────────────────────────────────────────────────
:: Works on Windows 10 (all updates) and Windows 11 (all versions).
:: Not supported on Windows 7 or 8.
for /f "tokens=4-5 delims=[.] " %%i in ('ver') do (
  set WIN_MAJOR=%%i
  set WIN_MINOR=%%j
)
echo   Windows ........... !WIN_MAJOR!.!WIN_MINOR!

if !WIN_MAJOR! LSS 10 (
  echo.
  echo   WARNING: Windows !WIN_MAJOR! is not supported.
  echo   Please upgrade to Windows 10 or Windows 11 to use this app.
  echo.
  pause
  exit /b 1
)

:: ── Refresh PATH so a just-installed Node.js is found without a restart ───────
:: Node.js installers add themselves to the system PATH, but that change is
:: not picked up by already-open windows. We force-reload it here.
for /f "skip=2 tokens=3*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do (
  if not "%%~b"=="" (
    set "SYS_PATH=%%~a %%~b"
  ) else (
    set "SYS_PATH=%%~a"
  )
)
for /f "skip=2 tokens=3*" %%a in ('reg query "HKCU\Environment" /v PATH 2^>nul') do (
  if not "%%~b"=="" (
    set "USER_PATH=%%~a %%~b"
  ) else (
    set "USER_PATH=%%~a"
  )
)
if defined SYS_PATH set "PATH=!SYS_PATH!"
if defined USER_PATH set "PATH=!PATH!;!USER_PATH!"

:: Also add the default Node.js install location as a fallback
set "PATH=!PATH!;%ProgramFiles%\nodejs;%APPDATA%\npm"

:: ── Check Node.js is installed ────────────────────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo   ERROR: Node.js is not installed.
  echo.
  echo   How to fix this ^(takes about 3 minutes^):
  echo     1. Open Chrome, Edge, or Firefox
  echo     2. Go to:  https://nodejs.org
  echo     3. Click the large green button that says LTS
  echo        ^(Important: do NOT click "Current" -- use LTS^)
  echo     4. Open the downloaded installer file
  echo     5. Follow the prompts ^(click Next, Accept, Install^)
  echo     6. RESTART your computer when the installer finishes
  echo     7. Double-click Start-Windows.bat again
  echo.
  pause
  exit /b 1
)

:: ── Check Node.js version ─────────────────────────────────────────────────────
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
echo   Node.js ........... !NODE_VERSION!

:: Extract the major version number (strip the leading "v")
set "NODE_VER_CLEAN=!NODE_VERSION:v=!"
for /f "tokens=1 delims=." %%i in ("!NODE_VER_CLEAN!") do set NODE_MAJOR=%%i

:: Validate we got a number
echo !NODE_MAJOR!| findstr /r "^[0-9][0-9]*$" >nul 2>&1
if errorlevel 1 (
  echo.
  echo   ERROR: Could not read the Node.js version number.
  echo   Try reinstalling Node.js from https://nodejs.org
  echo.
  pause
  exit /b 1
)

:: Node 18 ended support April 2025.
:: Node 20 ended support April 2026.
:: Node 22 LTS is the recommended version as of mid-2026 (active until April 2027).
:: Node 24 is the current release (April 2026), not yet LTS.
if !NODE_MAJOR! LSS 18 (
  echo.
  echo   ERROR: Node.js !NODE_VERSION! is too old and will not work.
  echo.
  echo   How to update:
  echo     1. Go to https://nodejs.org
  echo     2. Click the large green LTS button
  echo     3. Run the installer, restart your computer,
  echo        then double-click Start-Windows.bat again
  echo.
  pause
  exit /b 1
)

if !NODE_MAJOR! LSS 22 (
  echo   WARNING: Node.js !NODE_VERSION! works but is approaching end-of-life.
  echo            Visit https://nodejs.org when convenient to download LTS.
)

:: ── Check npm is available ────────────────────────────────────────────────────
where npm >nul 2>&1
if errorlevel 1 (
  echo.
  echo   ERROR: npm is missing. npm normally comes bundled with Node.js.
  echo.
  echo   Try these steps in order:
  echo     1. Restart your computer
  echo     2. Double-click Start-Windows.bat again
  echo     If it still fails: reinstall Node.js from https://nodejs.org
  echo.
  pause
  exit /b 1
)

for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VERSION=%%i
echo   npm ............... v!NPM_VERSION!

:: ── Install or update dependencies ───────────────────────────────────────────
echo.
if not exist "node_modules\" (
  echo   First-time setup: installing dependencies...
  echo   ^(This takes 20-60 seconds and only happens once.^)
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo   ERROR: Could not install dependencies.
    echo.
    echo   Common causes and fixes:
    echo     * No internet: Connect to Wi-Fi or ethernet and try again.
    echo     * VPN active: Pause your VPN temporarily and try again.
    echo     * Firewall: Ask your IT team if npm traffic is blocked.
    echo.
    pause
    exit /b 1
  )
  echo.
  echo   Setup complete.
) else (
  :: Re-run install in case the app was updated since last run.
  :: npm install is safe to run repeatedly — it's nearly instant when nothing changed.
  call npm install --silent
)

:: ── Check whether the app is already running on port 3001 ────────────────────
netstat -ano 2>nul | findstr ":3001 " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
  echo.
  echo   The app is already running.
  echo   Opening your browser now...
  start "" "http://localhost:3001"
  echo.
  echo   You can close this window.
  echo.
  pause
  exit /b 0
)

:: ── Check internet connectivity (informational only) ─────────────────────────
ping -n 1 -w 2000 8.8.8.8 >nul 2>&1
if errorlevel 1 (
  echo.
  echo   WARNING: No internet connection detected.
  echo            The app will open, but job board links won't load
  echo            until you're back online.
)

:: ── All checks passed — launch ────────────────────────────────────────────────
echo.
echo   Starting...
echo.
echo   +--------------------------------------------+
echo   ^|  Your browser will open in a few seconds.  ^|
echo   ^|                                            ^|
echo   ^|  Keep this window open while you work.     ^|
echo   ^|  To STOP the app, close this window.       ^|
echo   +--------------------------------------------+
echo.

:: Open the browser ~2 seconds after this window appears
start "" /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3001"

:: Start the server (this line blocks until the window is closed)
node server.js

echo.
echo   Job Board Monitor has stopped.
echo.
pause
