import OSWebGL = require('./../../oneShotWebGL.js');
import BlockError = require('./../../types/BlockError.js');
const glsl = e => e;

const median = <IBlockTemplate>{
    nameLoc: 'blocks.processing.median.name',
    name: 'Median',
    inputs: [{
        key: 'input',
        type: 'pixels',
        name: 'Input',
        nameLoc: 'blocks.processing.median.input'
    }, {
        key: 'size',
        type: 'number',
        name: 'Size',
        hint: 'A kernel size, usually larger or equal to 3.',
        nameLoc: 'blocks.processing.median.size'
    }],
    outputs: [{
        key: 'output',
        type: 'pixels',
        name: 'Output',
        nameLoc: 'blocks.processing.median.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  {size} = inputs;
            const out = document.createElement('canvas').getContext('2d').createImageData(inp.width, inp.height);
            
        });
    }
};

module.exports = {
    median
};
