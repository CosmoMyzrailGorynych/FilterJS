import Channel = require('./../types/Channel.js');
import BlockError = require('./../types/BlockError.js');
import OSWebGL = require('./../oneShotWebGL.js');
const glsl = e => e;

const grayscaleOGL = new OSWebGL(glsl`
    gl_FragColor = texture2D(u_image, v_texCoord);
    float luma;
    if (calcLuminescence) {
        luma = 0.2126 * gl_FragColor.r + 0.7152 * gl_FragColor.g + 0.0722 * gl_FragColor.b;
    } else {
        luma = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0;
    }
    gl_FragColor = vec4(luma, luma, luma, gl_FragColor.a);
`, {
    calcLuminescence: 'bool'
});
const grayscale = <IBlockTemplate>{
    nameLoc: 'blocks.processing.grayscale.name',
    name: 'To Grayscale',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.grayscale.input'
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
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
                  {calcLuminescence} = block.tagValues;
            grayscaleOGL.render(inp, {
                calcLuminescence
            })
            .then(image => {
                resolve({
                    output: image
                });
            })
            .catch(err => {
                console.error(err);
                reject(new BlockError(err, block));
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

const invertOGL = new OSWebGL(glsl`
    gl_FragColor = texture2D(u_image, v_texCoord);
    gl_FragColor.r = 1.0 - gl_FragColor.r;
    gl_FragColor.g = 1.0 - gl_FragColor.g;
    gl_FragColor.b = 1.0 - gl_FragColor.b;
`);
const invert = <IBlockTemplate>{
    nameLoc: 'blocks.processing.invert.name',
    name: 'Invert',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.invert.input'
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.processing.invert.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input;
            invertOGL.render(inp)
            .then(image => {
                resolve({
                    output: image
                });
            })
            .catch(err => {
                console.error(err);
                reject(new BlockError(err, block));
            });
        });
    }
};

const brightnessContrastOGL = new OSWebGL(glsl`
    gl_FragColor = texture2D(u_image, v_texCoord);
    gl_FragColor = gl_FragColor + vec4(brightness - 0.5, brightness - 0.5, brightness - 0.5, 0);
    gl_FragColor = gl_FragColor * vec4(contrast, contrast, contrast, 1) + vec4(0.5, 0.5, 0.5, 0);
`, {
    brightness: 'number',
    contrast: 'number'
});
const brightnessContrast = <IBlockTemplate>{
    nameLoc: 'blocks.processing.brightnessContrast.name',
    name: 'Brightness & Contrast',
    inputs: [{
        key: 'input',
        type: 'canvas',
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
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.processing.brightnessContrast.output',
    }],
    exec(inputs, block) {
        if (!('contrast' in inputs) && !('brightness' in inputs)) {
            return Promise.reject(new BlockError('A useless block. No brightness and/or contrast value was provided.', block));
        }
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  brightness = inputs.brightness || 0,
                  contrast = inputs.contrast === void 0? 1 : inputs.contrast;
            brightnessContrastOGL.render(inp, {
                contrast,
                brightness
            })
            .then(image => {
                resolve({
                    output: image
                });
            })
            .catch(err => {
                console.error(err);
                reject(new BlockError(err, block));
            });
        });
    }
};
const gammaCorrectionOGL = new OSWebGL(glsl`
    gl_FragColor = texture2D(u_image, v_texCoord);
    gl_FragColor = pow(gl_FragColor, vec4(g, g, g, 1)) + vec4(brightness, brightness, brightness, 0);
`, {
    g: 'number',
    brightness: 'number'
});
const gammaCorrection = <IBlockTemplate>{
    nameLoc: 'blocks.processing.gammaCorrection.name',
    name: 'Gamma Correction',
    inputs: [{
        key: 'input',
        type: 'canvas',
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
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.processing.gammaCorrection.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  g = inputs.gamma,
                  brightness = inputs.brightness || 0;
            gammaCorrectionOGL.render(inp, {
                g,
                brightness
            })
            .then(image => {
                resolve({
                    output: image
                });
            })
            .catch(err => {
                console.error(err);
                reject(new BlockError(err, block));
            });
        });
    }
};

const {computeNormals, computeNormalsPixels} = require('./processing/normals.js');
const {gaussianBlur} = require('./processing/blur.js');
const {simpleShader} = require('./processing/shaders.js');

module.exports = {
    name: 'Processing',
    blocks: {
        grayscale,
        grayscaleChannel,
        brightnessContrast,
        gammaCorrection,
        invert,
        gaussianBlur,
        computeNormals,
        simpleShader
    }
};
