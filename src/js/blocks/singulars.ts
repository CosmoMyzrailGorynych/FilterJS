import glob = require('./../global.js');

var inputImage = <BlockTemplate>{
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

var outputImage = <BlockTemplate>{
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

module.exports = {inputImage, outputImage};
