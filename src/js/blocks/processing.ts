import Channel = require('./../types/Channel.js');
import BlockError = require('./../types/BlockError.js');

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

const brightnessContrast = <IBlockTemplate>{
    nameLoc: 'blocks.processing.brightnessContrast.name',
    name: 'Brightness & Contrast',
    inputs: [{
        key: 'input',
        type: 'pixels',
        name: 'Input',
        nameLoc: 'blocks.processing.brightnessContrast.input'
    }, {
        key: 'brightness',
        type: 'number',
        name: 'Brightness',
        optional: true,
        nameLoc: 'blocks.processing.brightnessContrast.brightness',
        hint: 'A value between -1 and 1. 0 deals no changes, -1 turns an image to black color, 1 makes it fully white'
    }, {
        key: 'contrast',
        type: 'number',
        name: 'Contrast',
        optional: true,
        nameLoc: 'blocks.processing.brightnessContrast.contrast',
        hint: 'A value starting from 0. 0 turns an image into gray, 1 makes no changes, 2 doubles the contrast, etc.'
    }],
    outputs: [{
        key: 'output',
        type: 'pixels',
        name: 'Output',
        nameLoc: 'blocks.processing.brightnessContrast.output',
    }],
    exec(inputs, block) {
        if (!('contrast' in inputs) && !('brightness' in inputs)) {
            return Promise.reject(new BlockError('A useless block. No brightness and/or contrast value was provided.', block));
        }
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  output = new ImageData(inp.width, inp.height),
                  brightness = inputs.brightness || 0,
                  contrast = (inputs.contrast === void 0)? 1 : inputs.contrast;
            for (let x = 0; x < inp.width; x++) {
                for (let y = 0; y < inp.height; y++) {
                    const p = (y*inp.width + x)*4;
                    output.data[p] = ((inp.data[p] + brightness*256) - 128) * contrast + 128;
                    output.data[p+1] = ((inp.data[p+1] + brightness*256) - 128) * contrast + 128;
                    output.data[p+2] = ((inp.data[p+2] + brightness*256) - 128) * contrast + 128;
                    output.data[p+3] = inp.data[p+3];
                }
            }
            resolve({
                output
            });
        });
    }
};
const gammaCorrection = <IBlockTemplate>{
    nameLoc: 'blocks.processing.gammaCorrection.name',
    name: 'Gamma Correction',
    inputs: [{
        key: 'input',
        type: 'pixels',
        name: 'Input',
        nameLoc: 'blocks.processing.gammaCorrection.input'
    }, {
        key: 'gamma',
        type: 'number',
        name: 'Gamma',
        nameLoc: 'blocks.processing.gammaCorrection.gamma',
        hint: 'A value above 0. Gamma value that is less than 1 makes an image brighter.'
    }, {
        key: 'brightness',
        type: 'number',
        name: 'Brightness',
        optional: true,
        nameLoc: 'blocks.processing.brightnessContrast.brightness',
        hint: 'A value between -1 and 1. 0 deals no changes, -1 turns an image to black color, 1 makes it fully white'
    }],
    outputs: [{
        key: 'output',
        type: 'pixels',
        name: 'Output',
        nameLoc: 'blocks.processing.gammaCorrection.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  output = new ImageData(inp.width, inp.height),
                  g = inputs.gamma,
                  brightness = inputs.brightness || 1;
            for (let x = 0; x < inp.width; x++) {
                for (let y = 0; y < inp.height; y++) {
                    const p = (y*inp.width + x)*4;
                    output.data[p] = Math.pow(inp.data[p] / 256, g) * 256 * brightness;
                    output.data[p+1] = Math.pow(inp.data[p+1] / 256, g) * 256 * brightness;
                    output.data[p+2] = Math.pow(inp.data[p+2] / 256, g) * 256 * brightness;
                    output.data[p+3] = inp.data[p+3];
                }
            }
            resolve({
                output
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
        brightnessContrast,
        gammaCorrection,
        invert,
        computeNormals
    }
};
