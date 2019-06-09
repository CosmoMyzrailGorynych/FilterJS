import BlockError = require('./../../types/BlockError.js');
import OSWebGL = require('./../../oneShotWebGL.js');
const glsl = e => e;

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

module.exports = {gammaCorrection};
