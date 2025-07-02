import { ExcelSheet } from "./components/Excellsheet";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const container = document.querySelector(".container") as HTMLElement;

if (canvas === null) throw new Error("Canvas not found");

const formularBarInput = document.querySelector(".formular-bar-input") as HTMLInputElement;


const sheet = new ExcelSheet(canvas, container, formularBarInput);

function setupActionButtons() {
    const addRowBtn = document.getElementById("add-row");
    const addColBtn = document.getElementById("add-column");

    addRowBtn?.addEventListener("click", () => {
        const index = sheet.selectedCell?.row ?? sheet.selectedRows.startRow;
        if (index != null) {
            sheet.addRow(index);
            sheet.redrawVisible(sheet.container.scrollTop, sheet.container.scrollLeft);
        }
    });

    addColBtn?.addEventListener("click", () => {
        const index = sheet.selectedCell?.col ?? sheet.selectedCols.startCol;
        if (index != null) {
            sheet.addColumn(index);
            sheet.redrawVisible(sheet.container.scrollTop, sheet.container.scrollLeft);
        }
    });
}

setupActionButtons();