import Channel = require('./../../types/Channel.js');

const getSkinColors = <IBlockTemplate>{
    nameLoc: 'blocks.composing.getSkinColors.name',
    name: 'Skin colors',
    noPreview: true,
    inputs: [{
        key: 'input',
        type: 'pixels',
        name: 'Input',
        nameLoc: 'blocks.composing.getSkinColors.input'
    }],
    outputs: [{
        key: 'output',
        type: 'channel',
        name: 'Skin mask',
        nameLoc: 'blocks.composing.getSkinColors.output'
    }],
    tags: [{
        tag: 'select-input',
        key: 'method',
        defaultValue: 'J. Kovac (uniform daylight)',
        options: [
            'J. Kovac (uniform daylight)',
            'J. Kovac (flash light)'
        ]
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input;
            const w = inp.width,
                  h = inp.height;
            const out = new Channel(w, h);
            for (let x = 0; x < w; x++) {
                for (let y = 0; y < h; y++) {
                    const ind = x + y*w;
                    const r = inp.data[ind*4 + 0],
                          g = inp.data[ind*4 + 1],
                          b = inp.data[ind*4 + 2];
                    out.data[ind] = 0;
                    if (block.tagValues.method === 'J. Kovac (uniform daylight)') {
                        if (r > 95 && g > 40 && b > 20 &&
                            (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
                            (Math.abs(r - g) > 15) &&
                            r > b && g > b) {
                            out.data[ind] = 255;
                        }
                    } else if (block.tagValues.method === 'J. Kovac (flash light)') {
                        if (r > 220 && g > 210 && b > 170 &&
                            (Math.abs(r - g) <= 15) &&
                            r > b && g > b) {
                            out.data[ind] = 255;
                        }
                    }
                }
            }
            resolve({
                output: out
            });
        });
    }
};

module.exports = {
    getSkinColors
};
