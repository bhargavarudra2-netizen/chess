import { io } from 'socket.io-client';

async function simulateGame() {
    const url = 'http://localhost:3000';
    const client1 = io(url);
    const client2 = io(url);

    console.log('Connecting clients...');

    await new Promise<void>(resolve => {
        let connected = 0;
        const onConnect = () => {
            connected++;
            if (connected === 2) resolve();
        };
        client1.on('connect', onConnect);
        client2.on('connect', onConnect);
    });

    console.log('Clients connected. Joining room...');

    const roomId = 'sim_room_1';
    client1.emit('join_room', { gameId: roomId });
    client2.emit('join_room', { gameId: roomId });

    // Wait for game start
    await new Promise<void>(resolve => {
        client1.on('game_start', () => {
            console.log('Game started!');
            resolve();
        });
    });

    // Helper to make move
    const makeMove = (client: any, from: string, to: string) => {
        return new Promise<void>(resolve => {
            client.emit('make_move', { gameId: roomId, from, to });
            client.once('move_result', (res: any) => {
                if (res.ok) {
                    console.log(`Move ${from}-${to} successful. FEN: ${res.fen}`);
                } else {
                    console.error(`Move ${from}-${to} failed: ${res.error}`);
                }
                // Wait a bit for opponent to receive
                setTimeout(resolve, 500);
            });
        });
    };

    // Play a short sequence
    console.log('White moves e2-e4');
    await makeMove(client1, 'e2', 'e4');

    console.log('Black moves e7-e5');
    await makeMove(client2, 'e7', 'e5');

    console.log('White moves g1-f3');
    await makeMove(client1, 'g1', 'f3');

    // Test Portal Logic (if portals exist at a1/h1 etc)
    // This depends on random generation, so hard to test deterministically without mocking PortalService.
    // But we can just play standard moves to verify flow.

    console.log('Simulation complete. Disconnecting...');
    client1.disconnect();
    client2.disconnect();
}

simulateGame().catch(console.error);
