var canvas = document.getElementById("drawingCanvas");
var ctx = canvas.getContext("2d");
var startPoint = null;
canvas.addEventListener("click", function (e) {
    var rect = canvas.getBoundingClientRect();
    console.log(rect);
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    // const x = e.clientX;
    // const y = e.clientY;
    if (!startPoint) {
        // First click – store start point
        startPoint = { x: x, y: y };
        console.log(startPoint);
    }
    else {
        // Second click – draw line
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        console.log(startPoint, " : TO ", { x: x, y: y });
        console.log("line drawn");
        startPoint = null; // Reset for next line
    }
});
