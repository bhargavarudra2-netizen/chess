# 🚀 Free Online Deployment Guide for Portal Chess

This guide walks you through deploying **Portal Chess** online for **100% free** so anyone in the world can visit your website, open a room, and play multiplayer chess with quantum portals directly in their browser!

---

## 🏗️ Recommended Free Architecture

| Component | Free Host | Why It's Best | Cost |
|---|---|---|---|
| **Frontend (React Client)** | **[Vercel](https://vercel.com)** | Global Edge CDN, instant GitHub auto-deployments, free custom domains & SSL | **$0 / Free Forever** |
| **Backend (NestJS + WebSockets)** | **[Render](https://render.com)** | Native WebSocket (Socket.io) support, free Node.js runtime, free SSL | **$0 / Free Tier** |

---

## 📋 Step 1: Deploy the Backend on Render (5 minutes)

1. Go to **[Render.com](https://render.com)** and create a free account (Sign up with GitHub).
2. On your Render Dashboard, click **New +** and select **Web Service**.
3. Connect your GitHub repository: `bhargavarudra2-netizen/chess`.
4. Configure the Web Service settings:
   - **Name**: `portal-chess-api` *(or any name you prefer)*
   - **Region**: Choose closest to you (e.g., `Singapore`, `Frankfurt`, or `Oregon`)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: **Free**
5. *(Optional)* Add an Environment Variable:
   - Key: `JWT_SECRET`
   - Value: Any random secret string (e.g. `mySuperSecretQuantumKey123!`)
6. Click **Deploy Web Service**!
7. Once deployed, Render will provide your public backend URL, for example:
   ```text
   https://portal-chess-api.onrender.com
   ```
   *(Keep this URL handy for Step 2!)*

> [!TIP]
> **Render Free Tier Spin-Down Note**: Free services on Render go to sleep after 15 minutes of inactivity. When someone opens the site, it automatically wakes up within ~30–45 seconds.

---

## 🌐 Step 2: Deploy the Frontend on Vercel (3 minutes)

1. Go to **[Vercel.com](https://vercel.com)** and create a free account (Sign in with your GitHub account).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `bhargavarudra2-netizen/chess`.
4. In the Project Configuration:
   - **Project Name**: `portal-chess` *(or your custom name)*
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click **Edit** and choose `client`
5. Expand the **Environment Variables** section and add:
   - **Variable 1**:
     - Key: `VITE_SERVER_URL`
     - Value: `https://portal-chess-api.onrender.com` *(Use your Render URL from Step 1)*
   - **Variable 2**:
     - Key: `VITE_API_BASE`
     - Value: `https://portal-chess-api.onrender.com` *(Use your Render URL from Step 1)*
6. Click **Deploy**!
7. Within ~60 seconds, your site is live with a global HTTPS URL like:
   ```text
   https://portal-chess.vercel.app
   ```

---

## 🎮 How Players Connect & Play Online

1. Send your Vercel link (`https://your-app.vercel.app`) to your friend or share it publicly.
2. Player 1 clicks **"Create Room"** in the Lobby to generate a 6-character room code.
3. Player 2 enters that room code in **"Join Room"** and clicks **Join**.
4. Both players are immediately paired with synchronized clocks, real-time moves, and active portals!

---

## 🔄 Automatic Continuous Deployment

Whenever you push new code to your `main` branch on GitHub:
- **Render** automatically pulls the latest code, runs `npm run build`, and updates the backend API.
- **Vercel** automatically rebuilds and deploys the new frontend in seconds with zero manual effort!

---

## 🛠️ Alternative Free Hosting Options

If you prefer an all-in-one platform or different providers:

### Alternative A: Koyeb (Always-On Free Tier)
- **[Koyeb.com](https://koyeb.com)** offers a free tier (512MB RAM) that does **not** spin down after inactivity.
- Supports Docker and native WebSockets.

### Alternative B: Railway (Free Trial)
- **[Railway.app](https://railway.app)** offers $5 in free monthly credits with instant GitHub deploys and zero configuration.
