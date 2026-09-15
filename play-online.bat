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

echo [3/3] Launching Cloudflare Public Tunnel...
echo.
echo Look for the public https://*.trycloudflare.com link below!
echo Share that link with your friend so they can join and play.
echo ===================================================
echo.
.\cloudflared.exe tunnel --url http://localhost:5173
pause
