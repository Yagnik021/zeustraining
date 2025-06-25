import { ExcelSheet } from "./components/Excellsheet";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const container = document.querySelector(".container") as HTMLElement;

if (canvas === null) throw new Error("Canvas not found");

const formularBarInput = document.querySelector(".formular-bar-input") as HTMLInputElement;


const sheet = new ExcelSheet(canvas, container, formularBarInput);

