error-label(style="left: {err.block.x + parent.view.x + parent.width/2}px; bottom: {-err.block.y - parent.view.y + parent.height/2}px")
    span {opts.error.message}
    script.
        this.err = this.opts.error;
        this.on('update', () => {
            if (this.opts.error !== this.err) {
                this.err = this.opts.error;
            }
        })