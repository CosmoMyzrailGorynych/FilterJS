import OSWebGL = require('../../oneShotWebGL.js');
import BlockError = require('../../types/BlockError.js');
const glsl = e => e;

const unblurGLSL = new OSWebGL(glsl`
    vec4 source = texture2D(u_image, v_texCoord),
         blurred = texture2D(blurredImage, v_texCoord);
    gl_FragColor = source + k * (source - blurred);
`, {
    k: 'float',
    blurredImage: 'texture'
});

const unblur = <IBlockTemplate>{
    nameLoc: 'blocks.processing.unblur.name',
    name: 'Unblur',
    hint: 'Pipe the original image and its blurred image to get a sharpened one. Try using it with bilateral blur or median to remove "halo" effects.',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.unblur.source'
    }, {
        key: 'blurred',
        type: 'canvas',
        name: 'Blurred',
        nameLoc: 'blocks.processing.unblur.blurred'
    }, {
        key: 'k',
        type: 'number',
        name: 'Input',
        nameLoc: 'blocks.processing.unblur.k',
        optional: true,
        hint: 'Defaults to 1. A number larger than 0, usually between (0; 1], but not limited to this range.'
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.composing.unblur.output'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const original = inputs.input,
                  blurred = inputs.blurred,
                  k = inputs.k !== void 0? inputs.k : 1;
            unblurGLSL.render(original, {
                blurredImage: blurred,
                k
            })
            .then(output => {
                resolve({
                    output
                });
            })
            .catch(err => {
                console.error(err);
                reject(new BlockError(err, block));
            });
        });
    }
};

module.exports = {unblur};