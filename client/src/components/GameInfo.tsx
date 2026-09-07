import React from 'react';

interface GameInfoProps {
    turn: 'w' | 'b';
    playerColor: string;
    history: string[];
    isGameOver: boolean;
    winner: string | null;
}

const GameInfo: React.FC<GameInfoProps> = ({ turn, playerColor, history, isGameOver, winner }) => {
    return (
        <div style={{ width: '300px', background: '#262421', padding: '20px', borderRadius: '8px', color: '#bababa' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#fff' }}>Portal Chess</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <span>You are: <b style={{ color: playerColor === 'white' ? '#fff' : '#aaa' }}>{playerColor}</b></span>
                    <span>Turn: <b style={{ color: turn === 'w' ? '#fff' : '#aaa' }}>{turn === 'w' ? 'White' : 'Black'}</b></span>
                </div>
            </div>

            <div style={{ background: '#302e2c', height: '300px', overflowY: 'auto', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #403d39' }}>Move History</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', fontSize: '14px' }}>
                    {history.map((move, i) => {
                        if (i % 2 === 0) {
                            return (
                                <React.Fragment key={i}>
                                    <span style={{ color: '#666' }}>{Math.floor(i / 2) + 1}.</span>
                                    <span>{move}</span>
                                    {history[i + 1] ? <span>{history[i + 1]}</span> : <span></span>}
                                </React.Fragment>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>

            {isGameOver && (
                <div style={{ background: '#4a2222', padding: '10px', borderRadius: '4px', textAlign: 'center', color: '#ffaaaa' }}>
                    <h3>Game Over</h3>
                    <p>Winner: {winner}</p>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ flex: 1, padding: '10px', background: '#403d39', border: 'none', color: '#fff', cursor: 'pointer' }}>Resign</button>
                <button style={{ flex: 1, padding: '10px', background: '#403d39', border: 'none', color: '#fff', cursor: 'pointer' }}>Draw</button>
            </div>
        </div>
    );
};

export default GameInfo;
