@echo off
REM Ollama Note Taker - Windows Launcher
REM Run this to generate session notes using local Ollama model

echo ============================================
echo    Ollama Note Taker
echo ============================================
echo.

REM Check if Ollama is running
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo ERROR: Ollama is not running!
    echo Please start Ollama first: ollama serve
    echo.
    pause
    exit /b 1
)

echo Select mode:
echo   1. Generate notes for recent changes (one-time)
echo   2. Auto mode: Generate notes every 10 minutes
echo   3. Generate note for current commit only
echo.

set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Generating session summary...
    node scripts\note-taker.mjs
) else if "%choice%"=="2" (
    echo.
    echo Starting auto mode (Ctrl+C to stop)...
    echo.
    node scripts\note-taker.mjs --auto
) else if "%choice%"=="3" (
    echo.
    echo Generating commit note...
    node scripts\note-taker.mjs --commit
) else (
    echo Invalid choice.
    pause
    exit /b 1
)

echo.
pause
