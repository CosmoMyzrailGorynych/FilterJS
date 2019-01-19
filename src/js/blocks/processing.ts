import Channel = require('./../types/Channel.js');

const grayscale = <IBlockTemplate>{
    nameLoc: 'blocks.processing.grayscale.name',
    name: 'To Grayscale',
    inputs: [{
        key: 'input',
        type: 'pixels',
        name: 'Input',
        nameLoc: 'blocks.processing.grayscale.input'
    }],
    outputs: [{
        key: 'output',
        type: 'pixels',
        name: 'Output',
        nameLoc: 'blocks.processing.grayscale.output',
    }],
    tags: [{
        key: 'calcLuminescence',
        defaultValue: true,
        tag: 'bool-input',
        label: 'Use Luminescence'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  out = document.createElement('canvas').getContext('2d')
                        .createImageData(inp.width, inp.height);
            if (block.tagValues.calcLuminescence) {
                for (let x = 0; x < inp.width; x++) {
                    for (let y = 0; y < inp.height; y++) {
                        const p = (y*inp.width + x)*4,
                              a = 0.2126*inp.data[p] + 0.7152*inp.data[p+1] + 0.0722*inp.data[p+2];
                        out.data[p] = a;
                        out.data[p+1] = a;
                        out.data[p+2] = a;
                        out.data[p+3] = inp.data[p+3];
                    }
                }
            } else {
                for (let x = 0; x < inp.width; x++) {
                    for (let y = 0; y < inp.height; y++) {
                        const p = (y*inp.width + x)*4,
                              a = (inp.data[p] + inp.data[p+1] + inp.data[p+2]) / 3;
                        out.data[p] = a;
                        out.data[p+1] = a;
                        out.data[p+2] = a;
                        out.data[p+3] = inp.data[p+3];
                    }
                }
            }
            resolve({
                output: out
            });
        });
    }
};
const grayscaleChannel = <IBlockTemplate>{
    nameLoc: 'blocks.processing.grayscaleChannel.name',
    name: 'To Grayscale Channel',
    inputs: [{
        key: 'input',
        type: 'pixels',
        name: 'Input',
        nameLoc: 'blocks.processing.grayscale.input'
    }],
    outputs: [{
        key: 'output',
        type: 'channel',
        name: 'Output',
        nameLoc: 'blocks.processing.grayscale.output',
    }],
    tags: [{
        key: 'calcLuminescence',
        defaultValue: true,
        tag: 'bool-input',
        label: 'Use Luminescence'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  out = new Channel(inp.width, inp.height);
            if (block.tagValues.calcLuminescence) {
                for (let x = 0; x < inp.width; x++) {
                    for (let y = 0; y < inp.height; y++) {
                        const p = (y*inp.width + x) * 4,
                              a = 0.2126*inp.data[p] + 0.7152*inp.data[p+1] + 0.0722*inp.data[p+2];
                        out.data[y*inp.width + x] = a;
                    }
                }
            } else {
                for (let x = 0; x < inp.width; x++) {
                    for (let y = 0; y < inp.height; y++) {
                        const p = (y*inp.width + x)*4,
                              a = (inp.data[p] + inp.data[p+1] + inp.data[p+2]) / 3;
                        out.data[y*inp.width + x] = a;
                    }
                }
            }
            resolve({
                output: out
            });
        });
    }
};

const invert = <IBlockTemplate>{
    nameLoc: 'blocks.processing.invert.name',
    name: 'Invert',
    inputs: [{
        key: 'input',
        type: 'pixels',
        name: 'Input',
        nameLoc: 'blocks.processing.invert.input'
    }],
    outputs: [{
        key: 'output',
        type: 'pixels',
        name: 'Output',
        nameLoc: 'blocks.processing.invert.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  out = new ImageData(inp.width, inp.height);
            for (let x = 0; x < inp.width; x++) {
                for (let y = 0; y < inp.height; y++) {
                    const p = (y*inp.width + x)*4;
                    out.data[p] = 255 - inp.data[p];
                    out.data[p+1] = 255 - inp.data[p+1];
                    out.data[p+2] = 255 - inp.data[p+2];
                    out.data[p+3] = inp.data[p+3];
                }
            }
            resolve({
                output: out
            });
        });
    }
};

const computeMaxAtPoint = (input: ImageData, x: number, y: number) => {
    const p = (input.width * y + x)*4;
    return Math.max(input.data[p], input.data[p+1], input.data[p+2]);
};

const computeNormals = <IBlockTemplate>{
    nameLoc: 'blocks.processing.computeNormals.name',
    name: 'Normal',
    inputs: [{
        key: 'height',
        type: 'pixels',
        name: 'Height',
        nameLoc: 'blocks.processing.computeNormals.inputHeight'
    }, {
        key: 'intensity',
        type: 'number',
        name: 'Intensity',
        nameLoc: 'blocks.processing.computeNormals.inputIntensity',
        optional: true
    }],
    outputs: [{
        key: 'normals',
        type: 'pixels',
        name: 'Normals',
        nameLoc: 'blocks.processing.computeNormals.outputNormals',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.height,
                  out = document.createElement('canvas').getContext('2d')
                        .createImageData(inp.width, inp.height),
                  intensity = inputs.intensity || 1;
            for (let x = 1; x < inp.width - 1; x++) {
                for (let y = 1; y < inp.height - 1; y++) {
                    var p = (x + y*inp.width) * 4;
                    out.data[p] = 127 + (computeMaxAtPoint(inp, x-1, y) - computeMaxAtPoint(inp, x+1, y)) * intensity;
                    out.data[p+1] = 127 + (computeMaxAtPoint(inp, x, y-1) - computeMaxAtPoint(inp, x, y+1)) * intensity;
                    out.data[p+2] = 255;
                    out.data[p+3] = 255;
                }
            }
            // work with edges
            for (let y = 0; y < inp.height; y++) {
                var p = y*inp.width*4; // left edge
                out.data[p] = 127 + (computeMaxAtPoint(inp, 0, y) - computeMaxAtPoint(inp, 1, y)) * intensity;
                if (y > 0 && y < inp.height -1) {
                    out.data[p+1] = 127 + (computeMaxAtPoint(inp, 0, y-1) - computeMaxAtPoint(inp, 1, y+1)) * intensity;
                }
                out.data[p+2] = 255;
                out.data[p+3] = 255;

                var p = ((y+1)*inp.width - 1)*4; // right edge
                out.data[p] = 127 + (computeMaxAtPoint(inp, inp.width-2, y) - computeMaxAtPoint(inp, inp.width-1, y)) * intensity;
                if (y > 0 && y < inp.height -1) {
                    out.data[p+1] = 127 + (computeMaxAtPoint(inp, inp.width-1, y-1) - computeMaxAtPoint(inp, inp.width-1, y+1)) * intensity;
                }
                out.data[p+2] = 255;
                out.data[p+3] = 255;
            }
            for (let x = 0; x < inp.width; x++) {
                var p = x*4; // top edge
                if (x > 0 && x < inp.width - 1) {
                    out.data[p] = 127 + (computeMaxAtPoint(inp, x-1, 0) - computeMaxAtPoint(inp, x+1, 1)) * intensity;
                }
                out.data[p+1] = 127 + (computeMaxAtPoint(inp, x, 0) - computeMaxAtPoint(inp, x, 1)) * intensity;
                out.data[p+2] = 255;
                out.data[p+3] = 255;

                p = (inp.width*(inp.height-1) + x)*4; // bottom edge
                if (x > 0 && x < inp.width - 1) {
                    out.data[p] = 127 + (computeMaxAtPoint(inp, x-1, inp.height-1) - computeMaxAtPoint(inp, x+1, inp.height-1)) * intensity;
                }
                out.data[p+1] = 127 + (computeMaxAtPoint(inp, x, inp.height-2) - computeMaxAtPoint(inp, x, inp.height-1)) * intensity;
                out.data[p+2] = 255;
                out.data[p+3] = 255;
            }
            resolve({
                normals: out
            });
        });
    }
};

module.exports = {
    name: 'Processing',
    blocks: {
        grayscale,
        grayscaleChannel,
        invert,
        computeNormals
    }
};
