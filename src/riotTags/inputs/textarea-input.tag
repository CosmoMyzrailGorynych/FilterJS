textarea-input
    textarea(
        ref="input"
        onmouseup="{saveWidth}"
        onchange="{onChange}"
        onkeydown="{preventBubbling}"
        value="{parent.block.tagValues[editedKey]}"
        style="width: {parent.block.tagValues[editedKey + '@width']}; height: {parent.block.tagValues[editedKey + '@height']};"
    )
    script.
        this.editedKey = this.opts.key || 'value';
        this.onChange = e => {
            e.stopPropagation();
            this.parent.block.tagValues[this.editedKey] = e.target.value;
        };
        this.saveWidth = e => {
            this.parent.block.tagValues[this.editedKey + '@width'] = e.target.style.width;
            this.parent.block.tagValues[this.editedKey + '@height'] = e.target.style.height;
        };
        this.preventBubbling = e => e.stopPropagation();