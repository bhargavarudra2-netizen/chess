---
description: How to run the Portal Chess application
---

# Run Portal Chess

This workflow describes how to run the Portal Chess application (Server and Client).

## Prerequisites

- **Node.js** (v18+)
- **Docker** (for Redis)
- **Redis** (running on port 6379)

## Steps

1.  **Start Redis**
    Ensure Redis is running. You can use the provided `docker-compose.yml` file.
    ```bash
    docker-compose up -d redis
    ```
    *Note: If you don't have Docker, you must install and run Redis manually on port 6379.*

2.  **Install Dependencies**
    Install dependencies for both Server and Client.
    ```bash
    cd server && npm install
    cd ../client && npm install
    ```

3.  **Start Server**
    Start the NestJS server. It will listen on port 3000.
    ```bash
    cd server
    npm run start:dev
    ```

4.  **Start Client**
    Start the Vite development server. It will usually listen on port 5173.
    ```bash
    cd client
    npm run dev
    ```

5.  **Access the Application Locally**
    Open your browser and navigate to `http://localhost:5173`.

6.  **Play with a Friend Online (Remote / Public Internet)**
    To share a secure public link with a friend anywhere in the world:
    - Double click `play-online.bat`, or run:
      ```powershell
      .\cloudflared.exe tunnel --url http://localhost:5173
      ```
    - Copy the generated `https://*.trycloudflare.com` link and send it to your friend!

