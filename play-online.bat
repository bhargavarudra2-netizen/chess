@echo off
title Portal Chess - Online Multiplayer Launcher
echo ===================================================
echo       PORTAL CHESS - PLAY WITH A FRIEND ONLINE
echo ===================================================
echo.
echo [1/3] Starting NestJS Backend Server (Port 3000)...
start "Portal Chess Backend" cmd /k "cd server && npm run start:dev"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Vite Frontend Server (Port 5173)...
start "Portal Chess Frontend" cmd /k "cd client && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Choose your online tunnel provider:
echo   [1] Cloudflare Tunnel (Recommended - Direct HTTPS)
echo   [2] Localtunnel (Backup if Cloudflare times out on your ISP)
echo.
set /p tunnelChoice="Choose [1 or 2] (Default is 1): "

if "%tunnelChoice%"=="2" (
    echo.
    echo Starting Localtunnel on port 5173...
    echo Your friend can enter password/IP if asked.
    npx --yes localtunnel --port 5173
) else (
    echo.
    echo Starting Cloudflare Tunnel on port 5173...
    echo If it times out due to ISP limits, close and choose option [2].
    .\cloudflared.exe tunnel --url http://localhost:5173
)
pause
