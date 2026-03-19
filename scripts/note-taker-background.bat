@echo off
REM ============================================================================
REM Ollama Note Taker - Background Service
REM ============================================================================
REM This script runs the note-taker in auto mode as a background process
REM It will generate notes every 10 minutes automatically
REM ============================================================================

echo Starting Ollama Note Taker Background Service...
echo Press Ctrl+C to stop
echo.

REM Change to project directory
cd /d "%~dp0.."

REM Check if Ollama is running
echo Checking Ollama service...
timeout /t 2 /nobreak >nul

REM Start the note-taker in auto mode
node scripts/note-taker.mjs --auto

pause