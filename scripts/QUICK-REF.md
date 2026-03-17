# 🤖 Ollama Quick Reference

## Prerequisites
- ✅ Ollama installed: https://ollama.com/
- ✅ Model pulled: `ollama pull llama3.2:3b`
- ✅ Ollama running: `ollama serve`

## Commands

### Windows (Easiest)
```bash
# Double-click
scripts\note-taker.bat
```

### Command Line
```bash
# Generate notes now
node scripts/note-taker.mjs

# Auto-mode (every 10 min)
node scripts/note-taker.mjs --auto

# Note for current commit
node scripts/note-taker.mjs --commit
```

## Typical Workflow

### Start of Day
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start auto-note taking
node scripts/note-taker.mjs --auto
```

### During Coding
- Work normally with Claude Code
- Notes auto-generate every 10 minutes
- Focus on coding, not documentation

### After Commit
```bash
git commit -m "message"
node scripts/note-taker.mjs --commit
```

### End of Day
- Review notes in Obsidian
- Check `Sessions/2026-03-17.md`
- Add any manual notes if needed

## Models

| Model | Pull Command | Best For |
|-------|--------------|----------|
| Llama 3.2 3B | `ollama pull llama3.2:3b` | Daily notes |
| Phi 3 Mini | `ollama pull phi3:mini` | Quick notes |
| Gemma 2 2B | `ollama pull gemma2:2b` | Ultra-fast |

Change in `scripts/note-taker.mjs` line 17.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Not accessible | Run `ollama serve` |
| Model not found | Run `ollama pull llama3.2:3b` |
| Port in use | Already running, OK to proceed |
| Notes not appearing | Check vault path in config |

## File Locations

```
scripts/note-taker.mjs       # Main script
scripts/note-taker.bat       # Windows launcher
scripts/README.md            # Full documentation
Obsidian/SeshNx/            # Your vault
  ├── Sessions/              # Session summaries
  └── Daily Notes/           # Commit notes
```

## Benefits

- ✅ Saves Claude Code tokens
- ✅ Continuous documentation
- ✅ Runs locally (private)
- ✅ Fast (2-3 seconds)
- ✅ Automatic (zero effort)

---

**Need Help?** See `OLLAMA-INTEGRATION.md` in your Obsidian vault
