type ScrollDirection = "horizontal" | "vertical" | "both";

/**
 * AutoScroller class
 * @member intervalId - The ID of the interval used for automatic scrolling.
 */
export class AutoScroller {
    private intervalId: number | null = null;

    /**
     * Constructor for the AutoScroller class.
     * @param {HTMLElement} container - The container element to scroll.
     * @param {Function} onScroll - The function to call when scrolling occurs.
     * @param {ScrollDirection} direction - The direction to scroll in.
     * @param {number} scrollStep - The step size for scrolling.
     * @param {number} buffer - The buffer size for scrolling.
     * @returns {void}
     */
    constructor(
        private container: HTMLElement,
        private onScroll: (e : MouseEvent) => void,
        private direction: ScrollDirection = "both",
        private scrollStep: number = 16,
        private buffer: number = 20
    ) {}

    /**
     * To start the automatic scrolling.
     * @param e - Mouse event 
     */
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

    /**
     * To stop the automatic scrolling.
     */
    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
