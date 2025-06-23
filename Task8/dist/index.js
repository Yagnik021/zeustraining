import { headers, jsonData } from "./jsonData.js";
const canvas = document.getElementById("canvas");
const container = document.querySelector(".container");
if (canvas === null)
    throw new Error("Canvas not found");
const ctx = canvas.getContext("2d");
const rowHeaderWidth = 50;
const colHeaderHeight = 30;
/**
 * @class ExcelSheet : A class representing an Excel sheet with rows, columns, and cells.
 * @elements rows : An array of Row objects representing the rows of the Excel sheet.
 * @elements columns : An array of Column objects representing the columns of the Excel sheet.
 * @elements cells : A 2D array of Cell objects representing the cells of the Excel sheet.
 * @elements sheetWidth : The width of the Excel sheet in pixels.
 * @elements sheetHeight : The height of the Excel sheet in pixels.
 * @elements isResizing : A boolean indicating whether the sheet is currently being resized.
 * @elements resizeTarget : An object representing the target of the resize operation.
 * @elements resizeStartPos : An object representing the starting position of the resize operation.
 * @elements selectedCell : An object representing the currently selected cell.
 */
class ExcelSheet {
    /**
     * Constructor for ExcelSheet.
     * @param ctx The canvas context for rendering
     * @param canvas The canvas element for rendering
     * @param container The container element to attach listeners to.
     * The constructor will generate an initial sheet with 100,000 rows and 8 columns, set initial cell size to 30x80,
     * set the line width to 1px, and set the line color to black.
     * It will also attach a event listener to the container to open a text input when a cell is double clicked.
     * Finally, it will set the selected cell to the top left corner of the sheet, and draw an initial frame.
     */
    constructor(ctx, canvas, container) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.container = container;
        this.rows = [];
        this.columns = [];
        this.cells = [];
        this.sheetWidth = 0;
        this.sheetHeight = 0;
        this.isResizing = false;
        this.resizeTarget = null;
        this.resizeStartPos = { x: 0, y: 0 };
        this.selectedCell = null;
        this.generateSheet(jsonData.length + 1, 500, 30, 80, 1, "black");
        this.attachEventListners();
        this.selectedCell = { row: 0, col: 0 };
        this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        this.container.addEventListener("scroll", () => {
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        });
    }
    generateSheet(numberOfRows = 1000, numberOfColumns, cellHeight, cellWidth, lineWidth, lineColor) {
        this.rows = Array.from({ length: numberOfRows }, () => new Row(cellHeight));
        this.columns = Array.from({ length: numberOfColumns }, (_, index) => new Column(index, cellWidth));
        const virtualArea = document.querySelector(".virtual-canvas-area");
        this.sheetWidth = rowHeaderWidth + (numberOfColumns * cellWidth);
        this.sheetHeight = colHeaderHeight + (numberOfRows * cellHeight);
        virtualArea.style.width = `${this.sheetWidth + 40}px`;
        virtualArea.style.height = `${this.sheetHeight + 40}px`;
        // Canvas stays fixed at container size
        this.canvas.width = this.container.clientWidth - 40;
        this.canvas.height = this.container.clientHeight - 40;
        this.canvas.style.width = this.canvas.width + "px";
        this.canvas.style.height = this.canvas.height + "px";
        this.ctx.clearRect(0, 0, this.sheetWidth, this.sheetHeight);
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = lineColor;
        this.ctx.font = "14px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "black";
        for (let row = 0; row < numberOfRows; row++) {
            const rowCells = [];
            for (let col = 0; col < numberOfColumns; col++) {
                let cell;
                let attribute = "";
                if (row === 0) {
                    if (col <= headers.length - 1) {
                        cell = new Cell(headers[col], row, col);
                    }
                    else {
                        cell = new Cell("", row, col);
                    }
                }
                else if (row <= jsonData.length) {
                    if (col <= headers.length - 1) {
                        const attribute = headers[col];
                        const value = jsonData[row - 1][attribute];
                        cell = new Cell(String(value), row, col);
                    }
                    else {
                        cell = new Cell("", row, col);
                    }
                }
                else {
                    cell = new Cell("", row, col);
                }
                rowCells.push(cell);
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
        return (this.columns.length - 1);
    }
    getRowIndexFromY(y) {
        let pos = 0;
        for (let i = 0; i < this.rows.length; i++) {
            pos += this.rows[i].height;
            if (y < pos)
                return i;
        }
        return (this.rows.length - 1);
    }
    attachEventListners() {
        this.container.addEventListener("dblclick", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            console.log("rect : ", rect);
            // Relative to canvas viewport
            const x = e.clientX - rect.left + this.container.scrollLeft - rowHeaderWidth;
            const y = e.clientY - rect.top + this.container.scrollTop - colHeaderHeight;
            const colIndex = this.getColIndexFromX(x);
            const rowIndex = this.getRowIndexFromY(y);
            const cell = this.getCell(rowIndex, colIndex);
            if (cell) {
                this.showInputOverCell(cell, rowIndex, colIndex);
            }
        });
        this.container.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left + this.container.scrollLeft - rowHeaderWidth;
            const y = e.clientY - rect.top + this.container.scrollTop - colHeaderHeight;
            const hoverCol = this.getColIndexFromX(x);
            const hoverRow = this.getRowIndexFromY(y);
            const colRightEdge = this.columns.slice(0, hoverCol + 1).reduce((sum, col) => sum + col.width, 0);
            const rowBottomEdge = this.rows.slice(0, hoverRow + 1).reduce((sum, row) => sum + row.height, 0);
            const withinColResizeZone = Math.abs(x - colRightEdge) < 5;
            const withinRowResizeZone = Math.abs(y - rowBottomEdge) < 5;
            if (!this.isResizing) {
                if (withinColResizeZone) {
                    this.container.style.cursor = "ew-resize";
                    this.resizeTarget = { type: "column", index: hoverCol };
                }
                else if (withinRowResizeZone) {
                    this.container.style.cursor = "ns-resize";
                    this.resizeTarget = { type: "row", index: hoverRow };
                }
                else {
                    this.container.style.cursor = "cell";
                    this.resizeTarget = null;
                }
            }
        });
        this.container.addEventListener("pointerdown", (e) => {
            if (!this.resizeTarget) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left + this.container.scrollLeft - rowHeaderWidth;
                const y = e.clientY - rect.top + this.container.scrollTop - colHeaderHeight;
                const row = this.getRowIndexFromY(y);
                const col = this.getColIndexFromX(x);
                if (row >= 0 && col >= 0 && row < this.rows.length && col < this.columns.length) {
                    this.selectedCell = { row, col };
                    this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
                }
                return;
            }
            ;
            this.isResizing = true;
            this.resizeStartPos = { x: e.clientX, y: e.clientY };
            this.resizeTarget = Object.assign({}, this.resizeTarget);
        });
        window.addEventListener("mousemove", (e) => {
            if (!this.isResizing || !this.resizeTarget)
                return;
            const deltaX = e.clientX - this.resizeStartPos.x;
            const deltaY = e.clientY - this.resizeStartPos.y;
            if (this.resizeTarget.type === "column") {
                const col = this.columns[this.resizeTarget.index];
                col.width = Math.max(50, col.width + deltaX);
            }
            else if (this.resizeTarget.type === "row") {
                const row = this.rows[this.resizeTarget.index];
                row.height = Math.max(30, row.height + deltaY);
            }
            this.resizeStartPos = { x: e.clientX, y: e.clientY };
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        });
        window.addEventListener("mouseup", () => {
            this.isResizing = false;
            this.resizeTarget = null;
        });
        document.addEventListener("keydown", (e) => {
            if (!this.selectedCell) {
                this.selectedCell = { row: 0, col: 0 };
            }
            ;
            const { row, col } = this.selectedCell;
            let newRow = row;
            let newCol = col;
            switch (e.key) {
                case "ArrowRight":
                    newCol = Math.min(col + 1, this.columns.length - 1);
                    break;
                case "ArrowLeft":
                    newCol = Math.max(col - 1, 0);
                    break;
                case "ArrowDown":
                    newRow = Math.min(row + 1, this.rows.length - 1);
                    break;
                case "ArrowUp":
                    newRow = Math.max(row - 1, 0);
                    break;
                case "Tab":
                    e.preventDefault();
                    newCol = col + 1;
                    if (newCol >= this.columns.length) {
                        newCol = 0;
                        newRow++;
                    }
                    if (newRow >= this.rows.length)
                        newRow = this.rows.length - 1;
                    break;
                case "Enter":
                    e.preventDefault();
                    this.showInputOverCell(this.getCell(row, col), row, col);
                    return;
            }
            this.selectedCell = { row: newRow, col: newCol };
            // this.scrollIntoView(newRow, newCol);  // optional
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        });
    }
    getCell(row, col) {
        if (this.cells[row] && this.cells[row][col]) {
            return this.cells[row][col];
        }
        return null;
    }
    showInputOverCell(cell, row, col) {
        const x = this.columns.slice(0, col).reduce((sum, c) => sum + c.width, 0);
        const y = this.rows.slice(0, row).reduce((sum, r) => sum + r.height, 0);
        this.selectedCell = { row, col };
        const input = document.createElement("input");
        input.type = "text";
        input.value = cell.text.toString();
        input.style.position = "absolute";
        input.style.left = `${x - this.container.scrollLeft + rowHeaderWidth + this.canvas.offsetLeft}px`;
        input.style.top = `${y - this.container.scrollTop + colHeaderHeight + this.canvas.offsetTop}px`;
        input.style.width = `${this.columns[col].width}px`;
        input.style.height = `${this.rows[row].height}px`;
        input.style.fontSize = "14px";
        input.style.zIndex = "1000";
        document.body.appendChild(input);
        input.focus();
        input.addEventListener("blur", () => {
            cell.updateText(input.value);
            document.body.removeChild(input);
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                input.blur();
            }
        });
    }
    redrawVisible(scrollTop, scrollLeft) {
        var _a, _b, _c;
        const viewportWidth = this.canvas.width;
        const viewportHeight = this.canvas.height;
        const startRow = this.getRowIndexFromY(scrollTop);
        const endRow = this.getRowIndexFromY(scrollTop + viewportHeight);
        const startCol = this.getColIndexFromX(scrollLeft);
        const endCol = this.getColIndexFromX(scrollLeft + viewportWidth);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "black";
        this.ctx.font = "14px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "black";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(rowHeaderWidth, colHeaderHeight, this.canvas.width - rowHeaderWidth, this.canvas.height - colHeaderHeight);
        this.ctx.clip();
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cell = (_a = this.cells[row]) === null || _a === void 0 ? void 0 : _a[col];
                if (!cell)
                    continue;
                const x = this.columns.slice(0, col).reduce((sum, c) => sum + c.width, 0) - scrollLeft;
                const y = this.rows.slice(0, row).reduce((sum, r) => sum + r.height, 0) - scrollTop;
                this.ctx.strokeStyle = "#ccc";
                this.ctx.strokeRect(x + rowHeaderWidth, y + colHeaderHeight, this.columns[col].width, this.rows[row].height);
                this.ctx.fillStyle = "black";
                this.ctx.fillText(cell.text, x + rowHeaderWidth + this.columns[col].width / 2, y + colHeaderHeight + this.rows[row].height / 2);
                if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
                    this.ctx.strokeStyle = "#007BFF";
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(x + rowHeaderWidth, y + colHeaderHeight, this.columns[col].width - 2, this.rows[row].height - 2);
                    this.ctx.lineWidth = 1;
                }
            }
        }
        this.ctx.restore();
        this.ctx.fillStyle = "#f0f0f0";
        this.ctx.fillRect(0, rowHeaderWidth, colHeaderHeight, this.canvas.width - rowHeaderWidth);
        this.ctx.fillRect(0, colHeaderHeight, rowHeaderWidth, this.canvas.height - colHeaderHeight);
        this.ctx.fillStyle = "black";
        for (let col = startCol; col <= endCol; col++) {
            const x = rowHeaderWidth + this.columns.slice(0, col).reduce((sum, c) => sum + c.width, 0) - scrollLeft;
            const width = this.columns[col].width;
            if (((_b = this.selectedCell) === null || _b === void 0 ? void 0 : _b.col) === col) {
                this.ctx.fillStyle = "#d0e4ff";
                this.ctx.fillRect(x, 0, width, colHeaderHeight);
            }
            this.ctx.fillStyle = "#f0f0f0";
            this.ctx.strokeStyle = "#ccc";
            this.ctx.strokeRect(x, 0, width, colHeaderHeight);
            this.ctx.fillStyle = "black";
            this.ctx.strokeStyle = "black";
            this.ctx.fillText(this.columns[col].label, x + width / 2, colHeaderHeight / 2);
        }
        this.ctx.fillStyle = "#f0f0f0";
        this.ctx.fillRect(0, colHeaderHeight, rowHeaderWidth, this.canvas.height - colHeaderHeight);
        for (let row = startRow; row <= endRow; row++) {
            const y = colHeaderHeight + this.rows.slice(0, row).reduce((sum, r) => sum + r.height, 0) - scrollTop;
            const height = this.rows[row].height;
            if (((_c = this.selectedCell) === null || _c === void 0 ? void 0 : _c.row) === row) {
                this.ctx.fillStyle = "#d0e4ff";
                this.ctx.fillRect(0, y, rowHeaderWidth, height);
            }
            this.ctx.fillStyle = "#f0f0f0";
            this.ctx.strokeStyle = "#ccc";
            this.ctx.strokeRect(0, y, rowHeaderWidth, height);
            this.ctx.fillStyle = "black";
            this.ctx.strokeStyle = "black";
            this.ctx.fillText((row + 1).toString(), rowHeaderWidth / 2, y + height / 2);
        }
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
 * @element {number} width - The width of the column in pixels.
 */
class Column {
    /**
     * @param index Index of the column in the Excel sheet (0-indexed)
     * @param width width of the column in pixels
     */
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
const sheet = new ExcelSheet(ctx, canvas, container);
