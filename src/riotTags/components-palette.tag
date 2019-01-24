components-palette
    div.aBlockCategory(
        each="{category in blocks}"
        if="{category.paletteCount}"
        onclick="{selectCategory}"
        class="{hover: selectedCategory === category}"
    )
        h3
            icon(icon="{category.set}")
            span  {category.name}
        div(if="{selectedCategory === category}")
            div.aBlock(
                each="{block, blockName in category.blocks}"
                if="{!block.isSingular && !block.noPalette}"
                onclick="{addBlock}"
                class="{block.set}"
            )
                h3
                    span {block.name}
    script.
        this.filter = this.opts.filter;
        this.on('update', () => {
            if (this.filter !== this.opts.filter) {
                this.filter = this.opts.filter;
            }
        });
        this.blocks = require('./js/blocks.js')
        this.addBlock = e => {
            this.filter.addBlock(e.item.blockName, (Math.round(-this.filter.view.x / 20) * 20), Math.round(-this.filter.view.y / 20) * 20);
            window.signals.trigger('graphChange', e);
        };
        this.selectCategory = e => {
            if (this.selectedCategory !== e.item.category) {
                this.selectedCategory = e.item.category;
            } else {
                this.selectedCategory = void 0;
            }
        };