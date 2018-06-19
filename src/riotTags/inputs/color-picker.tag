color-picker
    input(type="color" ref="input" onchange="{onChange}" value="{parent.block.tagValues[editedKey]}")
    script.
        this.editedKey = this.opts.key || 'value';
        this.onChange = e => {
            this.parent.block.tagValues[this.editedKey] = e.target.value;
        };