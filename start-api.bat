@echo off
echo Starting md-to-html-api service...
cd /d "%~dp0packages\md-cli"
pnpm dev
pause
