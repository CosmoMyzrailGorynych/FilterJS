const canvasToPixels = <IBlockTemplate>{
    nameLoc: 'blocks.convert.convert',
    name: 'Convert',
    noPalette: true,
    noPreview: true,
    inputs: [{
        key: 'canvas',
        type: 'canvas',
        name: ' ',
        nameLoc: 'nonBreakingSpace',
    }],
    outputs: [{
        key: 'pixels',
        type: 'pixels',
        name: ' ',
        nameLoc: 'nonBreakingSpace',
    }],
    exec(inputs) {
        if (inputs.canvas instanceof HTMLCanvasElement) {
            return Promise.resolve({
                pixels: inputs.canvas.getContext('2d').getImageData(0, 0, inputs.canvas.width, inputs.canvas.height)
            });
        }
        const canvas = document.createElement('canvas');
        canvas.width = inputs.canvas.width;
        canvas.height = inputs.canvas.height;
        canvas.getContext('2d').drawImage(inputs.canvas, 0, 0);
        return Promise.resolve({
            pixels: canvas.getContext('2d').getImageData(0, 0, inputs.canvas.width, inputs.canvas.height)
        });
    }
};

const pixelsToCanvas = <IBlockTemplate>{
    nameLoc: 'blocks.convert.convert',
    name: 'Convert',
    noPalette: true,
    noPreview: true,
    inputs: [{
        key: 'pixels',
        type: 'pixels',
        name: ' ',
        nameLoc: 'nonBreakingSpace',
    }],
    outputs: [{
        key: 'canvas',
        type: 'canvas',
        name: ' ',
        nameLoc: 'nonBreakingSpace',
    }],
    exec(inputs) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = inputs.pixels.width;
            canvas.height = inputs.pixels.height;
            canvas.getContext('2d').putImageData(inputs.pixels, 0, 0);
            resolve({
                canvas
            });
        });
    }
};

const channelToPixels = <IBlockTemplate>{
    nameLoc: 'blocks.convert.convertChannel',
    name: 'Convert (B&W)',
    noPalette: true,
    noPreview: true,
    inputs: [{
        key: 'channel',
        type: 'channel',
        name: ' ',
        nameLoc: 'nonBreakingSpace',
    }],
    outputs: [{
        key: 'pixels',
        type: 'pixels',
        name: ' ',
        nameLoc: 'nonBreakingSpace',
    }],
    exec(inputs) {
        return new Promise((resolve, reject) => {
            const w = inputs.channel.width,
                  h = inputs.channel.height;
            const out = new ImageData(w, h);
            for (let x = 0; x < w; x++) {
                for (let y = 0; y < h; y++) {
                    for (let i = 0; i < 3; i++) {
                        out.data[(x+y*w)*4 + i] = inputs.channel.data[x+y*w];
                    }
                    out.data[(x+y*w)*4 + 3] = 255;
                }
            }
            resolve({
                pixels: out
            });
        });
    }
};

module.exports = {
    name: 'Conversion',
    blocks: {
        canvasToPixels,
        pixelsToCanvas,
        channelToPixels
    }
};
