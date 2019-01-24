vec3-input
    .aVec3Input(onmousedown="{onPress}" ref="sphere")
        .aVec3InputThumb(ref="thumb")
    script.
        const maxArmLength = 16 * 2.5;
        this.editedKey = this.opts.key || 'value';
        this.value = this.parent.block.tagValues[this.editedKey] || [-0.5, -0.5, 0];

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

        const linearToCircle = val => 1 - Math.sqrt(1 - val*val);
        const circleToLinear = val => Math.sqrt(1 - Math.pow(1 - val*val, 2));
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
                if (length > 1) {
                    x /= length;
                    y /= length;
                }
                let z = Math.sqrt(1 - x*x - y*y) || 0;
                this.setValue(x, y, z);
                this.update();
            };
            const unlistener = e => {
                document.removeEventListener('mousemove', listener);
                document.removeEventListener('mouseup', unlistener);
            };
            document.addEventListener('mousemove', listener);
            document.addEventListener('mouseup', unlistener);
        };
        this.setValue = (x, y, z) => {
            this.value[0] = x;
            this.value[1] = y; 
            this.value[2] = z;
        };
        this.onChange = e => {
            this.parent.block.tagValues[this.editedKey] = Number(e.target.value) || 0;
        };