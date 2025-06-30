/**
 * Represents a cell in the Excel sheet.
 * @param {string} text - The text content of the cell.
 * @param {number} rowIndex - The row index of the cell.
 * @param {number} colIndex - The column index of the cell.
 */
class Cell {
    text: string;
    // rowIndex: number;
    // colIndex: number;


    /**
     * Constructs a new instance of the Cell class.
     * @param {string} text - The text content of the cell.
     * @param {number} rowIndex - The row index of the cell.
     * @param {number} colIndex - The column index of the cell.
     */
    constructor(text: string = "", rowIndex: number, colIndex: number) {
        this.text = text;
        // this.rowIndex = rowIndex;
        // this.colIndex = colIndex;
    }

    /**
     * This method updates the text content of the cell.
     * @param newText New text to update the cell with.
     */
    updateText(newText?: string | null) {
        if (newText) {
            this.text = newText;
        } else {
            this.text = "";
        }
    }
}

export { Cell };