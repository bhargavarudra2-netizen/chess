import { useState } from 'react';
import GameBoard from './components/GameBoard';
import GameInfo from './components/GameInfo';
import Lobby from './components/Lobby';
import AuthModal from './components/AuthModal';
import GameHistoryModal from './components/GameHistoryModal';
import { OfflineSetupModal, type OfflineMatchConfig } from './components/OfflineSetupModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useChessGame } from './hooks/useChessGame';
import { useAuth } from './hooks/useAuth';
import './App.css';

function App() {
  const {
    user,
    isLoading: authLoading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    fetchHistory,
  } = useAuth();

  const [authOpen, setAuthOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [offlineSetupOpen, setOfflineSetupOpen] = useState(false);
  const [offlineSubMode, setOfflineSubMode] = useState<'vs_ai' | 'pass_and_play'>('vs_ai');

  const {
    mode,
    roomId,
    gameState,
    playerColor,
    clocks,
    isSearching,
    queueDuration,
    pendingRoomCode,
    aiDifficulty,
    isAiThinking,
    royalLinkUsed,
    warning,
    joinQueue,
    leaveQueue,
    createPrivateRoom,
    joinRoom,
    startPractice,
    startVsAi,
    startPassAndPlay,
    rematch,
    leaveToLobby,
    makeMove,
    requestRoyalLink,
    declineRoyalLink,
    resign,
    requestDraw,
    error,
  } = useChessGame();

  const [flipped, setFlipped] = useState(false);

  const handleJoinQueue = () => {
    joinQueue();
  };

  const handleStartOfflineMatch = (config: OfflineMatchConfig) => {
    setFlipped(false);
    if (config.subMode === 'vs_ai') {
      startVsAi({
        difficulty: config.difficulty,
        playerColor: config.playerColor,
        timeControlSeconds: config.timeControlSeconds,
      });
    } else {
      startPassAndPlay({
        timeControlSeconds: config.timeControlSeconds,
        autoFlip: config.autoFlip,
      });
    }
  };

  const getEffectiveOrientation = (): 'white' | 'black' => {
    if (mode === 'pass_and_play') {
      // Keep board stable: do not automatically rotate on turn; only flip if manual flip toggled
      return flipped ? 'black' : 'white';
    }
    if (flipped) {
      return playerColor === 'black' ? 'white' : 'black';
    }
    return playerColor === 'black' ? 'black' : 'white';
  };

  const getHeaderBadge = () => {
    if (mode === 'practice') {
      return <b style={{ color: '#34d399' }}>Practice Sandbox</b>;
    }
    if (mode === 'vs_ai') {
      return (
        <span>
          🤖 Vs AI (<b style={{ color: '#06b6d4', textTransform: 'capitalize' }}>{aiDifficulty}</b>)
        </span>
      );
    }
    if (mode === 'pass_and_play') {
      return <b style={{ color: '#a855f7' }}>Pass & Play</b>;
    }
    return (
      <>
        Room: <b style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{roomId}</b>
      </>
    );
  };

  return (
    <ErrorBoundary>
      <div className="app-wrapper">
        {/* Universal Gaming Header */}
      <header className="app-header">
        <div className="brand-badge" onClick={leaveToLobby} style={{ cursor: 'pointer' }}>
          <div className="brand-logo-gem">🌀</div>
          <span className="brand-title">Portal Chess</span>
          <span className="portal-tag">Quantum Arena</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                {getHeaderBadge()}
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

          {/* User Profile Pill & Auth Trigger */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  {user.username}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: 'rgba(6, 182, 212, 0.2)',
                    color: '#38bdf8',
                  }}
                >
                  ⚡ {user.rating}
                </span>
              </div>

              <button
                onClick={() => setHistoryOpen(true)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                History
              </button>

              <button
                onClick={logout}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
              }}
            >
              Sign In / Register
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      {mode === 'lobby' ? (
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
          <Lobby
            onJoinQueue={handleJoinQueue}
            onLeaveQueue={leaveQueue}
            isSearching={isSearching}
            queueDuration={queueDuration}
            onCreateRoom={createPrivateRoom}
            onJoinRoom={joinRoom}
            onStartPractice={startPractice}
            onOpenOfflineSetup={(sub) => {
              setOfflineSubMode(sub);
              setOfflineSetupOpen(true);
            }}
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
              orientation={getEffectiveOrientation()}
              portals={gameState.portals}
              onMove={makeMove}
              turn={gameState.turn === 'w' ? 'white' : 'black'}
              lastMove={gameState.lastMove}
              onRequestRoyalLink={requestRoyalLink}
              onDeclineRoyalLink={declineRoyalLink}
              royalLinkUsed={royalLinkUsed}
              warning={warning}
              isPractice={mode === 'practice'}
              isAiThinking={isAiThinking}
              mode={mode}
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
            mode={mode}
            aiDifficulty={aiDifficulty}
            royalLinkUsed={royalLinkUsed}
            onFlipBoard={() => setFlipped(f => !f)}
            onResign={resign}
            onRequestDraw={requestDraw}
            onRematch={rematch}
            onExitToLobby={leaveToLobby}
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

      {/* Offline Setup Modal */}
      <OfflineSetupModal
        isOpen={offlineSetupOpen}
        initialSubMode={offlineSubMode}
        onClose={() => setOfflineSetupOpen(false)}
        onStartMatch={handleStartOfflineMatch}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={login}
        onRegister={register}
        isLoading={authLoading}
        error={authError}
        clearError={() => setAuthError(null)}
      />

      {/* Game History Modal */}
      <GameHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        fetchHistory={fetchHistory}
        currentUser={user}
      />
      </div>
    </ErrorBoundary>
  );
}

export default App;
