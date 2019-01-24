import OSWebGL = require('./../../oneShotWebGL.js');
import BlockError = require('./../../types/BlockError.js');
const glsl = e => e;

const computeNormalsOGL = new OSWebGL(glsl`
    vec4 left = texture2D(u_image, v_texCoord + vec2(-pixel.x, 0.0));
    vec4 top = texture2D(u_image, v_texCoord + vec2(0.0, -pixel.y));
    vec4 right = texture2D(u_image, v_texCoord + vec2(pixel.x, 0.0));
    vec4 bottom = texture2D(u_image, v_texCoord + vec2(0.0, pixel.y));
    float leftMax = max(left.r, max(left.g, left.b));
    float topMax = max(top.r, max(top.g, top.b));
    float rightMax = max(right.r, max(right.g, right.b));
    float bottomMax = max(bottom.r, max(bottom.g, bottom.b));
    gl_FragColor.r = 0.5 - (rightMax-leftMax) * intensity;
    gl_FragColor.g = 0.5 - (bottomMax-topMax) * intensity;
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
    tags: [{
        key: 'flip',
        defaultValue: false,
        tag: 'bool-input',
        label: 'Flip R & G'
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
                intensity: intensity * (block.tagValues.flip? -1 : 1)
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

module.exports = {
    computeNormals
};
