// Getting started with the game structure

// Game variables
const cols = 10;
const rows = 20;
const squareSize = 30;
const canvas = document.getElementById('tetris');
canvas.width = cols * squareSize;
canvas.height = rows * squareSize;
const context = canvas.getContext('2d');

// Create the board
const board = [];
function initBoard() {
    for (let y = 0; y < rows; y++) {
        board[y] = [];
        for (let x = 0; x < cols; x++) {
            board[y][x] = '#E0E0E0';
        }
    }
}

// Tetris blocks, called tetrominoes, have 7 different shapes: I, O, T, S, Z, J and L.
// Each shape is formed by 4 squares joined together.

class Tetromino {
    constructor(name, shape) {
        this.name = name;
        this.shape = shape;
        this.posX = Math.floor(cols / 2) - Math.ceil(this.shape[0].length / 2);
        this.posY = 0;
        this.moving = true;
    }

    currentShape() {
        return this.shape;
    }

    collision(xMove, yMove) {
        for (let y = 0; y < this.shape.length; y++) {
            for (let x = 0; x < this.shape[y].length; x++) {
                if (this.shape[y][x]) {
                    const nextX = this.posX + x + xMove;
                    const nextY = this.posY + y + yMove;
                    if (nextX < 0 || nextX >= cols || nextY >= rows) {
                        return true;
                    }
                    if (nextY >= 0 && board[nextY][nextX] !== '#E0E0E0') {
                        return true;
                    }
                }
            }
        }
        return false;
    }    

    mergeToBoard() {
        for (let y = 0; y < this.shape.length; y++) {
            for (let x = 0; x < this.shape[y].length; x++) {
                if (this.shape[y][x]) {
                    board[this.posY + y][this.posX + x] = tetrominoShapes[this.name].color;
                }
            }
        }
    }

    move(direction) {
        let xMove = 0;
        let yMove = 0;
        
        switch (direction) {
            case 'left':
                xMove = -1;
                break;
            case 'right':
                xMove = 1;
                break;
            case 'down':
                yMove = 1;
                break;
        }
    
        if (!this.collision(xMove, yMove)) {
            this.posX += xMove;
            this.posY += yMove;
        } else if (direction === 'down') {
            this.mergeToBoard();
            currentTetromino = newTetromino();
        }
    }

    rotate() {
        const rotatedShape = [];
        for (let y = 0; y < this.shape[0].length; y++) {
            rotatedShape[y] = [];
            for (let x = 0; x < this.shape.length; x++) {
                rotatedShape[y][x] = this.shape[this.shape.length - 1 - x][y];
            }
        }
        this.shape = rotatedShape;
    }

}

const tetrominoShapes = {
    I: { shape: [[1, 1, 1, 1]], color: 'cyan' },
    O: { shape: [[1, 1], [1, 1]], color: 'yellow' },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'blue' },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'orange' }
};

// Instantiate a new random tetromino
function newTetromino() {
    // Select a random tetromino shape
    const shape = Object.keys(tetrominoShapes)[Math.floor(Math.random() * Object.keys(tetrominoShapes).length)];
    return new Tetromino(shape, tetrominoShapes[shape].shape);
}

// Utils functions

function drawSquare(x, y, color) {
    if (color) {
        context.fillStyle = color;
        context.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        context.strokeStyle = '#BDBDBD';
        context.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
    }
}

function drawTetromino(tetromino, color) {
    for (let y = 0; y < tetromino.shape.length; y++) {
        for (let x = 0; x < tetromino.shape[y].length; x++) {
            if (tetromino.shape[y][x]) {  
                drawSquare(tetromino.posX + x, tetromino.posY + y, color);
            }
        }
    }
}

function drawBoard() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Draw the board
            drawSquare(x, y, board[y][x]);
        }
    }
}

// Game utils
let currentTetromino = newTetromino();
let gameInterval = 1000;
let level = 1;
let score = 0;

function clearRow(row) {
    if (board[row].every(cell => cell !== '#E0E0E0')) {
        board.splice(row, 1);
        board.unshift(Array(cols).fill('#E0E0E0'));
        score += 10;
    }
}

function update() {
    drawBoard();
    drawTetromino(currentTetromino, tetrominoShapes[currentTetromino.name].color);
    
    // Check if the tetromino has reached the bottom and if so check if the row is full
    if (currentTetromino.collision(0, 1)) {
        currentTetromino.mergeToBoard();
        currentTetromino = newTetromino();
    }

    // Check if there is a full row
    for (let y = 0; y < rows; y++) {
        clearRow(y);
    }
}


function startGame(interval) {
    gameInterval = setInterval(() => {
        if (!currentTetromino.collision(0, 1)) {
            currentTetromino.move('down');
            update();
        } else {
            clearInterval(gameInterval);
            currentTetromino.mergeToBoard();
            currentTetromino = newTetromino();
            startGame();
        }
    }, interval);
}

function stopGame() {
    clearInterval(gameInterval);
}

document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
        case 37: // left key
            currentTetromino.move('left');
            break;
        case 39: // right key
            currentTetromino.move('right');
            break;
        case 40: // down key
            currentTetromino.move('down');
            break;
        case 38: // up key
            currentTetromino.rotate();
            break;
    }
    update();
});

initBoard();
update();
startGame(gameInterval);