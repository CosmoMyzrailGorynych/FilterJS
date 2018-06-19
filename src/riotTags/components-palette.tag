components-palette
    div.aBlock(
        each="{block, blockName in blocks}"
        if="{!block.isSingular && !block.noPalette}"
        onclick="{addBlock}"
        class="{block.set}"
    )
        h3 
            icon(icon="{block.set}")
            span {block.name}
    script.
        this.filter = this.opts.filter;
        this.blocks = require('./js/blocks.js')
        this.addBlock = e => {
            this.filter.addBlock(e.item.blockName, (Math.round(-this.filter.view.x / 20) * 20), Math.round(-this.filter.view.y / 20) * 20);
            window.signals.trigger('graphChange', e);
        };