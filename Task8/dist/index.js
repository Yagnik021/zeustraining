"use strict";
const canvas = document.getElementById("canvas");
if (canvas === null)
    throw new Error("Canvas not found");
const ctx = canvas.getContext("2d");
class ExcelSheet {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.rows = [];
        this.columns = [];
        this.cells = [];
        this.generateSheet(300, 300, 30, 80, 1, "black");
        this.attachDoubleClickHandler();
    }
    generateSheet(numberOfRows, numberOfColumns, cellHeight, cellWidth, lineWidth, lineColor) {
        this.rows = Array.from({ length: numberOfRows }, () => new Row(cellHeight));
        this.columns = Array.from({ length: numberOfColumns }, (_, index) => new Column(index, cellWidth));
        const sheetWidth = (numberOfColumns * (cellWidth));
        const sheetHeight = (numberOfRows * (cellHeight));
        this.canvas.width = sheetWidth;
        this.canvas.height = sheetHeight;
        this.canvas.style.width = `${sheetWidth}px`;
        this.canvas.style.height = `${sheetHeight}px`;
        this.ctx.clearRect(0, 0, sheetWidth, sheetHeight);
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = lineColor;
        this.ctx.font = "14px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "black";
        for (let row = 0; row < numberOfRows; row++) {
            const rowCells = [];
            for (let col = 0; col < numberOfColumns; col++) {
                const x = col * cellWidth;
                const y = row * cellHeight;
                this.ctx.strokeRect(x, y, cellWidth, cellHeight);
                const cell = new Cell(`R${row + 1}C${col + 1}`, row, col);
                rowCells.push(cell);
                this.ctx.fillText(cell.text, x + cellWidth / 2, y + cellHeight / 2);
            }
            this.cells.push(rowCells);
        }
    }
    getColIndexFromX(x) {
        let pos = 0;
        for (let i = 0; i < this.columns.length; i++) {
            pos += this.columns[i].width;
            if (x < pos)
                return i;
        }
        return -1;
    }
    getRowIndexFromY(y) {
        let pos = 0;
        for (let i = 0; i < this.rows.length; i++) {
            pos += this.rows[i].height;
            if (y < pos)
                return i;
        }
        return -1;
    }
    attachDoubleClickHandler() {
        this.canvas.addEventListener("dblclick", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const colIndex = this.getColIndexFromX(x);
            const rowIndex = this.getRowIndexFromY(y);
            const cell = this.getCell(rowIndex, colIndex);
            if (cell) {
                this.showInputOverCell(cell, rowIndex, colIndex);
            }
        });
    }
    getCell(row, col) {
        if (this.cells[row] && this.cells[row][col]) {
            return this.cells[row][col];
        }
        return null;
    }
    redrawCanvas() {
        const sheetWidth = this.canvas.width;
        const sheetHeight = this.canvas.height;
        this.ctx.clearRect(0, 0, sheetWidth, sheetHeight);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "black";
        this.ctx.font = "14px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "black";
        for (let row = 0; row < this.cells.length; row++) {
            for (let col = 0; col < this.cells[row].length; col++) {
                const cell = this.cells[row][col];
                const x = col * this.columns[col].width;
                const y = row * this.rows[row].height;
                this.ctx.strokeRect(x, y, this.columns[col].width, this.rows[row].height);
                this.ctx.fillText(cell.text, x + this.columns[col].width / 2, y + this.rows[row].height / 2);
            }
        }
    }
    showInputOverCell(cell, row, col) {
        const x = this.columns.slice(0, col).reduce((sum, c) => sum + c.width, 0);
        const y = this.rows.slice(0, row).reduce((sum, r) => sum + r.height, 0);
        const input = document.createElement("input");
        input.type = "text";
        input.value = cell.text.toString();
        input.style.position = "absolute";
        input.style.left = `${x + canvas.offsetLeft}px`;
        input.style.top = `${y + canvas.offsetTop}px`;
        input.style.width = `${this.columns[col].width}px`;
        input.style.height = `${this.rows[row].height}px`;
        input.style.fontSize = "14px";
        input.style.zIndex = "1000";
        document.body.appendChild(input);
        input.focus();
        input.addEventListener("blur", () => {
            cell.updateText(input.value);
            document.body.removeChild(input);
            this.redrawCanvas(); // Your method to re-render the updated grid
        });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                input.blur();
            }
        });
    }
}
/**
 * Represents a row in the Excel sheet.
 * @param {number} height - The height of the row in pixels.
 */
class Row {
    constructor(height = 100) {
        this.height = height;
    }
}
/**
 * Represents a column in the Excel sheet.
 * @param {number} width - The width of the column in pixels.
 */
class Column {
    constructor(index, width = 100) {
        this.width = width;
        this.label = Column.generateLabel(index);
    }
    static generateLabel(index) {
        let label = "";
        let i = index;
        while (i >= 0) {
            label = String.fromCharCode((i % 26) + 65) + label;
            i = Math.floor(i / 26) - 1;
        }
        return label;
    }
}
/**
 * Represents a cell in the Excel sheet.
 * @param {string} text - The text content of the cell.
 * @param {number} rowIndex - The row index of the cell.
 * @param {number} colIndex - The column index of the cell.
 */
class Cell {
    /**
     * Constructs a new instance of the Cell class.
     * @param {string} text - The text content of the cell.
     * @param {number} rowIndex - The row index of the cell.
     * @param {number} colIndex - The column index of the cell.
     */
    constructor(text = "", rowIndex, colIndex) {
        this.text = text;
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
    }
    updateText(newText) {
        if (newText) {
            this.text = newText;
        }
        else {
            this.text = "";
        }
    }
}
const sheet = new ExcelSheet(ctx, canvas);
