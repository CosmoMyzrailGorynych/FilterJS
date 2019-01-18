import glob = require('./../global.js');

const inputImage = <IBlockTemplate>{
    nameLoc: 'blocks.singulars.inputImage.name',
    name: 'Input Image',
    isSingular: true,
    inputs: [],
    outputs: [{
        key: 'image',
        type: 'canvas',
        name: 'Image',
        nameLoc: 'blocks.singulars.inputImage.outputImage',
    }],
    exec() {
        return Promise.resolve({
            image: glob.sourceImage
        });
    }
};

const outputImage = <IBlockTemplate>{
    nameLoc: 'blocks.general.outputImage.name',
    name: 'Output Image',
    isSingular: true,
    inputs: [{
        key: 'image',
        type: 'canvas',
        name: 'Image',
        nameLoc: 'blocks.general.outputImage.inputImage',
    }],
    outputs: [],
    exec(inputs) {
        return Promise.resolve(inputs.image);
    }
};

module.exports = {
    name: 'Singulars',
    blocks: {
        inputImage,
        outputImage
    }
};
