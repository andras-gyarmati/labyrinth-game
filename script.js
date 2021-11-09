const GameStates = Object.freeze({
    INSERT: "INSERT",
    MOVE: "MOVE",
    END: "END",
});

// todo move functions inside classes
class Cell {
    constructor(code, rowIndex, colIndex) {
        this.sides = code.split("");
        this.cellEm = createGridCell(rowIndex, colIndex, this.sides);
        this.players = [];
    }
}

class Player {
    constructor(treasures, number) {
        this.number = number;
        this.name = `Player ${number}`;
        this.treasures = treasures;
        this.treasures.forEach((x) => (x.isDealed = true));
        this.playerEm = createPlayerEm(number);
    }
}

function createPlayerEm(number) {
    let playerEm = document.createElement("div");
    playerEm.classList.add("player");
    playerEm.innerHTML = `P${number}`;
    return playerEm;
}

class Treasure {
    constructor(number) {
        this.number = number;
        this.isDealed = false;
        this.isFound = false;
    }
}

const cellSize = 85;
const treasures = [...Array(24).keys()].sort(() => Math.random() - 0.5).map((x) => new Treasure(x));
const grid = document.querySelector("#grid");
const gridSize = 7;
const initialGridData = [
    ["0110", "1101", "0111", "1010", "0111", "0011", "0011"],
    ["1101", "1010", "0011", "0011", "1010", "1110", "0110"],
    ["1110", "0110", "1110", "1001", "0111", "1100", "1011"],
    ["1001", "0011", "0101", "1001", "0110", "0101", "0011"],
    ["1110", "1100", "1101", "1101", "1011", "0101", "1011"],
    ["0101", "0111", "0101", "1010", "0101", "0101", "1110"],
    ["1100", "1010", "1101", "0101", "1101", "1001", "1001"],
];
let playerCount = 4; // todo: from user input
let treasureCount = 4; // todo: from user input
let extraCell = new Cell("0110", -1, -1);
let gridData = [];
let players = [];
let corners = [];
const stateBoardPlayerNum = document.querySelector("#current-player-num");
const stateBoardTreasure = document.querySelector("#current-treasure");
const stateBoardStat = document.querySelector("#stat");
const stateBoardPlayer = document.querySelector("#current-player");
let currentPlayer = null;
let gameState = GameStates.INSERT;

function genCells() {
    for (let rowIndex = 0; rowIndex < initialGridData.length; rowIndex++) {
        let row = initialGridData[rowIndex];
        gridData[rowIndex] = [];
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
            let cellCode = row[colIndex];
            gridData[rowIndex][colIndex] = new Cell(cellCode, rowIndex, colIndex);
        }
    }
}

genCells();

function isFixed(x, y) {
    return x % 2 == 0 && y % 2 == 0;
}

function moveCell(rowIndex, colIndex) {
    setCellEmPos(gridData[rowIndex][colIndex].cellEm, rowIndex, colIndex);
}

function arrowCellClicked(event) {
    let cell = event.target;
    let colIndex = cell.dataset.colIndex;
    let rowIndex = cell.dataset.rowIndex;
    let tmpCell;
    if (rowIndex == -1) {
        tmpCell = gridData[gridSize - 1][colIndex];
        for (let i = gridSize - 1; i > 0; i--) {
            gridData[i][colIndex] = gridData[i - 1][colIndex];
            moveCell(i, colIndex);
        }
        gridData[0][colIndex] = extraCell;
        moveCell(0, colIndex);
        extraCell = tmpCell;
    } else if (rowIndex == gridSize) {
        tmpCell = gridData[0][colIndex];
        for (let i = 0; i < gridSize - 1; i++) {
            gridData[i][colIndex] = gridData[i + 1][colIndex];
            moveCell(i, colIndex);
        }
        gridData[gridSize - 1][colIndex] = extraCell;
        moveCell(gridSize - 1, colIndex);
        extraCell = tmpCell;
    } else if (colIndex == -1) {
        tmpCell = gridData[rowIndex][gridSize - 1];
        for (let i = gridSize - 1; i > 0; i--) {
            gridData[rowIndex][i] = gridData[rowIndex][i - 1];
            moveCell(rowIndex, i);
        }
        gridData[rowIndex][0] = extraCell;
        moveCell(rowIndex, 0);
        extraCell = tmpCell;
    } else if (colIndex == gridSize) {
        tmpCell = gridData[rowIndex][0];
        for (let i = 0; i < gridSize - 1; i++) {
            gridData[rowIndex][i] = gridData[rowIndex][i + 1];
            moveCell(rowIndex, i);
        }
        gridData[rowIndex][gridSize - 1] = extraCell;
        moveCell(rowIndex, gridSize - 1);
        extraCell = tmpCell;
    }
}

function onArrowCellMouseEnter(el) {
    setCellEmPos(extraCell.cellEm, el.dataset.rowIndex, el.dataset.colIndex);
}

function onArrowCellMouseLeave() {
    setCellEmPos(extraCell.cellEm, -1, -1);
}

function placePlayerOnCell(player, cell) {
    console.log(player);
    cell.players.push(player);
    if (player.playerEm.parentNode) {
        player.playerEm.parentNode.removeChild(player.playerEm);
    }
    cell.cellEm.appendChild(player.playerEm);
}

function setCellEmPos(cellEm, rowIndex, colIndex) {
    cellEm.dataset.rowIndex = rowIndex;
    cellEm.dataset.colIndex = colIndex;
    cellEm.style.top = `${(parseInt(rowIndex) + 1) * cellSize}px`;
    cellEm.style.left = `${(parseInt(colIndex) + 1) * cellSize}px`;
}

function createCellEm(rowIndex, colIndex) {
    let cellEm = document.createElement("div");
    cellEm.classList.add("cell");
    cellEm.style.position = "absolute";
    setCellEmPos(cellEm, rowIndex, colIndex);
    return cellEm;
}

function isGridCell(rowIndex, colIndex) {
    return 0 <= rowIndex && rowIndex < gridSize && 0 <= colIndex && colIndex < gridSize;
}

function setCellEmBorders(cellEm, sides) {
    cellEm.style.borderStyle = sides.map((x) => (x === "1" ? "none" : "solid")).join(" ");
}

function createGridCell(rowIndex, colIndex, sides) {
    let cellEm = createCellEm(rowIndex, colIndex);
    cellEm.classList.add("grid-cell");
    cellEm.classList.add("animated-cell");
    setCellEmBorders(cellEm, sides);
    return cellEm;
}

function isArrowCell(rowIndex, colIndex) {
    return (
        Math.abs(rowIndex % 2) === 1 &&
        Math.abs(colIndex % 2) === 1 &&
        ((rowIndex !== -1 && rowIndex !== gridSize) || (colIndex !== -1 && colIndex !== gridSize))
    );
}

function createArrowCell(rowIndex, colIndex) {
    let cellEm = createCellEm(rowIndex, colIndex);
    cellEm.addEventListener("click", (e) => {
        arrowCellClicked(e);
        onArrowCellMouseLeave();
    });
    cellEm.classList.add("arrow-cell");
    // cellEm.addEventListener("mouseenter", () => onArrowCellMouseEnter(cellEm));
    // cellEm.addEventListener("mouseleave", () => onArrowCellMouseLeave());
    cellEm.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        rotateCell(extraCell);
    });
    return cellEm;
}

function drawGrid() {
    grid.innerHTML = "";
    grid.appendChild(extraCell.cellEm);
    for (let rowIndex = -1; rowIndex <= gridSize; rowIndex++) {
        for (let colIndex = -1; colIndex <= gridSize; colIndex++) {
            if (!isArrowCell(rowIndex, colIndex) && !isGridCell(rowIndex, colIndex)) continue;
            let cellEm = null;
            if (isGridCell(rowIndex, colIndex)) {
                cellEm = gridData[rowIndex][colIndex].cellEm;
            } else {
                cellEm = createArrowCell(rowIndex, colIndex);
            }
            grid.appendChild(cellEm);
        }
    }
}

function toggleManual() {
    let el = document.querySelector("#manual");
    if (el.style.display === "block") {
        el.style.display = "none";
    } else {
        el.style.display = "block";
    }
}

function showGrid() {
    document.querySelector("#grid").style.display = "block";
    document.querySelector("#grid-button").disabled = "disabled";
}

function initCorner(num, rowIndex, colIndex) {
    let mark = document.createElement("div");
    mark.innerHTML = num;
    mark.classList.add("corner-marker");
    gridData[rowIndex][colIndex].cellEm.classList.add("corner-cell");
    gridData[rowIndex][colIndex].cellEm.appendChild(mark);
    return gridData[rowIndex][colIndex];
}

initCorners();

function initPlayers() {
    console.log("initplayers");
    for (let i = 0; i < playerCount; i++) {
        let player = new Player(treasures.slice(i * treasureCount, (i + 1) * treasureCount), i + 1);
        placePlayerOnCell(player, corners[i]);
        players.push(player);
    }

    setCurrentPlayer(0);

    console.log(JSON.stringify(players));
    console.log(JSON.stringify(treasures));
}

initPlayers();

function setCurrentPlayer(index) {
    players.forEach((x) => x.playerEm.classList.remove("active-player"));
    currentPlayer = players[index];
    currentPlayer.playerEm.classList.add("active-player");
}

function initCorners() {
    corners = [
        initCorner(1, 0, 0),
        initCorner(2, 0, gridSize - 1),
        initCorner(3, gridSize - 1, 0),
        initCorner(4, gridSize - 1, gridSize - 1),
    ];
    console.log(corners);
}

function rotateCell(cell) {
    let shifted = cell.sides.shift();
    cell.sides.push(shifted);
    setCellEmBorders(cell.cellEm, cell.sides);
}

drawGrid();

function displayStat() {
    stateBoardPlayerNum.innerHTML = players.indexOf(currentPlayer) + 1;
    stateBoardTreasure.innerHTML = currentPlayer.treasures.find((x) => !x.isFound).number;
    stateBoardStat.innerHTML = `${currentPlayer.treasures.filter((x) => x.isFound).length} / ${
        currentPlayer.treasures.length
    }`;
    stateBoardPlayer.innerHTML = currentPlayer.name;
}

displayStat();

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function executeInsert() {
    console.log("insert");
    sleep(2000);
    gameState = GameStates.MOVE;
}
function executeMove() {
    console.log("move");
    sleep(2000);
    gameState = GameStates.INSERT;
}
function executeEnd() {}

function gameLoop() {
    while (gameState != GameStates.END) {
        switch (gameState) {
            case GameStates.INSERT:
                executeInsert();
                break;
            case GameStates.MOVE:
                executeMove();
                break;
            case GameStates.END:
                executeEnd();
                break;
        }
    }
}

// gameLoop();
