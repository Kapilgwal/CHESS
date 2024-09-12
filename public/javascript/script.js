const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

// Renders the chessboard
const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";

    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = createSquareElement(rowIndex, squareIndex);
            
            if (square) {
                const pieceElement = createPieceElement(square, rowIndex, squareIndex);
                squareElement.appendChild(pieceElement);
            }

            addDragAndDropEvents(squareElement, rowIndex, squareIndex);
            boardElement.appendChild(squareElement);
        });
    });

    toggleBoardFlip();
};

// Create a square element
const createSquareElement = (rowIndex, squareIndex) => {
    const squareElement = document.createElement("div");
    squareElement.classList.add("square", (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark");
    squareElement.dataset.row = rowIndex;
    squareElement.dataset.col = squareIndex;
    return squareElement;
};

// Create a piece element
const createPieceElement = (square, rowIndex, squareIndex) => {
    const pieceElement = document.createElement("div");
    pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black");
    pieceElement.innerText = getPieceUnicode(square);
    pieceElement.draggable = playerRole === square.color;

    if (pieceElement.draggable) {
        pieceElement.addEventListener("dragstart", (e) => handleDragStart(e, pieceElement, rowIndex, squareIndex));
        pieceElement.addEventListener("dragend", handleDragEnd);
    }

    return pieceElement;
};

// Handle drag start
const handleDragStart = (e, pieceElement, rowIndex, squareIndex) => {
    draggedPiece = pieceElement;
    sourceSquare = { row: rowIndex, col: squareIndex };
    e.dataTransfer.setData("text/plain", "");
};

// Handle drag end
const handleDragEnd = () => {
    draggedPiece = null;
    sourceSquare = null;
};

// Add drag and drop events to the square element
const addDragAndDropEvents = (squareElement, rowIndex, squareIndex) => {
    squareElement.addEventListener("dragover", (e) => e.preventDefault());
    squareElement.addEventListener("drop", (e) => handleDrop(e, squareElement));
};

// Handle drop event
const handleDrop = (e, squareElement) => {
    e.preventDefault();
    if (draggedPiece) {
        const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
        };
        handleMove(sourceSquare, targetSquare);
    }
};

// Toggle board orientation based on player role
const toggleBoardFlip = () => {
    if (playerRole === 'b') {
        boardElement.classList.add("flipped");
    } else {
        boardElement.classList.remove("flipped");
    }
};

// Handle chess move and emit it through Socket.IO
const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q' // Default promotion to Queen
    };

    socket.emit("move", move);
};

// Get the Unicode representation of the chess piece
const getPieceUnicode = (piece) => {
        const unicodePieces = {
            K: "♔",
            k: "♚",
            Q: "♕",
            q: "♛",
            R: "♖",
            r: "♜",
            b: "♗",
            B: "♝",
            n: "♘",
            N: "♞",
            p: "♙",
            P: "♟"
        };


    return unicodePieces[piece.type] || "";
};

// Socket.IO events

// Set player role and render board
socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

// Set spectator role and render board
socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
});

// Update board state with FEN and render board
socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

// Update move and render board
socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});

// Initial rendering of the board
renderBoard();

/*
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    console.log(board);
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square",
                (rowIndex + squareIndex) % 2 == 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black");

                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });
                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            };

            squareElement.addEventListener("dragover", function (e) {
                e.preventDefault();
            })

            squareElement.addEventListener("drop", function (e) {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };

                    handleMove(sourceSquare, targetSource);
                }
            })
            boardElement.appendChild(squareElement);
        })
    });

    if(playerRole === 'b'){
        boardElement.classList.add("flipped");
    }
    
    else{
        boardElement.classList.remove("flipped");

    }


};

const handleMove = (source, target) => {

    const move = {

        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    };

    socket.emit("move",move);

};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        K: "♔",
        k: "♚",
        Q: "♕",
        q: "♛",
        R: "♖",
        r: "♜",
        b: "♗",
        B: "♝",
        n: "♘",
        N: "♞",
        p: "♙",
        P: "♟"
    };

    return unicodePieces[piece.type] || "";
};

socket.on("playerRole", function(role){
    playerRole = role;
    renderBoard();
})

socket.on("spcetatorRole", function(){
    playerRole = null;
    renderBoard();
})

socket.on("boardState",function(fen){
    chess.load(fen);
    renderBoard();

})

socket.on("move",function(move){
    chess.move(move);
    renderBoard();
    
})

renderBoard();


*/