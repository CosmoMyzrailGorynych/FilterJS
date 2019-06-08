import OSWebGL = require('./../../oneShotWebGL.js');
import BlockError = require('./../../types/BlockError.js');
const glsl = e => e;

const derivativeOGL = new OSWebGL(glsl`
    gl_FragColor = (texture2D(u_image, v_texCoord) - texture2D(u_image, v_texCoord - direction*pixel)) * vec4(0.5, 0.5, 0.5, 1.0) + vec4(0.5, 0.5, 0.5, 1.0);
`, {
    direction: 'vec2'
});
const derivative = <IBlockTemplate>{
    nameLoc: 'blocks.processing.derivative.name',
    name: 'Derivative',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.derivative.input'
    }],
    tags: [{
        key: 'direction',
        defaultValue: [1, 0],
        tag: 'vec2-input',
        label: 'Direction',
        options: ['unitLength']
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.processing.derivative.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
            direction = block.tagValues.direction;
            derivativeOGL.render(inp, {
                direction
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

const applyDerivativeOGL = new OSWebGL(glsl`
    gl_FragColor = texture2D(u_image, v_texCoord) + (texture2D(derivative, v_texCoord) - vec4(0.5, 0.5, 0.5, 0.0)) * vec4(2.0, 2.0, 2.0, 0.0);
`, {
    direction: 'vec2',
    derivative: 'texture'
});
const applyDerivative = <IBlockTemplate>{
    nameLoc: 'blocks.processing.applyDerivative.name',
    name: 'Apply Derivative',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.applyDerivative.input'
    }, {
        key: 'derivative',
        type: 'canvas',
        name: 'Derivative',
        nameLoc: 'blocks.processing.applyDerivative.derivative'
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.processing.applyDerivative.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
            direction = block.tagValues.direction,
            derivative = inputs.derivative;
            applyDerivativeOGL.render(inp, {
                derivative
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

const combineDerivativesOGL = new OSWebGL(glsl`
    vec4 origDerivative = texture2D(u_image, v_texCoord) - texture2D(u_image, v_texCoord - direction*pixel),
         newDerivative = (texture2D(derivative, v_texCoord) - vec4(0.5, 0.5, 0.5, 0.0)) * vec4(2.0, 2.0, 2.0, 0.0);
    gl_FragColor = texture2D(u_image, v_texCoord) + k * (newDerivative-origDerivative);
`, {
    direction: 'vec2',
    derivative: 'texture',
    k: 'float'
});
const combineDerivatives = <IBlockTemplate>{
    nameLoc: 'blocks.processing.combineDerivatives.name',
    name: 'Combine Derivatives',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.combineDerivatives.input'
    }, {
        key: 'derivative',
        type: 'canvas',
        name: 'Derivative',
        nameLoc: 'blocks.processing.combineDerivatives.derivative'
    }, {
        key: 'intensity',
        type: 'number',
        name: 'Intensity',
        nameLoc: 'blocks.processing.combineDerivatives.intensity',
        optional: true
    }],
    tags: [{
        key: 'direction',
        defaultValue: [1, 0],
        tag: 'vec2-input',
        label: 'Direction',
        options: ['unitLength']
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.processing.combineDerivatives.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
            direction = block.tagValues.direction,
            derivative = inputs.derivative,
            intensity = inputs.intensity !== void 0? inputs.intensity : 1;
            combineDerivativesOGL.render(inp, {
                direction,
                derivative,
                k: intensity
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
    derivative,
    applyDerivative,
    combineDerivatives
};
