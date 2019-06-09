import BlockError = require('./../../types/BlockError.js');
import OSWebGL = require('./../../oneShotWebGL.js');
const glsl = e => e;

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

module.exports = {invert};