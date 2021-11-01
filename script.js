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
    constructor(){

    }
}

const treasures = [...Array(24).keys()];
const grid = document.querySelector("#grid");
const gridSize = 7;
const initialGridData = [
    ["0110", "1101", "0111", "1010", "0111", "0011", "0011"],
    ["1101", "1010", "0011", "0011", "1010", "1110", "0110"],
    ["1110", "0110", "1110", "1001", "0111", "1100", "1010"],
    ["1001", "0011", "0101", "1001", "0110", "0101", "0011"],
    ["1110", "1100", "1101", "1101", "1011", "0101", "1010"],
    ["0101", "0111", "0101", "1010", "0101", "0101", "1110"],
    ["1100", "1010", "1101", "0101", "1101", "1001", "1001"],
];

let initExtraCellCode = "0110";
let extraCell = new Cell(initExtraCellCode);

let gridData = [];

function isFixed(x, y) {
    return x % 2 == 1 && y % 2 == 1;
}

function initCells() {
    for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
        let row = document.createElement("div");
        row.classList.add("row");
        grid.appendChild(row);
        gridData[rowIndex] = [];
        for (let colIndex = 0; colIndex < gridSize; colIndex++) {
            let col = document.createElement("div");
            col.classList.add("col");

            let cell = new Cell(initialGridData[rowIndex][colIndex]);
            gridData[rowIndex][colIndex] = cell;

            col.style.borderWidth = "15px";
            col.style.borderStyle = cell.sides
                .map((x) => (x === "1" ? "none" : "solid"))
                .join(" ");

            row.appendChild(col);
        }
    }
}

initCells();
