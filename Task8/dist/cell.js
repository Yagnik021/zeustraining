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
export { Cell };
