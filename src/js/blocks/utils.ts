import glob = require('./../global.js');

const aspectRatio = <IBlockTemplate>{
    nameLoc: 'blocks.utils.aspectRatio.name',
    name: 'Aspect Ratio',
    noPreview: true,
    inputs: [],
    outputs: [{
        key: 'ratio',
        type: 'number',
        name: 'Ratio',
        nameLoc: 'blocks.generators.aspectRatio.ratio'
    }],
    tags: [{
        tag: 'select-input',
        options: [
            'width / height',
            'height / width',
            'min / max',
            'max / min'
        ],
        defaultValue: 'width / height',
        key: 'method'
    }],
    exec(inputs, block) {
        if (block.tagValues.method === 'width / height') {
            return Promise.resolve({
                ratio: glob.width / glob.height
            });
        } else if (block.tagValues.method === 'height / width') {
            return Promise.resolve({
                ratio: glob.height / glob.width
            });
        } else if (block.tagValues.method === 'min / max') {
            return Promise.resolve({
                ratio: Math.min(glob.width, glob.height) / Math.max(glob.width, glob.height)
            });
        }
        return Promise.resolve({
            ratio: Math.max(glob.width, glob.height) / Math.min(glob.width, glob.height)
        });
    }
};

module.exports = {
    aspectRatio
};
