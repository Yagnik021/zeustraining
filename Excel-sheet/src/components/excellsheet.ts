import { Row } from "./Row";
import { Column } from "./Column";
import { Cell } from "./Cell";
import { CommandManager } from "./Commands/CommandManger";
import { jsonData, headers } from "./jsonData";
import { EditCellCommand } from "./Commands/EditCommandCell";
import { MouseHandler } from "./EventHandlers/MouseHandler";
import { KeyDownHandler } from "./EventHandlers/KeydownHandler";
import { evaluateFormula } from "./Utils/evaluator";
import { a1ToIndexes } from "./Utils/a1Utils";


type DataRow = {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    salary: number;
};

const rowMap = new Map<number, DataRow[]>();

jsonData.forEach((r) => {
    if (!rowMap.has(r.row)) {
        rowMap.set(r.row, []);
    }
    rowMap.get(r.row)!.push(r);
});

const colIndexToField: Record<number, keyof DataRow> = {
    0: "id",
    1: "firstName",
    2: "lastName",
    3: "age",
    4: "salary"
};


/**
 * The ExcelSheet class represents the main Excel sheet component.
 * @member rows - An array of Row objects representing the rows in the Excel sheet.
 * @member columns - An array of Column objects representing the columns in the Excel sheet.
 * @member cells - A 2D array of Cell objects representing the cells in the Excel sheet. * 
 * @member sheetWidth - The total width of the Excel sheet in pixels.
 * @member sheetHeight - The total height of the Excel sheet in pixels.
 * @member isResizing - Indicates whether a resize operation is currently in progress.
 * @member resizeStartPos - The screen position where the resize interaction started.
 * @member _selectedCell - Internally tracks the currently selected cell (use selectedCell getter/setter externally).
 * @member dpr - The device pixel ratio used for accurate canvas rendering.
 * @member canvas - The canvas element used to render the Excel sheet.
 * @member ctx - The 2D rendering context for the canvas.
 * @member clipboardBuffer - Stores copied or cut cell data for paste operations.
 * @member commandManager - Manages undo/redo commands for cell edits and operations.
 * @member selectedRow - The currently selected row (e.g., for full row selection).
 * @member selectedCol - The currently selected column (e.g., for full column selection).
 * @member selectedArea - Defines the currently selected cell range.
 * @member container - The outer container element holding the canvas and scrollbars.
 * @member formularBarInput - The input box linked to the formula bar.
 * @member rowHeaderWidth - Width of the row header area (usually fixed).
 * @member colHeaderHeight - Height of the column header area (usually fixed).
 * @member mouseHandler - Manages pointer interactions and delegates strategies (resize, selection, etc).
 * @member cumulativeColWidths - An array of cumulative column widths for efficient rendering.
 * @member cumulativeRowHeights - An array of cumulative row heights for efficient rendering.
 */

class ExcelSheet {

    private _selectedCell: { row: number; col: number } | null = null;
    private _resizeStartPos = { x: 0, y: 0 };
    private _clipboardBuffer: string[][] | null = null;
    private _rows: Row[] = [];
    private _columns: Column[] = [];
    private _cells = new Map<number, Map<number, Cell>>();
    private _sheetWidth = 0;
    private _sheetHeight = 0;
    private _selectedRows: number[] = [];
    private _selectedCols: number[] = [];
    private _selectedArea: { startRow: number | null; startCol: number | null; endRow: number | null; endCol: number | null } = { startRow: null, startCol: null, endRow: null, endCol: null };
    private _rowHeaderWidth = 50;
    private _colHeaderHeight = 30;
    private _mouseHandler!: MouseHandler;
    private _cumulativeColWidths: number[] = [];
    private _cumulativeRowHeights: number[] = [];
    private _selectedRange: { startRow: number | null; startCol: number | null; endRow: number | null; endCol: number | null } = { startRow: null, startCol: null, endRow: null, endCol: null };

    public commandManager: CommandManager;
    public container: HTMLElement;
    public ctx: CanvasRenderingContext2D;
    public formularBarInput: HTMLInputElement;
    public isResizing = false;
    public dpr = window.devicePixelRatio || 1;
    public canvas: HTMLCanvasElement;
    public isInputOn = false;


    /**
     * Constructor for ExcelSheet.
     * @param ctx The canvas context for rendering
     * @param canvas The canvas element for rendering
     * @param container The container element to attach listeners to.
     */
    constructor(canvas: HTMLCanvasElement, container: HTMLElement, formularBarInput: HTMLInputElement) {
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.canvas = canvas;
        this.container = container;
        this.formularBarInput = formularBarInput;
        this.generateSheet(100000, 500, 30, 80, 1, "black");
        this.updateCumulativeSizes();
        this.attachEventListners();
        this.selectedCell = { row: 0, col: 0 };
        this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        this.renderAreaStatus({ count: 0, sum: null, min: null, max: null, avg: null });
        this.mouseHandler = new MouseHandler(this);
        this.commandManager = new CommandManager();
        new KeyDownHandler(this);
    }


    /**
     * Getter and setter for the resizeStartPos property.
     */
    get resizeStartPos() { return this._resizeStartPos; }
    set resizeStartPos(value: { x: number; y: number }) { this._resizeStartPos = value; }

    /**
     * Getter and setter for the clipboardBuffer property.
     */
    get clipboardBuffer() { return this._clipboardBuffer; }
    set clipboardBuffer(value: string[][] | null) { this._clipboardBuffer = value; }

    /**
     * Getter and setter for the rows property.
     */
    get rows() { return this._rows; }
    set rows(value: Row[]) { this._rows = value; }

    /**
     * Getter and setter for the columns property.
     */
    get columns() { return this._columns; }
    set columns(value: Column[]) { this._columns = value; }

    /**
     * Getter and setter for the cells property.
     */
    get cells() { return this._cells; }
    set cells(value: Map<number, Map<number, Cell>>) { this._cells = value; }

    /**
     * Getter and setter for the sheetWidth property.
     */
    get sheetWidth() { return this._sheetWidth; }
    set sheetWidth(value: number) { this._sheetWidth = value; }

    /**
     *  Getter and setter for the sheetHeight property.
     */
    get sheetHeight() { return this._sheetHeight; }
    set sheetHeight(value: number) { this._sheetHeight = value; }

    /**
     * Getter and setter for the selectedRows property.
     */
    get selectedRows() { return this._selectedRows; }
    set selectedRows(value: number[]) { this._selectedRows = value; }

    /**
     * Getter and setter for the selectedCols property.
     */
    get selectedCols() { return this._selectedCols; }
    set selectedCols(value: number[]) { this._selectedCols = value; }

    /**
     * Getter and setter for the selectedArea property.
     */
    get selectedArea() { return this._selectedArea; }
    set selectedArea(value: { startRow: number | null; startCol: number | null; endRow: number | null; endCol: number | null }) {
        this._selectedArea = value;
    }

    /**
     * Getter and setter for the rowHeaderWidth property.
     */
    get rowHeaderWidth() { return this._rowHeaderWidth; }
    set rowHeaderWidth(value: number) { this._rowHeaderWidth = value; }

    /**
     * Getter and setter for the colHeaderHeight property.
     */
    get colHeaderHeight() { return this._colHeaderHeight; }
    set colHeaderHeight(value: number) { this._colHeaderHeight = value; }

    /**
     * Getter and setter for the mouseHandler property.
     */
    get mouseHandler() { return this._mouseHandler; }
    set mouseHandler(value: MouseHandler) { this._mouseHandler = value; }

    /**
     * Getter and setter for the cumulativeColWidths property.
     */
    get cumulativeColWidths() { return this._cumulativeColWidths; }
    set cumulativeColWidths(value: number[]) { this._cumulativeColWidths = value; }

    /**
     * Getter and setter for the cumulativeRowHeights property.
     */
    get cumulativeRowHeights() { return this._cumulativeRowHeights; }
    set cumulativeRowHeights(value: number[]) { this._cumulativeRowHeights = value; }

    /**
     * Getter and setter for the selectedRange property.
     */
    get selectedRange() { return this._selectedRange; }
    set selectedRange(value: { startRow: number | null; startCol: number | null; endRow: number | null; endCol: number | null }) {
        this._selectedRange = value;
    }

    /**
     * Getter for the selected cell.
     */
    get selectedCell() {
        return this._selectedCell;
    }

    /**
     * Setter for the selected cell.
     * @param cell The selected cell
     */
    set selectedCell(cell: { row: number; col: number } | null) {
        this._selectedCell = cell;

        // === Side effect: Update the address bar
        const addressDiv = document.querySelector(".address") as HTMLDivElement;

        if (addressDiv) {

            if (cell) {
                addressDiv.innerHTML = this.columns[cell.col].label + (cell.row + 1);
                this.formularBarInput.value = this.getOrCreateCell(cell.row, cell.col)?.text || "";
            } else {
                addressDiv.innerHTML = "";
                this.formularBarInput.value = "";
            }
        }
    }


    /**
     * Function to generate the initial Excel sheet with the specified number of rows and columns.
     * @param numberOfRows Number of rows in the sheet
     * @param numberOfColumns Number of columns in the sheet
     * @param cellHeight Starting cell height
     * @param cellWidth Starting cell width
     * @param lineWidth Line width in pixels in the sheet
     * @param lineColor Border color of the sheet
     */
    generateSheet(
        numberOfRows: number = 100000,
        numberOfColumns: number,
        cellHeight: number,
        cellWidth: number,
        lineWidth: number,
        lineColor: string
    ) {
        this.rows = Array.from({ length: numberOfRows }, (_, index) => new Row(cellHeight, index));
        this.columns = Array.from(
            { length: numberOfColumns },
            (_, index) => new Column(index, cellWidth)
        );

        const virtualArea = document.querySelector(".virtual-canvas-area") as HTMLElement;
        this.sheetWidth = this.rowHeaderWidth + (numberOfColumns * cellWidth);
        this.sheetHeight = this.colHeaderHeight + (numberOfRows * cellHeight);

        virtualArea.style.width = `${this.sheetWidth + 20}px`;
        virtualArea.style.height = `${this.sheetHeight + 20}px`;

        this.dpr = window.devicePixelRatio;

        this.canvas.width = (this.container.clientWidth) * this.dpr;
        this.canvas.height = (this.container.clientHeight) * this.dpr;

        this.canvas.style.width = (this.container.clientWidth) * this.dpr + "px";
        this.canvas.style.height = (this.container.clientHeight) * this.dpr + "px";

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);


        this.ctx.clearRect(0, 0, this.sheetWidth, this.sheetHeight);
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = lineColor;
        this.ctx.font = "14px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "black";

        this.cells = new Map();

        for (let row = 0; row < numberOfRows; row++) {
            const rowMap = new Map();

            for (let col = 0; col < numberOfColumns; col++) {
                let cell: Cell;

                if (row === 0) {
                    if (col < headers.length) {
                        cell = new Cell(headers[col]);
                    } else {
                        continue; // Skip empty cell
                    }
                } else if (row <= jsonData.length) {
                    if (col < headers.length) {
                        const attribute = headers[col];
                        const value = jsonData[row - 1][attribute];
                        cell = new Cell(String(value));
                    } else {
                        continue; // Skip empty cell
                    }
                } else {
                    continue; // Skip empty cell
                }

                rowMap.set(col, cell);
            }

            if (rowMap.size > 0) {
                this.cells.set(row, rowMap);
            }
        }


    }

    /**
     * Updates the cumulative sizes of columns and rows.
     */
    updateCumulativeSizes() {
        this.cumulativeColWidths = this.columns.reduce<number[]>((acc, col) => {
            const last = acc[acc.length - 1] || 0;
            acc.push(last + col.width);
            return acc;
        }, []);
        this.cumulativeRowHeights = this.rows.reduce<number[]>((acc, row) => {
            const last = acc[acc.length - 1] || 0;
            acc.push(last + row.height);
            return acc;
        }, []);
    }


    /**
     * Get cell if not exists then create a new one
     * @param row Row index of the cell
     * @param col Col index of the cell
     * @returns Cell object+
     * 
     */
    getOrCreateCell(row: number, col: number): Cell {
        let rowMap = this.cells.get(row);
        if (!rowMap) {
            rowMap = new Map();
            this.cells.set(row, rowMap);
        }
        let cell = rowMap.get(col);
        if (!cell) {
            cell = new Cell("");
            rowMap.set(col, cell);
        }
        return cell;
    }


    /**
     * To set the cell
     * @param row Row index
     * @param col Col index
     * @param cell Cell object
     */
    setCell(row: number, col: number, cell: Cell): void {
        if (!this.cells.has(row)) {
            this.cells.set(row, new Map());
        }
        this.cells.get(row)!.set(col, cell);
    }


    /**
     * To get the column index from the x position
     * @param x Cursor X position
     * @returns Column index
     */
    getColIndexFromX(x: number): number {
        let pos = 0;
        for (let i = 0; i < this.columns.length; i++) {
            pos += this.columns[i].width;
            if (x < pos) return i;
        }
        return (this.columns.length - 1);
    }

    /**
     * To get the row index from the y position
     * @param y Cursor Y position
     * @returns Row index
     */
    getRowIndexFromY(y: number): number {

        let pos = 0;

        for (let i = 0; i < this.rows.length; i++) {
            pos += this.rows[i].height;
            if (y < pos) return i;
        }
        return (this.rows.length - 1);
    }


    /**
     * To attach event listners
     */
    attachEventListners(): void {

        this.container.addEventListener("scroll", () => {
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        });

        this.container.addEventListener("dblclick", (e: MouseEvent) => {
            const rect = this.canvas.getBoundingClientRect();
            const physicalX = (e.clientX - rect.left);
            const physicalY = (e.clientY - rect.top);

            const canvasX = physicalX / this.dpr;
            const canvasY = physicalY / this.dpr;

            const x = canvasX + this.container.scrollLeft - this.rowHeaderWidth;
            const y = canvasY + this.container.scrollTop - this.colHeaderHeight;

            const colIndex = this.getColIndexFromX(x);
            const rowIndex = this.getRowIndexFromY(y);

            const cell = this.getOrCreateCell(rowIndex, colIndex);

            if (cell) {
                this.showInputOverCell(cell, rowIndex, colIndex);
            }
        });

        window.addEventListener("resize", () => {
            const currentDPR = window.devicePixelRatio > 1 ? window.devicePixelRatio : 1;
            if (currentDPR !== this.dpr) {
                this.dpr = currentDPR;
            }

            this.canvas.width = this.container.clientWidth * currentDPR;
            this.canvas.height = this.container.clientHeight * currentDPR;
            this.canvas.style.width = this.canvas.width + "px";
            this.canvas.style.height = this.canvas.height + "px";
            this.ctx.scale(currentDPR, currentDPR);
            // this.ctx.transform(currentDPR, 0, 0, currentDPR, 0, 0);

            this.updateCumulativeSizes();            
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        })

        this.formularBarInput.addEventListener("focus", () => {
            let newValue = this.formularBarInput.value;
            const match = newValue.match(/^=([A-Z]+)\((\w+\d+):(\w+\d+)\)$/i) || [];

            if (!match.length) return;
            const start = match[2];
            const end = match[3];

            let startRange = a1ToIndexes(start);
            let endRange = a1ToIndexes(end);

            this.selectedRange = { startRow: startRange.row, startCol: startRange.col, endRow: endRange.row, endCol: endRange.col };
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        })


        this.formularBarInput.addEventListener("input", () => {

            if (this.selectedCell) {

                const row = this.selectedCell.row;
                const col = this.selectedCell.col;
                let newValue = this.formularBarInput.value;
                const currentValue = this.getOrCreateCell(row, col)?.text;

                if (newValue === currentValue) return;
                if (newValue.trim().startsWith("=")) {
                    const evaluated = evaluateFormula(newValue.trim(), this);
                    const match = newValue.match(/^=([A-Z]+)\(([A-Z]+\d+):([A-Z]+\d+)\)$/i) || [];

                    if (!match.length) return;
                    const start = match[2];
                    const end = match[3];

                    let startRange = a1ToIndexes(start);
                    let endRange = a1ToIndexes(end);

                    this.selectedRange = { startRow: startRange.row, startCol: startRange.col, endRow: endRange.row, endCol: endRange.col };
                    this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
                    newValue = evaluated; // Only value is passed for editing now
                }
                const cmd = new EditCellCommand(
                    row,
                    col,
                    this.formularBarInput.value,
                    newValue,
                    (r, c) => this.getOrCreateCell(r, c),
                    () => this.redrawVisible(this.container.scrollTop, this.container.scrollLeft)
                );

                this.commandManager.executeCommand(cmd);
            }
        })

        this.formularBarInput.addEventListener("blur", () => {
            this.selectedRange = { startRow: null, startCol: null, endRow: null, endCol: null };
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        })
    }

    /**
     * To show input over the cell
     * @param cell Cell object on which input is to be shown
     * @param row Row index of the cell
     * @param col Column index of the cell
     */
    public showInputOverCell(cell: Cell, row: number, col: number, initialValue?: string) {
        const x = this.cumulativeColWidths[col - 1] ?? 0;
        const y = this.cumulativeRowHeights[row - 1] ?? 0;

        this.selectedCell = { row, col };

        const input_box = document.createElement("input");
        const virtualArea = document.querySelector(".virtual-canvas-area") as HTMLElement;
        this.isInputOn = true;

        input_box.type = "text";
        input_box.value = initialValue ? "" : cell.text.toString();
        input_box.style.position = "absolute";
        input_box.style.left = `${(x + this.rowHeaderWidth) * this.dpr}px`;
        input_box.style.top = `${(y + this.colHeaderHeight) * this.dpr}px`;
        input_box.style.width = `${this.columns[col].width * this.dpr}px`;
        input_box.style.height = `${this.rows[row].height * this.dpr}px`;
        input_box.style.fontSize = "14px";
        input_box.style.zIndex = "1";
        virtualArea.style.overflow = "hidden";
        virtualArea.appendChild(input_box);
        input_box.addEventListener("focus", () => {
            this.formularBarInput.value = input_box.value;
            let newValue = input_box.value;
            const match = newValue.match(/^=([A-Z]+)\(([A-Z]+\d+):([A-Z]+\d+)\)$/i) || [];

            if (!match.length) return;
            const start = match[2];
            const end = match[3];

            let startRange = a1ToIndexes(start);
            let endRange = a1ToIndexes(end);

            this.selectedRange = { startRow: startRange.row, startCol: startRange.col, endRow: endRange.row, endCol: endRange.col };
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        })

        input_box.addEventListener("input", () => {
            this.formularBarInput.value = input_box.value;
            let newValue = input_box.value;
            const match = newValue.match(/^=([A-Z]+)\(([A-Z]+\d+):([A-Z]+\d+)\)$/i) || [];

            if (!match.length) return;
            const start = match[2];
            const end = match[3];

            let startRange = a1ToIndexes(start);
            let endRange = a1ToIndexes(end);

            this.selectedRange = { startRow: startRange.row, startCol: startRange.col, endRow: endRange.row, endCol: endRange.col };
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        });

        input_box.addEventListener("blur", () => {
            let newValue = input_box.value;
            if (newValue.trim().startsWith("=")) {
                const evaluated = evaluateFormula(newValue.trim(), this);
                newValue = evaluated;
            }
            this.selectedRange = { startRow: null, startCol: null, endRow: null, endCol: null };
            const cmd = new EditCellCommand(
                row,
                col,
                input_box.value,
                newValue,
                (r, c) => this.getOrCreateCell(r, c),
                () => this.redrawVisible(this.container.scrollTop, this.container.scrollLeft)
            );
            this.commandManager.executeCommand(cmd);
            virtualArea.removeChild(input_box);
            this.isInputOn = false;
        });

        input_box.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
                input_box.blur();
            }
        });

        input_box.focus();
    }


    /**
     * To redraw the visible part of the grid
     * @param scrollTop Current scroll top of the grid
     * @param scrollLeft Current scroll left of the grid
     */
    public redrawVisible(scrollTop: number, scrollLeft: number): void {
        console.log("redrawVisible");
        
        const viewportWidth = this.canvas.width;
        const viewportHeight = this.canvas.height;

        const startRow = this.getRowIndexFromY(scrollTop);
        const endRow = this.getRowIndexFromY(scrollTop + viewportHeight);

        const startCol = this.getColIndexFromX(scrollLeft);
        const endCol = this.getColIndexFromX(scrollLeft + viewportWidth);

        const rowIndexStr = (endRow + 1).toString();
        this.ctx.font = "14px Arial";
        const textWidth = this.ctx.measureText(rowIndexStr).width;
        const padding = 20;
        this.rowHeaderWidth = Math.floor(textWidth + padding);

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "black";
        this.ctx.font = "14px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "black";

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.selectedRows.length > 0) {
            this.ctx.fillStyle = "#E8F2EC";
            for (let row = startRow; row <= endRow; row++) {
                if (this.selectedRows.indexOf(row) === -1) continue;
                const y = (this.cumulativeRowHeights[row - 1] ?? 0) - scrollTop + this.colHeaderHeight;
                const rowHeight = this.rows[row].height;
                this.ctx.fillRect(this.rowHeaderWidth, y, this.cumulativeColWidths[endCol] - this.cumulativeColWidths[startCol], rowHeight);
            }
        }

        if (this.selectedCols.length > 0) {
            this.ctx.fillStyle = "#E8F2EC";
            for (let col = startCol; col <= endCol; col++) {
                if (this.selectedCols.indexOf(col) === -1) continue;
                const x = (this.cumulativeColWidths[col - 1] ?? 0) - scrollLeft + this.rowHeaderWidth;
                const colWidth = this.columns[col].width;
                this.ctx.fillRect(x, this.colHeaderHeight, colWidth, this.cumulativeRowHeights[endRow] - this.cumulativeRowHeights[startRow]);
            }
        }


        // === Clip to scrollable canvas area
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.rowHeaderWidth, this.colHeaderHeight, this.canvas.width - this.rowHeaderWidth, this.canvas.height - this.colHeaderHeight);
        this.ctx.clip();
        this.drawGridLines(startRow, endRow, startCol, endCol, scrollTop, scrollLeft);

        if (this.selectedRange.startRow !== null && this.selectedRange.startCol !== null && this.selectedRange.endRow !== null && this.selectedRange.endCol !== null) {
            this.highlightSelectedRange(this.selectedRange.startRow, this.selectedRange.endRow, this.selectedRange.startCol, this.selectedRange.endCol, scrollTop, scrollLeft);
        }
        this.drawCellContent(startRow, endRow, startCol, endCol, scrollTop, scrollLeft);

        this.ctx.beginPath();
        this.ctx.restore();
        this.highlightSelectedArea(startRow, endRow, startCol, endCol, scrollTop, scrollLeft);
        this.drawColumnHeaders(startCol, endCol, scrollLeft);
        this.drawRowHeaders(startRow, endRow, scrollTop);
        this.drawCornorBox();

    }


    /**
     * To update the text of a cell
     * @param row Row index of the cell
     * @param col Column index of the cell
     * @param newText New text of the cell
     */
    updateCell(row: number, col: number, newText: string): void {
        const rowData = rowMap.get(row) as any;
        const field = colIndexToField[col] as any;

        if (rowData && field) {
            // Attempt type coercion based on field type
            if (field === "age" || field === "salary" || field === "id") {
                rowData[field] = Number(newText);
            } else {
                rowData[field] = newText;
            }

            // Also update canvas cell
            this.getOrCreateCell(row, col)?.updateText(newText);
        }
    }


    /**
     * To render the text of a cell 
     * @param value Text to be rendered
     * @param x Position of the text on the canvas
     * @param y Position of the text on the canvas
     * @param width Width of the cell
     * @param height Height of the cell
     */
    renderText(value: string, x: number, y: number, width: number, height: number) {
        this.ctx.font = "14px Arial";
        const padding = 6;
        let displayText = value;
        let text = value;
        if (text.startsWith("=")) {
            text = evaluateFormula(text.trim(), this);
            displayText = text;
        }

        let metrics = this.ctx.measureText(text);
        while (metrics.width > width - 2 * padding && text.length > 0) {
            text = text.slice(0, -1);
            metrics = this.ctx.measureText(text + "…");
        }

        if (text.length < displayText.length) {
            text += "…"; // add ellipsis
        }

        if (!isNaN(Number(text))) {
            this.ctx.fillText(text, x + (width / 2) - (metrics.width / 2) - padding, y + (height / 2) - 13);
        } else {
            this.ctx.fillText(text, x + padding - (width / 2) + (metrics.width / 2), y + (height / 2) - 13);
        }
    }

    /**
     * To draw the content of a cell
     * @param startRow Start row index of the visiable canvas
     * @param endRow end row index of the visiable canvas
     * @param startCol Start column index of the visiable canvas
     * @param endCol End column index of the visiable canvas
     * @param scrollTop Current scroll top of the grid
     * @param scrollLeft Current scroll left of the grid
     */
    drawCellContent(startRow: number, endRow: number, startCol: number, endCol: number, scrollTop: number, scrollLeft: number) {
        // === Draw cell text only
        let y = (this.cumulativeRowHeights[startRow - 1] ?? 0) - scrollTop;

        for (let row = startRow; row <= endRow; row++) {
            const rowHeight = this.rows[row].height;
            let x = (this.cumulativeColWidths[startCol - 1] ?? 0) - scrollLeft;

            for (let col = startCol; col <= endCol; col++) {
                const colWidth = this.columns[col].width;
                const cell = this.getOrCreateCell(row, col);
                if (!cell) continue;

                const cellX = x + this.rowHeaderWidth;
                const cellY = y + this.colHeaderHeight;

                this.ctx.fillStyle = "black";

                // Draw cell text
                this.renderText(
                    cell.text,
                    cellX + colWidth / 2,
                    cellY + rowHeight / 2,
                    colWidth,
                    rowHeight
                );


                if (this.selectedCell?.row === row && this.selectedCell.col === col) {
                    this.ctx.strokeStyle = "#137E43";
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(cellX, cellY, colWidth, rowHeight);
                    this.ctx.lineWidth = 1;
                }

                x += colWidth;
            }
            y += rowHeight;
        }

    }

    /**
     * To highlight the selected area in the grid
     * @param startRow Start row index of the visiable canvas
     * @param endRow end row index of the visiable canvas
     * @param startCol Start column index of the visiable canvas
     * @param endCol End column index of the visiable canvas
     * @param scrollTop Current scroll top of the grid
     * @param scrollLeft Current scroll left of the grid
     */
    highlightSelectedArea(startRow: number, endRow: number, startCol: number, endCol: number, scrollTop: number, scrollLeft: number) {

        if (this.selectedArea.startRow === null || this.selectedArea.startCol === null || this.selectedArea.endRow === null || this.selectedArea.endCol === null) return;

        const startAreaRow = Math.min(this.selectedArea.startRow, this.selectedArea.endRow);
        const endAreaRow = Math.max(this.selectedArea.startRow, this.selectedArea.endRow);
        const startAreaCol = Math.min(this.selectedArea.startCol, this.selectedArea.endCol);
        const endAreaCol = Math.max(this.selectedArea.startCol, this.selectedArea.endCol);

        for (let row = startAreaRow; row <= endAreaRow; row++) {
            if (row < startRow || row > endRow) continue;

            const y = (this.cumulativeRowHeights[row - 1] ?? 0) - scrollTop + this.colHeaderHeight;
            const rowHeight = this.rows[row].height;

            for (let col = startAreaCol; col <= endAreaCol; col++) {

                if (col < startCol || col > endCol) continue;

                const x = (this.cumulativeColWidths[col - 1] ?? 0) - scrollLeft + this.rowHeaderWidth;
                const colWidth = this.columns[col].width;


                this.ctx.fillStyle = "#E8F2EC";
                this.ctx.fillRect(x, y, colWidth, rowHeight);

                const cellRow = this.selectedCell?.row;
                const cellCol = this.selectedCell?.col;
                if (cellRow === row && cellCol === col) {
                    this.ctx.fillStyle = "white";
                    this.ctx.fillRect(x, y, colWidth, rowHeight);
                }
                // === Draw cell text in black
                const cell = this.getOrCreateCell(row, col);
                if (cell) {
                    this.ctx.fillStyle = "black";
                    this.renderText(
                        cell.text,
                        x + colWidth / 2,
                        y + rowHeight / 2,
                        colWidth,
                        rowHeight
                    );
                }
                this.ctx.beginPath();
                this.ctx.strokeStyle = "#ccc";
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, colWidth, rowHeight);
                this.ctx.stroke();

                const isBothSelected = this.selectedCols.length > 0 && this.selectedRows.length > 0;

                if (!(((this.selectedCols.includes(col) && (endAreaCol - startAreaCol + 1) < this.selectedCols.length) || this.selectedRows.includes(row) && (endAreaRow - startAreaRow + 1) < this.selectedRows.length) || isBothSelected)) {
                    // === Border logic: Only outer rectangle gets green border
                    const isTopEdge = row === startAreaRow;
                    const isBottomEdge = row === endAreaRow;
                    const isLeftEdge = col === startAreaCol;
                    const isRightEdge = col === endAreaCol;

                    this.ctx.strokeStyle = "#ccc";
                    this.ctx.lineWidth = 1;

                    if (isTopEdge) {
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = "#137E43";
                        this.ctx.lineWidth = 2;
                        this.ctx.moveTo(x, y);
                        this.ctx.lineTo(x + colWidth, y);
                        this.ctx.stroke();
                    }

                    if (isBottomEdge) {
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = "#137E43";
                        this.ctx.lineWidth = 2;
                        this.ctx.moveTo(x, y + rowHeight);
                        this.ctx.lineTo(x + colWidth, y + rowHeight);
                        this.ctx.stroke();
                    }

                    if (isLeftEdge) {
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = "#137E43";
                        this.ctx.lineWidth = 2;
                        this.ctx.moveTo(x, y);
                        this.ctx.lineTo(x, y + rowHeight);
                        this.ctx.stroke();
                    }

                    if (isRightEdge) {
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = "#137E43";
                        this.ctx.lineWidth = 2;
                        this.ctx.moveTo(x + colWidth, y);
                        this.ctx.lineTo(x + colWidth, y + rowHeight);
                        this.ctx.stroke();
                    }
                    this.ctx.lineWidth = 1;
                }
            }
        }
    }


    highlightSelectedRange(startRow: number, endRow: number, startCol: number, endCol: number, scrollTop: number, scrollLeft: number) {
        if (startRow !== null && startCol !== null && endRow !== null && endCol !== null) {
            let sr1 = startRow, sc1 = startCol, er1 = endRow, ec1 = endCol;

            startRow = Math.min(sr1, er1);
            startCol = Math.min(sc1, ec1);
            endRow = Math.max(sr1, er1);
            endCol = Math.max(sc1, ec1);
            let y = (this.cumulativeRowHeights[startRow - 1] ?? 0) - scrollTop + this.colHeaderHeight;
            let x = (this.cumulativeColWidths[startCol - 1] ?? 0) - scrollLeft + this.rowHeaderWidth;

            let width = this.cumulativeColWidths[endCol] - (this.cumulativeColWidths[startCol - 1] ?? 0);
            let height = this.cumulativeRowHeights[endRow] - (this.cumulativeRowHeights[startRow - 1] ?? 0);
            this.ctx.beginPath();
            this.ctx.fillStyle = "rgba(194, 225, 247, 0.37)";
            this.ctx.fillRect(x, y, width - 1, height - 1);
            this.ctx.strokeStyle = "blue";
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, width, height);
            this.ctx.stroke();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "black";

        }
    }

    /**
     * To draw grid lines 
     * @param startRow Start row index of the visiable canvas
     * @param endRow end row index of the visiable canvas
     * @param startCol Start column index of the visiable canvas
     * @param endCol End column index of the visiable canvas
     * @param scrollTop Current scroll top of the grid
     * @param scrollLeft Current scroll left of the grid
     */
    drawGridLines(startRow: number, endRow: number, startCol: number, endCol: number, scrollTop: number, scrollLeft: number) {


        // Horizontal lines
        let currentY = (this.cumulativeRowHeights[startRow - 1] ?? 0) - scrollTop + this.colHeaderHeight;
        for (let row = startRow; row <= endRow + 1; row++) {
            const rowHeight = this.rows[row]?.height || 0;

            this.ctx.beginPath();
            this.ctx.strokeStyle = "#ccc";

            this.ctx.moveTo(this.rowHeaderWidth, currentY + 0.5);
            this.ctx.lineTo(Math.min(this.canvas.width, this.sheetWidth - scrollLeft - (50 - this.rowHeaderWidth)), currentY + 0.5);
            this.ctx.stroke();

            currentY += rowHeight;
        }

        // Vertical lines
        let currentX = (this.cumulativeColWidths[startCol - 1] ?? 0) - scrollLeft + this.rowHeaderWidth;
        for (let col = startCol; col <= endCol + 1; col++) {
            const colWidth = this.columns[col]?.width || 0;
            this.ctx.beginPath();
            this.ctx.strokeStyle = "#ccc";
            this.ctx.moveTo(currentX + 0.5, this.colHeaderHeight);
            this.ctx.lineTo(currentX + 0.5, Math.min(this.canvas.width, this.sheetHeight - scrollTop));
            this.ctx.stroke();

            currentX += colWidth;
        }


        this.ctx.strokeStyle = "#ccc";
        this.ctx.stroke();
    }

    /**
     * To draw row headers 
     * @param startRow Start row index of the visiable canvas
     * @param endRow End row index of the visiable canvas
     * @param scrollTop Current scroll top of the grid
     */
    drawRowHeaders(startRow: number, endRow: number, scrollTop: number) {
        // === Draw row header background
        let isEntierGridIsSelected = this.selectedArea?.startRow === 0 && this.selectedArea?.endRow === this.rows.length - 1 && this.selectedArea?.startCol === 0 && this.selectedArea?.endCol === this.columns.length - 1;

        for (let row = startRow; row <= endRow; row++) {
            const y = this.colHeaderHeight + (this.cumulativeRowHeights[row - 1] ?? 0) - scrollTop;
            const height = this.rows[row].height;

            let isSelectedRow = false;
            if (this.selectedRows.length > 0) {
                isSelectedRow = this.selectedRows.indexOf(row) !== -1;
            }
            const isSelectedCellRow = this.selectedCell?.row === row;
            const isColSelected = this.selectedCols.length > 0;
            const isInSelectedArea =
                this.selectedArea?.startRow !== null &&
                this.selectedArea?.endRow !== null &&
                (
                    (this.selectedArea.startRow <= row && row <= this.selectedArea.endRow) ||
                    (this.selectedArea.endRow <= row && row <= this.selectedArea.startRow)
                );

            // === Fill background
            if (isEntierGridIsSelected) {
                this.ctx.fillStyle = "#137E43";
            } else if ((isSelectedCellRow || isInSelectedArea) && !isSelectedRow) {
                this.ctx.fillStyle = "#CAEAD8";
            } else if (isSelectedRow) {
                this.ctx.fillStyle = "#137E43";
            } else if (isColSelected) {
                this.ctx.fillStyle = "#CAEAD8";
            } else {
                this.ctx.fillStyle = "#f0f0f0";
            }
            this.ctx.fillRect(0.5, y + 0.5, this.rowHeaderWidth, height);

            // === Border
            this.ctx.strokeStyle = isSelectedRow ? "#137E43" : "#ccc";
            this.ctx.lineWidth = isSelectedRow ? 2 : 1;
            this.ctx.strokeRect(0.5, y + 0.5, this.rowHeaderWidth, height);


            // === Right edge highlight if selected
            if ((isSelectedCellRow || isInSelectedArea && !isSelectedRow) || isColSelected) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = "#137E43";
                this.ctx.lineWidth = 2;
                this.ctx.moveTo(this.rowHeaderWidth + 0.5, y + 0.5);
                this.ctx.lineTo(this.rowHeaderWidth + 0.5, y + height + 0.5);
                this.ctx.stroke();
            }
            if (isSelectedRow) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = "white";
                this.ctx.lineWidth = 3;
                this.ctx.moveTo(0.5, y + height + 0.5);
                this.ctx.lineTo(this.rowHeaderWidth + 0.5, y + height + 0.5);
                this.ctx.stroke();
            }

            // === Draw row number
            this.ctx.fillStyle = isSelectedRow || isEntierGridIsSelected ? "white" : "black";
            this.ctx.textAlign = "left";
            this.ctx.textBaseline = "middle";

            const rowIndexStr = (endRow + 1).toString();
            const padding = 2;
            const textWidth = this.ctx.measureText(rowIndexStr).width;
            const textX = this.rowHeaderWidth - textWidth - padding;

            this.ctx.fillText((row + 1).toString(), textX, y + height / 2);
        }
    }

    /**
     * To draw corner box of the grid
     */
    drawCornorBox() {
        this.ctx.strokeStyle = "#ccc";
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0.5, 0.5, this.rowHeaderWidth, this.colHeaderHeight);

        this.ctx.fillStyle = "#B7B7B7";
        this.ctx.beginPath();
        this.ctx.moveTo(this.rowHeaderWidth - 4, this.colHeaderHeight - 4);
        this.ctx.lineTo(this.rowHeaderWidth - 4, this.colHeaderHeight - 16);
        this.ctx.lineTo(this.rowHeaderWidth - 16, this.colHeaderHeight - 4);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.strokeStyle = "#B7B7B7";
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(this.rowHeaderWidth - 0.5, this.colHeaderHeight - 0.5);
        this.ctx.lineTo(this.rowHeaderWidth - 0.5, 0);
        this.ctx.moveTo(this.rowHeaderWidth - 0.5, this.colHeaderHeight - 0.5);
        this.ctx.lineTo(0, this.colHeaderHeight - 0.5);
        this.ctx.stroke();
    }

    /**
     * To draw column headers
     * @param startCol Start column index of the visiable canvas
     * @param endCol End column index of the visiable canvas
     * @param scrollLeft Current scroll left of the grid
     */
    drawColumnHeaders(startCol: number, endCol: number, scrollLeft: number) {
        let isEntierGridIsSelected = this.selectedArea?.startRow === 0 && this.selectedArea?.endRow === this.rows.length - 1 && this.selectedArea?.startCol === 0 && this.selectedArea?.endCol === this.columns.length - 1;
        this.ctx.fillStyle = "black";
        for (let col = startCol; col <= endCol; col++) {
            const x = this.rowHeaderWidth + (this.cumulativeColWidths[col - 1] ?? 0) - scrollLeft;
            const width = this.columns[col].width;

            const isInSelectedArea =
                this.selectedArea?.startCol !== null &&
                this.selectedArea?.endCol !== null &&
                (
                    (this.selectedArea.startCol <= col && col <= this.selectedArea.endCol) ||
                    (this.selectedArea.endCol <= col && col <= this.selectedArea.startCol)
                );

            const isRowSelected = this.selectedRows.length > 0;

            const isSelectedCellCol = this.selectedCell?.col === col;

            let isFullySelectedCol = false;
            if (this.selectedCols.length > 0) {
                isFullySelectedCol = this.selectedCols.indexOf(col) !== -1;
            }

            // === Set background fill color
            if (isEntierGridIsSelected) {
                this.ctx.fillStyle = "#137E43";
            } else if (((isSelectedCellCol || isInSelectedArea) && !isFullySelectedCol)) {
                this.ctx.fillStyle = "#CAEAD8";
            } else if (isFullySelectedCol) {
                this.ctx.fillStyle = "#137E43";
            } else if (isRowSelected) {
                this.ctx.fillStyle = "#CAEAD8";
            } else {
                this.ctx.fillStyle = "#f0f0f0";
            }

            this.ctx.fillRect(x + 0.5, 0 + 0.5, width, this.colHeaderHeight);

            // === Set border style
            if (isFullySelectedCol) {
                this.ctx.strokeStyle = "#137E43";
                this.ctx.lineWidth = 2;
            } else {
                this.ctx.strokeStyle = "#ccc";
                this.ctx.lineWidth = 1;
            }
            this.ctx.strokeRect(x + 0.5, 0 + 0.5, width, this.colHeaderHeight);

            // === Bottom border if part of selected area or cell
            if ((isSelectedCellCol || isInSelectedArea && !isFullySelectedCol) || isRowSelected) {
                this.ctx.strokeStyle = "#137E43";
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x + 0.5, this.colHeaderHeight + 0.5);
                this.ctx.lineTo(x + width + 0.5, this.colHeaderHeight + 0.5);
                this.ctx.stroke();
            }

            if (isFullySelectedCol) {
                this.ctx.strokeStyle = "white";
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(x + width + 0.5, 0.5);
                this.ctx.lineTo(x + width + 0.5, this.colHeaderHeight + 0.5);
                this.ctx.stroke();
            }

            // === Draw column label text
            this.ctx.fillStyle = (isFullySelectedCol || isEntierGridIsSelected) ? "white" : "black";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";

            this.ctx.fillText(
                this.columns[col].label,
                x + width / 2,
                this.colHeaderHeight / 2
            );

        }

    }

    /**
     * To calculate Selected area status like count, sum, min, max, avg
     */
    calculateAreaStatus(batchSize: number = 50) {
        const { startRow, endRow, startCol, endCol } = this.selectedArea;

        if (
            startRow === null ||
            endRow === null ||
            startCol === null ||
            endCol === null
        ) {
            if (this.selectedCell) {
                const cell = this.cells.get(this.selectedCell.row)?.get(this.selectedCell.col);
                const value = cell?.text?.trim() ?? "";
                const num = parseFloat(value);
                const isNum = !isNaN(num);

                this.renderAreaStatus({
                    count: value !== "" ? 1 : 0,
                    sum: isNum ? num : null,
                    min: isNum ? num : null,
                    max: isNum ? num : null,
                    avg: isNum ? num : null
                });
            }
            return;
        }

        let sum = 0;
        let numericCount = 0;
        let totalCount = 0;
        let min: number | null = null;
        let max: number | null = null;

        const rowStart = Math.min(startRow, endRow);
        const rowEnd = Math.max(startRow, endRow);
        const colStart = Math.min(startCol, endCol);
        const colEnd = Math.max(startCol, endCol);

        let currentRow = rowStart;

        const processBatch = () => {
            const limit = Math.min(currentRow + batchSize, rowEnd + 1);

            for (; currentRow < limit; currentRow++) {
                const rowMap = this.cells.get(currentRow);
                if (!rowMap) continue;

                for (let col = colStart; col <= colEnd; col++) {
                    const cell = rowMap.get(col);
                    if (!cell || cell.displayValue.trim() === "") continue;

                    totalCount++;

                    const num = parseFloat(cell.displayValue);
                    if (!isNaN(num)) {
                        numericCount++;
                        sum += num;
                        min = min === null ? num : Math.min(min, num);
                        max = max === null ? num : Math.max(max, num);
                    }
                }
            }

            if (currentRow <= rowEnd) {
                processBatch();
            } else {
                const avg = numericCount > 0 ? sum / numericCount : null;

                this.renderAreaStatus({
                    count: totalCount,
                    sum: numericCount > 0 ? sum : null,
                    min,
                    max,
                    avg
                });
            }
        };

        try {
            processBatch();
        } catch (err) {
            console.error("Failed to calculate area status:", err);
            this.renderAreaStatus({ count: 0, sum: null, min: null, max: null, avg: null });
        }
    }

    /**
     * To render selected area status like count, sum, min, max, avg in UI
     * @param stats Selected area status like count, sum, min, max, avg
     */
    renderAreaStatus(stats: {
        count: number;
        sum: number | null;
        min: number | null;
        max: number | null;
        avg: number | null;
    }): void {

        const updateElement = (selector: string, value: number | null) => {
            const container = document.querySelector(selector) as HTMLElement;
            if (!container) return;

            if (value === null) {
                container.style.display = "none";
            } else {
                const valueEl = container.querySelector(".counter-value") as HTMLElement;
                valueEl.textContent = selector === ".avg-item" ? value.toFixed(3) : value.toString();
                container.style.display = "flex";
            }
        };

        // Count should always be shown (even if 0)
        const countContainer = document.querySelector(".count-item") as HTMLElement;
        const countValue = countContainer?.querySelector(".count-value") as HTMLElement;
        if (countContainer && countValue) {
            countValue.textContent = stats.count.toString();
            countContainer.style.display = "flex";
        }

        // Update other stats
        updateElement(".min-item", stats.min);
        updateElement(".max-item", stats.max);
        updateElement(".sum-item", stats.sum);
        updateElement(".avg-item", stats.avg);
    }

    /**
     * Add new row
     * @param atIndex Index to add row
     */
    addRow(atIndex: number) {
        const newCells = new Map();

        for (const [rowIdx, rowMap] of this.cells) {
            const newIndex = rowIdx >= atIndex ? rowIdx + 1 : rowIdx;
            newCells.set(newIndex, rowMap);
        }

        this.cells = newCells;
        this.cells.set(atIndex, new Map());
        this.rows.splice(atIndex, 0, new Row(30, atIndex));

        const virtualArea = document.querySelector(".virtual-canvas-area") as HTMLElement;
        const addedHeight = this.rows[atIndex].height;
        this.sheetHeight += addedHeight;
        virtualArea.style.height = `${this.sheetHeight}px`;
        this.updateCumulativeSizes();
        this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
    }

    /**
     * Add new column
     * @param index Index to add column
     */
    addColumn(index: number) {
        const newColumn = new Column(index);
        this.columns.splice(index, 0, newColumn);

        for (let i = index + 1; i < this.columns.length; i++) {
            this.columns[i].updateIndex(i);
        }

        for (const [rowIndex, colMap] of this.cells.entries()) {
            const newColMap = new Map<number, Cell>();

            for (const [colIndex, cell] of colMap.entries()) {
                if (colIndex >= index) {
                    newColMap.set(colIndex + 1, cell);
                } else {
                    newColMap.set(colIndex, cell);
                }
            }

            const blankCell = new Cell("");
            newColMap.set(index, blankCell);

            this.cells.set(rowIndex, newColMap);
        }

        const virtualArea = document.querySelector(".virtual-canvas-area") as HTMLElement;
        const addedWidth = this.columns[index].width;
        this.sheetWidth += addedWidth;
        virtualArea.style.width = `${this.sheetWidth}px`;


        this.updateCumulativeSizes();
        this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
    }

    /**
     * To scroll into view if selected cell is out of view
     * @param row Row index of the cell
     * @param col Column index of the cell
     */
    scrollIntoView(row: number, col: number) {
        const container = this.container;
        const scrollTop = container.scrollTop;
        const scrollLeft = container.scrollLeft;
        const viewWidth = container.clientWidth;
        const viewHeight = container.clientHeight;

        const cellX = this.cumulativeColWidths[col] ?? 0 + this.rowHeaderWidth;
        const cellY = this.cumulativeRowHeights[row] ?? 0 + this.colHeaderHeight;

        const cellWidth = this.columns[col].width;
        const cellHeight = this.rows[row].height;

        const headerOffsetX = this.rowHeaderWidth;
        const headerOffsetY = this.colHeaderHeight;

        let newScrollLeft = scrollLeft;
        let newScrollTop = scrollTop;

        // Horizontal scroll check
        if (cellX < scrollLeft + headerOffsetX + cellWidth) {
            newScrollLeft = cellX - headerOffsetX - cellWidth;
        } else if (cellX + cellWidth > scrollLeft + viewWidth - headerOffsetX) {
            newScrollLeft = cellX + cellWidth - viewWidth + headerOffsetX;
        }

        // Vertical scroll check
        if (cellY < scrollTop + headerOffsetY + cellHeight) {
            newScrollTop = cellY - headerOffsetY;
        } else if (cellY + cellHeight > scrollTop + viewHeight - headerOffsetY) {
            newScrollTop = cellY + cellHeight - viewHeight + headerOffsetY;
        }

        container.scrollLeft = newScrollLeft;
        container.scrollTop = newScrollTop;
    }

}

export { ExcelSheet };