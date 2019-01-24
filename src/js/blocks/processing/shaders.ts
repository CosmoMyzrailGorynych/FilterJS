import OSWebGL = require('./../../oneShotWebGL.js');
import BlockError = require('./../../types/BlockError.js');
const glsl = e => e;

const simpleShaderOGL = new OSWebGL(glsl`
    vec4 normal = (texture2D(u_image, v_texCoord) - vec4(0.5, 0.5, 0.5, 0)) * vec4(2.0, 2.0, 2.0, 1.0);
    float d = mix(1.0, dot(normal.rgb, light * vec3(-1.0, -1.0, -1.0)), intensity);
    gl_FragColor = vec4(d, d, d, 1.0);
`, {
    intensity: 'number',
    light: 'vec3'
});
const simpleShader = <IBlockTemplate>{
    nameLoc: 'blocks.processing.simpleShader.name',
    name: 'Simple Shader',
    inputs: [{
        key: 'normals',
        type: 'canvas',
        name: 'Normals',
        nameLoc: 'blocks.processing.simpleShader.inputNormals'
    }, {
        key: 'intensity',
        type: 'number',
        name: 'Intensity',
        nameLoc: 'blocks.processing.simpleShader.inputIntensity',
        optional: true
    }],
    tags: [{
        key: 'light',
        defaultValue: [-0.5, -0.5, 1],
        tag: 'vec3-input',
        label: 'Light direction'
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.processing.simpleShader.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.normals,
                  intensity = inputs.intensity || 1,
                  light = block.tagValues.light;
            simpleShaderOGL.render(inp, {
                // vec3-input sets a vector from center to a hemisphere's surface, and we need the negative
                intensity,
                light: [light[0] * -1, light[1] * -1, light[2] * -1]
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

module.exports = {
    simpleShader
};
