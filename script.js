const GameStates = Object.freeze({
    INSERT: "INSERT",
    MOVE: "MOVE",
});

class Cell {
    constructor(code) {
        this.sides = code.split("");
    }
}

class Player {
    constructor(treasures) {
        this.treasures = treasures;
    }
}

class Treasure {
    constructor(number) {
        this.number = number;
    }
}

const cellSize = 85;
const treasures = [...Array(24).keys()].map((x) => new Treasure(x));
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
let playerCount = 1; // todo: from user input
let treasureCount = 1; // todo: from user input

let initExtraCellCode = "0110";
let extraCell = new Cell(initExtraCellCode);

let gridData = [];

let players = [];

function genCells() {
    for (let i = 0; i < initialGridData.length; i++) {
        let row = initialGridData[i];
        gridData[i] = [];
        for (let j = 0; j < row.length; j++) {
            let cellCode = row[j];
            gridData[i][j] = new Cell(cellCode);
        }
    }
}

genCells();

function isFixed(x, y) {
    return x % 2 == 1 && y % 2 == 1;
}

function cellClicked(event) {
    let cell = event.target;
    let colIndex = cell.dataset.colIndex;
    let rowIndex = cell.dataset.rowIndex;
    let tmpCell;
    if (rowIndex == -1) {
        tmpCell = gridData[gridSize - 1][colIndex];
        for (let i = gridSize - 1; i > 0; i--) {
            gridData[i][colIndex] = gridData[i - 1][colIndex];
        }
        gridData[0][colIndex] = extraCell;
        extraCell = tmpCell;
    } else if (rowIndex == gridSize) {
        tmpCell = gridData[0][colIndex];
        for (let i = 0; i < gridSize - 1; i++) {
            gridData[i][colIndex] = gridData[i + 1][colIndex];
        }
        gridData[gridSize - 1][colIndex] = extraCell;
        extraCell = tmpCell;
    } else if (colIndex == -1) {
        tmpCell = gridData[rowIndex][gridSize - 1];
        for (let i = gridSize - 1; i > 0; i--) {
            gridData[rowIndex][i] = gridData[rowIndex][i - 1];
        }
        gridData[rowIndex][0] = extraCell;
        extraCell = tmpCell;
    } else if (colIndex == gridSize) {
        tmpCell = gridData[rowIndex][0];
        for (let i = 0; i < gridSize - 1; i++) {
            gridData[rowIndex][i] = gridData[rowIndex][i + 1];
        }
        gridData[rowIndex][gridSize - 1] = extraCell;
        extraCell = tmpCell;
    }
    drawGrid();
}

function onArrowCellMouseEnter(el, cell) {
    if (cell === null) cell = extraCell;
    el.style.borderStyle = cell.sides
        .map((x) => (x === "1" ? "none" : "solid"))
        .join(" ");
    el.style.borderWidth = "15px";
    el.style.borderWidth = "15px";
    el.classList.remove("arrow-cell");
    el.classList.remove("border-cell");
    el.classList.add("cell");
}

function onArrowCellMouseLeave(el) {
    el.style.borderStyle = "";
    el.classList.add("arrow-cell");
    el.classList.add("border-cell");
    el.classList.remove("cell");
}

// todo: add element to the cell object and move them around when cells are moved in the underlaying griddata structure

function drawGrid() {
    grid.innerHTML = "";
    for (let rowIndex = -1; rowIndex <= gridSize; rowIndex++) {
        for (let colIndex = -1; colIndex <= gridSize; colIndex++) {
            let cellEm = document.createElement("div");
            cellEm.classList.add("cell");
            cellEm.dataset.rowIndex = rowIndex;
            cellEm.dataset.colIndex = colIndex;
            cellEm.style.position = "absolute"
            cellEm.style.top = `${(rowIndex + 1) * cellSize}px`
            cellEm.style.left = `${(colIndex + 1) * cellSize}px`
            if (
                0 <= rowIndex &&
                rowIndex < gridSize &&
                0 <= colIndex &&
                colIndex < gridSize
            ) {
                let cell = gridData[rowIndex][colIndex];
                cellEm.style.borderStyle = cell.sides
                    .map((x) => (x === "1" ? "none" : "solid"))
                    .join(" ");
                cellEm.style.borderWidth = "15px";
            } else {
                cellEm.classList.add("border-cell");
                if (
                    Math.abs(rowIndex % 2) === 1 &&
                    Math.abs(colIndex % 2) === 1 &&
                    ((rowIndex !== -1 && rowIndex !== gridSize) ||
                        (colIndex !== -1 && colIndex !== gridSize))
                ) {
                    cellEm.classList.add("arrow-cell");
                    cellEm.addEventListener("mouseenter", () =>
                        onArrowCellMouseEnter(cellEm, null)
                    );
                    cellEm.addEventListener("mouseleave", () =>
                        onArrowCellMouseLeave(cellEm)
                    );
                    cellEm.addEventListener("contextmenu", (e) => {
                        e.preventDefault();
                        rotateCell(extraCell);
                        onArrowCellMouseEnter(cellEm, null);
                    });
                }
            }

            cellEm.addEventListener("click", cellClicked);

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

function initPlayers() {
    for (let i = 0; i < playerCount; i++) {
        players.push(new Player());
    }
}

function rotateCell(cell) {
    let shifted = cell.sides.shift();
    cell.sides.push(shifted);
}

drawGrid();
