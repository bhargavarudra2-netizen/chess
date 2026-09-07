# Portal Chess

> lets build a different world

A custom chess game with portal mechanics and online multiplayer.

## Structure
- `client/`: React + Vite + TypeScript frontend.
- `server/`: NestJS + Socket.io + TypeORM backend.

## How to Run

### 1. Start the Server
```bash
cd server
npm install
npm run start:dev
```
Server runs on port 3000.

### 2. Start the Client
```bash
cd client
npm install
npm run dev
```
Client runs on http://localhost:5173.

## Features
- **Portals**: Randomly generated pairs. Move into one to teleport to the other.
- **Bishop Rule**: Bishops only teleport if destination color matches.
- **Royal Link**: King can create a portal before move 15 (Not fully UI implemented yet, logic exists).
- **Online Multiplayer**: Real-time moves via Socket.io.
