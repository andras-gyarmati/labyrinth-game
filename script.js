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

function isFixed(x, y) {
    return x % 2 == 1 && y % 2 == 1;
}

function cellClicked(event) {
    let cell = event.target;
    let colIndex = cell.dataset.colIndex;
    let tmpCell;
    if (cell.dataset.rowIndex == -1) {
        tmpCell = gridData[gridSize - 1][colIndex];
        for (let i = gridSize - 1; i > 0; i--) {
            gridData[i][colIndex] = gridData[i - 1][colIndex];
        }
        gridData[0][colIndex] = extraCell;
        extraCell = tmpCell;
    }
    initCells();
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

function initCells() {
    grid.innerHTML = "";
    for (let rowIndex = -1; rowIndex <= gridSize; rowIndex++) {
        let row = document.createElement("div");
        row.classList.add("row");
        grid.appendChild(row);
        if (0 <= rowIndex && rowIndex < gridSize) {
            gridData[rowIndex] = [];
        }

        for (let colIndex = -1; colIndex <= gridSize; colIndex++) {
            let col = document.createElement("div");
            col.classList.add("col");
            col.dataset.rowIndex = rowIndex;
            col.dataset.colIndex = colIndex;
            if (
                0 <= rowIndex &&
                rowIndex < gridSize &&
                0 <= colIndex &&
                colIndex < gridSize
            ) {
                let cell = new Cell(initialGridData[rowIndex][colIndex]);
                gridData[rowIndex][colIndex] = cell;
                col.style.borderStyle = cell.sides
                    .map((x) => (x === "1" ? "none" : "solid"))
                    .join(" ");
                col.style.borderWidth = "15px";
                col.classList.add("cell");
            } else {
                col.classList.add("border-cell");
                if (
                    Math.abs(rowIndex % 2) === 1 &&
                    Math.abs(colIndex % 2) === 1 &&
                    ((rowIndex !== -1 && rowIndex !== gridSize) ||
                        (colIndex !== -1 && colIndex !== gridSize))
                ) {
                    col.classList.add("arrow-cell");
                    col.addEventListener("mouseenter", () =>
                        onArrowCellMouseEnter(col, null)
                    );
                    col.addEventListener("mouseleave", () =>
                        onArrowCellMouseLeave(col)
                    );
                    col.addEventListener("contextmenu", (e) => {
                        e.preventDefault();
                        rotateCell(extraCell);
                        onArrowCellMouseEnter(col, null);
                    });
                }
            }

            col.addEventListener("click", cellClicked);

            row.appendChild(col);
        }
    }
}

function toggleManual() {
    let el = document.querySelector("#manual");
    console.log(el.style.display);
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

initCells();
