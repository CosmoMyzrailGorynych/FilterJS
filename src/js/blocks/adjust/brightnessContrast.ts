import BlockError = require('./../../types/BlockError.js');
import OSWebGL = require('./../../oneShotWebGL.js');
const glsl = e => e;

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

module.exports = {brightnessContrast};
