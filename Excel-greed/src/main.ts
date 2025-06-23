import { ExcelSheet } from "./components/excellsheet";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const container = document.querySelector(".container") as HTMLElement;

if (canvas === null) throw new Error("Canvas not found");

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const sheet = new ExcelSheet(ctx, canvas, container);

