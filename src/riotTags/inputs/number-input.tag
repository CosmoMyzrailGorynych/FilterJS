number-input
    input(type="number" step="0.1" ref="input" onchange="{onChange}" value="{parent.block.tagValues[editedKey]}")
    script.
        this.editedKey = this.opts.key || 'value';
        this.onChange = e => {
            this.parent.block.tagValues[this.editedKey] = Number(e.target.value) || 0;
        };