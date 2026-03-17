#!/usr/bin/env node
/**
 * Ollama-Powered Note Taker for Claude Code Sessions
 *
 * This script uses local Ollama models to generate session summaries
 * and update your Obsidian vault without using Claude tokens.
 *
 * Usage:
 *   node scripts/note-taker.mjs                  # Interactive mode
 *   node scripts/note-taker.mjs --auto           # Automatic mode
 *   node scripts/note-taker.mjs --commit         # Generate notes for git commit
 *
 * Requirements:
 *   - Ollama running with: ollama serve
 *   - Model pulled: ollama pull llama3.2:3b
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  // Obsidian vault path
  obsidianVault: 'C:\\Users\\ricar\\Documents\\Amalia Media LLC\\Products\\Webapp\\Obsidian\\SeshNx',

  // Ollama configuration
  ollamaUrl: 'http://localhost:11434',
  model: 'llama3.2:3b', // Fast, efficient model for note-taking

  // Project paths
  projectRoot: dirname(__dirname),

  // Note settings
  autoMode: process.argv.includes('--auto'),
  commitMode: process.argv.includes('--commit'),
  intervalMinutes: 10, // How often to take notes in auto mode
};

// ============================================================================
// OLLAMA INTEGRATION
// ============================================================================

/**
 * Check if Ollama is running and accessible
 */
async function checkOllama() {
  try {
    const response = await fetch(`${CONFIG.ollamaUrl}/api/tags`);
    return response.ok;
  } catch (error) {
    console.error('❌ Ollama not accessible. Make sure it\'s running with: ollama serve');
    return false;
  }
}

/**
 * Generate text using Ollama
 */
async function generateWithOllama(prompt, system = '') {
  const response = await fetch(`${CONFIG.ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CONFIG.model,
      prompt: prompt,
      system: system,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 1000,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}

// ============================================================================
// GIT ANALYSIS
// ============================================================================

/**
 * Get recent git changes
 */
function getGitChanges() {
  try {
    // Get commits since last note
    const lastNoteHash = getLastNoteHash();
    const range = lastNoteHash ? `${lastNoteHash}..HEAD` : 'HEAD~10..HEAD';

    const log = execSync(`git log ${range} --pretty=format:"%H|%s|%an|%ad" --date=iso`, {
      cwd: CONFIG.projectRoot,
      encoding: 'utf-8',
    });

    const commits = log.trim().split('\n').filter(Boolean).map(line => {
      const [hash, subject, author, date] = line.split('|');
      return { hash, subject, author, date };
    });

    // Get diff stats
    const diff = execSync(`git diff --stat ${range} HEAD`, {
      cwd: CONFIG.projectRoot,
      encoding: 'utf-8',
    });

    return { commits, diff };
  } catch (error) {
    console.error('Error getting git changes:', error.message);
    return { commits: [], diff: '' };
  }
}

/**
 * Get file changes in detail
 */
function getDetailedChanges(commitRange) {
  try {
    const diff = execSync(`git diff ${commitRange}`, {
      cwd: CONFIG.projectRoot,
      encoding: 'utf-8',
    });
    return diff;
  } catch (error) {
    return '';
  }
}

/**
 * Get the last note's commit hash
 */
function getLastNoteHash() {
  const sessionPath = join(CONFIG.obsidianVault, 'Sessions', `${getCurrentDate()}.md`);
  if (!existsSync(sessionPath)) return null;

  const content = readFileSync(sessionPath, 'utf-8');
  const match = content.match(/Last Commit:\s*([a-f0-9]+)/);
  return match ? match[1] : null;
}

// ============================================================================
// NOTE GENERATION
// ============================================================================

/**
 * Generate session summary using Ollama
 */
async function generateSessionSummary() {
  console.log('📝 Analyzing recent changes...');

  const { commits, diff } = getGitChanges();

  if (commits.length === 0) {
    console.log('✨ No new changes since last note.');
    return null;
  }

  console.log(`Found ${commits.length} commit(s)`);

  const prompt = buildPrompt(commits, diff);
  const systemPrompt = `You are a technical note-taker for a software project. Generate clear, structured session summaries in Markdown format. Focus on:
1. What was accomplished (features, bug fixes, refactoring)
2. Technical details and implementation notes
3. Files modified and their purposes
4. Any important decisions or insights
5. Next steps or ongoing work

Be concise but informative. Use the exact formatting from the template.`;

  console.log('🤖 Generating summary with Ollama...');
  const summary = await generateWithOllama(prompt, systemPrompt);

  return {
    date: getCurrentDate(),
    time: new Date().toLocaleTimeString(),
    commits,
    diff,
    summary,
  };
}

/**
 * Build prompt for Ollama
 */
function buildPrompt(commits, diff) {
  return `
# Recent Git Activity

${commits.map((c, i) => `
${i + 1}. ${c.subject}
   Author: ${c.author}
   Date: ${c.date}
   Hash: ${c.hash.substring(0, 8)}
`).join('\n')}

# Files Changed

${diff || 'No file changes'}

# Task

Generate a session summary note for these changes. Use this structure:

## 🎯 Objectives
- [x] Objective 1 (from commits)
- [ ] Objective 2 (ongoing)

## ✅ Completed
### Feature Work
- **Feature**: Description
  - Files: path/to/file1, path/to/file2
  - Notes: Implementation details

### Bug Fixes
- **Bug**: Description
  - Error: Error message
  - Fix: What was changed

### Code Quality
- Refactoring work
- Tests added
- Documentation

## 🚧 In Progress
- Task 1
- Task 2

## 💡 Insights
- Important patterns or discoveries
- Performance considerations
- Architecture notes

## ⏭️ Next Session
1. Priority task 1
2. Priority task 2

---
Session Duration: [estimate]
Lines Changed: [from git diff --shortstat]
Files Modified: [count]
`;
}

/**
 * Create or update session note in Obsidian
 */
function updateSessionNote(sessionData) {
  if (!sessionData) {
    console.log('No session data to write.');
    return;
  }

  const sessionPath = join(CONFIG.obsidianVault, 'Sessions', `${sessionData.date}.md`);

  const frontmatter = `---
date: ${sessionData.date}
session_type: daily
tags: [session, daily, ollama-generated]
---

# Session Summary - ${sessionData.date}

**Generated**: ${sessionData.date} at ${sessionData.time}
**Model**: ${CONFIG.model}
**Commits Covered**: ${sessionData.commits.length}

## 🔗 Recent Commits

${sessionData.commits.map(c => `- \`${c.hash.substring(0, 8)}\`: ${c.subject}`).join('\n')}

---

`;

  const note = frontmatter + sessionData.summary;

  // Append if file exists, create new if not
  if (existsSync(sessionPath)) {
    const existing = readFileSync(sessionPath, 'utf-8');
    const updated = existing + '\n\n## 📝 Auto-Generated Update\n\n' + sessionData.summary;
    writeFileSync(sessionPath, updated);
    console.log('✅ Updated existing session note');
  } else {
    writeFileSync(sessionPath, note);
    console.log('✅ Created new session note');
  }

  console.log(`📄 Note saved to: ${sessionPath}`);
}

// ============================================================================
// UTILITIES
// ============================================================================

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Commit mode: Generate notes for current commit
 */
async function commitMode() {
  const currentHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  const currentCommit = execSync('git log -1 --pretty=format:"%s|%an|%ad"', { encoding: 'utf-8' }).trim();

  const [subject, author, date] = currentCommit.split('|');

  const { commits, diff } = getGitChanges();
  commits.unshift({
    hash: currentHash,
    subject,
    author,
    date,
  });

  const prompt = buildPrompt(commits, diff);
  const systemPrompt = `You are a technical note-taker. Generate a concise commit note explaining what was changed and why.`;

  console.log('🤖 Generating commit note with Ollama...');
  const summary = await generateWithOllama(prompt, systemPrompt);

  const commitPath = join(CONFIG.obsidianVault, 'Daily Notes', `${getCurrentDate()}.md`);
  const note = `
# Commit Note - ${currentHash.substring(0, 8)}

**Time**: ${new Date().toLocaleTimeString()}
**Commit**: ${currentHash.substring(0, 8)}
**Author**: ${author}
**Message**: ${subject}

${summary}

---

`;

  if (existsSync(commitPath)) {
    const existing = readFileSync(commitPath, 'utf-8');
    writeFileSync(commitPath, existing + note);
  } else {
    writeFileSync(commitPath, note);
  }

  console.log('✅ Commit note created');
}

/**
 * Auto mode: Run continuously and take notes at intervals
 */
async function autoMode() {
  console.log(`🔄 Auto mode enabled - taking notes every ${CONFIG.intervalMinutes} minutes`);
  console.log('Press Ctrl+C to stop\n');

  const interval = setInterval(async () => {
    console.log(`\n[${new Date().toLocaleTimeString()}] 📝 Auto-generating notes...`);

    try {
      const sessionData = await generateSessionSummary();
      if (sessionData) {
        updateSessionNote(sessionData);
      }
    } catch (error) {
      console.error('Error in auto mode:', error.message);
    }
  }, CONFIG.intervalMinutes * 60 * 1000);

  // Initial note
  try {
    const sessionData = await generateSessionSummary();
    if (sessionData) {
      updateSessionNote(sessionData);
    }
  } catch (error) {
    console.error('Error generating initial note:', error.message);
  }

  // Keep running
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\n\n👋 Auto mode stopped');
    process.exit(0);
  });
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🤖 Ollama Note Taker\n');

  // Check Ollama
  const ollamaRunning = await checkOllama();
  if (!ollamaRunning) {
    process.exit(1);
  }

  console.log(`✅ Ollama connected (${CONFIG.model})`);
  console.log(`📁 Obsidian vault: ${CONFIG.obsidianVault}\n`);

  // Execute mode
  if (CONFIG.commitMode) {
    await commitMode();
  } else if (CONFIG.autoMode) {
    await autoMode();
  } else {
    // Interactive mode
    const sessionData = await generateSessionSummary();
    if (sessionData) {
      updateSessionNote(sessionData);
    }
  }

  if (!CONFIG.autoMode) {
    console.log('\n✨ Done!');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
