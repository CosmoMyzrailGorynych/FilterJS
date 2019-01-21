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

const computeNormalsOGL = new OSWebGL(glsl`
    vec4 left = texture2D(u_image, v_texCoord - vec2(-pixel.x, 0.0));
    vec4 top = texture2D(u_image, v_texCoord - vec2(0.0, -pixel.y));
    vec4 right = texture2D(u_image, v_texCoord - vec2(pixel.x, 0.0));
    vec4 bottom = texture2D(u_image, v_texCoord - vec2(0.0, pixel.y));
    float leftMax = max(left.r, max(left.g, left.b));
    float topMax = max(top.r, max(top.g, top.b));
    float rightMax = max(right.r, max(right.g, right.b));
    float bottomMax = max(bottom.r, max(bottom.g, bottom.b));
    gl_FragColor.r = 0.5 + (leftMax-rightMax) * intensity;
    gl_FragColor.g = 0.5 + (topMax-bottomMax) * intensity;
    gl_FragColor.b = 1.0;
    gl_FragColor.a = 1.0;
`, {
    intensity: 'number'
});
const computeNormals = <IBlockTemplate>{
    nameLoc: 'blocks.processing.computeNormals.name',
    name: 'Normal',
    inputs: [{
        key: 'height',
        type: 'canvas',
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
        type: 'canvas',
        name: 'Normals',
        nameLoc: 'blocks.processing.computeNormals.outputNormals',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.height,
                  intensity = inputs.intensity || 1;
            computeNormalsOGL.render(inp, {
                intensity
            })
            .then(image => {
                resolve({
                    normals: image
                });
            })
            .catch(err => {
                console.error(err);
                reject(new BlockError(err, block));
            });
        });
    }
};

const computeMaxAtPoint = (input: ImageData, x: number, y: number) => {
    const p = (input.width * y + x)*4;
    return Math.max(input.data[p], input.data[p+1], input.data[p+2]);
};
const computeNormalsPixels = <IBlockTemplate>{
    nameLoc: 'blocks.processing.computeNormalsPixels.name',
    name: 'Normal (Pixels)',
    inputs: [{
        key: 'height',
        type: 'pixels',
        name: 'Height',
        nameLoc: 'blocks.processing.computeNormalsPixels.inputHeight'
    }, {
        key: 'intensity',
        type: 'number',
        name: 'Intensity',
        nameLoc: 'blocks.processing.computeNormalsPixels.inputIntensity',
        optional: true
    }],
    outputs: [{
        key: 'normals',
        type: 'pixels',
        name: 'Normals',
        nameLoc: 'blocks.processing.computeNormalsPixels.outputNormals',
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
                    out.data[p] = 127 - (computeMaxAtPoint(inp, x-1, y) - computeMaxAtPoint(inp, x+1, y)) * intensity;
                    out.data[p+1] = 127 - (computeMaxAtPoint(inp, x, y-1) - computeMaxAtPoint(inp, x, y+1)) * intensity;
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
        computeNormals,
        computeNormalsPixels
    }
};
