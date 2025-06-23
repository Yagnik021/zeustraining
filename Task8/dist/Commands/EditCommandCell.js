export class EditCellCommand {
    constructor(grid, row, col, newValue) {
        var _a;
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.newValue = newValue;
        this.oldValue = ((_a = this.grid.getCell(row, col)) === null || _a === void 0 ? void 0 : _a.value) || "";
    }
    execute() {
        this.grid.getCell(this.row, this.col).value = this.newValue;
        this.grid.redrawVisible(this.grid.container.scrollTop, this.grid.container.scrollLeft);
    }
    undo() {
        this.grid.getCell(this.row, this.col).value = this.oldValue;
        this.grid.redrawVisible(this.grid.container.scrollTop, this.grid.container.scrollLeft);
    }
}
