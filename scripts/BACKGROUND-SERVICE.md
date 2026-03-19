# 🔄 Ollama Note Taker - Background Service Setup

Run your llama3.2:3b note-taker automatically in the background with continuous documentation.

## 🚀 Quick Start Options

### Option 1: Simple Background Window (Easiest)
```bash
# Double-click this file
scripts\note-taker-background.bat
```

**Pros**: Simple, no installation, shows output in window
**Cons**: Window must stay open, stops on logout

---

### Option 2: Windows Task Scheduler (Recommended)
```bash
# Register as Windows service
schtasks /create /tn "OllamaNoteTaker" /xml "scripts\note-taker-service.xml"

# Start immediately
schtasks /run /tn "OllamaNoteTaker"

# Check status
schtasks /query /tn "OllamaNoteTaker"

# Stop when needed
schtasks /end /tn "OllamaNoteTaker"

# Uninstall
schtasks /delete /tn "OllamaNoteTaker" /f
```

**Pros**: Auto-start on boot/login, runs in background, survives logout
**Cons**: Requires admin setup

---

### Option 3: PM2 Process Manager (Best for Developers)
```bash
# Install PM2 globally
npm install -g pm2

# Start the service
pm2 start scripts/ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs ollama-note-taker

# Restart
pm2 restart ollama-note-taker

# Stop
pm2 stop ollama-note-taker

# Remove
pm2 delete ollama-note-taker

# Save configuration (auto-start on reboot)
pm2 save
pm2 startup
```

**Pros**: Professional process management, logs, monitoring, auto-restart
**Cons**: Requires PM2 installation

---

## 🔧 Configuration

### Change Update Interval
Edit `scripts/note-taker.mjs` line 41:
```javascript
intervalMinutes: 10, // Change to 5, 15, 30, etc.
```

### Change Model
Edit `scripts/note-taker.mjs` line 33:
```javascript
model: 'llama3.2:3b', // Or 'phi3:mini', 'gemma2:2b', etc.
```

### Change Obsidian Vault Path
Edit `scripts/note-taker.mjs` line 29:
```javascript
obsidianVault: 'C:\\Your\\Path\\To\\Obsidian\\Vault',
```

---

## 📊 Monitoring & Logs

### View Generated Notes
- **Session Notes**: `Obsidian/SeshNx/Sessions/2026-03-16.md`
- **Commit Notes**: `Obsidian/SeshNx/Daily Notes/2026-03-16.md`

### Check Service Status
**Option 1 (Simple)**: Look at the background window
**Option 2 (Task Scheduler)**: `schtasks /query /tn "OllamaNoteTaker"`
**Option 3 (PM2)**: `pm2 status` or `pm2 monit`

### View Logs
**Option 1 (Simple)**: Check the background window output
**Option 2 (Task Scheduler)**: Windows Event Viewer
**Option 3 (PM2)**: `pm2 logs ollama-note-taker --lines 100`

---

## 🛠️ Troubleshooting

### Service Not Starting
1. **Ollama not running**: Start with `ollama serve`
2. **Wrong paths**: Update paths in `note-taker.mjs`
3. **Port conflicts**: Make sure Ollama is on port 11434

### No Notes Generated
1. **No git changes**: Notes only generate when there are commits
2. **Wrong vault path**: Check `obsidianVault` in config
3. **Model missing**: Run `ollama pull llama3.2:3b`

### High Memory Usage
1. **Change model**: Switch to `gemma2:2b` (smaller)
2. **Increase interval**: Change to 30 minutes instead of 10
3. **Restart service**: Clear any accumulated memory

---

## 🎯 Recommended Setup

### For Daily Development
**Use PM2** - Professional monitoring and auto-restart
```bash
npm install -g pm2
pm2 start scripts/ecosystem.config.js
pm2 save
pm2 startup
```

### For Set-and-Forget
**Use Task Scheduler** - Runs on boot, survives reboots
```bash
schtasks /create /tn "OllamaNoteTaker" /xml "scripts\note-taker-service.xml"
```

### For Testing
**Use Simple Batch** - Easy to see what's happening
```bash
# Just double-click
scripts\note-taker-background.bat
```

---

## 📝 How It Works

1. **Auto Mode**: Service starts in `--auto` mode
2. **Interval Check**: Every 10 minutes (configurable)
3. **Git Analysis**: Scans for new commits
4. **AI Generation**: Uses llama3.2:3b to create summaries
5. **Obsidian Update**: Writes notes to your vault
6. **Repeat**: Continues automatically

### Typical Day
- **9:00 AM**: Service starts (auto-start)
- **9:10 AM**: First note generated (morning commits)
- **2:30 PM**: Second note (afternoon work)
- **5:00 PM**: Final note (end of day)
- **All Day**: Zero manual intervention needed

---

## 🎉 Benefits

✅ **Zero Configuration** - Set once, runs forever
✅ **Continuous Documentation** - Every commit captured
✅ **No Token Usage** - All local processing
✅ **Fast Performance** - 2-3 second generation time
✅ **Structured Notes** - Professional format automatically
✅ **Zero Effort** - Focus on coding, not documentation

---

**Status**: Ready to run! Choose your preferred method and start automatic note-taking today.