# Portal Chess - Project Summary

> **Portal Chess (Quantum Arena)** transforms classical chess into a tactical sci-fi mind sport through quantum teleportation portals, placeable wormhole links, and real-time multiplayer warfare.

---

## 1. Executive Summary

Portal Chess is a full-stack, real-time chess platform built on **React (Vite, TypeScript)** and **NestJS (Socket.io, TypeORM)**. It introduces quantum physics mechanics to traditional 8x8 chess:
- **Portals** are paired wormholes distributed dynamically across the board. Moving onto a portal entrance instantly warps the piece to the linked exit square.
- **Royal Link** is an exclusive, one-time tactical power activated when a player castles, permitting the creation and placement of a new golden portal connection.
- **Full Chess Engine Compliance**: Built atop `chess.js` and `chessground`, respecting all FIDE rules (castling, en passant, promotion, check, checkmate, stalemate, three-fold repetition) while integrating portal physics.

---

## 2. Implemented Features

### 🌀 2.1. Quantum Portal Mechanics
- **Dynamic Portal Generation**: Portals spawn in 2 to 4 linked pairs across ranks 3 through 6 to prevent opening piece obstruction.
- **Instant Warping & Capture**: Entering a portal moves the piece to the linked exit; if an enemy piece occupies the exit, it is captured upon materialization.
- **Bishop Color Rule**: Bishops can only travel through portals whose exit square has the same tile color (light-square or dark-square) as their current square.
- **King Check Prevention**: The King cannot teleport through any portal if doing so would place it in check. The engine blocks the warp, holds the King safely at the entrance square, and displays an animated visual warning.
- **Portal Pawn Promotion**: If a pawn traverses a portal and arrives at the opposing back rank (rank 8 for White, rank 1 for Black), it immediately promotes to a Queen.
- **Royal Link Priority & Friendly Fallback**: When a portal has both a Royal Link and a fallback portal link:
  1. The Royal Link takes top priority.
  2. If the Royal Link destination is already occupied by a friendly piece (or would put the King in check), the engine automatically falls back to the secondary portal link.

### 👑 2.2. The Royal Link
- **Castling-Exclusive Trigger**: Activated strictly when performing Kingside ($O-O$) or Queenside ($O-O-O$) castling before move 15. Standard King moves never trigger the prompt.
- **Tactical Modal**: Players can choose to:
  1. Deploy a new Golden Portal to a chosen square or the King's origin square.
  2. Decline the Royal Link and proceed with a regular castle.
- **One-Time Use**: Strictly limited to one activation per player per game.

### 🎮 2.3. Game Modes
1. **Offline Solo vs Quantum AI**:
   - Three difficulty tiers: **Novice** (random/tactical), **Adept** (heuristic evaluation with portal depth), and **Master** (minimax with portal awareness).
   - Instant response, works with zero backend dependency.
2. **Pass & Play (Local 2-Player)**:
   - Play face-to-face on one screen.
   - Optional automatic board flipping on turn change.
   - Dual digital countdown clocks with flagging defeat.
3. **Free Sandbox Board**:
   - Interactive board to freely test portal jumps, piece combinations, and check scenarios.
4. **Online Multiplayer (Socket.io)**:
   - Matchmaking queue with Elo rating buckets.
   - Private 6-character room codes for direct friend challenges.
   - Spectator support and real-time game state synchronization.

### 🎨 2.4. Audio & Visual Excellence
- **Cosmic Sci-Fi UI**: Tailored dark theme (`#0a0f1d`), neon cyan (`#06b6d4`) and violet (`#a855f7`) accents, and glowing SVG portal vortices with rotating energy rings.
- **King Check Aura**: Pulsing radial red gradient (`#ef4444`) highlighting the King's square when placed in check.
- **Procedural Sound Engine**: Zero-asset, Web Audio API synthesizer generating clean, low-latency audio for moves, captures, checks, game over, portal warps, and Royal Link deployment.
- **Captured Pieces Tracker**: Material tally displaying captured pieces and advantage scores for both sides.
- **Custom Brand Identity**: Dedicated vector SVG brand logo featuring the crowned Quantum King.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite (Rolldown), Chessground, Chess.js, Vanilla CSS |
| **Backend** | NestJS 10, TypeScript, Socket.io, TypeORM |
| **Persistence** | PostgreSQL (User accounts, Match History, Move Logs), Redis (Matchmaking Queue) |
| **Audio** | HTML5 Web Audio API procedural synthesis |
| **DevOps / Containers** | Docker, Docker Compose |

---

## 4. Current State & Roadmap

- **Core Gameplay**: 100% Completed, tested, and verified across all chess rules and portal exceptions.
- **Offline Modes**: 100% Fully functional (vs AI, Pass & Play, Sandbox).
- **Next Milestone**: Finalize full Online Multiplayer flow (room socket contracts, reconnection handling, in-game draw/resign sync, and persistent post-game Elo updates).
