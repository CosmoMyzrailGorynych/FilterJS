var canvasToPixels = <BlockTemplate>{
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
        return Promise.resolve({
            pixels: inputs.canvas.getContext('2d').getImageData(0, 0, inputs.canvas.width, inputs.canvas.height)
        });
    }
};

var pixelsToCanvas = <BlockTemplate>{
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
            var canvas = document.createElement('canvas');
            canvas.width = inputs.pixels.width;
            canvas.height = inputs.pixels.height;
            canvas.getContext('2d').putImageData(inputs.pixels, 0, 0);
            resolve({
                canvas
            });
        });
    }
};

var channelToPixels = <BlockTemplate>{
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
            var w = inputs.channel.width,
                h = inputs.channel.height;
            var out = new ImageData(w, h);
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
    canvasToPixels,
    pixelsToCanvas,
    channelToPixels
};
