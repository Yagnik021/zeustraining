const canvas = document.getElementById("drawingCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

let startPoint: { x: number; y: number } | null = null;

canvas.addEventListener("click", (e: MouseEvent) => {
    // const rect = canvas.getBoundingClientRect();

    // console.log(rect);
    
    // const x = e.clientX - rect.left;
    // const y = e.clientY - rect.top;
    const x = e.clientX;
    const y = e.clientY;

    if (!startPoint) {
        // First click – store start point
        startPoint = { x, y };
        console.log(startPoint);
    } else {
        // Second click – draw line
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        console.log(startPoint , " : TO ", { x, y }); 
        
        console.log("line drawn");
        
        startPoint = null; // Reset for next line
    }
});
