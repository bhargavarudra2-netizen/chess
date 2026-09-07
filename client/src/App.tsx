import GameBoard from './components/GameBoard';
import GameInfo from './components/GameInfo';
import Lobby from './components/Lobby';
import { useChessGame } from './hooks/useChessGame';
import './App.css';

function App() {
  const {
    mode,
    roomId,
    gameState,
    playerColor,
    clocks,
    isSearching,
    queueDuration,
    pendingRoomCode,
    joinQueue,
    leaveQueue,
    createPrivateRoom,
    joinRoom,
    startPractice,
    leaveToLobby,
    makeMove,
    resign,
    requestDraw,
    error,
  } = useChessGame();

  return (
    <div className="app-wrapper">
      {/* Universal Gaming Header */}
      <header className="app-header">
        <div className="brand-badge" onClick={leaveToLobby} style={{ cursor: 'pointer' }}>
          <div className="brand-logo-gem">🌀</div>
          <span className="brand-title">Portal Chess</span>
          <span className="portal-tag">Quantum Arena</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {mode !== 'lobby' && (
            <>
              <span
                style={{
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94a3b8',
                }}
              >
                {mode === 'practice' ? (
                  <b style={{ color: '#34d399' }}>Local Practice</b>
                ) : (
                  <>
                    Room: <b style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{roomId}</b>
                  </>
                )}
              </span>

              <button
                onClick={leaveToLobby}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ← Exit to Lobby
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      {mode === 'lobby' ? (
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
          <Lobby
            onJoinQueue={joinQueue}
            onLeaveQueue={leaveQueue}
            isSearching={isSearching}
            queueDuration={queueDuration}
            onCreateRoom={createPrivateRoom}
            onJoinRoom={joinRoom}
            onStartPractice={startPractice}
            pendingRoomCode={pendingRoomCode}
          />
        </main>
      ) : gameState ? (
        <main className="app-main">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {error && (
              <div className="error-banner">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <GameBoard
              fen={gameState.fen}
              orientation={playerColor === 'spectator' ? 'white' : playerColor}
              portals={gameState.portals}
              onMove={makeMove}
              turn={gameState.turn === 'w' ? 'white' : 'black'}
              lastMove={gameState.lastMove}
            />
          </div>

          <GameInfo
            fen={gameState.fen}
            turn={gameState.turn}
            playerColor={playerColor}
            history={gameState.history}
            isGameOver={gameState.isGameOver}
            winner={gameState.winner}
            clocks={clocks}
            lastMove={gameState.lastMove}
            onResign={resign}
            onRequestDraw={requestDraw}
          />
        </main>
      ) : (
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid #06b6d4',
              borderTopColor: 'transparent',
              animation: 'portal-inner-spin 1s infinite linear',
            }}
          />
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading game session...</div>
        </main>
      )}
    </div>
  );
}

export default App;
