var {MedianFilter} = require('./medianFilter.js');

const median = <IBlockTemplate>{
    nameLoc: 'blocks.processing.median.name',
    name: 'Median & Percentile',
    inputs: [{
        key: 'input',
        type: 'pixels',
        name: 'Input',
        nameLoc: 'blocks.processing.median.input'
    }, {
        key: 'size',
        type: 'number',
        name: 'Size',
        hint: 'The size of the filtering kernel, relative to the image. Should be less than 0.5 (mostly MUCH less than 0.5, e.g. 0.01). Bigger values result into slower processing',
        nameLoc: 'blocks.processing.median.size'
    }, {
        key: 'percentile',
        type: 'number',
        name: 'Percentile',
        optional: true,
        hint: 'A number between 0 and 1 that defaults to 0.5. Smaller values make image darker, while higher make it brighter.'
    }],
    outputs: [{
        key: 'output',
        type: 'pixels',
        name: 'Output',
        nameLoc: 'blocks.processing.median.output',
    }],
    tags: [{
        tag: 'select-input',
        key: 'mode',
        label: 'Mask shape:',
        defaultValue: 'circular',
        options: [
            'circular',
            'rectangular',
            'diamond'
        ]
    }, {
        tag: 'bool-input',
        key: 'quality',
        label: 'High quality',
        defaultValue: false
    }],
    exec(inputs, block) {
        const inp = inputs.input;
        const filter = new MedianFilter({
            size: Math.round(inp.width * (inputs.size || 0.01)),
            shape: block.tagValues.mode || 'circular',
            percentile: Math.max(0, Math.min(0.5, inputs.percentile || 0.5)),
            highQuality: block.tagValues.quality
        });
        return new Promise((resolve, reject) => {
            const output = filter.convertImage(inp);
            resolve({
                output
            });
        });
    }
};

module.exports = {
    median
};
