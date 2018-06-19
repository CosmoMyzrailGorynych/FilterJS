bool-input
    input(type="checkbox" ref="input" onchange="{onChange}" checked="{parent.block.tagValues[editedKey]}")
    span(if="{opts.label}") {opts.label}
    script.
        this.editedKey = this.opts.key || 'value';
        this.onChange = e => {
            this.parent.block.tagValues[this.editedKey] = e.target.checked;
        };