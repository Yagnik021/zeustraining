/**
 * Utility function to convert A1 notation to row and column indexes
 * @param a1 Notation to convert
 * @returns Row and column indexes in an object
 */
export function a1ToIndexes(a1: string): { row: number, col: number } {
    const match = a1.match(/^([A-Z]+)(\d+)$/i);
    if (!match) throw new Error(`Invalid cell reference: ${a1}`);

    const [, letters, rowStr] = match;
    const col = letters
        .toUpperCase()
        .split("")
        .reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0) - 1;

    const row = parseInt(rowStr, 10) - 1;
    return { row, col };
}

/**
 * To convert row and column indexes to A1 notation
 * @param row Row index to convert
 * @param col Column index to convert
 * @returns Cell reference in A1 notation
 */
export function indexesToA1(row: number, col: number): string {
    let colStr = "";
    col += 1;

    while (col > 0) {
        const rem = (col - 1) % 26;
        colStr = String.fromCharCode(65 + rem) + colStr;
        col = Math.floor((col - 1) / 26);
    }

    return `${colStr}${row + 1}`;
}
