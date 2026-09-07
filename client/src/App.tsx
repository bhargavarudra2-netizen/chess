import GameBoard from './components/GameBoard';
import GameInfo from './components/GameInfo';
import { useChessGame } from './hooks/useChessGame';
import './App.css';

function App() {
  const roomId = 'default-room'; // Default room for quick play
  const {
    gameState,
    playerColor,
    clocks,
    makeMove,
    resign,
    requestDraw,
    error,
  } = useChessGame(roomId);

  if (!gameState) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          background: 'radial-gradient(circle at 50% 30%, #171f38 0%, #090d16 80%)',
          color: '#f8fafc',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '3px solid #06b6d4',
            borderTopColor: 'transparent',
            animation: 'portal-inner-spin 1s infinite linear',
          }}
        />
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#94a3b8' }}>
          Connecting to Portal Chess server...
        </div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Ensure server is running on port 3000
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="brand-badge">
          <div className="brand-logo-gem">🌀</div>
          <span className="brand-title">Portal Chess</span>
          <span className="portal-tag">Quantum Board</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
            }}
          >
            Room: <b style={{ color: '#f1f5f9' }}>{roomId}</b>
          </span>
        </div>
      </header>

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
    </div>
  );
}

export default App;
