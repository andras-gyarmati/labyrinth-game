const Directions = Object.freeze({
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
});

class Cell {
    constructor(code, rowIndex, colIndex) {
        this.sides = code.split("");
        this.rowIndex = parseInt(rowIndex);
        this.colIndex = parseInt(colIndex);
        this.cellEm = createGridCell(rowIndex, colIndex, this.sides);
        this.players = [];
        this.treasure = null;
    }
}

class Player {
    constructor(treasures, number) {
        this.number = number;
        this.name = `Player ${number}`;
        this.treasures = treasures;
        this.treasures.forEach((x) => (x.isDealed = true));
        this.playerEm = this.createPlayerEm(number);
        this.cell = null;
        this.cornerCell = null;
    }

    currentTreasure() {
        return this.treasures.find((x) => !x.isFound);
    }

    createPlayerEm(number) {
        let playerEm = document.createElement("div");
        playerEm.classList.add("player");
        playerEm.innerHTML = `P${number}`;
        return playerEm;
    }
}

class Treasure {
    constructor(number) {
        this.number = number;
        this.isDealed = false;
        this.isFound = false;
        this.treasureEm = this.createTreasureEm(number);
        this.cell = null;
    }

    createTreasureEm(number) {
        let treasureEm = document.createElement("div");
        treasureEm.classList.add("treasure");
        treasureEm.innerHTML = `T${number}`;
        return treasureEm;
    }
}

document.querySelector("html").addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

const cellSize = 85;
const treasureCount = 24;
let allTreasures = [];
const gridEm = document.querySelector("#grid");
const gridSize = 7;
let initialGridData = [
    ["0110", "0000", "0111", "0000", "0111", "0000", "0011"],
    ["0000", "0000", "0000", "0000", "0000", "0000", "0000"],
    ["1110", "0000", "1110", "0000", "0111", "0000", "1011"],
    ["0000", "0000", "0000", "0000", "0000", "0000", "0000"],
    ["1110", "0000", "1101", "0000", "1011", "0000", "1011"],
    ["0000", "0000", "0000", "0000", "0000", "0000", "0000"],
    ["1100", "0000", "1101", "0000", "1101", "0000", "1001"],
];
let cellsToPlace = [
    "1101",
    "1010",
    "0011",
    "1101",
    "1010",
    "0011",
    "0011",
    "1010",
    "1110",
    "0110",
    "0110",
    "1001",
    "1100",
    "1001",
    "0011",
    "0101",
    "1001",
    "0110",
    "0101",
    "0011",
    "1100",
    "1101",
    "0101",
    "0101",
    "0111",
    "0101",
    "1010",
    "0101",
    "0101",
    "1110",
    "1010",
    "0101",
    "1001",
    "0110",
];

let extraCell = null;

let playerCountRange = document.querySelector("#player-count-range");
let treasureCountRange = document.querySelector("#treasure-count-range");
const playerCountSpan = document.querySelector("#player-count");
const treasureCountSpan = document.querySelector("#treasure-count");

let playerCount = 2;
let treasureCountPerPlayer = 2;

treasureCountRange.max = treasureCount / playerCount;
updateTreasureRange();

playerCountRange.addEventListener("input", (e) => {
    playerCount = parseInt(e.target.value);
    playerCountSpan.innerHTML = playerCount;
    treasureCountRange.max = treasureCount / playerCount;
    updateTreasureRange();
});

treasureCountRange.addEventListener("input", updateTreasureRange);

let gridData = [];
let players = [];
let corners = [];
let pathCells = [];
let cells = [];
const menuEm = document.querySelector("#menu");
const stateBoardTreasure = document.querySelector("#current-treasure");
const stateBoardStat = document.querySelector("#stat");
const stateBoardPlayer = document.querySelector("#current-player");
const winnerEm = document.querySelector("#winner");
const winnerName = document.querySelector("#winner-name");
let currentPlayer = null;

function startGame() {
    allTreasures = shuffle([...Array(24).keys()]).map((x) => new Treasure(x));
    winnerEm.classList.add("hidden");
    genCells();
    initCorners();
    initPlayers();
    drawGrid();
    updateStatDisplay();
    placeTreasures();
}

function updateTreasureRange() {
    treasureCountPerPlayer = treasureCountRange.value;
    treasureCountSpan.innerHTML = treasureCountPerPlayer;
}

function genCells() {
    let shuffled = shuffle(cellsToPlace);
    extraCell = new Cell(shuffled.shift(), -1, -1);
    for (let rowIndex = 0; rowIndex < initialGridData.length; rowIndex++) {
        let row = initialGridData[rowIndex];
        gridData[rowIndex] = [];
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
            let cellCode = row[colIndex];
            if (cellCode === "0000") cellCode = shuffled.shift();
            let cell = new Cell(cellCode, rowIndex, colIndex);
            gridData[rowIndex][colIndex] = cell;
            cells.push(cell);
        }
    }
}

function moveCell(rowIndex, colIndex) {
    let cell = gridData[rowIndex][colIndex];
    cell.rowIndex = parseInt(rowIndex);
    cell.colIndex = parseInt(colIndex);
    setCellEmPos(cell.cellEm, rowIndex, colIndex);
}

function arrowCellClicked(event) {
    let cellEm = event.target;
    if (cellEm.classList.contains("last-arrow-cell")) {
        return;
    }
    if (pathCells.length) activateNextPlayer();
    discardPathCells();

    document.querySelector(".last-arrow-cell")?.classList.remove("last-arrow-cell");

    cellEm.classList.add("last-arrow-cell");
    let colIndex = parseInt(cellEm.dataset.colIndex);
    let rowIndex = parseInt(cellEm.dataset.rowIndex);
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

    moveExtraCellToCorner();
    showPath();
}

function moveExtraCellToCorner() {
    if (extraCell.players) {
        let rowIndex = extraCell.rowIndex;
        let colIndex = extraCell.colIndex;
        if (rowIndex === 0) rowIndex = gridSize - 1;
        else if (rowIndex === gridSize - 1) rowIndex = 0;
        else if (colIndex === 0) colIndex = gridSize - 1;
        else if (colIndex === gridSize - 1) colIndex = 0;
        let cell = gridData[rowIndex][colIndex];
        // has a bug: if multiple players are on the cell only some of them gets moved
        extraCell.players.forEach((player) => placePlayerOnCell(player, cell));
    }

    setCellEmPos(extraCell.cellEm, -1, -1);
    extraCell.rowIndex = -1;
    extraCell.colIndex = -1;
}

function placePlayerOnCell(player, cell) {
    if (cell === player.cell) return;
    if (player.cell) {
        const index = player.cell.players.indexOf(player);
        if (index > -1) player.cell.players.splice(index, 1);
    }

    cell.players.push(player);
    player.cell = cell;
    if (player.playerEm.parentNode) {
        player.playerEm.parentNode.removeChild(player.playerEm);
    }
    cell.cellEm.appendChild(player.playerEm);

    checkPlayerTreasure(player);
    checkIfPlayerWon(player);
}

function checkIfPlayerWon(player) {
    if (player.treasures.every((x) => x.isFound) && player.cell == player.cornerCell) {
        gridEm.classList.add("hidden");
        winnerEm.classList.remove("hidden");
        winnerName.innerHTML = player.name;
    }
}

function checkPlayerTreasure(player) {
    let treasure = player.currentTreasure();
    if (treasure && treasure == player.cell.treasure) {
        treasure.isFound = true;
        treasure.treasureEm.classList.remove("active-treasure");
        treasure.treasureEm.classList.add("found-treasure");
    }
}

function placeTreasureOnCell(treasure, cell) {
    cell.treasure = treasure;
    treasure.cell = cell;
    cell.cellEm.appendChild(treasure.treasureEm);
}

function setCellEmPos(cellEm, rowIndex, colIndex) {
    cellEm.dataset.rowIndex = parseInt(rowIndex);
    cellEm.dataset.colIndex = parseInt(colIndex);
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

function showPath() {
    let cell = currentPlayer.cell;
    let rowIndex = parseInt(cell.rowIndex);
    let colIndex = parseInt(cell.colIndex);
    pathCells = bfs(rowIndex, colIndex);
    pathCells.forEach((x) => {
        x.cellEm.classList.add("path-cell");
        x.cellEm.addEventListener("click", pathCellClicked);
    });
}

function pathCellClicked(event) {
    let cellEm = event.target.closest(".cell");
    let rowIndex = parseInt(cellEm.dataset.rowIndex);
    let colIndex = parseInt(cellEm.dataset.colIndex);
    placePlayerOnCell(currentPlayer, gridData[rowIndex][colIndex]);
    discardPathCells();
    activateNextPlayer();
}

function activateNextPlayer() {
    players.push(players.shift());
    setActivePlayer(0);
    updateStatDisplay();
}

function discardPathCells() {
    if (!pathCells) return;
    pathCells.forEach((x) => {
        x.cellEm.classList.remove("path-cell");
        x.cellEm.removeEventListener("click", pathCellClicked);
    });
    pathCells = [];
}

function bfs(rowIndex, colIndex) {
    let cells = [];
    let queue = [gridData[rowIndex][colIndex]];
    while (queue.length) {
        let current = queue[0];
        let cri = current.rowIndex;
        let cci = current.colIndex;
        // top neighbor
        if (cri - 1 >= 0) {
            let tn = gridData[cri - 1][cci];
            if (current.sides[Directions.UP] == 1 && tn.sides[Directions.DOWN] == 1 && !cells.includes(tn)) {
                queue.push(tn);
            }
        }
        // right neighbor
        if (cci + 1 < gridSize) {
            let rn = gridData[cri][cci + 1];
            if (current.sides[Directions.RIGHT] == 1 && rn.sides[Directions.LEFT] == 1 && !cells.includes(rn)) {
                queue.push(rn);
            }
        }
        // bottom neighbor
        if (cri + 1 < gridSize) {
            let bn = gridData[cri + 1][cci];
            if (current.sides[Directions.DOWN] == 1 && bn.sides[Directions.UP] == 1 && !cells.includes(bn)) {
                queue.push(bn);
            }
        }
        // left neighbor
        if (cci - 1 >= 0) {
            let ln = gridData[cri][cci - 1];
            if (current.sides[Directions.LEFT] == 1 && ln.sides[Directions.RIGHT] == 1 && !cells.includes(ln)) {
                queue.push(ln);
            }
        }

        cells.push(queue.shift());
    }
    return cells;
}

function createArrowCell(rowIndex, colIndex) {
    let cellEm = createCellEm(rowIndex, colIndex);
    cellEm.addEventListener("click", (e) => {
        arrowCellClicked(e);
    });
    cellEm.classList.add("arrow-cell");
    cellEm.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        rotateCell(extraCell);
    });
    return cellEm;
}

function drawGrid() {
    gridEm.innerHTML = "";
    gridEm.appendChild(extraCell.cellEm);
    for (let rowIndex = -1; rowIndex <= gridSize; rowIndex++) {
        for (let colIndex = -1; colIndex <= gridSize; colIndex++) {
            if (!isArrowCell(rowIndex, colIndex) && !isGridCell(rowIndex, colIndex)) continue;
            let cellEm = null;
            if (isGridCell(rowIndex, colIndex)) {
                cellEm = gridData[rowIndex][colIndex].cellEm;
            } else {
                cellEm = createArrowCell(rowIndex, colIndex);
            }
            gridEm.appendChild(cellEm);
        }
    }
}

function toggleManual() {
    let el = document.querySelector("#manual");
    if (!el.classList.contains("hidden")) {
        el.classList.add("hidden");
    } else {
        el.classList.remove("hidden");
    }
}

function showGrid() {
    document.querySelector("#grid").classList.remove("hidden");
    document.querySelector("#score-board").classList.remove("hidden");
    menuEm.classList.add("hidden");
    startGame();
}

function restart() {
    document.querySelector("#grid").classList.add("hidden");
    document.querySelector("#score-board").classList.add("hidden");
    document.querySelector("#menu").classList.remove("hidden");
}

function initCorner(num, rowIndex, colIndex) {
    let mark = document.createElement("div");
    mark.innerHTML = num;
    mark.classList.add("corner-marker");
    let cell = gridData[rowIndex][colIndex];
    cell.cellEm.classList.add("corner-cell");
    cell.cellEm.appendChild(mark);
    return cell;
}

function initPlayers() {
    for (let i = 0; i < playerCount; i++) {
        let player = new Player(
            allTreasures.slice(i * treasureCountPerPlayer, (i + 1) * treasureCountPerPlayer),
            i + 1
        );
        placePlayerOnCell(player, corners[i]);
        player.cornerCell = corners[i];
        players.push(player);
    }
    setActivePlayer(0);
}

function setActivePlayer(index) {
    players.forEach((x) => x.playerEm.classList.remove("active-player"));
    currentPlayer = players[index];
    currentPlayer.playerEm.classList.add("active-player");
    setActiveTreasure(currentPlayer);
}

function setActiveTreasure(player) {
    allTreasures.forEach((x) => x.treasureEm.classList.remove("active-treasure"));
    let treasure = player.currentTreasure();
    if (treasure) treasure.treasureEm.classList.add("active-treasure");
}

function initCorners() {
    corners = [
        initCorner(1, 0, 0),
        initCorner(2, 0, gridSize - 1),
        initCorner(3, gridSize - 1, 0),
        initCorner(4, gridSize - 1, gridSize - 1),
    ];
}

function rotateCell(cell) {
    cell.sides.push(cell.sides.shift());
    setCellEmBorders(cell.cellEm, cell.sides);
}

function updateStatDisplay() {
    stateBoardPlayer.innerHTML = currentPlayer.name;
    stateBoardTreasure.innerHTML =
        (currentPlayer.currentTreasure() && currentPlayer.currentTreasure().number) || "go home!";
    stateBoardStat.innerHTML = `${currentPlayer.treasures.filter((x) => x.isFound).length} / ${
        currentPlayer.treasures.length
    }`;
}

function executeEnd() {}

function shuffle(arr) {
    let shuffled = [...arr];
    shuffled.sort(() => Math.random() - 0.5);
    return shuffled;
}

function placeTreasures() {
    let shuffledCells = shuffle(cells);
    let dealedTreasures = allTreasures.filter((x) => x.isDealed);
    dealedTreasures.forEach((treasure) => {
        let treasurelessCell = shuffledCells.find((cell) => !cell.treasure && !corners.includes(cell));
        if (treasurelessCell) placeTreasureOnCell(treasure, treasurelessCell);
        else console.log(treasurelessCell);
    });
}
