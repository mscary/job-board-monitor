#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Job Board Monitor — Mac Launcher
# Double-click this file to start the app.
# If double-clicking gives a security warning, see the README for help.
# ─────────────────────────────────────────────────────────────────────────────

# Always run from the folder this script lives in, regardless of where it
# was launched from (handles Spotlight, drag-to-Dock, etc.)
cd "$(dirname "$0")" || exit 1

clear
printf "\n"
printf "  ╔══════════════════════════════════════════╗\n"
printf "  ║         Job Board Monitor                ║\n"
printf "  ╚══════════════════════════════════════════╝\n"
printf "\n"

# ── macOS version check ───────────────────────────────────────────────────────
MACOS_VERSION=$(sw_vers -productVersion 2>/dev/null || echo "unknown")
MACOS_MAJOR=$(echo "$MACOS_VERSION" | cut -d. -f1)
printf "  macOS ............. %s\n" "$MACOS_VERSION"

# macOS 12 Monterey is the practical minimum for modern Node.js installers.
# macOS 13 Ventura, 14 Sonoma, 15 Sequoia are all fully supported.
if [[ "$MACOS_MAJOR" =~ ^[0-9]+$ ]] && [ "$MACOS_MAJOR" -lt 12 ]; then
  printf "\n"
  printf "  WARNING: macOS %s is quite old.\n" "$MACOS_VERSION"
  printf "  The app may still work, but upgrading macOS is strongly recommended\n"
  printf "  for security reasons. Check: Apple menu > System Preferences >\n"
  printf "  Software Update.\n"
  printf "\n"
fi

# ── Find Node.js ──────────────────────────────────────────────────────────────
# nodejs.org installer  → /usr/local/bin  (Intel + Apple Silicon)
# Homebrew (Apple Silicon M1/M2/M3/M4) → /opt/homebrew/bin
# Homebrew (Intel Mac)  → /usr/local/bin  (already covered above)
# MacPorts              → /opt/local/bin
# nvm                   → ~/.nvm/versions/node/<version>/bin
#
# The .command file runs as a login shell so the user's PATH should already
# include these, but we add them explicitly as a safety net.

EXTRA_PATHS=(
  "/usr/local/bin"
  "/opt/homebrew/bin"
  "/opt/local/bin"
)

# Find the most recent nvm-managed node, if any
if [ -d "$HOME/.nvm/versions/node" ]; then
  LATEST_NVM=$(ls -v "$HOME/.nvm/versions/node" 2>/dev/null | tail -1)
  [ -n "$LATEST_NVM" ] && EXTRA_PATHS+=("$HOME/.nvm/versions/node/$LATEST_NVM/bin")
fi

for dir in "${EXTRA_PATHS[@]}"; do
  if [ -x "$dir/node" ]; then
    export PATH="$dir:$PATH"
    break
  fi
done

# ── Check Node.js is installed ────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  printf "\n"
  printf "  ✗  Node.js is not installed.\n"
  printf "\n"
  printf "  How to fix this (takes about 3 minutes):\n"
  printf "    1. Open Safari or Chrome\n"
  printf "    2. Go to:  https://nodejs.org\n"
  printf "    3. Click the large green button that says LTS\n"
  printf "       (Important: do NOT click 'Current' — use LTS)\n"
  printf "    4. Open the downloaded .pkg file\n"
  printf "    5. Follow the installer (click Continue, Agree, Install)\n"
  printf "    6. When it finishes, double-click Start-Mac.command again\n"
  printf "\n"
  read -rp "  Press Enter to close this window..."
  exit 1
fi

# ── Check Node.js version ─────────────────────────────────────────────────────
NODE_VERSION=$(node --version 2>/dev/null)
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
printf "  Node.js ........... %s\n" "$NODE_VERSION"

# Validate that we got a real number
if ! [[ "$NODE_MAJOR" =~ ^[0-9]+$ ]]; then
  printf "\n"
  printf "  ✗  Could not read the Node.js version number.\n"
  printf "  Try reinstalling Node.js from https://nodejs.org\n"
  printf "\n"
  read -rp "  Press Enter to close this window..."
  exit 1
fi

# Node 18 ended support in April 2025.
# Node 20 ended support in April 2026.
# Node 22 LTS is the recommended version as of mid-2026 (active until April 2027).
# Node 24 is the current release (released April 2026), not yet LTS.
if [ "$NODE_MAJOR" -lt 18 ]; then
  printf "\n"
  printf "  ✗  Node.js %s is too old and will not work.\n" "$NODE_VERSION"
  printf "\n"
  printf "  How to update:\n"
  printf "    1. Go to https://nodejs.org\n"
  printf "    2. Click the large green LTS button\n"
  printf "    3. Run the installer, then double-click Start-Mac.command again\n"
  printf "\n"
  read -rp "  Press Enter to close this window..."
  exit 1
elif [ "$NODE_MAJOR" -lt 22 ]; then
  printf "  ⚠  Node.js %s works but is approaching end-of-life.\n" "$NODE_VERSION"
  printf "     Visit https://nodejs.org when convenient and download the LTS version.\n"
fi

# ── Check npm is available ────────────────────────────────────────────────────
if ! command -v npm &>/dev/null; then
  printf "\n"
  printf "  ✗  npm is missing. npm normally comes bundled with Node.js.\n"
  printf "\n"
  printf "  Try these steps in order:\n"
  printf "    1. Restart your Mac\n"
  printf "    2. Double-click Start-Mac.command again\n"
  printf "    If it still fails: reinstall Node.js from https://nodejs.org\n"
  printf "\n"
  read -rp "  Press Enter to close this window..."
  exit 1
fi

NPM_VERSION=$(npm --version 2>/dev/null)
printf "  npm ............... v%s\n" "$NPM_VERSION"

# ── Check the app folder has write access ─────────────────────────────────────
# The app saves all data to job_sources.json in this folder.
# If the folder is read-only, the app will start but silently fail to save.
if [ ! -w "." ]; then
  printf "\n"
  printf "  ✗  This folder is read-only. The app cannot save your data.\n"
  printf "\n"
  printf "  How to fix:\n"
  printf "    Move the entire app folder to your Desktop or Documents,\n"
  printf "    then double-click Start-Mac.command from the new location.\n"
  printf "\n"
  read -rp "  Press Enter to close this window..."
  exit 1
fi

# ── Install or update dependencies ───────────────────────────────────────────
printf "\n"
if [ ! -d "node_modules" ]; then
  printf "  First-time setup: installing dependencies...\n"
  printf "  (This takes 20-60 seconds and only happens once.)\n"
  printf "\n"
  if ! npm install 2>&1; then
    printf "\n"
    printf "  ✗  Could not install dependencies.\n"
    printf "\n"
    printf "  Common causes and fixes:\n"
    printf "    • No internet: Connect to Wi-Fi and try again.\n"
    printf "    • VPN active: Pause your VPN temporarily and try again.\n"
    printf "    • Firewall: Ask your IT team if npm is blocked.\n"
    printf "\n"
    read -rp "  Press Enter to close this window..."
    exit 1
  fi
  printf "\n"
  printf "  ✓  Setup complete.\n"
else
  # Re-run install if package.json has been updated since the last install
  if [ "package.json" -nt "node_modules/.package-lock.json" ] 2>/dev/null; then
    printf "  Updating dependencies (app was updated)...\n"
    if ! npm install --silent 2>&1; then
      printf "  ⚠  Dependency update failed — using existing packages.\n"
    fi
  fi
fi

# ── Check whether the app is already running on port 3001 ────────────────────
if lsof -Pi :3001 -sTCP:LISTEN -t &>/dev/null; then
  printf "\n"
  printf "  The app is already running.\n"
  printf "  Opening your browser now...\n"
  open "http://localhost:3001"
  printf "\n"
  printf "  You can close this window.\n"
  printf "\n"
  read -rp "  Press Enter to close..."
  exit 0
fi

# ── Soft internet check (informational only) ──────────────────────────────────
if ! ping -c 1 -W 2000 8.8.8.8 &>/dev/null 2>&1; then
  printf "\n"
  printf "  ⚠  No internet connection detected.\n"
  printf "     The app will open, but job board links won't load until\n"
  printf "     you're back online.\n"
fi

# ── All checks passed — launch ────────────────────────────────────────────────
printf "\n"
printf "  Starting...\n"
printf "\n"
printf "  ┌────────────────────────────────────────────┐\n"
printf "  │  Your browser will open in a few seconds.  │\n"
printf "  │                                            │\n"
printf "  │  Keep this window open while you work.     │\n"
printf "  │  To STOP the app, close this window.       │\n"
printf "  └────────────────────────────────────────────┘\n"
printf "\n"

# Open the browser 2 seconds after the server starts (gives server time to bind)
(sleep 2 && open "http://localhost:3001") &

node server.js

# Reached if the server exits cleanly (e.g. user pressed Ctrl+C)
printf "\n"
printf "  Job Board Monitor has stopped.\n"
printf "\n"
read -rp "  Press Enter to close this window..."
