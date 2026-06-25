@echo off
cd /d "%~dp0"
echo Building web application...
call pnpm --dir apps\web build
if errorlevel 1 (
  echo Web build failed.
  pause
  exit /b 1
)

echo Syncing web build to CLI...
xcopy /E /I /Y apps\web\dist packages\md-cli\dist >nul
if errorlevel 1 (
  echo Web build sync failed.
  pause
  exit /b 1
)

echo Starting md-to-html-api service...
cd packages\md-cli
pnpm dev
pause
