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
        let min = sheet.rows.length;
        for (var i = 0; i < sheet.selectedRows.length; i++) {
            if (sheet.selectedRows[i] < min) {
                min = sheet.selectedRows[i];
            };
        }
        if (min != null) {
            sheet.addRow(min);
            sheet.redrawVisible(sheet.container.scrollTop, sheet.container.scrollLeft);
        }
    });

    addColBtn?.addEventListener("click", () => {
        let min = sheet.columns.length;
        for (var i = 0; i < sheet.selectedCols.length; i++) {
            if (sheet.selectedCols[i] < min) {
                min = sheet.selectedCols[i];
            };
        }
        if (min != null) {
            sheet.addColumn(min);
            sheet.redrawVisible(sheet.container.scrollTop, sheet.container.scrollLeft);
        }
    });
}

setupActionButtons();