import { Row } from "./row";
import { Column } from "./column";
import { Cell } from "./cell";
import { CommandManager } from "./Commands/CommandManger";
import { jsonData, headers } from "./jsonData";
import { EditCellCommand } from "./Commands/EditCommandCell";

const rowHeaderWidth = 50 as number;
const colHeaderHeight = 30 as number;

class ExcelSheet {

    private rows: Row[] = [];
    private columns: Column[] = [];
    private cells: Cell[][] = [];
    private sheetWidth: number = 0;
    private sheetHeight: number = 0;
    private isResizing: boolean = false;
    private resizeTarget: { type: "column" | "row", index: number } | null = null;
    private resizeStartPos: { x: number, y: number } = { x: 0, y: 0 };
    private selectedCell: { row: number; col: number } | null = null;
    private commandManager: CommandManager;
    private selectedRow: number | null = null;
    private selectedCol: number | null = null;
    private selectedArea : { startRow: number, startCol: number, endRow: number, endCol: number } = { startRow: 0, startCol: 0, endRow: 0, endCol: 0 };

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
    constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement, public container: HTMLElement) {
        this.generateSheet(jsonData.length + 1, 500, 30, 80, 0.5, "black");
        this.attachEventListners();
        this.selectedCell = { row: 0, col: 0 };
        this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);

        this.container.addEventListener("scroll", () => {
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        });

        this.commandManager = new CommandManager();
    }

    private generateSheet(
        numberOfRows: number = 1000,
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
        this.sheetWidth = rowHeaderWidth + (numberOfColumns * cellWidth);
        this.sheetHeight = colHeaderHeight + (numberOfRows * cellHeight);

        virtualArea.style.width = `${this.sheetWidth + 80}px`;
        virtualArea.style.height = `${this.sheetHeight + 80}px`;

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
            const rowCells: Cell[] = [];

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

    private getColIndexFromX(x: number): number {
        let pos = 0;
        for (let i = 0; i < this.columns.length; i++) {
            pos += this.columns[i].width;
            if (x < pos) return i;
        }
        return (this.columns.length - 1);
    }

    private getRowIndexFromY(y: number): number {

        let pos = 0;

        for (let i = 0; i < this.rows.length; i++) {
            pos += this.rows[i].height;
            if (y < pos) return i;
        }
        return (this.rows.length - 1);
    }


    private attachEventListners(): void {
        this.container.addEventListener("dblclick", (e: MouseEvent) => {
            const rect = this.canvas.getBoundingClientRect();
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

        this.container.addEventListener("mousemove", (e: MouseEvent) => {
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
                } else if (withinRowResizeZone) {
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
                const x = e.clientX - rect.left + this.container.scrollLeft - rowHeaderWidth;
                const y = e.clientY - rect.top + this.container.scrollTop - colHeaderHeight;

                if(x<0 && y>0){
                    const row = this.getRowIndexFromY(y);
                    this.selectedRow = row;
                    this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
                    console.log(row , " : slected row");
                    
                    return; 
                }

                if(y<0 && x>0){
                    const col = this.getColIndexFromX(x);
                    this.selectedCol = col;
                    this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
                    console.log(col , " : slected col");
                    
                    return; 

                }

                const row = this.getRowIndexFromY(y);
                const col = this.getColIndexFromX(x);

                if (row >= 0 && col >= 0 && row < this.rows.length && col < this.columns.length) {
                    this.selectedCell = { row, col };
                    this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
                }
                return;
            };

            this.isResizing = true;
            this.resizeStartPos = { x: e.clientX, y: e.clientY };

            this.resizeTarget = { ...this.resizeTarget };
        });

        window.addEventListener("mousemove", (e: MouseEvent) => {

            if (!this.isResizing || !this.resizeTarget) return;

            const deltaX = e.clientX - this.resizeStartPos.x;
            const deltaY = e.clientY - this.resizeStartPos.y;

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

        window.addEventListener("mouseup", () => {
            this.isResizing = false;
            this.resizeTarget = null;
        });

        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if (!this.selectedCell) {
                this.selectedCell = { row: 0, col: 0 };
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
            // this.scrollIntoView(newRow, newCol);  // optional
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
            this.canvas.width = this.container.clientWidth - 40;
            this.canvas.height = this.container.clientHeight - 40;
            this.canvas.style.width = this.canvas.width + "px";
            this.canvas.style.height = this.canvas.height + "px";
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        })
    }


    public getCell(row: number, col: number): Cell | null {
        if (this.cells[row] && this.cells[row][col]) {
            return this.cells[row][col];
        }
        return null;
    }


    public showInputOverCell(cell: Cell, row: number, col: number) {
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
            const cmd = new EditCellCommand(this, row, col, input.value);
            this.commandManager.executeCommand(cmd);

            document.body.removeChild(input);
            this.redrawVisible(this.container.scrollTop, this.container.scrollLeft);
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
                input.blur();
            }
        });
    }


    public redrawVisible(scrollTop: number, scrollLeft: number): void {
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
                const cell = this.cells[row]?.[col];
                if (!cell) continue;

                const x = this.columns.slice(0, col).reduce((sum, c) => sum + c.width, 0) - scrollLeft;
                const y = this.rows.slice(0, row).reduce((sum, r) => sum + r.height, 0) - scrollTop;

                this.ctx.strokeStyle = "#ccc";
                this.ctx.strokeRect(x + rowHeaderWidth, y + colHeaderHeight, this.columns[col].width, this.rows[row].height);
                this.ctx.fillStyle = "black";
                // this.ctx.fillText(
                //     cell.text,
                //     x + rowHeaderWidth + this.columns[col].width / 2,
                //     y + colHeaderHeight + this.rows[row].height / 2
                // );

                this.renderText(cell.text,
                    x + rowHeaderWidth + this.columns[col].width / 2,
                    y + colHeaderHeight + this.rows[row].height / 2, this.columns[col].width, this.rows[row].height);

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
            if (this.selectedCell?.col === col) {
                this.ctx.fillStyle = "#d0e4ff";
                this.ctx.fillRect(x, 0, width, colHeaderHeight);
            }

            this.ctx.fillStyle = "#f0f0f0";
            this.ctx.strokeStyle = "#ccc";
            this.ctx.strokeRect(x, 0, width, colHeaderHeight);
            this.ctx.fillStyle = "black";
            this.ctx.strokeStyle = "black";
            this.ctx.fillText(
                this.columns[col].label,
                x + width / 2,
                colHeaderHeight / 2
            );
        }

        this.ctx.fillStyle = "#f0f0f0";
        this.ctx.fillRect(0, colHeaderHeight, rowHeaderWidth, this.canvas.height - colHeaderHeight);
        for (let row = startRow; row <= endRow; row++) {
            const y = colHeaderHeight + this.rows.slice(0, row).reduce((sum, r) => sum + r.height, 0) - scrollTop;
            const height = this.rows[row].height;

            if (this.selectedCell?.row === row) {
                this.ctx.fillStyle = "#d0e4ff";
                this.ctx.fillRect(0, y, rowHeaderWidth, height);
            }

            this.ctx.fillStyle = "#f0f0f0";
            this.ctx.strokeStyle = "#ccc";
            this.ctx.strokeRect(0, y, rowHeaderWidth, height);
            this.ctx.fillStyle = "black";
            this.ctx.strokeStyle = "black";
            this.ctx.fillText(
                (row + 1).toString(),
                rowHeaderWidth / 2,
                y + height / 2
            );
        }

        // updateInput();
    }

   
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

}

export { ExcelSheet };