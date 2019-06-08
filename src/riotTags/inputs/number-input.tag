number-input
    input(type="number" step="0.1" ref="input" onchange="{onChange}" onkeydown="{preventBubbling}" value="{parent.block.tagValues[editedKey]}")
    script.
        this.editedKey = this.opts.key || 'value';
        this.onChange = e => {
            e.stopPropagation();
            this.parent.block.tagValues[this.editedKey] = Number(e.target.value) || 0;
        };
        this.preventBubbling = e => e.stopPropagation();