graph-editor(style="background-position: {this.view.x + this.width/2}px {this.view.y + this.height/2}px;")
    canvas#theLinksCanvas(
        ref="linkCanvas" 
        width="{width}" height="{height}" 
        onmousedown="{startDragging}" 
        onclick="{unselectAll}"
        style="opacity: {drawingLink? 0.35 : 1}"
    )
    canvas#thePreviewCanvas(
        ref="previewCanvas"
        width="{width}" height="{height}"
        onmousemove="{drawPreview}"
        show="{drawingLink}"
    )
    .Blocks
        regular-block(each="{block in blocks}" block="{block}")
    error-label(if="{error}" error="{error}")
    .aCoordLabel {view.x}; {view.y}
    script.
        this.blocks = this.opts.graph;
        this.view = this.opts.view;
        this.on('update', () => {
            if (this.blocks !== this.opts.graph) {
                this.blocks = this.opts.graph;
                this.error = false;
            }
            if (this.view !== this.opts.view) {
                this.view = this.opts.view;
            }
            if (this.error !== this.opts.error) {
                this.error = this.opts.error;
                if (this.error) {
                    this.view.x = -this.error.block.x - 80;
                    this.view.y = -this.error.block.y - 100;
                    this.updateLinks();
                }
            }
        });
        var cx, cpx;
        const palette = require('./js/palette.js');

        const glob = require('./js/global.js');
        this.drawingLink = false;
        window.signals.on('mouseup', e => {
            if (this.drawingLink) {
                this.drawingLink = false;
                glob.drawnLink = {};
                cpx.clearRect(0, 0, this.width, this.height);
                this.update();
            }
        });
        this.drawPreview = e => {
            var shiftX = e.screenX - e.layerX;
            var shiftY = e.screenY - e.layerY;
            cpx.clearRect(0, 0, this.width, this.height);

            cpx.save();
            cpx.translate(-shiftX, -shiftY);

            cpx.strokeStyle = palette[glob.drawnLink.type] || 'white';
            cpx.beginPath();
            cpx.moveTo(e.screenX, e.screenY);
            cpx.bezierCurveTo((glob.drawnLink.fromX*2+e.screenX)/3, e.screenY, (e.screenX*2+glob.drawnLink.fromX)/3, glob.drawnLink.fromY, glob.drawnLink.fromX, glob.drawnLink.fromY);
            cpx.stroke();

            cpx.restore();
        };

        window.addEventListener('resize', () => {
            this.updateBounds();
            this.update();
            if (cx) {
                cx.lineWidth = 2;
                cx.lineCap = 'round';
                cpx.lineWidth = 2;
                cpx.lineCap = 'round';
                this.updateLinks();
            }
        });

        this.keyListener = e => {
            console.log(e);
            if ((e.key === 'Backspace' || e.key === 'Delete') && glob.selectedBlocks.length) {
                var blockTagMap = glob.selectedBlocks.map(tag => tag.block);
                // firstly, delete all the blocks from the graph
                for (let block of blockTagMap) {
                    if (block.template.isSingular) {
                        continue;
                    }
                    this.blocks.splice(this.blocks.indexOf(block), 1);
                }
                // next, remove all the input links in the graph leading to deleted blocks
                for (let block of this.blocks) {
                    let i = 0;
                    while (i < block.inputLinks.length) {
                        if (blockTagMap.indexOf(block.inputLinks[i].outBlock) !== -1) {
                            block.inputLinks.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                }
                // deselect any possible blocks (e.g. singulars)
                glob.selectedBlocks.length = 0;
                this.updateLinks();
                this.update();
            }
        };
        window.addEventListener('keydown', this.keyListener);
        this.on('unmount', () => {
            window.removeEventListener('keydown', this.keyListener);
        });
        
        this.updateLinks = () => {
            cx.clearRect(0, 0, this.width, this.height);
            for (var block of this.blocks) {
                for (var link of block.inputLinks) {
                    var b1 = block,
                        b2 = link.outBlock;
                    var i1 = b1.template.inputs.findIndex(input => input.key === link.inputKey),
                        i2 = b2.template.outputs.findIndex(input => input.key === link.outKey);
                    var iY = (i1 + 0.5) * 40 + 42 + b1.y + this.view.y + this.height/2,
                        iX = b1.x + this.view.x + this.width/2,
                        oY = (i2 + 0.5) * 40 + 42 + b2.y + this.view.y + this.height/2,
                        oX = b2.x + b2.tag.root.getBoundingClientRect().width + this.view.x + this.width/2;
                    cx.strokeStyle = palette[block.template.inputs[i1].type] || 'white';
                    cx.beginPath();
                    cx.moveTo(iX, iY);
                    cx.bezierCurveTo((oX*2+iX)/3, iY, (iX*2+oX)/3, oY, oX, oY);
                    cx.stroke();
                }
            }
        };

        this.updateBounds = () => {
            var bounds = this.root.getBoundingClientRect();
            this.width = bounds.width;
            this.height = bounds.height;
        };

        this.on('mount', () => {
            setTimeout(() => {
                this.updateBounds();
                this.update();
                cx = this.refs.linkCanvas.getContext('2d');
                cx.lineWidth = 2;
                cx.lineCap = 'round';
                cpx = this.refs.previewCanvas.getContext('2d');
                cpx.lineWidth = 2;
                cpx.lineCap = 'round';
                this.updateLinks();
            }, 0);
        });

        this.mouseMoveListener = e => {
            this.view.x = this.initialX + e.screenX - this.startX;
            this.view.y = this.initialY + e.screenY - this.startY;
            this.updateLinks();
            this.update();
        };
        this.mouseUpListener = e => {
            document.removeEventListener('mousemove', this.mouseMoveListener);
            document.removeEventListener('mouseup', this.mouseUpListener);
            this.updateLinks();
            this.update();
        };

        this.startDragging = e => {
            this.startX = e.screenX;
            this.startY = e.screenY;
            this.initialX = this.view.x;
            this.initialY = this.view.y;

            document.addEventListener('mousemove', this.mouseMoveListener);
            document.addEventListener('mouseup', this.mouseUpListener);
            
            e.preventDefault();
        };

        window.signals.on('graphChange', () => {
            this.update();
        });

        this.unselectAll = e => {
            if (glob.selectedBlocks.length) {
                glob.selectedBlocks.length = 0;
                this.update();
            }
        };