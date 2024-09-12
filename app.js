const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { Chess } = require('chess.js');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const chess = new Chess();

let players = {
    white: null,
    black: null
};
let currentPlayer = "w";

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Chess Game' });
});

// Socket.IO connection logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Assign players or spectators
    if (!players.white) {
        players.white = socket.id;
        socket.emit('playerRole', 'w');
    } else if (!players.black) {
        players.black = socket.id;
        socket.emit('playerRole', 'b');
    } else {
        socket.emit('spectatorRole');
    }

    // Handle player disconnection
    socket.on('disconnect', () => {
        if (socket.id === players.white) {
            players.white = null;
        } else if (socket.id === players.black) {
            players.black = null;
        }
        console.log('A user disconnected:', socket.id);
    });

    // Handle move event
    socket.on('move', (move) => {
        try {
            if (isPlayerTurn(socket.id)) {
                const result = chess.move(move);

                if (result) {
                    currentPlayer = chess.turn();
                    io.emit('move', move);
                    io.emit('boardState', chess.fen());
                } else {
                    console.log('Invalid move:', move);
                    socket.emit('Invalid Move', move);
                }
            }
        } catch (err) {
            console.error('Error handling move:', err);
            socket.emit('Invalid Move', move);
        }
    });
});

// Helper function to check if it's the player's turn
const isPlayerTurn = (socketId) => {
    if (chess.turn() === 'w' && socketId === players.white) return true;
    if (chess.turn() === 'b' && socketId === players.black) return true;
    return false;
};

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
