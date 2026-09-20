# 🚀 Free Online Deployment Guide for Portal Chess

This guide walks you through deploying **Portal Chess** online for **100% free** so anyone in the world can visit your website, open a room, and play multiplayer chess with quantum portals directly in their browser!

---

## 🏗️ Architecture: Render + Vercel + UptimeRobot

| Component | Free Host | Purpose | Cost |
|---|---|---|---|
| **Frontend (React Client)** | **[Vercel](https://vercel.com)** | Global Edge CDN, instant GitHub auto-deployments, free SSL | **$0 / Free Forever** |
| **Backend (NestJS + WebSockets)** | **[Render](https://render.com)** | Native WebSocket support, free Node.js runtime, free SSL | **$0 / Free Tier** |
| **Keep-Alive Pinger** | **[UptimeRobot](https://uptimerobot.com)** | Pings backend every 14 min to prevent Render sleeping | **$0 / Free Forever** |

> Render's free tier sleeps after **15 minutes** of inactivity. UptimeRobot pings your `/health` endpoint every **14 minutes**, keeping it awake 24/7 at zero cost.

---

## Step 1: Deploy the Backend on Render (5 minutes)

1. Go to **[Render.com](https://render.com)** and create a free account (Sign up with GitHub).
2. On your Render Dashboard, click **New +** and select **Web Service**.
3. Connect your GitHub repository: `bhargavarudra2-netizen/chess`.
4. Configure the Web Service settings:
   - **Name**: `portal-chess-api`
   - **Region**: Choose closest to you (e.g., Singapore, Frankfurt, or Oregon)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: **Free**
5. Add an Environment Variable:
   - Key: `JWT_SECRET`
   - Value: Any random secret string (e.g. `mySuperSecretQuantumKey123!`)
6. Click **Deploy Web Service**!
7. Once deployed, Render gives you a URL like:
   ```
   https://portal-chess-api.onrender.com
   ```
   Keep this URL handy for Steps 2 and 3!

---

## Step 2: Set Up UptimeRobot Keep-Alive (3 minutes)

This makes your Render server **always-on** for free by pinging it every 14 minutes.

1. Go to **[UptimeRobot.com](https://uptimerobot.com)** and create a free account.
2. Click **+ Add New Monitor**.
3. Configure the monitor:
   - **Monitor Type**: `HTTP(S)`
   - **Friendly Name**: `Portal Chess API`
   - **URL**: `https://portal-chess-api.onrender.com/health`
     *(Replace with your actual Render URL from Step 1)*
   - **Monitoring Interval**: `14 minutes`
4. Click **Create Monitor**.

UptimeRobot will now ping your server every 14 minutes. The `/health` endpoint responds instantly, keeping your Render instance awake 24/7.

Verify it works by visiting `https://your-backend.onrender.com/health` in a browser. You should see:
```json
{ "status": "ok", "uptime": 3600, "timestamp": "...", "service": "portal-chess-api" }
```

---

## Step 3: Deploy the Frontend on Vercel (3 minutes)

1. Go to **[Vercel.com](https://vercel.com)** and create a free account (Sign in with GitHub).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `bhargavarudra2-netizen/chess`.
4. In the Project Configuration:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click **Edit** and choose `client`
5. Add Environment Variables:
   - Key: `VITE_SERVER_URL` | Value: `https://portal-chess-api.onrender.com`
   - Key: `VITE_API_BASE` | Value: `https://portal-chess-api.onrender.com`
6. Click **Deploy**!
7. Your site is live at something like:
   ```
   https://portal-chess.vercel.app
   ```

---

## How Players Play Online

1. Share your Vercel link with your friend.
2. Player 1 clicks **Create Room** to generate a 6-character room code.
3. Player 2 enters that room code in **Join Room** and clicks Join.
4. Both players are paired instantly with synchronized clocks and real-time moves!

---

## Automatic Continuous Deployment

When you push new code to `main` on GitHub:
- **Render** automatically pulls, builds, and deploys the new backend.
- **Vercel** automatically rebuilds and deploys the new frontend.

---

## Alternative Free Hosting Options

### Oracle Cloud (Always Free - Best Option)
- Truly always-on free VMs, never sleeps, no cold starts, no UptimeRobot needed.
- Requires a credit card for signup (identity verification only, not charged).

### Koyeb (1-hour sleep instead of 15 min)
- Free tier sleeps after 1 hour of inactivity.
- Use UptimeRobot with a 55-minute ping interval to keep it alive.
