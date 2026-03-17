# Project Scripts

This directory contains utility scripts for development and maintenance.

---

## 🤖 Ollama-Powered Note Taking

**NEW**: Automatic note generation using local Ollama models. This saves Claude Code tokens and keeps your Obsidian vault updated continuously.

### Quick Start

1. **Install Ollama**: Download from https://ollama.com/
2. **Pull the model**: `ollama pull llama3.2:3b`
3. **Start Ollama**: `ollama serve`
4. **Run the note taker**:

**Windows** (Easy):
```bash
# Double-click this file
scripts\note-taker.bat
```

**Any Platform**:
```bash
# Generate notes for recent changes
node scripts/note-taker.mjs

# Auto mode: Generate notes every 10 minutes
node scripts/note-taker.mjs --auto

# Generate note for current commit
node scripts/note-taker.mjs --commit
```

### How It Works
1. **Git Analysis**: Scans recent commits and file changes
2. **Ollama Generation**: Uses local LLM to generate structured summaries
3. **Obsidian Update**: Writes to your Obsidian vault automatically
4. **Zero Tokens**: All processing happens locally

### Configuration
Edit `scripts/note-taker.mjs`:
```javascript
const CONFIG = {
  obsidianVault: 'C:\\Users\\ricar\\...\\SeshNx',
  model: 'llama3.2:3b',
  intervalMinutes: 10,
};
```

### Models Options
| Model | Size | Speed | Quality |
|-------|------|-------|--------|
| `llama3.2:3b` | 2GB | ⚡ Fast | ✅ Great (Recommended) |
| `phi3:mini` | 2.3GB | ⚡⚡ Very Fast | ✅ Good |
| `gemma2:2b` | 1.6GB | ⚡⚡⚡ Ultra Fast | ✅ Good |

### Integration with Claude Code
Claude Code can trigger the note-taker:
```
User: "Generate a session note"
Claude: [Runs node scripts/note-taker.mjs]
```

This creates a hybrid approach:
- **Ollama**: Routine summaries, git-based notes
- **Claude Code**: Complex decisions, architectural analysis

---

## 🩺 Supabase Diagnostic Scripts

These scripts help you diagnose Supabase connection and table issues.

## Quick Browser Check (Easiest)

1. Open your app in the browser
2. Open the browser console (F12)
3. Copy and paste the contents of `check-supabase-browser.js` into the console
4. Press Enter

This will check all your tables and show you which ones exist, which are missing, and which have permission issues.

## Node.js Script (Alternative)

If you prefer to run from the command line:

```bash
# Make sure you have your Supabase credentials in your environment
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"

# Run the script
node scripts/check-supabase-tables.js
```

## What to Do If Tables Are Missing

If the script shows that tables are missing (like `market_items`):

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Open the relevant SQL file from the `sql/` folder (e.g., `sql/marketplace_module.sql`)
5. Copy and paste the entire SQL script
6. Click **Run** to execute it
7. Refresh your app

## Common Issues

### 404 Error (Table does not exist)
- **Solution**: Run the SQL script to create the table

### Permission Denied (RLS blocking)
- **Solution**: Check your Row Level Security policies in Supabase
- Go to **Authentication** → **Policies** in your Supabase dashboard
- Make sure the SELECT policy allows the operation you're trying to perform

### Connection Issues
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- Verify your Supabase project is active and not paused

