// utils/a1Utils.ts
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
