regular-block(
    style="left: {block.x + parent.view.x + parent.width/2}px; top: {block.y + parent.view.y + parent.height/2}px"
    onclick="{selectBlock}"
    class="{active: glob.selectedBlocks.indexOf(this) !== -1} {block.template.set}"
)
    h3(onmousedown="{startDragging}" title="{block.template.hint}") {block.template.name}
    .flexwrap
        .fifty
            div.anInputPin(
                each="{input in block.template.inputs}" 
                onmousedown="{tryStartInputPin}" 
                onmouseup="{tryConnectInputPin}"
                class="{input.type} {optional: input.optional}"
                title="{input.hint}"
                data-key="{input.key}" data-type="{input.type}"
            )
                span 
                    | {input.name}   
                    icon(icon="hint" if="{input.hint}")
        .fifty
            div.anOutputPin(
                each="{output in block.template.outputs}"
                onmousedown="{tryStartOutputPin}"
                onmouseup="{tryConnectOutputPin}"
                class="{output.type} {optional: output.optional}"
                title="{output.hint}"
                data-key="{output.key}" data-type="{output.type}"
            )
                span 
                    | {output.name}   
                    icon(icon="hint" if="{output.hint}")
    label(each="{tagInfo in block.template.tags}")
        div(if="{tagInfo.label && tagInfo.tag !== 'bool-input'}") {tagInfo.label}
        color-picker(if="{tagInfo.tag === 'color-picker'}" key="{tagInfo.key || 'value'}")
        number-input(if="{tagInfo.tag === 'number-input'}" key="{tagInfo.key || 'value'}")
        select-input(if="{tagInfo.tag === 'select-input'}" key="{tagInfo.key || 'value'}" options="{tagInfo.options}")
        bool-input(if="{tagInfo.tag === 'bool-input'}" key="{tagInfo.key || 'value'}" label="{tagInfo.label}")
        vec3-input(if="{tagInfo.tag === 'vec3-input'}" key="{tagInfo.key || 'value'}")
    script.
        this.block = this.opts.block;
        this.block.tag = this;
        this.inputMappings = [];

        const glob = require('./js/global.js');
        this.glob = glob;

        this.tryStartInputPin = e => {
            this.parent.drawingLink = true;
            this.parent.update();

            var l = glob.drawnLink;
            l.inputBlock = this.block;
            l.inputKey = e.item.input.key;
            l.type = e.item.input.type;
            l.fromX = e.screenX;
            l.fromY = e.screenY;
            
            // detach input link, if exists
            var ind = this.block.inputLinks.findIndex(link => link.inputKey === e.item.input.key);
            if (ind !== -1) {
                this.block.inputLinks.splice(ind, 1);
                this.parent.updateLinks();
            }

            e.preventDefault();
            e.stopPropagation();
        };
        this.tryStartOutputPin = e => {
            this.parent.drawingLink = true;
            this.parent.update();

            var l = glob.drawnLink;
            l.outBlock = this.block;
            l.outKey = e.item.output.key;
            l.type = e.item.output.type;
            l.fromX = e.screenX;
            l.fromY = e.screenY;

            e.preventDefault();
            e.stopPropagation();
        };
        this.tryConnectInputPin = e => {
            // if the connected link is in the same direction (input/output), then stop linking
            if (glob.drawnLink.inputKey) {
                return;
            }
            // if the types differ,try converting types
            if (glob.drawnLink.type !== e.item.input.type) {
                if (this.tryConvert(glob.drawnLink, e.item.input, true)) {
                    this.parent.update();
                    this.parent.updateLinks();
                }
                return;
            }

            // detach existing input link, if there is one
            var ind = this.block.inputLinks.findIndex(link => link.inputKey === e.item.input.key);
            if (ind !== -1) {
                this.block.inputLinks.splice(ind, 1);
                this.parent.updateLinks();
            }

            glob.drawnLink.inputBlock = this.block;
            glob.drawnLink.inputKey = e.item.input.key;
            this.makeConnection(glob.drawnLink);
        };
        this.tryConnectOutputPin = e => {
            // if the connected link is in the same direction (input/output), then stop linking
            if (glob.drawnLink.outKey) {
                return;
            }
            // if the types differ, try converting types
            if (glob.drawnLink.type !== e.item.output.type) {
                if (this.tryConvert(glob.drawnLink, e.item.output, false)) {
                    this.parent.update();
                    this.parent.updateLinks();
                }
                return;
            }

            glob.drawnLink.outBlock = this.block;
            glob.drawnLink.outKey = e.item.output.key;
            this.makeConnection(glob.drawnLink);
        };
        this.makeConnection = drawnLink => {
            if (!(drawnLink.inputKey && drawnLink.outKey && drawnLink.inputBlock && drawnLink.outBlock)) {
                throw new Error('Wrong link object while connecting two blocks', drawnLink)
            }
            if (drawnLink.inputBlock === drawnLink.outBlock) {
                // Don't connect to self
                return false;
            }
            drawnLink.inputBlock.addLink(drawnLink.inputKey, drawnLink.outBlock, drawnLink.outKey);
            this.parent.updateLinks();
        };

        this.tryConvert = (drawnLink, targetPin, isInputPin) => {
            var pinLeft = isInputPin? {
                    block: drawnLink.outBlock,
                    key: drawnLink.outKey,
                    type: drawnLink.type
                } : {
                    block: this.block,
                    key: targetPin.key,
                    type: targetPin.type
                }, pinRight = isInputPin? {
                    block: this.block,
                    key: targetPin.key,
                    type: targetPin.type
                } : {
                    block: drawnLink.inputBlock,
                    key: drawnLink.inputKey,
                    type: drawnLink.type
                };
            var converter,
                converter2,
                midType,
                midKey,
                x = Math.round((pinLeft.block.x + pinRight.block.x) / 40) * 20, // 40 means 20 (grid size) * 2
                y = Math.round((pinLeft.block.y + pinRight.block.y) / 40) * 20;
            if (pinLeft.type === 'canvas' && pinRight.type === 'pixels') {
                converter = this.parent.parent.filter.addBlock('canvasToPixels', x, y);
            } else if (pinLeft.type === 'pixels' && pinRight.type === 'canvas') {
                converter = this.parent.parent.filter.addBlock('pixelsToCanvas', x, y);
            } else if (pinLeft.type === 'channel' && pinRight.type === 'pixels') {
                converter = this.parent.parent.filter.addBlock('channelToPixels', x, y);
            } else if (pinLeft.type === 'pixels' && pinRight.type === 'channel') {
                converter = this.parent.parent.filter.addBlock('splitChannels', x, y);
            } else if (pinLeft.type === 'color' && pinRight.type === 'canvas') {
                converter = this.parent.parent.filter.addBlock('fillColor', x, y);
            } else if (pinLeft.type === 'canvas' && pinRight.type === 'channel') {
                midType = 'pixels';
                midKey = 'pixels';
                x = Math.round((pinRight.block.x/3 + pinLeft.block.x/3*2) / 20) * 20;
                y = Math.round((pinRight.block.y/3 + pinLeft.block.y/3*2) / 20) * 20;
                converter = this.parent.parent.filter.addBlock('canvasToPixels', x, y);
                x = Math.round((pinRight.block.x/3*2 + pinLeft.block.x/3) / 20) * 20;
                y = Math.round((pinRight.block.y/3*2 + pinLeft.block.y/3) / 20) * 20;
                converter2 = this.parent.parent.filter.addBlock('splitChannels', x, y);
            } else if (pinLeft.type === 'channel' && pinRight.type === 'canvas') {
                midType = 'pixels';
                midKey = 'pixels';
                x = Math.round((pinRight.block.x/3 + pinLeft.block.x/3*2) / 20) * 20;
                y = Math.round((pinRight.block.y/3 + pinLeft.block.y/3*2) / 20) * 20;
                converter = this.parent.parent.filter.addBlock('channelToPixels', x, y);
                x = Math.round((pinRight.block.x/3*2 + pinLeft.block.x/3) / 20) * 20;
                y = Math.round((pinRight.block.y/3*2 + pinLeft.block.y/3) / 20) * 20;
                converter2 = this.parent.parent.filter.addBlock('pixelsToCanvas', x, y);
            }
            if (converter) {
                // detach existing input link, if there is one
                var ind = pinRight.block.inputLinks.findIndex(link => link.inputKey === pinRight.key);
                if (ind !== -1) {
                    pinRight.block.inputLinks.splice(ind, 1);
                    this.parent.updateLinks();
                }
                if (converter2) {
                    // scheme:
                    // pinLeft.block — converter — converter2 — pinRight.block
                    converter.addLink(pinLeft.type, pinLeft.block, pinLeft.key);
                    converter2.addLink(midType, converter, midKey);
                    pinRight.block.addLink(pinRight.key, converter2, pinRight.type);
                } else {
                    converter.addLink(pinLeft.type, pinLeft.block, pinLeft.key);
                    pinRight.block.addLink(pinRight.key, converter, pinRight.type);
                }
                return true;
            }
            alertify.error(`Cannot automatically convert type "${pinLeft.type}" into "${pinRight.type}".`)
            return false;
        };

        this.mouseMoveListener = e => {
            for (var blockTag of glob.selectedBlocks) {
                blockTag.block.x = blockTag.initialX + e.screenX - this.startX;
                blockTag.block.y = blockTag.initialY + e.screenY - this.startY;
                blockTag.update();
            }
            this.parent.updateLinks();
        };
        this.mouseUpListener = e => {
            for (var blockTag of glob.selectedBlocks) {
                blockTag.block.x = Math.round(blockTag.block.x / 20) * 20;
                blockTag.block.y = Math.round(blockTag.block.y / 20) * 20;
                blockTag.update();
            }
            document.removeEventListener('mousemove', this.mouseMoveListener);
            document.removeEventListener('mouseup', this.mouseUpListener);
            this.parent.updateLinks();
        };
        this.startDragging = e => {
            if (e.ctrlKey || e.shiftKey || e.button !== 0) {
                return;
            }
            this.startX = e.screenX;
            this.startY = e.screenY;
            if (!glob.selectedBlocks.length) {
                glob.selectedBlocks.push(this);
            } else {
                if (glob.selectedBlocks.length && glob.selectedBlocks.indexOf(this) === -1) {
                    glob.selectedBlocks.length = 0;
                    glob.selectedBlocks.push(this);
                }
            }

            for (var block of glob.selectedBlocks) {
                block.initialX = block.block.x;
                block.initialY = block.block.y;
            }
            document.addEventListener('mousemove', this.mouseMoveListener);
            document.addEventListener('mouseup', this.mouseUpListener);
            e.preventDefault();
        };

        this.selectBlock = e => {
            if (e.button !== 0) {
                return;
            }
            if (e.ctrlKey || e.shiftKey) {
                var ind = glob.selectedBlocks.indexOf(this);
                if (ind === -1) {
                    glob.selectedBlocks.push(this);
                } else {
                    glob.selectedBlocks.splice(ind, -1);
                }
            } else {
                if (glob.selectedBlocks.length) {
                    glob.selectedBlocks.length = 0;
                    this.parent.update();
                } else {
                    glob.selectedBlocks.length = 0;
                }
                glob.selectedBlocks.push(this);
            }
        };