export class EditCellCommand {
    constructor(grid, row, col, newValue) {
        var _a;
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.newValue = newValue;
        this.oldValue = ((_a = this.grid.getCell(row, col)) === null || _a === void 0 ? void 0 : _a.text) || "";
        console.log(this.grid.getCell(row, col), " : EditCell");
    }
    execute() {
        var _a, _b, _c;
        (_a = this.grid.getCell(this.row, this.col)) === null || _a === void 0 ? void 0 : _a.updateText(this.newValue);
        this.grid.redrawVisible((_c = (_b = this.grid) === null || _b === void 0 ? void 0 : _b.container) === null || _c === void 0 ? void 0 : _c.scrollTop, this.grid.container.scrollLeft);
    }
    undo() {
        var _a;
        (_a = this.grid.getCell(this.row, this.col)) === null || _a === void 0 ? void 0 : _a.updateText(this.oldValue);
        this.grid.redrawVisible(this.grid.container.scrollTop, this.grid.container.scrollLeft);
    }
}
