import GameBoard from './components/GameBoard';
import GameInfo from './components/GameInfo';
import { useChessGame } from './hooks/useChessGame';

function App() {
  const roomId = 'default-room'; // Hardcoded for MVP
  const { gameState, playerColor, makeMove, error } = useChessGame(roomId);

  if (!gameState) return <div style={{ color: '#bababa', padding: '20px', background: '#161512', minHeight: '100vh' }}>Connecting to server...</div>;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '40px',
      padding: '40px',
      background: '#161512',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {error && <div style={{ background: '#ff4444', color: '#fff', padding: '10px', borderRadius: '4px' }}>{error}</div>}
        <GameBoard
          fen={gameState.fen}
          orientation={playerColor === 'spectator' ? 'white' : playerColor}
          portals={gameState.portals}
          onMove={makeMove}
          turn={gameState.turn === 'w' ? 'white' : 'black'}
        />
      </div>

      <GameInfo
        turn={gameState.turn}
        playerColor={playerColor}
        history={gameState.history}
        isGameOver={gameState.isGameOver}
        winner={gameState.winner}
      />
    </div>
  );
}

export default App;
