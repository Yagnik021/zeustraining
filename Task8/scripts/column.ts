/**
 * Represents a column in the Excel sheet.
 * @element {number} width - The width of the column in pixels.
 */
class Column {
    width: number;
    label: string;
    /**
     * @param index Index of the column in the Excel sheet (0-indexed)
     * @param width width of the column in pixels
     */
    constructor(index: number, width: number = 100) {
        this.width = width;
        this.label = Column.generateLabel(index);
    }


    private static generateLabel(index: number): string {
        let label = "";
        let i = index;
        while (i >= 0) {
            label = String.fromCharCode((i % 26) + 65) + label;
            i = Math.floor(i / 26) - 1;
        }
        return label;
    }
}

export { Column };