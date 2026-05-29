# Job Board Monitor — Setup Guide

A free, private tool that lives on your own computer for tracking job boards and career pages during your job search. No accounts, no subscriptions, no data shared anywhere.

> **Find your operating system below and follow only that section.**

---

## Before you start — what you need

You need one free program called **Node.js**. It's not an app you'll ever open or see; it just runs quietly in the background so this tool can work. Installing it takes about 3 minutes.

You do NOT need to know how to code. You do NOT need to use the Terminal.

---

## I use a Mac

### Step 1 — Download the app

1. On this GitHub page, click the green **Code** button near the top right
2. Click **Download ZIP**
3. Your browser will download a file — find it in your **Downloads** folder

> **Screenshot tip:** The green Code button is near the top-right of this page, above the list of files. Download ZIP is in the dropdown that appears.

---

### Step 2 — Unzip and move the folder

1. Find the downloaded ZIP file in your Downloads folder
2. Double-click it — a new folder will appear right next to it
3. Move that folder somewhere easy to find, like your **Desktop** or **Documents**

---

### Step 3 — Install Node.js (one time only)

1. Open **Safari** or **Chrome**
2. Go to: **https://nodejs.org**
3. Click the large button labeled **LTS** — don't worry about the version number, just make sure the button says LTS and not "Current"
4. The download starts automatically — find the `.pkg` file in your Downloads folder
5. Double-click the `.pkg` file
6. Follow the installer: click **Continue**, **Agree**, **Install**, enter your Mac password if asked, then **Close**

> If you see a message saying "This package will run a program to determine if the software can be installed" — click **Continue**. This is normal.

---

### Step 4 — First launch (Mac security step)

Because this app was downloaded from the internet, your Mac will ask you to confirm you trust it. This only happens once.

1. Open the app folder you moved in Step 2
2. Find the file called **Start-Mac.command**
3. **Right-click** it (or hold Control and click)
4. Click **Open** in the menu that appears
5. A dialog box will appear warning about an "unidentified developer"
6. Click **Open** (or **Open Anyway**)

A black Terminal window will open and the app will start. Your browser should open automatically to the app within a few seconds.

> **If you see "Open Anyway" in System Settings instead:**
> Go to **Apple menu → System Settings → Privacy & Security**, scroll down, and click **Open Anyway** next to the blocked file. Then try double-clicking the file again.

> **After this first launch**, you can just double-click **Start-Mac.command** normally — no security step needed again.

---

### Starting the app every day (Mac)

1. Open your app folder
2. Double-click **Start-Mac.command**
3. A black window opens — your browser opens to the app automatically
4. **Keep the black window open** while you use the app
5. When you are done: close the black window (this stops the app)

---

## I use Windows

### Step 1 — Download the app

1. On this GitHub page, click the green **Code** button near the top right
2. Click **Download ZIP**
3. Your browser will download a file — find it in your **Downloads** folder

---

### Step 2 — Unzip and move the folder

1. Find the downloaded ZIP file in your Downloads folder
2. Right-click it and select **Extract All...** (or **Extract Here**)
3. A new folder will appear — move it somewhere easy to find, like your **Desktop**

> **Do not run the app from inside the ZIP file.** Always extract it first.

---

### Step 3 — Install Node.js (one time only)

1. Open **Chrome**, **Edge**, or **Firefox**
2. Go to: **https://nodejs.org**
3. Click the large button labeled **LTS** — don't worry about the version number, just make sure the button says LTS and not "Current"
4. The download starts automatically — find the `.msi` file in your Downloads folder
5. Double-click the `.msi` file
6. Follow the installer: click **Next**, **I accept**, **Next**, **Install**
   - If Windows asks "Do you want to allow this app to make changes?" — click **Yes**
7. Click **Finish** when done
8. **Restart your computer** — this is required for Windows to recognize Node.js

---

### Step 4 — First launch (Windows security step)

Because this file was downloaded from the internet, Windows will ask you to confirm you trust it. This only happens once.

1. Open the app folder you moved in Step 2
2. Find the file called **Start-Windows.bat**
3. Double-click it
4. A blue screen may appear saying **"Windows protected your PC"**
5. Click **More info** (the link underneath the main message)
6. Click **Run anyway**

A black window will open and the app will start. Your browser should open automatically to the app within a few seconds.

> **After this first launch**, you can just double-click **Start-Windows.bat** normally — no security step needed again.

---

### Starting the app every day (Windows)

1. Open your app folder
2. Double-click **Start-Windows.bat**
3. A black window opens — your browser opens to the app automatically
4. **Keep the black window open** while you use the app
5. When you are done: close the black window (this stops the app)

---

## Using the app

Once the app is open in your browser, here is what everything does:

**Needs Attention** — Job boards you are overdue to check, sorted by most overdue first. Red = very overdue. Yellow = a little overdue.

**Never Checked** — Sources in your list that you have not visited yet.

**Up to Date** — Sources you have recently checked. Collapsed by default to keep the page clean.

**Snoozed** — Sources you have temporarily hidden. They come back automatically when the snooze expires.

### Checking a source
1. Click **Check Now** — the careers page opens in a new browser tab
2. Browse it manually, then come back to the app
3. Type a note about what you found (or didn't find; e.g., n/a or leave it blank to note you found nothing of relevance) - You can type anything; often it's helpful to paste in the link to the job description(s) you find. If you're passing on jobs to others, designate that here too!
4. Click **Save Check-in**

### Customizing your source list
- Click **+ Add Source** in the top bar to add a new job board or company page
- Click **Edit** on any card to change its name, URL, how often to check it, or to pause it temporarily
- Click **Delete** inside the Edit panel to remove it permanently - When you first open this, many cards may be irrelevant. Delete at will. 

### Changing how often a source is checked
Open the Edit panel for any source and change the **Check Every (days)** number. For example: 7 = check weekly, 14 = every two weeks.

### Exporting your history
Click **Export CSV** in the top bar. This downloads a spreadsheet of every check-in you have ever logged — useful for records or sharing with others. Probably a good idea to export once in awhile just to have a reference of good job sites, but super critical if that CSV is your reminder to apply to the positions you found!

---

## Stopping the app

Close the black launcher window. That's it. The app will stop and the browser tab will no longer work until you launch again.

Your data is automatically saved every time you log a check-in. Closing the browser tab does not delete anything.

---

## Your data — where it lives and how to back it up

All your data is saved in a single file called **job_sources.json** inside your app folder. Nothing is sent anywhere online.

**To back it up:** Copy `job_sources.json` to another folder (like a cloud drive or USB stick).

**To restore a backup:** Replace `job_sources.json` with your backup copy, then restart the app.

**To start fresh:** Delete `job_sources.json` and restart the app. A fresh list of example sources will be created automatically.

---

## Troubleshooting

**The black window opens and then closes immediately**
The app found an error. Re-open the black window to read the message before it closes by right-clicking Start-Mac.command (Mac) or Start-Windows.bat (Windows) and choosing Open. The error message will tell you what to do.

**"Node.js is not installed" but I already installed it (Windows)**
You probably just need to restart your computer. Node.js updates Windows's PATH when it installs, but that change only takes effect after a restart.

**"Node.js is not installed" but I already installed it (Mac)**
Open the Terminal app (search "Terminal" in Spotlight), type `node --version`, and press Enter. If it prints a version number, close Terminal and try double-clicking Start-Mac.command again. If Terminal says "command not found," reinstall Node.js from https://nodejs.org.

**The browser opens but shows an error or blank page**
Wait 5 seconds and refresh the page. The server may still be starting up.

**"Port 3001 is already in use"**
The app is probably already running since the launcher will open your browser to it automatically. Restart your computer to clear the port. If the app is NOT already running, maybe another cool app like this is using the port. In that case, talk to AI and it will quickly help you use a different port or solve the problem another way. 

**The app opens but my data from before is gone**
Your data lives in `job_sources.json`. Check that this file is still in your app folder. If you moved the app folder, make sure `job_sources.json` moved with it.

**Something else is wrong**
Close the app, restart your computer, and try launching again. That resolves most issues. If problems continue, discuss with your AI tool of choice (you can show screenshots, share the files, whatever it needs); you can try reaching out to whoever shared this tool with you, but....they are likely not an expert on troubleshooting this stuff!
