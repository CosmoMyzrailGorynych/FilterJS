vec2-input
    .aVec2Input(onmousedown="{onPress}" ref="sphere")
        .aVec2InputThumb(ref="thumb")
    script.
        const maxArmLength = 16 * 2.5;
        this.editedKey = this.opts.key || 'value';
        this.value = this.parent.block.tagValues[this.editedKey] || [1, 0];

        this.updatePickerPosition = () => {
            const x = this.value[0],
                  y =  this.value[1];
            this.refs.thumb.style.left = (x*maxArmLength + maxArmLength) + 'px';
            this.refs.thumb.style.top = (y*maxArmLength + maxArmLength) + 'px';
            this.refs.sphere.style.backgroundPosition = `${x * maxArmLength}px ${y * maxArmLength}px`;
        };
        this.on('updated', () => {
            this.updatePickerPosition();
        });
        this.on('mount', () => {
            setTimeout(() => {
                this.updatePickerPosition();
            }, 0);
        });

        this.onPress = e => {
            console.log(e);
            const startX = e.clientX - e.layerX + maxArmLength,
                  startY = e.clientY - e.layerY + maxArmLength;
            let endX = startX, endY = startY;
            const listener = e => {
                endX = e.clientX;
                endY = e.clientY;
                let x = (endX - startX) / maxArmLength,
                    y = (endY - startY) / maxArmLength,
                    length = Math.hypot(x, y);
                if (length > 1 || (length !== 0 && this.opts.options.indexOf('unitLength' !== -1))) {
                    x /= length;
                    y /= length;
                }
                this.setValue(x, y);
                this.update();
            };
            const unlistener = e => {
                document.removeEventListener('mousemove', listener);
                document.removeEventListener('mouseup', unlistener);
            };
            document.addEventListener('mousemove', listener);
            document.addEventListener('mouseup', unlistener);
        };
        this.setValue = (x, y) => {
            this.value[0] = x;
            this.value[1] = y;
        };
        this.onChange = e => {
            this.parent.block.tagValues[this.editedKey] = Number(e.target.value) || 0;
        };