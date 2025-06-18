class ManagerClass {
    element: HTMLDivElement;
    outerDivs: OuterDiv[] = [];

    constructor(count: number = 1) {
        this.element = document.createElement("div");
        this.element.id = "manager";
        this.element.className = "manager";

        Object.assign(this.element.style, {
            height: "100vh",
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
            gap: "10px",
        });

        document.body.appendChild(this.element);

        this.createOuterDivs(count);
    }

    createOuterDivs(count: number) {
        const lightColors = [
            "#FFEBEE",
            "#FFF8E1",
            "#E8F5E9",
            "#E3F2FD",
            "#F3E5F5",
            "#FBE9E7",
            "#E0F7FA",
            "#F9FBE7",
        ];

        for (let i = 0; i < count; i++) {
            const color = lightColors[i % lightColors.length];
            const outer = new OuterDiv(color);
            this.outerDivs.push(outer);
            this.element.appendChild(outer.element);

            const draggable = new innerDiv(outer, "lightBlue", "0px", "0px");
            const draggable2 = new innerDiv(outer, "lime", "100px", "0px");
            const draggable3 = new innerDiv(outer, "cyan", "0px", "100px");
            new ScreenSizeWatcher(draggable);
            new ScreenSizeWatcher(draggable2);
            new ScreenSizeWatcher(draggable3);
        }
    }
}


class OuterDiv {

    element: HTMLDivElement;
    constructor(backgroundColor: string = "#fae321") {
        this.element = document.createElement("div");
        this.element.setAttribute("id", "outerDiv");
        this.element.setAttribute("class", "outerDiv");

        Object.assign(this.element.style, {
            height: "300px",
            border: "1px solid black",
            backgroundColor: backgroundColor,
            overflow: "hidden",
            position: "relative",
        });

        document.body.appendChild(this.element);
    }

    addChild(child: HTMLDivElement) {
        this.element.appendChild(child);
    }

    getBounds() {
        return {
            left: this.element.offsetLeft,
            top: this.element.offsetTop,
            width: this.element.offsetWidth,
            height: this.element.offsetHeight
        };
    }
};

class innerDiv {
    element: HTMLDivElement;

    isDragging: boolean = false;
    offsetX: number = 0;
    offsetY: number = 0;

    parent: OuterDiv;
    constructor(parent: OuterDiv, color: string | null = "red", top: string | null = "0px", left: string | null = "0px") {
        this.element = document.createElement("div");
        this.element.setAttribute("id", "innerDiv");
        this.element.setAttribute("class", "innerDiv");

        Object.assign(this.element.style, {
            width: "50px",
            height: "50px",
            background: color,
            cursor: "grab",
            position: "absolute",
            left: left,
            top: top,
            touchAction: "none",
            zIndex: "2",
        });

        this.parent = parent;
        this.addPointerEvents();
        this.parent.addChild(this.element);
    }


    addPointerEvents() {
        this.element.addEventListener("pointerdown", (e) => {
            this.isDragging = true;
            this.element.style.cursor = "grabbing";
            // this.offsetX = e.clientX - this.element.offsetLeft;
            // this.offsetY = e.clientY - this.element.offsetTop;

            const rect = this.element.getBoundingClientRect();
            this.offsetX = e.clientX - rect.left;
            this.offsetY = e.clientY - rect.top;
            console.log(this.element.offsetLeft);

            console.log('Something : ', e.clientX, this.element.offsetLeft, this.offsetX);


            this.element.setPointerCapture(e.pointerId);
        });

        this.parent.element.addEventListener("pointermove", (e) => {
            if (this.isDragging) {
                const bounds = this.parent.getBounds();

                console.log(bounds);

                let newLeft = e.clientX - bounds.left - this.offsetX;
                let newTop = e.clientY - bounds.top - this.offsetY;
                console.log(e.clientX, bounds.left, this.offsetX);
                console.log(e.clientY, bounds.top, this.offsetY);
                console.log(newLeft, newTop);

                newLeft = Math.max(0, Math.min(bounds.width - 50, newLeft));
                newTop = Math.max(0, Math.min(bounds.height - 50, newTop));

                this.element.style.left = `${newLeft}px`;
                this.element.style.top = `${newTop}px`;
            }
        });

        this.parent.element.addEventListener("pointerleave", () => {
            this.isDragging = false;
            this.element.style.cursor = "grab";
        });

        this.element.addEventListener("pointerup", () => {
            this.isDragging = false;
            this.element.style.cursor = "grab";
        });
    }
}

class ScreenSizeWatcher {
    child: innerDiv;

    constructor(child: innerDiv) {
        this.child = child;
        window.addEventListener("resize", this.onResize);
        this.onResize();
    }

    onResize = () => {
        const childEl = this.child.element;
        const parentBounds = this.child.parent.getBounds();

        const currentLeft = parseFloat(childEl.style.left || "0");
        const currentTop = parseFloat(childEl.style.top || "0");
        const width = childEl.offsetWidth;
        const height = childEl.offsetHeight;

        let newLeft = currentLeft;
        let newTop = currentTop;

        if (currentLeft + width > parentBounds.width) {
            newLeft = parentBounds.width - width;
        }

        if (currentTop + height > parentBounds.height) {
            newTop = parentBounds.height - height;
        }

        childEl.style.left = `${Math.max(0, newLeft)}px`;
        
        childEl.style.top = `${Math.max(0, newTop)}px`;
    };
}

const manager = new ManagerClass(12);