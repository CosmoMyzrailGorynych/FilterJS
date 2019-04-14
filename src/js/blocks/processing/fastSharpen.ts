import OSWebGL = require('./../../oneShotWebGL.js');
import BlockError = require('./../../types/BlockError.js');
const glsl = e => e;

const diamondSharpen = new OSWebGL(glsl`
    gl_FragColor = vec4(0.0);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(-1.0, 0.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(0.0, -1.0) * pixel);
    gl_FragColor += 5.0 * texture2D(u_image, v_texCoord + vec2(0.0, 0.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(0.0, 1.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(1.0, 0.0) * pixel);
`);
const boxSharpen = new OSWebGL(glsl`
    gl_FragColor = vec4(0.0);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(-1.0, 0.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(0.0, -1.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(-1.0, -1.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(1.0, -1.0) * pixel);
    gl_FragColor += 9.0 * texture2D(u_image, v_texCoord + vec2(0.0, 0.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(0.0, 1.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(1.0, 0.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(1.0, 1.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(-1.0, 1.0) * pixel);
`);
const fastSharpen = <IBlockTemplate>{
    nameLoc: 'blocks.processing.fastSharpen.name',
    name: 'Fast sharpen',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.fastSharpen.inputNormals'
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.composing.fastSharpen.output'
    }],
    tags: [{
        tag: 'bool-input',
        key: 'box',
        label: 'Sharpen+',
        defaultValue: false
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  box = block.tagValues.box;
            (box? boxSharpen : diamondSharpen).render(inp)
            .then(output => {
                resolve({
                    output
                });
            })
            .catch(err => {
                console.error(err);
                reject(new BlockError(err, block));
            });
        })
    }
};

module.exports = {fastSharpen};
