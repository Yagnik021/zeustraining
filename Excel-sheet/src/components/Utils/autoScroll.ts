type ScrollDirection = "horizontal" | "vertical" | "both";

export class AutoScroller {
    private intervalId: number | null = null;

    constructor(
        private container: HTMLElement,
        private onScroll: (e : MouseEvent) => void,
        private direction: ScrollDirection = "both",
        private scrollStep: number = 16,
        private buffer: number = 20
    ) {}

    start(e: MouseEvent) {
        this.stop(); // Clear any existing interval

        this.intervalId = window.setInterval(() => {
            const rect = this.container.getBoundingClientRect();
            let scrolled = false;

            if (this.direction === "vertical" || this.direction === "both") {
                if (e.clientY < rect.top + this.buffer) {
                    this.container.scrollTop -= this.scrollStep;
                    scrolled = true;
                } else if (e.clientY > rect.bottom - this.buffer) {
                    this.container.scrollTop += this.scrollStep;
                    scrolled = true;
                }
            }

            if (this.direction === "horizontal" || this.direction === "both") {
                if (e.clientX < rect.left + this.buffer) {
                    this.container.scrollLeft -= this.scrollStep;
                    scrolled = true;
                } else if (e.clientX > rect.right - this.buffer) {
                    this.container.scrollLeft += this.scrollStep;
                    scrolled = true;
                }
            }

            if (scrolled) this.onScroll(e);
        }, 30);
    }

    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
