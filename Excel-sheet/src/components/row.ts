/**
 * Represents a row in the Excel sheet.
 */
class Row {
    height: number;
    index: number;

    /**
     * @param height - Height of the row in pixels (defaults to 100)
     * @param index - Index of the row in the sheet
     */
    constructor(height: number = 100, index: number) {
        this.height = height;
        this.index = index;
    }
}

export { Row };
