number-input
    input(type="text" ref="input" onchange="{onChange}" value="{parent.block.tagValues[editedKey]}")
    script.
        this.editedKey = this.opts.key || 'value';
        this.onChange = e => {
            this.parent.block.tagValues[this.editedKey] = Number(e.target.value) || 0;
        };