import OSWebGL = require('./../../oneShotWebGL.js');
import BlockError = require('./../../types/BlockError.js');
const glsl = e => e;

/**
 * By a matrix
 *  0 -1  0
 * -1  5 -1
 *  0 -1  0
 */
const diamondSharpen = new OSWebGL(glsl`
    gl_FragColor = vec4(0.0);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(-1.0, 0.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(0.0, -1.0) * pixel);
    gl_FragColor += 5.0 * texture2D(u_image, v_texCoord + vec2(0.0, 0.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(0.0, 1.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(1.0, 0.0) * pixel);
`);
const diamondSharpenNoOvershoot = new OSWebGL(glsl`
    vec4 minimum = min(texture2D(u_image, v_texCoord + vec2(-1.0, 0.0) * pixel),
                    min(texture2D(u_image, v_texCoord + vec2(1.0, 0.0) * pixel),
                     min(texture2D(u_image, v_texCoord + vec2(0.0, 1.0) * pixel),
                      min(texture2D(u_image, v_texCoord + vec2(0.0, -1.0) * pixel),
                       texture2D(u_image, v_texCoord)))));
    vec4 maximum = max(texture2D(u_image, v_texCoord + vec2(-1.0, 0.0) * pixel),
                    max(texture2D(u_image, v_texCoord + vec2(1.0, 0.0) * pixel),
                     max(texture2D(u_image, v_texCoord + vec2(0.0, 1.0) * pixel),
                      max(texture2D(u_image, v_texCoord + vec2(0.0, -1.0) * pixel),
                       texture2D(u_image, v_texCoord)))));
    gl_FragColor = vec4(0.0);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(-1.0, 0.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(0.0, -1.0) * pixel);
    gl_FragColor += 5.0 * texture2D(u_image, v_texCoord + vec2(0.0, 0.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(0.0, 1.0) * pixel);
    gl_FragColor += -1.0 * texture2D(u_image, v_texCoord + vec2(1.0, 0.0) * pixel);

    gl_FragColor = max(minimum, min(gl_FragColor, maximum));
`);
/**
 * By a matrix
 * -1 -1 -1
 * -1  9 -1
 * -1 -1 -1
 */
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
const boxSharpenNoOvershoot = new OSWebGL(glsl`
    vec4 minimum = min(texture2D(u_image, v_texCoord + vec2(-1.0, 0.0) * pixel),
                    min(texture2D(u_image, v_texCoord + vec2(1.0, 0.0) * pixel),
                     min(texture2D(u_image, v_texCoord + vec2(0.0, 1.0) * pixel),
                      min(texture2D(u_image, v_texCoord + vec2(0.0, -1.0) * pixel),
                       min(texture2D(u_image, v_texCoord + vec2(-1.0, -1.0) * pixel),
                        min(texture2D(u_image, v_texCoord + vec2(1.0, 1.0) * pixel),
                         min(texture2D(u_image, v_texCoord + vec2(-1.0, 1.0) * pixel),
                          min(texture2D(u_image, v_texCoord + vec2(1.0, -1.0) * pixel),
                           texture2D(u_image, v_texCoord)))))))));
    vec4 maximum = max(texture2D(u_image, v_texCoord + vec2(-1.0, 0.0) * pixel),
                    max(texture2D(u_image, v_texCoord + vec2(1.0, 0.0) * pixel),
                     max(texture2D(u_image, v_texCoord + vec2(0.0, 1.0) * pixel),
                      max(texture2D(u_image, v_texCoord + vec2(0.0, -1.0) * pixel),
                       max(texture2D(u_image, v_texCoord + vec2(-1.0, -1.0) * pixel),
                        max(texture2D(u_image, v_texCoord + vec2(1.0, 1.0) * pixel),
                         max(texture2D(u_image, v_texCoord + vec2(-1.0, 1.0) * pixel),
                          max(texture2D(u_image, v_texCoord + vec2(1.0, -1.0) * pixel),
                           texture2D(u_image, v_texCoord)))))))));

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

    gl_FragColor = max(minimum, min(gl_FragColor, maximum));
`);

const fastSharpen = <IBlockTemplate>{
    nameLoc: 'blocks.processing.fastSharpen.name',
    name: 'Fast sharpen',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.fastSharpen.input'
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
    }, {
        tag: 'bool-input',
        key: 'overshootSuppression',
        label: 'Suppress overshooting',
        defaultValue: false
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  box = block.tagValues.box,
                  suppress = block.tagValues.overshootSuppression;
            var method;
            // tslint:disable-next-line: prefer-conditional-expression
            if (box) {
                method = suppress? boxSharpenNoOvershoot : boxSharpen;
            } else {
                method = suppress? diamondSharpenNoOvershoot : diamondSharpen;
            }
            method.render(inp)
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

module.exports = {fastSharpen};
