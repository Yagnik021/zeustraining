import { Row } from "./Row";
import { Column } from "./Column";
import { Cell } from "./Cell";
import { CommandManager } from "./Commands/CommandManger";
import { jsonData, headers } from "./jsonData";
import { EditCellCommand } from "./Commands/EditCommandCell";
import { ResizeCommand } from "./Commands/ResizeCommand";


type DataRow = {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    salary: number;
};

// let this.rowHeaderWidth = 50 as number;
// const this.colHeaderHeight = 30 as number;
let dpr = 1;


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
 * @member Rows[] rows - An array of Row objects representing the rows in the Excel sheet.
 * @member Columns[] columns - An array of Column objects representing the columns in the Excel sheet.
 * @member Cells[][] cells - A 2D array of Cell objects representing the cells in the Excel sheet.
 * @member number sheetWidth - The width of the Excel sheet in pixels.
 * @member number sheetHeight - The height of the Excel sheet in pixels.
 * @member boolean isResizing - A flag indicating whether the Excel sheet is currently being resized.
 * @member resizeTarget - An object representing the target of the resize operation.
 * @member resizeStartPos - An object representing the starting position of the resize operation.
 * @member selectedCell - An object representing the currently selected cell in the Excel sheet.
 * @member commandManager - An instance of the CommandManager class representing the command manager for the Excel sheet.
 * @member selectedRow - The index of the currently selected row in the Excel sheet.
 * @member selectedCol - The index of the currently selected column in the Excel sheet.
 * @member selectedArea - An object representing the currently selected area in the Excel sheet.
 * @member isSelectingArea - A flag indicating whether the user is currently selecting an area in the Excel sheet.
 * @member canvas - The canvas element for rendering the Excel sheet.
 * @member ctx - The canvas context for rendering the Excel sheet.
 * @member container - The container element for the Excel sheet.
 * @member formularBarInput - The input element for the formular bar.
 */

class ExcelSheet {

    public rows: Row[] = [];
    public columns: Column[] = [];
    private cells: Cell[][] = [];
    private sheetWidth: number = 0;
    private sheetHeight: number = 0;
    private isResizing: boolean = false;
    private resizeTarget: { type: "column" | "row", index: number } | null = null;
    private resizeStartPos: { x: number, y: number } = { x: 0, y: 0 };
    private _selectedCell: { row: number; col: number } | null = null;
    private commandManager: CommandManager;
    private selectedRow: number | null = null;
    private selectedCol: number | null = null;
    private selectedArea: { startRow: number | null, startCol: number | null, endRow: number | null, endCol: number | null } = { startRow: null, startCol: null, endRow: null, endCol: null };
    private isSelectingArea: boolean = false;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    public container: HTMLElement;
    public formularBarInput: HTMLInputElement;
    private rowHeaderWidth: number = 50;
    private colHeaderHeight: number = 30;


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
        this.generateSheet(jsonData.length + 1, 500, 30, 80, 1, "black");
        this.attachEventListners();
        this.selectedCell = { row: 0, col: 0 };
        this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);


        this.renderAreaStatus({ count: 0, sum: null, min: null, max: null, avg: null });
        this.commandManager = new CommandManager();
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
    private generateSheet(
        numberOfRows: number = 100000,
        numberOfColumns: number,
        cellHeight: number,
        cellWidth: number,
        lineWidth: number,
        lineColor: string
    ) {
        this.rows = Array.from({ length: numberOfRows }, () => new Row(cellHeight));
        this.columns = Array.from(
            { length: numberOfColumns },
            (_, index) => new Column(index, cellWidth)
        );

        const virtualArea = document.querySelector(".virtual-canvas-area") as HTMLElement;
        this.sheetWidth = this.rowHeaderWidth + (numberOfColumns * cellWidth);
        this.sheetHeight = this.colHeaderHeight + (numberOfRows * cellHeight);

        virtualArea.style.width = `${this.sheetWidth + 20}px`;
        virtualArea.style.height = `${this.sheetHeight + 20}px`;

        dpr = window.devicePixelRatio;

        this.canvas.width = (this.container.clientWidth) * dpr;
        this.canvas.height = (this.container.clientHeight) * dpr;

        this.canvas.style.width = (this.container.clientWidth) * dpr + "px";
        this.canvas.style.height = (this.container.clientHeight) * dpr + "px";

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);


        this.ctx.clearRect(0, 0, this.sheetWidth, this.sheetHeight);
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = lineColor;
        this.ctx.font = "14px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "black";


        for (let row = 0; row < numberOfRows; row++) {
            const rowCells: Cell[] = [];

            for (let col = 0; col < numberOfColumns; col++) {
                let cell;
                if (row === 0) {
                    if (col <= headers.length - 1) {
                        cell = new Cell(headers[col], row, col);
                    }
                    else {
                        cell = new Cell("", row, col);
                    }
                } else if (row <= jsonData.length) {
                    if (col <= headers.length - 1) {
                        const attribute = headers[col];
                        const value = jsonData[row - 1][attribute];

                        cell = new Cell(String(value), row, col);
                    }
                    else {
                        cell = new Cell("", row, col);
                    }
                } else {
                    cell = new Cell("", row, col);
                }
                rowCells.push(cell);
            }

            this.cells.push(rowCells);
        }

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
                this.formularBarInput.value = this.getCell(cell.row, cell.col)?.text || "";
            } else {
                addressDiv.innerHTML = "";
                this.formularBarInput.value = "";
            }
        }

        this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
    }

    /**
     * To get the column index from the x position
     * @param x Cursor X position
     * @returns Column index
     */
    private getColIndexFromX(x: number): number {
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
    private getRowIndexFromY(y: number): number {

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
    private attachEventListners(): void {
        let originalSize = 0;

        this.container.addEventListener("scroll", () => {
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        });

        this.container.addEventListener("dblclick", (e: MouseEvent) => {
            const rect = this.canvas.getBoundingClientRect();
            const physicalX = (e.clientX - rect.left) / dpr;
            const physicalY = (e.clientY - rect.top) / dpr;

            const x = (physicalX + this.container.scrollLeft - this.rowHeaderWidth);
            const y = (physicalY + this.container.scrollTop - this.colHeaderHeight);

            const colIndex = this.getColIndexFromX(x);
            const rowIndex = this.getRowIndexFromY(y);

            const cell = this.getCell(rowIndex, colIndex);

            if (cell) {
                this.showInputOverCell(cell, rowIndex, colIndex);
            }
        });

        this.container.addEventListener("mousemove", (e: MouseEvent) => {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const physicalX = (e.clientX - rect.left) / dpr;
            const physicalY = (e.clientY - rect.top) / dpr;

            const x = (physicalX + this.container.scrollLeft - this.rowHeaderWidth);
            const y = (physicalY + this.container.scrollTop - this.colHeaderHeight);

            const hoverCol = this.getColIndexFromX(x);
            const hoverRow = this.getRowIndexFromY(y);

            if (this.isSelectingArea) {
                this.selectedArea = {
                    endRow: hoverRow,
                    endCol: hoverCol,
                    startRow: this.selectedArea.startRow,
                    startCol: this.selectedArea.startCol
                };

                if (
                    this.selectedArea.startRow === this.selectedArea.endRow &&
                    this.selectedArea.startCol === this.selectedArea.endCol
                ) {
                    if (
                        this.selectedArea.startRow === null ||
                        this.selectedArea.startCol === null
                    )
                        return;

                    this.selectedCell = {
                        row: this.selectedArea.startRow,
                        col: this.selectedArea.startCol
                    };
                } else {
                    this.selectedCell = null;
                }

                this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
                return;
            }

            const colRightEdge = this.columns
                .slice(0, hoverCol + 1)
                .reduce((sum, col) => sum + col.width, 0);
            const rowBottomEdge = this.rows
                .slice(0, hoverRow + 1)
                .reduce((sum, row) => sum + row.height, 0);

            const withinColResizeZone = Math.abs(x - colRightEdge) < 5;
            const withinRowResizeZone = Math.abs(y - rowBottomEdge) < 5;

            const scaledClientX = (e.clientX - rect.left) / dpr;
            const scaledClientY = (e.clientY - rect.top) / dpr;

            if (scaledClientX < 0 || scaledClientY < 0) {
                this.container.style.cursor = "default";
                this.resizeTarget = null;
                return;
            }

            console.log();
            

            if (!this.isResizing) {
                if (withinColResizeZone && scaledClientY <= this.colHeaderHeight) {
                    this.container.style.cursor = "ew-resize";
                    this.resizeTarget = { type: "column", index: hoverCol };
                } else if (withinRowResizeZone && scaledClientX <= this.rowHeaderWidth) {
                    this.container.style.cursor = "ns-resize";
                    this.resizeTarget = { type: "row", index: hoverRow };
                } else {
                    this.container.style.cursor = "cell";
                    this.resizeTarget = null;
                }
            }
        });


        this.container.addEventListener("pointerdown", (e: MouseEvent) => {
            if (!this.resizeTarget) {
                const rect = this.canvas.getBoundingClientRect();
                const physicalX = (e.clientX - rect.left) / dpr;
                const physicalY = (e.clientY - rect.top) / dpr;

                const logicalX = (physicalX + this.container.scrollLeft - this.rowHeaderWidth);
                const logicalY = (physicalY + this.container.scrollTop - this.colHeaderHeight);

                // Use these for area calculations
                const rowHeaderBuffer = logicalX;
                const colHeaderBuffer = logicalY;

                // Check if pointer is outside visible canvas bounds in logical units
                const outOfcanvas = physicalX > this.canvas.clientWidth || physicalY > this.canvas.clientHeight;
                if (rowHeaderBuffer < 0 && colHeaderBuffer > 0 && !outOfcanvas) {

                    const row = this.getRowIndexFromY(logicalY);
                    this.selectedRow = row;
                    this.selectedCol = null;
                    this.selectedCell = null;
                    this.selectedArea = { startRow: row, startCol: 0, endRow: row, endCol: this.columns.length - 1 };
                    this.calculateAreaStatus();
                    this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
                    return;
                }

                if (colHeaderBuffer < 0 && rowHeaderBuffer > 0 && !outOfcanvas) {
                    const col = this.getColIndexFromX(logicalX);
                    this.selectedRow = null;
                    this.selectedCol = col;
                    this.selectedCell = null;
                    this.selectedArea = { startRow: 0, startCol: col, endRow: this.rows.length - 1, endCol: col };
                    this.calculateAreaStatus();
                    this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
                    return;

                }

                if (rowHeaderBuffer > 0 && colHeaderBuffer > 0 && !outOfcanvas) {
                    this.selectedRow = null;
                    this.selectedCol = null;
                    this.selectedCell = null;
                    this.selectedArea = { startRow: this.getRowIndexFromY(logicalY), startCol: this.getColIndexFromX(logicalX), endRow: this.getRowIndexFromY(logicalY), endCol: this.getColIndexFromX(logicalX) };
                    this.isSelectingArea = true;
                    this.calculateAreaStatus();
                    this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
                    return;
                };

                const row = this.getRowIndexFromY(logicalY);
                const col = this.getColIndexFromX(logicalX);

                if (row >= 0 && col >= 0 && row < this.rows.length && col < this.columns.length) {
                    this.selectedCell = { row, col };
                    this.selectedRow = null;
                    this.selectedCol = null;
                    this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
                }
                return;
            };

            this.isResizing = true;
            this.resizeStartPos = { x: e.clientX, y: e.clientY };
            if (this.resizeTarget?.type === "column") {
                originalSize = this.columns[this.resizeTarget.index].width;
            } else if (this.resizeTarget?.type === "row") {
                originalSize = this.rows[this.resizeTarget.index].height;
            }
            this.resizeTarget = { ...this.resizeTarget };
        });

        this.container.addEventListener("pointerup", () => {
            this.isResizing = false;
            this.resizeTarget = null;
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        })

        window.addEventListener("mousemove", (e: MouseEvent) => {
            if (!this.isResizing || !this.resizeTarget) return;

            const rect = this.canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            const currentX = (e.clientX - rect.left) / dpr;
            const currentY = (e.clientY - rect.top) / dpr;
            const startX = (this.resizeStartPos.x - rect.left) / dpr;
            const startY = (this.resizeStartPos.y - rect.top) / dpr;

            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            if (this.resizeTarget.type === "column") {
                const col = this.columns[this.resizeTarget.index];
                col.width = Math.max(50, col.width + deltaX);
            } else if (this.resizeTarget.type === "row") {
                const row = this.rows[this.resizeTarget.index];
                row.height = Math.max(30, row.height + deltaY);
            }

            this.resizeStartPos = { x: e.clientX, y: e.clientY };

            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        });


        window.addEventListener("mouseup", (e) => {

            if (this.isSelectingArea) {

                const rect = this.canvas.getBoundingClientRect();
                const physicalX = (e.clientX - rect.left) / dpr;
                const physicalY = (e.clientY - rect.top) / dpr;

                const x = (physicalX + this.container.scrollLeft - this.rowHeaderWidth);
                const y = (physicalY + this.container.scrollTop - this.colHeaderHeight);

                this.selectedArea = { endRow: this.getRowIndexFromY(y), endCol: this.getColIndexFromX(x), startRow: this.selectedArea.startRow, startCol: this.selectedArea.startCol };
                this.isSelectingArea = false;
                if (this.selectedArea.startRow === this.selectedArea.endRow && this.selectedArea.startCol === this.selectedArea.endCol) {

                    if (this.selectedArea.startRow === null || this.selectedArea.startCol === null) return;
                    this.selectedCell = { row: this.selectedArea.startRow, col: this.selectedArea.startCol };
                    this.selectedArea = { endRow: null, endCol: null, startRow: null, startCol: null };
                } else {
                    this.selectedCell = null;
                }
                this.calculateAreaStatus();
                this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
                return;
            }

            if (!this.resizeTarget || !this.isResizing) return;
            const finalSize =
                this.resizeTarget.type === "column"
                    ? this.columns[this.resizeTarget.index].width
                    : this.rows[this.resizeTarget.index].height;

            if (originalSize !== finalSize) {
                const resizeCommand = new ResizeCommand(
                    this,
                    this.resizeTarget.type,
                    this.resizeTarget.index,
                    finalSize,
                    originalSize
                );
                this.commandManager.executeCommand(resizeCommand);
            }

            this.isResizing = false;
            this.resizeTarget = null;
        });

        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if (!this.selectedCell) {
                this.selectedCell = { row: 0, col: 0 };
                this.selectedCol = null;
                this.selectedRow = null;
            };

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
                    if (newRow >= this.rows.length) newRow = this.rows.length - 1;
                    break;
                case "Enter":
                    e.preventDefault();
                    this.showInputOverCell(this.getCell(row, col)!, row, col);
                    return;
            }

            this.selectedCell = { row: newRow, col: newCol };

            // To change view to Currently selected cell
            // this.scrollIntoView(newRow, newCol); 

            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        });

        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "z") {
                this.commandManager.undo();
            } else if (e.ctrlKey && e.key === "y") {
                this.commandManager.redo();
            }
        });

        window.addEventListener("resize", () => {
            const currentDPR = window.devicePixelRatio > 1 ? window.devicePixelRatio : 1;
            if (currentDPR !== dpr) {
                dpr = currentDPR;
            }

            this.canvas.width = this.container.clientWidth * currentDPR;
            this.canvas.height = this.container.clientHeight * currentDPR;
            this.canvas.style.width = this.canvas.width + "px";
            this.canvas.style.height = this.canvas.height + "px";
            this.ctx.scale(currentDPR, currentDPR);

            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);

        })

        this.formularBarInput.addEventListener("input", () => {


            if (this.selectedCell) {

                const row = this.selectedCell.row;
                const col = this.selectedCell.col;
                const newValue = this.formularBarInput.value;
                const currentValue = this.cells[row][col].text;

                if (newValue === currentValue) return;

                const cmd = new EditCellCommand(
                    row,
                    col,
                    newValue,
                    (r, c) => this.getCell(r, c),
                    () => this.redrawVisible(this.container.scrollTop, this.container.scrollLeft)
                );

                this.commandManager.executeCommand(cmd);
            }
        })
    }


    /**
     * To get the cell from the grid
     * @param row Row index of the cell
     * @param col Column index of the cell
     * @returns Cell object
     */
    public getCell(row: number, col: number): Cell | null {
        if (this.cells[row] && this.cells[row][col]) {
            return this.cells[row][col];
        }
        return null;
    }


    /**
     * To show input over the cell
     * @param cell Cell object on which input is to be shown
     * @param row Row index of the cell
     * @param col Column index of the cell
     */
    public showInputOverCell(cell: Cell, row: number, col: number) {
        const x = this.columns.slice(0, col).reduce((sum, c) => sum + c.width, 0);
        const y = this.rows.slice(0, row).reduce((sum, r) => sum + r.height, 0);

        this.selectedCell = { row, col };

        const input = document.createElement("input");
        const virtualArea = document.querySelector(".virtual-canvas-area") as HTMLElement;

        input.type = "text";
        input.value = cell.text.toString();
        input.style.position = "absolute";
        input.style.left = `${(x + this.rowHeaderWidth) * dpr }px`;
        input.style.top = `${(y + this.colHeaderHeight) * dpr}px`;
        input.style.width = `${this.columns[col].width * dpr}px`;
        input.style.height = `${this.rows[row].height * dpr}px`;
        input.style.fontSize = "14px";
        input.style.zIndex = "1";
        virtualArea.style.overflow = "hidden";
        virtualArea.appendChild(input);
        input.focus();

        input.addEventListener("input", () => {

            this.formularBarInput.value = input.value;
        });

        input.addEventListener("blur", () => {
            let newValue = input.value;
            const cmd = new EditCellCommand(
                row,
                col,
                newValue,
                (r, c) => this.getCell(r, c),
                () => this.redrawVisible(this.container.scrollTop, this.container.scrollLeft)
            );
            this.commandManager.executeCommand(cmd);
            virtualArea.removeChild(input);
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
                input.blur();
            }
        });
    }


    /**
     * To redraw the visible part of the grid
     * @param scrollTop Current scroll top of the grid
     * @param scrollLeft Current scroll left of the grid
     */
    public redrawVisible(scrollTop: number, scrollLeft: number): void {

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

        // === Clip to scrollable canvas area
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.rowHeaderWidth, this.colHeaderHeight, this.canvas.width - this.rowHeaderWidth, this.canvas.height - this.colHeaderHeight);
        this.ctx.clip();

        this.drawCellContent(startRow, endRow, startCol, endCol, scrollTop, scrollLeft);
        this.drawGridLines(startRow, endRow, startCol, endCol, scrollTop, scrollLeft);

        // === Draw grid lines (after text)
        this.ctx.beginPath();

        this.ctx.restore();

        this.ctx.fillStyle = "#f0f0f0";

        this.ctx.fillRect(this.rowHeaderWidth, 0, this.canvas.width - this.rowHeaderWidth, this.colHeaderHeight);

        this.highlightSelectedArea(startRow, endRow, startCol, endCol, scrollTop, scrollLeft);
        this.drawColumnHeaders(startCol, endCol, scrollLeft);
        this.drawRowHeaders(startRow, endRow, scrollTop);


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
            this.getCell(row, col)?.updateText(newText);
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
        const padding = 4;

        let text = value;
        let metrics = this.ctx.measureText(text);

        while (metrics.width > width - 2 * padding && text.length > 0) {
            text = text.slice(0, -1);
            metrics = this.ctx.measureText(text + "…");
        }

        if (text.length < value.length) {
            text += "…"; // add ellipsis
        }

        this.ctx.fillText(text, x, y);
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
    private drawCellContent(startRow: number, endRow: number, startCol: number, endCol: number, scrollTop: number, scrollLeft: number) {
        // === Draw cell text only
        let y = this.rows.slice(0, startRow).reduce((sum, r) => sum + r.height, 0) - scrollTop;

        for (let row = startRow; row <= endRow; row++) {
            const rowHeight = this.rows[row].height;
            let x = this.columns.slice(0, startCol).reduce((sum, c) => sum + c.width, 0) - scrollLeft;

            for (let col = startCol; col <= endCol; col++) {
                const colWidth = this.columns[col].width;
                const cell = this.cells[row]?.[col];
                if (!cell) continue;

                const cellX = x + this.rowHeaderWidth;
                const cellY = y + this.colHeaderHeight;

                if (this.selectedRow === row || this.selectedCol === col) {
                    this.ctx.fillStyle = "#E8F2EC";
                    this.ctx.fillRect(cellX, cellY, colWidth, rowHeight);
                }

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
    private highlightSelectedArea(startRow: number, endRow: number, startCol: number, endCol: number, scrollTop: number, scrollLeft: number) {

        if (this.selectedArea.startRow === null || this.selectedArea.startCol === null || this.selectedArea.endRow === null || this.selectedArea.endCol === null) return;

        const startAreaRow = Math.min(this.selectedArea.startRow, this.selectedArea.endRow);
        const endAreaRow = Math.max(this.selectedArea.startRow, this.selectedArea.endRow);
        const startAreaCol = Math.min(this.selectedArea.startCol, this.selectedArea.endCol);
        const endAreaCol = Math.max(this.selectedArea.startCol, this.selectedArea.endCol);

        for (let row = startAreaRow; row <= endAreaRow; row++) {
            if (row < startRow || row > endRow) continue;

            const y = this.rows.slice(0, row).reduce((sum, r) => sum + r.height, 0) - scrollTop + this.colHeaderHeight;
            const rowHeight = this.rows[row].height;

            for (let col = startAreaCol; col <= endAreaCol; col++) {

                if (col < startCol || col > endCol) continue;

                const x = this.columns.slice(0, col).reduce((sum, c) => sum + c.width, 0) - scrollLeft + this.rowHeaderWidth;
                const colWidth = this.columns[col].width;

                // === Fill background
                this.ctx.fillStyle = "#E8F2EC";
                this.ctx.fillRect(x, y, colWidth, rowHeight);

                // === Draw cell text in black
                const cell = this.cells[row]?.[col];
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

    /**
     * To draw grid lines 
     * @param startRow Start row index of the visiable canvas
     * @param endRow end row index of the visiable canvas
     * @param startCol Start column index of the visiable canvas
     * @param endCol End column index of the visiable canvas
     * @param scrollTop Current scroll top of the grid
     * @param scrollLeft Current scroll left of the grid
     */

    private drawGridLines(startRow: number, endRow: number, startCol: number, endCol: number, scrollTop: number, scrollLeft: number) {
        // Horizontal lines
        let currentY = this.rows.slice(0, startRow).reduce((sum, r) => sum + r.height, 0) - scrollTop + this.colHeaderHeight;
        for (let row = startRow; row <= endRow + 1; row++) {
            const rowHeight = this.rows[row]?.height || 0;

            if (this.selectedRow === row || this.selectedRow === row - 1) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = "#137E43";
                this.ctx.lineWidth = 2;

                this.ctx.moveTo(this.rowHeaderWidth, currentY + 0.5);
                this.ctx.lineTo(Math.min(this.canvas.width, this.sheetWidth - scrollLeft), currentY + 0.5);


                this.ctx.stroke();

                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = "#ccc";
            } else {
                this.ctx.beginPath();
                this.ctx.strokeStyle = "#ccc";

                this.ctx.moveTo(this.rowHeaderWidth, currentY + 0.5);
                this.ctx.lineTo(Math.min(this.canvas.width, this.sheetWidth - scrollLeft), currentY + 0.5);
                this.ctx.stroke();
            }

            currentY += rowHeight;
        }

        // Vertical lines
        let currentX = this.columns.slice(0, startCol).reduce((sum, c) => sum + c.width, 0) - scrollLeft + this.rowHeaderWidth;
        for (let col = startCol; col <= endCol + 1; col++) {
            const colWidth = this.columns[col]?.width || 0;

            if (this.selectedCol === col || this.selectedCol === col - 1) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = "#137E43";
                this.ctx.lineWidth = 2;
                this.ctx.moveTo(currentX + 0.5, this.colHeaderHeight);
                this.ctx.lineTo(currentX - 1.5, Math.min(this.canvas.width, this.sheetHeight - scrollTop));
                this.ctx.stroke();
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = "#ccc";
            } else {
                this.ctx.beginPath();
                this.ctx.strokeStyle = "#ccc";
                this.ctx.moveTo(currentX + 0.5, this.colHeaderHeight);
                this.ctx.lineTo(currentX + 0.5, Math.min(this.canvas.width, this.sheetHeight - scrollTop));
                this.ctx.stroke();
            }

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
    private drawRowHeaders(startRow: number, endRow: number, scrollTop: number) {
        // === Draw row header background
        this.ctx.fillStyle = "#f0f0f0";
        this.ctx.fillRect(0, this.colHeaderHeight, this.rowHeaderWidth, this.canvas.height - this.colHeaderHeight);

        for (let row = startRow; row <= endRow; row++) {
            const y = this.colHeaderHeight + this.rows.slice(0, row).reduce((sum, r) => sum + r.height, 0) - scrollTop;
            const height = this.rows[row].height;

            const isSelectedRow = this.selectedRow === row;
            const isSelectedCellRow = this.selectedCell?.row === row;

            const isInSelectedArea =
                this.selectedArea?.startRow !== null &&
                this.selectedArea?.endRow !== null &&
                (
                    (this.selectedArea.startRow <= row && row <= this.selectedArea.endRow) ||
                    (this.selectedArea.endRow <= row && row <= this.selectedArea.startRow)
                );

            // === Fill background
            if (isSelectedCellRow || isInSelectedArea && !isSelectedRow) {
                this.ctx.fillStyle = "#CAEAD8";
            } else if (isSelectedRow) {
                this.ctx.fillStyle = "#137E43";
            } else {
                this.ctx.fillStyle = "#f0f0f0";
            }
            this.ctx.fillRect(0.5, y + 0.5, this.rowHeaderWidth, height);

            // === Border
            this.ctx.strokeStyle = isSelectedRow ? "#137E43" : "#ccc";
            this.ctx.lineWidth = isSelectedRow ? 2 : 1;
            this.ctx.strokeRect(0.5, y + 0.5, this.rowHeaderWidth, height);

            // === Right edge highlight if selected
            if (isSelectedCellRow || isInSelectedArea && !isSelectedRow) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = "#137E43";
                this.ctx.lineWidth = 2;
                this.ctx.moveTo(this.rowHeaderWidth + 0.5, y + 0.5);
                this.ctx.lineTo(this.rowHeaderWidth + 0.5, y + height + 0.5);
                this.ctx.stroke();
            }

            // === Draw row number
            this.ctx.fillStyle = isSelectedRow ? "white" : "black";
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
     * To draw column headers
     * @param startCol Start column index of the visiable canvas
     * @param endCol End column index of the visiable canvas
     * @param scrollLeft Current scroll left of the grid
     */
    private drawColumnHeaders(startCol: number, endCol: number, scrollLeft: number) {
        this.ctx.fillStyle = "black";
        for (let col = startCol; col <= endCol; col++) {
            const x = this.rowHeaderWidth + this.columns.slice(0, col).reduce((sum, c) => sum + c.width, 0) - scrollLeft;
            const width = this.columns[col].width;

            const isInSelectedArea =
                this.selectedArea?.startCol !== null &&
                this.selectedArea?.endCol !== null &&
                (
                    (this.selectedArea.startCol <= col && col <= this.selectedArea.endCol) ||
                    (this.selectedArea.endCol <= col && col <= this.selectedArea.startCol)
                );

            const isSelectedCellCol = this.selectedCell?.col === col;
            const isFullySelectedCol = this.selectedCol === col;

            // === Set background fill color
            if (isSelectedCellCol || isInSelectedArea && !isFullySelectedCol) {
                this.ctx.fillStyle = "#CAEAD8";
            } else if (isFullySelectedCol) {
                this.ctx.fillStyle = "#137E43";
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
            if (isSelectedCellCol || isInSelectedArea && !isFullySelectedCol) {
                this.ctx.strokeStyle = "#137E43";
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x + 0.5, this.colHeaderHeight + 0.5);
                this.ctx.lineTo(x + width + 0.5, this.colHeaderHeight + 0.5);
                this.ctx.stroke();
            }

            // === Draw column label text
            this.ctx.fillStyle = isFullySelectedCol ? "white" : "black";
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
    calculateAreaStatus() {

        const { startRow, endRow, startCol, endCol } = this.selectedArea;
        if (startRow === null || endRow === null || startCol === null || endCol === null) {

            // if (this.selectedCell?.row  && this.selectedCell.col) {
            //     console.log("this.selectedCell", this.selectedCell);

            //     const cell = this.cells[this.selectedCell.row]?.[this.selectedCell.col];
            //     console.log(cell);

            //     this.renderAreaStatus({
            //         count: 1,
            //         sum: isNaN(parseFloat(cell.text)) ? parseFloat(cell.text) : null,
            //         min: isNaN(parseFloat(cell.text)) ? parseFloat(cell.text) : null,
            //         max: isNaN(parseFloat(cell.text)) ? parseFloat(cell.text) : null,
            //         avg: isNaN(parseFloat(cell.text)) ? parseFloat(cell.text) : null
            //     });
            // }

            this.renderAreaStatus({ count: 0, sum: null, min: null, max: null, avg: null });
            return;
        }
        let numericValues: number[] = [];
        let totalCount = 0;

        for (let row = Math.min(startRow, endRow); row <= Math.max(startRow, endRow); row++) {
            for (let col = Math.min(startCol, endCol); col <= Math.max(startCol, endCol); col++) {
                const cell = this.cells[row]?.[col];
                if (!cell || cell.text.trim() === "") continue;

                totalCount++;

                const num = parseFloat(cell.text);
                if (!isNaN(num)) {
                    numericValues.push(num);
                }
            }
        }

        const count = totalCount;
        const numericCount = numericValues.length;
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const min = numericCount > 0 ? Math.min(...numericValues) : null;
        const max = numericCount > 0 ? Math.max(...numericValues) : null;
        const avg = numericCount > 0 ? sum / numericCount : null;

        this.renderAreaStatus({ count, sum, min, max, avg });
    }

    /**
     * To render selected area status like count, sum, min, max, avg in UI
     * @param stats Selected area status like count, sum, min, max, avg
     */
    private renderAreaStatus(stats: {
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
}

export { ExcelSheet };