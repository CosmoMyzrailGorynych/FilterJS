select-input
    select(ref="input" onchange="{onChange}" value="{option}")
        option(each="{option in opts.options}" selected="{option === parent.parent.block.tagValues[editedKey]}" value="{option}") {option}
    script.
        this.editedKey = this.opts.key || 'value';
        this.onChange = e => {
            this.parent.block.tagValues[this.editedKey] = e.target.value;
        };
        